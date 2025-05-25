from fastapi.middleware.cors import CORSMiddleware
# ...existing imports...

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.vercel.app"],  # Update this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
