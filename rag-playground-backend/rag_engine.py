import os
from typing import List, Dict, Any
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import CharacterTextSplitter
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain_community.retrievers import BM25Retriever
from sentence_transformers import CrossEncoder
from dotenv import load_dotenv
import tiktoken
import time
from rag_metrics import RAGMetrics  # Change from relative to absolute import

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

# Initialize Groq LLM with a supported model
llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama3-70b-8192",  # Updated to a supported model
    temperature=0.7
)

# Initialize embeddings
embedding_model = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={'device': 'cpu'}
)

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

# Initialize metrics
metrics_analyzer = RAGMetrics()

# Constants for token management
MAX_TOKENS_LIMIT = 4000
MAX_CONTEXT_LENGTH = 2000

def count_tokens(text: str) -> int:
    encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

def split_and_annotate(text: str):
    # Reduced chunk size and overlap for better token management
    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.create_documents([text])
    # Annotate with page numbers if possible
    for i, chunk in enumerate(chunks):
        chunk.metadata["page"] = i + 1
    return chunks

def truncate_context(context: str, max_length: int = MAX_CONTEXT_LENGTH) -> str:
    """Truncate context to fit within token limits."""
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(context)
    if len(tokens) > max_length:
        tokens = tokens[:max_length]
        context = encoding.decode(tokens)
    return context

def process_in_batches(text: str, max_tokens: int = 6000) -> str:
    """Process large texts in batches to avoid token limits."""
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)
    
    if len(tokens) <= max_tokens:
        return text
    
    # Split into batches
    batches = []
    current_batch = []
    current_length = 0
    
    for token in tokens:
        if current_length + 1 > max_tokens:
            batches.append(encoding.decode(current_batch))
            current_batch = []
            current_length = 0
        current_batch.append(token)
        current_length += 1
    
    if current_batch:
        batches.append(encoding.decode(current_batch))
    
    return " ".join(batches)

def create_vector_store(text: str):
    docs = split_and_annotate(text)
    # Process chunks to ensure they're within token limits
    processed_docs = []
    for doc in docs:
        doc.page_content = process_in_batches(doc.page_content)
        processed_docs.append(doc)
    
    vectorstore = FAISS.from_documents(processed_docs, embedding_model)
    bm25_retriever = BM25Retriever.from_documents(processed_docs)
    metadata = {
        "chunks": len(processed_docs),
        "total_tokens": sum(count_tokens(doc.page_content) for doc in processed_docs),
        "embedding_model": embedding_model.model_name
    }
    return vectorstore, bm25_retriever, processed_docs, metadata

def track_processing_time(func):
    def wrapper(*args, **kwargs):
        metrics = {
            "start_time": time.time(),
            "steps": [],
            "memory_usage": {},
            "performance_metrics": {}
        }
        
        # Track text processing
        start = time.time()
        text = args[0]  # Get the text argument
        chunks = split_and_annotate(text)
        metrics["steps"].append({
            "name": "text_processing",
            "duration": time.time() - start,
            "chunks": len(chunks)
        })
        
        # Track embedding
        start = time.time()
        vectorstore, bm25_retriever, docs, metadata = create_vector_store(text)  # Pass text, not chunks
        metrics["steps"].append({
            "name": "embedding",
            "duration": time.time() - start,
            "vectors": len(docs)
        })
        
        # Track retrieval & generation
        start = time.time()
        result = func(*args, **kwargs)  # Call original function with original args
        metrics["steps"].append({
            "name": "generation",
            "duration": time.time() - start
        })
        
        # Add performance metrics
        if isinstance(result, dict) and result.get("sources"):
            metrics["performance_metrics"] = metrics_analyzer.calculate_response_metrics(
                result["sources"],
                args[1],  # question
                result.get("answer", "")
            )
            
        metrics["memory_usage"] = {
            "embedding_size": len(docs) * 384,  # Size of embedding vectors
            "total_chunks": len(docs),
            "avg_chunk_size": sum(len(d.page_content) for d in docs) / len(docs)
        }
        
        metrics["total_duration"] = time.time() - metrics["start_time"]
        if isinstance(result, dict):
            result["metrics"] = metrics
        return result
    return wrapper

