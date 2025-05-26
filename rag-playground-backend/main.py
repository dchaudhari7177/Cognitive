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

# Update CORS settings
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://cognitive-seven.vercel.app",
]

# Create FastAPI app
app = FastAPI(
    title="RAG Playground API",
    description="API for RAG Playground",
    version="1.0.0",
    root_path=""  # Important for Render deployment
)

# Configure CORS with updated settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,  # Important: set to False for public API
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add preflight handler
@app.options("/{path:path}")
async def preflight_handler(path: str):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        },
    )

# Memory optimization
@app.middleware("http")
async def clean_up_memory(request, call_next):
    response = await call_next(request)
    gc.collect()  # Force garbage collection
    return response

# Update UPLOAD_DIR configuration
if os.environ.get('RENDER'):
    # On Render.com, use a path that's definitely writable
    UPLOAD_DIR = "/tmp/uploaded_pdfs"
else:
    # Local development path
    UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploaded_pdfs"))

# Ensure upload directory exists with proper permissions
try:
    os.makedirs(UPLOAD_DIR, mode=0o777, exist_ok=True)
    logger.info(f"Upload directory configured and created at: {UPLOAD_DIR}")
except Exception as e:
    logger.error(f"Failed to create upload directory: {e}")
    # Use /tmp as fallback
    UPLOAD_DIR = "/tmp"
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
    architectures: str = Form(...),
    settings: str = Form(None)  # Make settings optional
):
    file_path = None
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
    }
    
    try:
        # Verify upload directory exists and is writable
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR, mode=0o777, exist_ok=True)
        
        if not os.access(UPLOAD_DIR, os.W_OK):
            logger.error(f"Upload directory {UPLOAD_DIR} is not writable")
            raise HTTPException(status_code=500, detail="Server configuration error - upload directory not writable")

        # Parse architectures early to validate JSON
        try:
            architectures_list = json.loads(architectures)
            if not architectures_list or not isinstance(architectures_list, list):
                raise HTTPException(status_code=400, detail="Invalid architectures format")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid architectures JSON")

        # Update file path handling
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
        logger.info(f"Attempting to save file to: {file_path}")
        
        try:
            content = await pdf.read()
            with open(file_path, "wb") as f:
                f.write(content)
            logger.info(f"Successfully saved file at: {file_path}")
        except Exception as e:
            logger.error(f"Failed to save file: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

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

        return JSONResponse(content={"results": results}, headers=headers)

    except Exception as e:
        logger.error(f"Error processing request: {e}")
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as cleanup_error:
                logger.error(f"Failed to cleanup file: {cleanup_error}")
        raise HTTPException(status_code=500, detail=str(e))

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
        forwarded_allow_ips="*",  # Important for proxy support
    )


