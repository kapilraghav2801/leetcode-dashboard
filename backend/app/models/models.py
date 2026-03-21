from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.db import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False, unique=True)
    slug = Column(String(200), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)

    title = Column(String(300), nullable=False)
    slug = Column(String(300), nullable=False)
    difficulty = Column(String(10), nullable=False, default="Medium")  # Easy / Medium / Hard
    leetcode_url = Column(String(500), nullable=True)
    companies = Column(ARRAY(String), default=[])  # ["Google", "Amazon", "Meta"]
    notes = Column(Text, nullable=True)
    is_solved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="questions")
    solutions = relationship("Solution", back_populates="question", cascade="all, delete-orphan")


class Solution(Base):
    __tablename__ = "solutions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)

    source = Column(String(20), nullable=False)  # "mine" | "web"
    title = Column(String(300), nullable=True)   # e.g. "NeetCode solution" for web
    url = Column(String(500), nullable=True)     # for web solutions: link to video/post
    code = Column(Text, nullable=True)           # for my solutions: actual code
    language = Column(String(30), nullable=True) # python, java, cpp
    time_complexity = Column(String(50), nullable=True)
    space_complexity = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    question = relationship("Question", back_populates="solutions")
