import httpx
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; LeetcodePortal/1.0)"
}

# Known solution sites to search
SOURCES = [
    {
        "name": "NeetCode",
        "search_url": "https://neetcode.io/practice",
        "url_template": "https://neetcode.io/solutions/{slug}",
    },
]


async def search_youtube(question_title: str) -> list[dict]:
    """Search YouTube for video solutions."""
    query = quote_plus(f"{question_title} leetcode solution")
    url = f"https://www.youtube.com/results?search_query={query}"
    results = []
    try:
        async with httpx.AsyncClient(timeout=8, headers=HEADERS) as client:
            resp = await client.get(url)
            soup = BeautifulSoup(resp.text, "html.parser")
            # Extract video links from YouTube search results
            scripts = soup.find_all("script")
            for script in scripts:
                if "videoId" in str(script):
                    import re
                    ids = re.findall(r'"videoId":"([^"]{11})"', str(script))
                    titles_raw = re.findall(r'"title":{"runs":\[{"text":"([^"]+)"', str(script))
                    for vid_id, title in zip(ids[:5], titles_raw[:5]):
                        results.append({
                            "title": title,
                            "url": f"https://www.youtube.com/watch?v={vid_id}",
                            "source": "YouTube",
                        })
                    break
    except Exception:
        pass
    return results[:4]


async def search_github(question_title: str) -> list[dict]:
    """Search GitHub for solution files."""
    query = quote_plus(f"{question_title} leetcode solution python")
    url = f"https://github.com/search?q={query}&type=code"
    results = []
    try:
        async with httpx.AsyncClient(timeout=8, headers=HEADERS, follow_redirects=True) as client:
            resp = await client.get(url)
            soup = BeautifulSoup(resp.text, "html.parser")
            for link in soup.select("a.Link--muted")[:4]:
                href = link.get("href", "")
                if href.startswith("/"):
                    results.append({
                        "title": link.text.strip() or "GitHub solution",
                        "url": f"https://github.com{href}",
                        "source": "GitHub",
                    })
    except Exception:
        pass
    return results[:3]


async def fetch_web_solutions(question_title: str) -> list[dict]:
    """Aggregate solutions from multiple sources."""
    yt = await search_youtube(question_title)
    gh = await search_github(question_title)

    # Always add a NeetCode search link as fallback
    neetcode_search = [{
        "title": f"Search on NeetCode: {question_title}",
        "url": f"https://neetcode.io/practice",
        "source": "NeetCode",
    }]

    return yt + gh + neetcode_search
