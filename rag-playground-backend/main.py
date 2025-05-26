from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
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
import logging

# Load environment variables and configure port
load_dotenv()
PORT = int(os.getenv("PORT", "10000"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RAG Playground API",
    description="API for RAG Playground",
    version="1.0.0",
    root_path=""  # Important for Render deployment
)

# Update CORS settings
origins = [
    "*"
]

# Update CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Memory optimization
@app.middleware("http")
async def clean_up_memory(request, call_next):
    response = await call_next(request)
    gc.collect()  # Force garbage collection
    return response

# Update UPLOAD_DIR configuration
if os.environ.get('RENDER'):
    UPLOAD_DIR = "/tmp/uploaded_pdfs"  # Use /tmp for Render
else:
    UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploaded_pdfs"))

# Ensure upload directory exists
try:
    os.makedirs(UPLOAD_DIR, mode=0o777, exist_ok=True)
    logger.info(f"Created upload directory at: {UPLOAD_DIR}")
except Exception as e:
    logger.error(f"Failed to create upload directory: {e}")
    UPLOAD_DIR = "/tmp"  # Fallback to /tmp if creation fails
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    logger.info(f"Using fallback upload directory: {UPLOAD_DIR}")

# Memory optimization settings
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit
MAX_TEXT_LENGTH = 10000  # Limit text length

# Add root endpoint
@app.get("/")
@app.head("/")
async def root():
    return {"status": "healthy", "message": "RAG Playground API is running"}

@app.options("/query")
async def query_options():
    return {"status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/query")
async def query(
    pdf: UploadFile = File(...),
    query: str = Form(...),
    architectures: str = Form(...)
):
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
        logger.info(f"Attempting to save file to: {file_path}")
        
        # Save PDF
        content = await pdf.read()
        logger.info(f"Read file content, size: {len(content)} bytes")
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        if os.path.exists(file_path):
            logger.info(f"Successfully saved file at: {file_path}")
            file_size = os.path.getsize(file_path)
            logger.info(f"File size on disk: {file_size} bytes")
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="Failed to save PDF file")
            
        logger.info(f"Saved PDF to {file_path}")
        
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
                logger.info(f"Cleaned up file: {file_path}")
        except Exception as e:
            logger.error(f"Failed to cleanup file {file_path}: {str(e)}")

# Add error logger
@app.middleware("http")
async def log_requests(request, call_next):
    try:
        response = await call_next(request)
        logger.info(f"Request: {request.method} {request.url} - Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise

# Add error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting server on port {PORT}")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Important: bind to all interfaces
        port=PORT,
        reload=False,
        workers=1,
        log_level="info",
        access_log=True,
        limit_concurrency=10,
        timeout_keep_alive=65,
    )
