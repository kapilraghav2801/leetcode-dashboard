from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
from app.db import get_db
from app.models.models import Question, Topic
from app.schemas.schemas import StatsOut
from app.services.cache import cache_get, cache_set
from app.core.security import get_current_admin

router = APIRouter(prefix="/stats", tags=["stats"])

CACHE_KEY = "leetcode:stats:summary"


@router.get("/summary", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    cached = cache_get(CACHE_KEY)
    if cached:
        return cached

    questions = db.query(Question).all()

    total = len(questions)
    solved = sum(1 for q in questions if q.is_solved)

    by_diff = {d: {"total": 0, "solved": 0} for d in ["Easy", "Medium", "Hard"]}
    all_companies = []

    for q in questions:
        d = q.difficulty if q.difficulty in by_diff else "Medium"
        by_diff[d]["total"] += 1
        if q.is_solved:
            by_diff[d]["solved"] += 1
        if q.companies:
            all_companies.extend(q.companies)

    # Per-topic breakdown
    topics = db.query(Topic).order_by(Topic.order).all()
    topics_breakdown = []
    for t in topics:
        t_qs = [q for q in questions if str(q.topic_id) == str(t.id)]
        topics_breakdown.append({
            "topic": t.title,
            "total": len(t_qs),
            "solved": sum(1 for q in t_qs if q.is_solved),
        })

    # Top companies
    company_counts = Counter(all_companies)
    top_companies = [{"company": c, "count": n} for c, n in company_counts.most_common(10)]

    result = {
        "total": total,
        "solved": solved,
        "easy_total": by_diff["Easy"]["total"],
        "easy_solved": by_diff["Easy"]["solved"],
        "medium_total": by_diff["Medium"]["total"],
        "medium_solved": by_diff["Medium"]["solved"],
        "hard_total": by_diff["Hard"]["total"],
        "hard_solved": by_diff["Hard"]["solved"],
        "topics_breakdown": topics_breakdown,
        "top_companies": top_companies,
    }

    cache_set(CACHE_KEY, result, ttl=3600)
    return result


@router.post("/invalidate-cache")
def invalidate_stats_cache(_=Depends(get_current_admin)):
    from app.services.cache import cache_delete
    cache_delete(CACHE_KEY)
    return {"message": "Stats cache cleared"}
