import re
import httpx
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; LeetcodePortal/1.0)"
}


async def search_youtube(question_title: str) -> list[dict]:
    """Search YouTube for video solutions sorted by view count (most watched first)."""
    query = quote_plus(f"{question_title} leetcode solution")
    # sp=CAM%3D sorts results by view count
    url = f"https://www.youtube.com/results?search_query={query}&sp=CAM%3D"
    results = []
    try:
        async with httpx.AsyncClient(timeout=8, headers=HEADERS) as client:
            resp = await client.get(url)
            soup = BeautifulSoup(resp.text, "html.parser")
            scripts = soup.find_all("script")
            for script in scripts:
                if "videoId" in str(script):
                    ids = re.findall(r'"videoId":"([^"]{11})"', str(script))
                    titles_raw = re.findall(r'"title":{"runs":\[{"text":"([^"]+)"', str(script))
                    seen = set()
                    for vid_id, title in zip(ids, titles_raw):
                        if vid_id not in seen:
                            seen.add(vid_id)
                            results.append({
                                "title": title,
                                "url": f"https://www.youtube.com/watch?v={vid_id}",
                                "source": "YouTube",
                            })
                        if len(results) >= 2:
                            break
                    break
    except Exception:
        pass
    return results


def get_leetcode_links(question_title: str, slug: str | None, leetcode_url: str | None) -> list[dict]:
    """Return direct LeetCode links for the problem."""
    results = []
    if slug:
        base_url = leetcode_url or f"https://leetcode.com/problems/{slug}/"
        results.append({
            "title": f"LeetCode Problem: {question_title}",
            "url": base_url,
            "source": "LeetCode",
        })
    elif leetcode_url:
        results.append({
            "title": f"LeetCode Problem: {question_title}",
            "url": leetcode_url,
            "source": "LeetCode",
        })
    else:
        results.append({
            "title": f"Search on LeetCode: {question_title}",
            "url": f"https://leetcode.com/search/?q={quote_plus(question_title)}",
            "source": "LeetCode",
        })
    return results


async def fetch_web_solutions(
    question_title: str,
    slug: str | None = None,
    leetcode_url: str | None = None,
) -> list[dict]:
    """Aggregate solutions from YouTube and LeetCode."""
    yt = await search_youtube(question_title)
    lc = get_leetcode_links(question_title, slug, leetcode_url)

    neetcode = [{
        "title": f"Search on NeetCode: {question_title}",
        "url": "https://neetcode.io/practice",
        "source": "NeetCode",
    }]

    return yt + lc + neetcode
