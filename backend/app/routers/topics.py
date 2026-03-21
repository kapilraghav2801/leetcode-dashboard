from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import get_db
from app.models.models import Topic, Question
from app.schemas.schemas import TopicCreate, TopicUpdate, TopicOut
from app.core.security import get_current_admin
import re

router = APIRouter(prefix="/topics", tags=["topics"])


def make_slug(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


@router.get("", response_model=list[TopicOut])
def list_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).order_by(Topic.order, Topic.title).all()
    result = []
    for t in topics:
        q_total = db.query(func.count(Question.id)).filter(Question.topic_id == t.id).scalar()
        q_solved = db.query(func.count(Question.id)).filter(
            Question.topic_id == t.id, Question.is_solved == True
        ).scalar()
        out = TopicOut.model_validate(t)
        out.question_count = q_total
        out.solved_count = q_solved
        result.append(out)
    return result


@router.post("", response_model=TopicOut, status_code=201)
def create_topic(body: TopicCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    slug = make_slug(body.title)
    existing = db.query(Topic).filter(Topic.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Topic with this title already exists")
    topic = Topic(title=body.title, slug=slug, description=body.description, order=body.order)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    out = TopicOut.model_validate(topic)
    out.question_count = 0
    out.solved_count = 0
    return out


@router.patch("/{topic_id}", response_model=TopicOut)
def update_topic(topic_id: str, body: TopicUpdate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(topic, field, val)
    if body.title:
        topic.slug = make_slug(body.title)
    db.commit()
    db.refresh(topic)
    q_total = db.query(func.count(Question.id)).filter(Question.topic_id == topic.id).scalar()
    q_solved = db.query(func.count(Question.id)).filter(Question.topic_id == topic.id, Question.is_solved == True).scalar()
    out = TopicOut.model_validate(topic)
    out.question_count = q_total
    out.solved_count = q_solved
    return out


@router.delete("/{topic_id}", status_code=204)
def delete_topic(topic_id: str, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()
