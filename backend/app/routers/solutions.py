from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.models import Solution, Question
from app.schemas.schemas import MySolutionCreate, MySolutionUpdate, SolutionOut, WebSolutionOut
from app.core.security import get_current_admin
from app.services.scraper import fetch_web_solutions

router = APIRouter(prefix="/questions/{question_id}/solutions", tags=["solutions"])


def get_question_or_404(question_id: str, db: Session) -> Question:
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q


# Get my solution (public)
@router.get("/mine", response_model=SolutionOut | None)
def get_my_solution(question_id: str, db: Session = Depends(get_db)):
    get_question_or_404(question_id, db)
    sol = db.query(Solution).filter(
        Solution.question_id == question_id,
        Solution.source == "mine"
    ).first()
    return sol  # returns null if not added yet


# Save / update my solution (admin)
@router.put("/mine", response_model=SolutionOut)
def upsert_my_solution(
    question_id: str,
    body: MySolutionCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    get_question_or_404(question_id, db)
    sol = db.query(Solution).filter(
        Solution.question_id == question_id,
        Solution.source == "mine"
    ).first()
    if sol:
        for field, val in body.model_dump(exclude_none=True).items():
            setattr(sol, field, val)
    else:
        sol = Solution(
            question_id=question_id,
            source="mine",
            code=body.code,
            language=body.language,
            time_complexity=body.time_complexity,
            space_complexity=body.space_complexity,
        )
        db.add(sol)
    db.commit()
    db.refresh(sol)
    return sol


# Fetch web solutions (public — triggers scraper)
@router.get("/web", response_model=list[WebSolutionOut])
async def get_web_solutions(question_id: str, db: Session = Depends(get_db)):
    q = get_question_or_404(question_id, db)
    results = await fetch_web_solutions(q.title, q.slug, q.leetcode_url)
    return results