@track_processing_time
def answer_with_simple_rag(text: str, question: str):
    try:
        vectorstore, _, _, metadata = create_vector_store(text)
        # Reduce number of retrieved documents
        retriever = vectorstore.as_retriever(search_type="similarity", k=1)
        
        # Get relevant documents and limit context size
        docs = retriever.get_relevant_documents(question)
        context = " ".join(doc.page_content for doc in docs)
        context = truncate_context(context)
        
        # Create a simplified prompt with limited context
        prompt = f"Question: {question}\nContext: {context}\nAnswer concisely:"
        
        # Use the LLM with processed context
        result = llm.invoke(prompt)
        
        return {
            "architecture": "SimpleRAG",
            "answer": result.content if hasattr(result, 'content') else result,
            "sources": [{"content": doc.page_content[:500], "page": doc.metadata.get("page")} for doc in docs],
            "metadata": {
                "chunks": metadata["chunks"],
                "embedding_model": metadata["embedding_model"],
                "total_tokens": metadata["total_tokens"],
                "retriever_type": "vector_similarity"
            }
        }
    except Exception as e:
        return {
            "architecture": "SimpleRAG",
            "answer": f"Error: {str(e)}",
            "sources": [],
            "metadata": {}
        }

@track_processing_time
def answer_with_hybrid_rag(text: str, question: str):
    try:
        vectorstore, bm25_retriever, _, metadata = create_vector_store(text)
        # Reduce retrieved documents
        vector_docs = vectorstore.similarity_search(question, k=1)
        bm25_docs = bm25_retriever.get_relevant_documents(question)[:1]
        
        # Process and combine contexts with limits
        combined_context = []
        sources = []
        seen = set()
        
        for doc in vector_docs + bm25_docs:
            if doc.page_content not in seen:
                processed_content = truncate_context(doc.page_content, MAX_CONTEXT_LENGTH // 2)
                combined_context.append(processed_content)
                sources.append({
                    "content": processed_content[:500],
                    "page": doc.metadata.get("page"),
                    "retriever": "vector" if doc in vector_docs else "bm25"
                })
                seen.add(doc.page_content)
        
        # Create simplified prompt with limited context
        context = " ".join(combined_context)
        prompt = f"Question: {question}\nContext: {context}\nAnswer concisely:"
        result = llm.invoke(prompt)
        
        return {
            "architecture": "HybridRAG",
            "answer": result.content if hasattr(result, 'content') else result,
            "sources": sources,
            "metadata": {
                "chunks": metadata["chunks"],
                "embedding_model": metadata["embedding_model"],
                "total_tokens": metadata["total_tokens"],
                "retriever_type": "hybrid_vector_bm25"
            }
        }
    except Exception as e:
        return {
            "architecture": "HybridRAG",
            "answer": f"Error: {str(e)}",
            "sources": [],
            "metadata": {}
        }

@track_processing_time
def answer_with_reranker_rag(text: str, question: str):
    try:
        vectorstore, _, _, metadata = create_vector_store(text)
        # Get more initial docs but fewer final ones
        initial_docs = vectorstore.similarity_search(question, k=5)
        pairs = [(question, doc.page_content) for doc in initial_docs]
        scores = reranker.predict(pairs)
        reranked = sorted(zip(scores, initial_docs), reverse=True)[:1]  # Only take top result
        
        # Process context with limits
        context = truncate_context(reranked[0][1].page_content)
        prompt = f"Question: {question}\nContext: {context}\nAnswer concisely:"
        
        # Use direct LLM call instead of chain
        result = llm.invoke(prompt)
        
        return {
            "architecture": "ReRankerRAG",
            "answer": result.content if hasattr(result, 'content') else result,
            "sources": [
                {
                    "content": doc.page_content[:500],
                    "page": doc.metadata.get("page"),
                    "score": float(score)
                } for score, doc in reranked[:1]  # Only include top result
            ],
            "metadata": {
                "chunks": metadata["chunks"],
                "embedding_model": metadata["embedding_model"],
                "total_tokens": metadata["total_tokens"],
                "retriever_type": "reranked_vector",
                "reranker_model": "ms-marco-MiniLM-L-6-v2"
            }
        }
    except Exception as e:
        return {
            "architecture": "ReRankerRAG",
            "answer": f"Error: {str(e)}",
            "sources": [],
            "metadata": {}
        }
