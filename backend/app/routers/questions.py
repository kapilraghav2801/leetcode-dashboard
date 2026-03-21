from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.models import Question, Topic
from app.schemas.schemas import QuestionCreate, QuestionUpdate, QuestionOut
from app.core.security import get_current_admin
import re

router = APIRouter(tags=["questions"])


def make_slug(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


# List questions under a topic (public)
@router.get("/topics/{topic_id}/questions", response_model=list[QuestionOut])
def list_questions(topic_id: str, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return db.query(Question).filter(Question.topic_id == topic_id).order_by(Question.created_at).all()


# Add question to topic (admin)
@router.post("/topics/{topic_id}/questions", response_model=QuestionOut, status_code=201)
def create_question(
    topic_id: str,
    body: QuestionCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    q = Question(
        topic_id=topic_id,
        title=body.title,
        slug=make_slug(body.title),
        difficulty=body.difficulty,
        leetcode_url=body.leetcode_url,
        companies=body.companies,
        notes=body.notes,
        is_solved=body.is_solved,
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


# Update question (admin) - used to add companies, mark solved, etc.
@router.patch("/questions/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: str,
    body: QuestionUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(q, field, val)
    db.commit()
    db.refresh(q)
    return q


# Delete question (admin)
@router.delete("/questions/{question_id}", status_code=204)
def delete_question(question_id: str, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()


# Get single question (public)
@router.get("/questions/{question_id}", response_model=QuestionOut)
def get_question(question_id: str, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q
