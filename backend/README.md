# LeetCode Portal — FastAPI Backend

Backend for `kapilraghav.info/leetcode`.

## Stack
- **FastAPI** — API framework
- **PostgreSQL** (Supabase) — main database
- **Redis** (Upstash) — stats caching
- **SQLAlchemy** — ORM
- **JWT** — single-admin auth

## Local Setup

```bash
# 1. Clone and enter directory
cd leetcode-api

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 5. Generate your admin password hash
python generate_hash.py yourpassword
# Copy the output hash into .env as ADMIN_PASSWORD_HASH

# 6. Run the server
uvicorn app.main:app --reload
```

API docs available at: http://localhost:8000/docs

## Project Structure

```
app/
  main.py                  # App entry, CORS, router registration
  db.py                    # SQLAlchemy engine + session
  core/
    config.py              # Pydantic settings (reads .env)
    security.py            # JWT create/verify, bcrypt, auth dependency
  models/
    models.py              # Topic, Question, Solution ORM models
  schemas/
    schemas.py             # Pydantic request/response schemas
  routers/
    auth.py                # POST /api/v1/auth/login
    topics.py              # GET/POST/PATCH/DELETE /api/v1/topics
    questions.py           # CRUD under /api/v1/topics/{id}/questions
    solutions.py           # My solution + web solutions per question
    stats.py               # GET /api/v1/stats/summary
  services/
    scraper.py             # Fetches YouTube + GitHub solutions by title
    cache.py               # Redis get/set/delete wrapper
```

## API Endpoints

### Public (no auth needed)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/topics` | List all topics with question counts |
| GET | `/api/v1/topics/{id}/questions` | Questions under a topic |
| GET | `/api/v1/questions/{id}` | Single question detail |
| GET | `/api/v1/questions/{id}/solutions/mine` | Your solution (read-only) |
| GET | `/api/v1/questions/{id}/solutions/web` | Scraped web solutions |
| GET | `/api/v1/stats/summary` | Progress stats for homepage |

### Admin (JWT required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Get JWT token |
| POST | `/api/v1/topics` | Create topic |
| PATCH | `/api/v1/topics/{id}` | Update topic |
| DELETE | `/api/v1/topics/{id}` | Delete topic |
| POST | `/api/v1/topics/{id}/questions` | Add question |
| PATCH | `/api/v1/questions/{id}` | Update question (companies, solved, etc.) |
| DELETE | `/api/v1/questions/{id}` | Delete question |
| PUT | `/api/v1/questions/{id}/solutions/mine` | Save/update your solution |

## Database Models

### Topic
- `id`, `title`, `slug`, `description`, `order`, `created_at`

### Question
- `id`, `topic_id`, `title`, `slug`, `difficulty`
- `leetcode_url` — link to the problem
- `companies` — array of company names e.g. `["Google", "Amazon"]`
- `notes`, `is_solved`, `created_at`

### Solution
- `id`, `question_id`, `source` (`mine` | `web`)
- `code`, `language`, `time_complexity`, `space_complexity` — for your solutions
- `url`, `title` — for web solutions

## Deployment (Render)

1. Push to GitHub
2. Create a new Web Service on Render, connect the repo
3. Set all env vars from `.env.example` in Render dashboard
4. Deploy — `render.yaml` handles the rest

## Stats Caching

Stats are cached in Redis for 1 hour. Cache auto-invalidates on next request after TTL.
To manually clear: `POST /api/v1/stats/invalidate-cache` (no auth needed — low risk data).
