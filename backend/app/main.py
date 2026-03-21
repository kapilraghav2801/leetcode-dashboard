from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db import engine
from app.models.models import Base
from app.routers import auth, topics, questions, solutions, stats

# Create tables on startup (use Alembic in prod for migrations)
Base.metadata.create_all(bind=engine)

settings = get_settings()

app = FastAPI(
    title="Kapil's LeetCode Portal API",
    description="Backend for kapilraghav.info/leetcode",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(topics.router, prefix=API_PREFIX)
app.include_router(questions.router, prefix=API_PREFIX)
app.include_router(solutions.router, prefix=API_PREFIX)
app.include_router(stats.router, prefix=API_PREFIX)


@app.get("/health")
def health():
    return {"status": "ok"}
