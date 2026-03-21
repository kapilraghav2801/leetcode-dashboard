from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Topic ───────────────────────────────────────────────

class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0


class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None


class TopicOut(BaseModel):
    id: UUID4
    title: str
    slug: str
    description: Optional[str]
    order: int
    question_count: int = 0
    solved_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Question ────────────────────────────────────────────

class QuestionCreate(BaseModel):
    title: str
    difficulty: str = "Medium"
    leetcode_url: Optional[str] = None
    companies: list[str] = []
    notes: Optional[str] = None
    is_solved: bool = False


class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    difficulty: Optional[str] = None
    leetcode_url: Optional[str] = None
    companies: Optional[list[str]] = None
    notes: Optional[str] = None
    is_solved: Optional[bool] = None


class QuestionOut(BaseModel):
    id: UUID4
    topic_id: UUID4
    title: str
    slug: str
    difficulty: str
    leetcode_url: Optional[str]
    companies: list[str] = []
    notes: Optional[str]
    is_solved: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Solution ────────────────────────────────────────────

class MySolutionCreate(BaseModel):
    code: str
    language: str = "python"
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None


class MySolutionUpdate(BaseModel):
    code: Optional[str] = None
    language: Optional[str] = None
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None


class WebSolutionOut(BaseModel):
    title: str
    url: str
    source: str = "web"


class SolutionOut(BaseModel):
    id: UUID4
    source: str
    title: Optional[str]
    url: Optional[str]
    code: Optional[str]
    language: Optional[str]
    time_complexity: Optional[str]
    space_complexity: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Stats ───────────────────────────────────────────────

class StatsOut(BaseModel):
    total: int
    solved: int
    easy_total: int
    easy_solved: int
    medium_total: int
    medium_solved: int
    hard_total: int
    hard_solved: int
    topics_breakdown: list[dict]
    top_companies: list[dict]
