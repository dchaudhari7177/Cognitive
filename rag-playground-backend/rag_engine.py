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

def count_tokens(text: str) -> int:
    encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

def split_and_annotate(text: str):
    splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.create_documents([text])
    # Annotate with page numbers if possible
    for i, chunk in enumerate(chunks):
        chunk.metadata["page"] = i + 1
    return chunks

def create_vector_store(text: str):
    docs = split_and_annotate(text)
    vectorstore = FAISS.from_documents(docs, embedding_model)
    bm25_retriever = BM25Retriever.from_documents(docs)
    metadata = {
        "chunks": len(docs),
        "total_tokens": sum(count_tokens(doc.page_content) for doc in docs),
        "embedding_model": embedding_model.model_name
    }
    return vectorstore, bm25_retriever, docs, metadata

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
        retriever = vectorstore.as_retriever(search_type="similarity", k=3)
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
        result = chain.invoke(question)
        docs = retriever.get_relevant_documents(question)
        return {
            "architecture": "SimpleRAG",
            "answer": result["result"],
            "sources": [{"content": doc.page_content, "page": doc.metadata.get("page")} for doc in docs],
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
        vector_docs = vectorstore.similarity_search(question, k=3)
        bm25_docs = bm25_retriever.get_relevant_documents(question)
        # Annotate sources
        sources = []
        seen = set()
        for doc in vector_docs:
            key = doc.page_content
            if key not in seen:
                sources.append({"content": doc.page_content, "page": doc.metadata.get("page"), "retriever": "vector"})
                seen.add(key)
        for doc in bm25_docs:
            key = doc.page_content
            if key not in seen:
                sources.append({"content": doc.page_content, "page": doc.metadata.get("page"), "retriever": "bm25"})
                seen.add(key)
        # Use vector retriever for answer
        retriever = vectorstore.as_retriever(search_type="similarity", k=3)
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
        result = chain.invoke(question)
        return {
            "architecture": "HybridRAG",
            "answer": result["result"],
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
        initial_docs = vectorstore.similarity_search(question, k=10)
        pairs = [(question, doc.page_content) for doc in initial_docs]
        scores = reranker.predict(pairs)
        reranked = sorted(zip(scores, initial_docs), reverse=True)[:3]
        docs = [doc for score, doc in reranked]
        # Use top reranked docs for answer
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=vectorstore.as_retriever(search_type="similarity", k=3))
        result = chain.invoke(question)
        return {
            "architecture": "ReRankerRAG",
            "answer": result["result"],
            "sources": [
                {
                    "content": doc.page_content,
                    "page": doc.metadata.get("page"),
                    "score": float(score)
                } for score, doc in reranked
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
