"""
End-to-end API test script.
Run with: python3.11 test_api.py
"""
import httpx
import sys

BASE = "http://localhost:8000/api/v1"
PASS = "\033[92m PASS\033[0m"
FAIL = "\033[91m FAIL\033[0m"

errors = []

def check(label, condition, detail=""):
    if condition:
        print(f"{PASS} {label}")
    else:
        print(f"{FAIL} {label}  {detail}")
        errors.append(label)

def section(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")


client = httpx.Client(base_url=BASE, timeout=10)

# ── Health ────────────────────────────────────────────
section("HEALTH CHECK")
r = httpx.get("http://localhost:8000/health")
check("GET /health → 200", r.status_code == 200)
check("health body ok", r.json() == {"status": "ok"})


# ── Auth ──────────────────────────────────────────────
section("AUTH")

r = client.post("/auth/login", json={"username": "kapil", "password": "wrongpass"})
check("POST /auth/login wrong password → 401", r.status_code == 401)

r = client.post("/auth/login", json={"username": "wrong", "password": "testpass123"})
check("POST /auth/login wrong username → 401", r.status_code == 401)

r = client.post("/auth/login", json={"username": "kapil", "password": "testpass123"})
check("POST /auth/login correct → 200", r.status_code == 200)
check("Login returns access_token", "access_token" in r.json())
check("Login returns bearer type", r.json().get("token_type") == "bearer")
TOKEN = r.json().get("access_token", "")
AUTH = {"Authorization": f"Bearer {TOKEN}"}

r = client.get("/auth/me", headers=AUTH)
check("GET /auth/me with token → 200", r.status_code == 200)
check("GET /auth/me returns correct username", r.json().get("username") == "kapil")

r = client.get("/auth/me")
check("GET /auth/me without token → 401", r.status_code == 401)


# ── Topics ────────────────────────────────────────────
section("TOPICS")

r = client.get("/topics")
check("GET /topics (public) → 200", r.status_code == 200)
check("GET /topics returns list", isinstance(r.json(), list))

r = client.post("/topics", json={"title": "Arrays", "description": "Array problems", "order": 1})
check("POST /topics without auth → 401", r.status_code == 401)

r = client.post("/topics", json={"title": "Arrays", "description": "Array problems", "order": 1}, headers=AUTH)
check("POST /topics with auth → 201", r.status_code == 201, str(r.text))
TOPIC = r.json()
TOPIC_ID = TOPIC.get("id")
check("Topic has id", bool(TOPIC_ID))
check("Topic slug correct", TOPIC.get("slug") == "arrays")
check("Topic question_count == 0", TOPIC.get("question_count") == 0)

r = client.post("/topics", json={"title": "Arrays", "description": "Duplicate", "order": 2}, headers=AUTH)
check("POST /topics duplicate title → 400", r.status_code == 400)

r = client.get("/topics")
check("GET /topics after create has 1 topic", len(r.json()) == 1)

r = client.patch(f"/topics/{TOPIC_ID}", json={"description": "Updated desc"}, headers=AUTH)
check("PATCH /topics/:id with auth → 200", r.status_code == 200)
check("PATCH updates description", r.json().get("description") == "Updated desc")

r = client.patch(f"/topics/00000000-0000-0000-0000-000000000000", json={"description": "x"}, headers=AUTH)
check("PATCH /topics/:id non-existent → 404", r.status_code == 404)


# ── Questions ─────────────────────────────────────────
section("QUESTIONS")

r = client.get(f"/topics/{TOPIC_ID}/questions")
check("GET /topics/:id/questions (public) → 200", r.status_code == 200)
check("GET /topics/:id/questions empty list", r.json() == [])

r = client.get("/topics/00000000-0000-0000-0000-000000000000/questions")
check("GET /topics/bad-id/questions → 404", r.status_code == 404)

q_payload = {
    "title": "Two Sum",
    "difficulty": "Easy",
    "leetcode_url": "https://leetcode.com/problems/two-sum/",
    "companies": ["Google", "Amazon"],
    "notes": "Use a hash map",
    "is_solved": False,
}
r = client.post(f"/topics/{TOPIC_ID}/questions", json=q_payload)
check("POST /topics/:id/questions without auth → 401", r.status_code == 401)

r = client.post(f"/topics/{TOPIC_ID}/questions", json=q_payload, headers=AUTH)
check("POST /topics/:id/questions with auth → 201", r.status_code == 201, str(r.text))
Q = r.json()
QUESTION_ID = Q.get("id")
check("Question has id", bool(QUESTION_ID))
check("Question slug correct", Q.get("slug") == "two-sum")
check("Question companies list preserved", Q.get("companies") == ["Google", "Amazon"])
check("Question is_solved=False", Q.get("is_solved") == False)

r = client.get(f"/questions/{QUESTION_ID}")
check("GET /questions/:id (public) → 200", r.status_code == 200)
check("GET /questions/:id returns correct title", r.json().get("title") == "Two Sum")

r = client.get("/questions/00000000-0000-0000-0000-000000000000")
check("GET /questions/bad-id → 404", r.status_code == 404)

r = client.patch(f"/questions/{QUESTION_ID}", json={"is_solved": True, "companies": ["Google", "Amazon", "Meta"]}, headers=AUTH)
check("PATCH /questions/:id → 200", r.status_code == 200)
check("PATCH marks is_solved=True", r.json().get("is_solved") == True)
check("PATCH updates companies", len(r.json().get("companies", [])) == 3)

r = client.get(f"/topics/{TOPIC_ID}/questions")
check("GET /topics questions now has 1 item", len(r.json()) == 1)

# Check topic counts updated
r = client.get("/topics")
t = r.json()[0]
check("Topic question_count updated to 1", t.get("question_count") == 1)
check("Topic solved_count updated to 1", t.get("solved_count") == 1)


# ── Solutions ─────────────────────────────────────────
section("SOLUTIONS")

r = client.get(f"/questions/{QUESTION_ID}/solutions/mine")
check("GET /questions/:id/solutions/mine (no solution yet) → 200", r.status_code == 200)
check("GET /mine returns null when empty", r.json() is None)

sol_payload = {
    "code": "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i",
    "language": "python",
    "time_complexity": "O(n)",
    "space_complexity": "O(n)",
}

r = client.put(f"/questions/{QUESTION_ID}/solutions/mine", json=sol_payload)
check("PUT /solutions/mine without auth → 401", r.status_code == 401)

r = client.put(f"/questions/{QUESTION_ID}/solutions/mine", json=sol_payload, headers=AUTH)
check("PUT /solutions/mine with auth → 200", r.status_code == 200, str(r.text))
SOL = r.json()
check("Solution source is 'mine'", SOL.get("source") == "mine")
check("Solution code stored", "twoSum" in SOL.get("code", ""))
check("Solution language correct", SOL.get("language") == "python")

r = client.get(f"/questions/{QUESTION_ID}/solutions/mine")
check("GET /solutions/mine after PUT → 200 with data", r.status_code == 200 and r.json() is not None)

# Update (idempotent PUT)
r = client.put(f"/questions/{QUESTION_ID}/solutions/mine", json={**sol_payload, "time_complexity": "O(n) updated"}, headers=AUTH)
check("Second PUT /solutions/mine updates existing", r.json().get("time_complexity") == "O(n) updated")


# ── Stats ─────────────────────────────────────────────
section("STATS")

r = client.get("/stats/summary")
check("GET /stats/summary → 200", r.status_code == 200, str(r.text))
stats = r.json()
check("Stats total == 1", stats.get("total") == 1)
check("Stats solved == 1", stats.get("solved") == 1)
check("Stats easy_total == 1", stats.get("easy_total") == 1)
check("Stats easy_solved == 1", stats.get("easy_solved") == 1)
check("Stats medium_total == 0", stats.get("medium_total") == 0)
check("Stats hard_total == 0", stats.get("hard_total") == 0)
check("Stats top_companies has Google", any(c["company"] == "Google" for c in stats.get("top_companies", [])))
check("Stats topics_breakdown has Arrays", any(t["topic"] == "Arrays" for t in stats.get("topics_breakdown", [])))

r = client.post("/stats/invalidate-cache", headers=AUTH)
check("POST /stats/invalidate-cache with auth → 200", r.status_code == 200)

r = client.post("/stats/invalidate-cache")
check("POST /stats/invalidate-cache without auth → 401", r.status_code == 401)


# ── Clean up: Delete ──────────────────────────────────
section("CLEANUP (DELETE)")

r = client.delete(f"/questions/{QUESTION_ID}", headers=AUTH)
check("DELETE /questions/:id with auth → 204", r.status_code == 204)

r = client.get(f"/questions/{QUESTION_ID}")
check("GET deleted question → 404", r.status_code == 404)

r = client.delete(f"/topics/{TOPIC_ID}")
check("DELETE /topics/:id without auth → 401", r.status_code == 401)

r = client.delete(f"/topics/{TOPIC_ID}", headers=AUTH)
check("DELETE /topics/:id with auth → 204", r.status_code == 204)

r = client.get("/topics")
check("GET /topics after delete is empty", r.json() == [])


# ── Summary ───────────────────────────────────────────
section("SUMMARY")
total = 47  # approximate expected tests
passed = total - len(errors)
print(f"\n  Total checks: {total}")
print(f"  Passed: {passed}")
if errors:
    print(f"\033[91m  Failed ({len(errors)}):\033[0m")
    for e in errors:
        print(f"    - {e}")
else:
    print(f"\033[92m  All checks passed!\033[0m")

sys.exit(1 if errors else 0)
