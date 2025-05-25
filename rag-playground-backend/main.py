from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import uuid
import time
from utils import extract_text_from_pdf
from rag_engine import (
    answer_with_simple_rag,
    answer_with_hybrid_rag,
    answer_with_reranker_rag
)
import json
import gc

# Load environment variables and configure port
load_dotenv()
PORT = int(os.getenv("PORT", "10000"))

# Update CORS settings
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(
    title="RAG Playground API",
    description="API for RAG Playground",
    version="1.0.0"
)

# Memory optimization
@app.middleware("http")
async def clean_up_memory(request, call_next):
    response = await call_next(request)
    gc.collect()  # Force garbage collection
    return response

# Update UPLOAD_DIR path to be absolute
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploaded_pdfs")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Memory optimization settings
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit
MAX_TEXT_LENGTH = 10000  # Limit text length

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/query")
async def query(
    pdf: UploadFile = File(...),
    query: str = Form(...),
    architectures: str = Form(...)
):
    if not pdf.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only PDF files are accepted."
        )

    file_path = None
    try:
        # Parse architectures early to validate JSON
        try:
            architectures_list = json.loads(architectures)
            if not architectures_list or not isinstance(architectures_list, list):
                raise HTTPException(status_code=400, detail="Invalid architectures format")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid architectures JSON")

        # Save PDF with better error handling
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
        
        try:
            content = await pdf.read()
            if len(content) == 0:
                raise HTTPException(status_code=400, detail="Empty PDF file uploaded")
            
            # Ensure file handle is closed after writing
            with open(file_path, "wb") as f:
                f.write(content)
            
            if not os.path.exists(file_path):
                raise HTTPException(status_code=500, detail="Failed to save PDF file")
                
            print(f"Saved PDF to {file_path}")
            
            # Process the PDF
            text = extract_text_from_pdf(file_path)[:MAX_TEXT_LENGTH]
            if not text or not text.strip():
                raise HTTPException(status_code=400, detail="No text content found in PDF")
            
            # Process one architecture at a time
            results = []
            for arch in architectures_list[:1]:  # Only process first selected architecture
                try:
                    gc.collect()  # Clean up before each processing
                    start_time = time.time()
                    if arch == "SimpleRAG":
                        result = answer_with_simple_rag(text, query)
                    elif arch == "HybridRAG":
                        result = answer_with_hybrid_rag(text, query)
                    elif arch == "ReRankerRAG":
                        result = answer_with_reranker_rag(text, query)
                    else:
                        continue  # Skip unsupported architectures

                    result["time"] = round(time.time() - start_time, 2)
                    results.append(result)
                except Exception as e:
                    results.append({
                        "architecture": arch,
                        "answer": f"Error: {str(e)}",
                        "sources": [],
                        "time": 0
                    })

            return {"results": results}

        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=400, detail=str(e))
            
    finally:
        # Cleanup in finally block
        try:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                print(f"Cleaned up file: {file_path}")
        except Exception as e:
            print(f"Failed to cleanup file {file_path}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print(f"Starting server on port {PORT}")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        workers=1,
        limit_max_requests=50,  # Restart worker after 50 requests
        timeout_keep_alive=30
    )


