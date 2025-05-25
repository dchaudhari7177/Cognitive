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
import sys
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Update port configuration
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(
    title="RAG Playground API",
    description="API for RAG Playground",
    version="1.0.0"
)

# Update CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Update UPLOAD_DIR path to be absolute
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploaded_pdfs")
os.makedirs(UPLOAD_DIR, exist_ok=True)

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
            text = extract_text_from_pdf(file_path)
            if not text or not text.strip():
                raise HTTPException(status_code=400, detail="No text content found in PDF")
            
            # Process RAG queries
            results = []
            for arch in architectures_list:
                try:
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

# Add error handling middleware
@app.middleware("http")
async def catch_exceptions_middleware(request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "error": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        proxy_headers=True,
        forwarded_allow_ips="*"
    )
