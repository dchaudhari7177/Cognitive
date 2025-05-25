from fastapi.middleware.cors import CORSMiddleware
import os

# ...existing imports...

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://rag-playground-frontend-gray.vercel.app").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ...existing code...
