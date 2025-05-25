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

# Update port configuration
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

# Update CORS settings with specific domain
ALLOWED_ORIGINS = [
    "https://cognitive-seven.vercel.app",
    "http://localhost:3000",  # For local development
]

app = FastAPI(
    title="RAG Playground API",
    description="API for RAG Playground",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Configure more detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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
    logger.info(f"Received query request with file: {pdf.filename}")
    
    if not pdf.filename.lower().endswith('.pdf'):
        logger.error(f"Invalid file format: {pdf.filename}")
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only PDF files are accepted."
        )

    file_path = None
    try:
        # Parse architectures with better error handling
        try:
            architectures_list = json.loads(architectures)
            if not architectures_list or not isinstance(architectures_list, list):
                logger.error(f"Invalid architectures format: {architectures}")
                raise HTTPException(status_code=400, detail="Invalid architectures format")
        except json.JSONDecodeError as e:
            logger.error(f"Invalid architectures JSON: {e}")
            raise HTTPException(status_code=400, detail="Invalid architectures JSON")

        # Save PDF with better error handling
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
        
        try:
            content = await pdf.read()
            content_size = len(content)
            logger.info(f"PDF size: {content_size} bytes")
            
            if content_size == 0:
                raise HTTPException(status_code=400, detail="Empty PDF file uploaded")
            elif content_size > 10 * 1024 * 1024:  # 10MB limit
                raise HTTPException(status_code=400, detail="PDF file too large. Maximum size is 10MB")
            
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
            logger.error(f"Error processing request: {str(e)}")
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

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
    logger.info(f"Starting server on {HOST}:{PORT}")
    import uvicorn
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        proxy_headers=True,
        forwarded_allow_ips="*"
    )
