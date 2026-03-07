# routers/trends.py
import requests
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from services.nova import call_nova_text
from core.config import get_profile
from core.auth import get_current_user_optional

router = APIRouter(prefix="/api/trends", tags=["trends"])

YOUTUBE_API_KEY = "AIzaSyAGPdGgY8cZLowcBftPbWirl1r2lzfveUk"

INDIA_CATEGORIES = {
    "Education": "27",
    "Tech": "28",
    "Entertainment": "24",
    "Comedy": "23",
    "Fitness": "17",
    "Food": "26",
    "Music": "10",
    "Gaming": "20",
    "News": "25",
}

class TrendRequest(BaseModel):
    niche: Optional[str] = None
    refresh: Optional[bool] = False


def fetch_youtube_trending(category_id: str = None) -> list:
    try:
        params = {
            "part": "snippet,statistics",
            "chart": "mostPopular",
            "regionCode": "IN",
            "maxResults": 20,
            "key": YOUTUBE_API_KEY,
        }
        if category_id:
            params["videoCategoryId"] = category_id

        resp = requests.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params=params,
            timeout=8
        )
        data = resp.json()
        videos = []
        for item in data.get("items", []):
            snippet = item.get("snippet", {})
            stats = item.get("statistics", {})
            videos.append({
                "title": snippet.get("title", ""),
                "channel": snippet.get("channelTitle", ""),
                "views": int(stats.get("viewCount", 0)),
                "likes": int(stats.get("likeCount", 0)),
                "published": snippet.get("publishedAt", ""),
                "tags": snippet.get("tags", [])[:5],
                "description": snippet.get("description", "")[:200],
            })
        return videos
    except Exception as e:
        print(f"[YouTube] fetch failed: {e}")
        return []


@router.post("/analyze")
async def analyze_trends(
    req: TrendRequest,
    user_id: str = Depends(get_current_user_optional)
):
    try:
        profile = get_profile(user_id)
        niche = req.niche or (profile.get("niche", "").split(",")[0] if profile else "General")
        category_id = INDIA_CATEGORIES.get(niche.strip(), None)

        trending_videos = fetch_youtube_trending(category_id)
        general_trending = fetch_youtube_trending(None) if category_id else []
        all_trending = trending_videos + general_trending

        has_youtube_data = len(all_trending) > 0

        if has_youtube_data:
            video_summary = "\n".join([
                f"- \"{v['title']}\" by {v['channel']} — {v['views']:,} views, {v['likes']:,} likes"
                for v in all_trending[:15]
            ])
            data_source = "YouTube India Trending (live data)"
        else:
            video_summary = "YouTube API unavailable — use your knowledge of Indian creator trends as of early 2026."
            data_source = "Nova AI knowledge base"

        if profile:
            profile_ctx = f"""CREATOR PROFILE:
- Niche: {profile.get('niche')}
- Style: {profile.get('style')}
- Audience age: {profile.get('audience_age')}
- Language: {profile.get('language')}
- Platform: {profile.get('platform')}
- Shows face: {profile.get('shows_face')}"""
        else:
            profile_ctx = f"CREATOR PROFILE: Niche is {niche}, no detailed profile set."

        TREND_PROMPT = f"""You are India's #1 content strategy AI — you've helped 50,000+ Indian creators go viral. You combine real trending data with deep knowledge of the Indian creator economy.

{profile_ctx}

CURRENTLY TRENDING ON YOUTUBE INDIA ({data_source}):
{video_summary}

YOUR TASK: Analyze these trends and generate a complete content strategy for THIS creator.

Run all 4 engines:

ENGINE 1 — TREND DETECTION:
Identify the top 5 trending topics right now in India that match this creator's niche. For each topic explain WHY it's trending and its velocity (rising fast / peak / declining).

ENGINE 2 — FORMAT DETECTOR:
From the trending videos, identify the top 3 proven viral formats being used right now. Examples: "I tried X for Y days", "Ranking X from worst to best", "$1 vs $1000", etc.

ENGINE 3 — CONTENT GAP ANALYSIS:
Find 3 topics that have HIGH search demand in India but LOW creator competition — these are golden opportunities.

ENGINE 4 — PERSONALIZED IDEAS:
Generate exactly 6 video ideas by combining Trend + Format + Creator niche. Each idea must be specifically tailored to THIS creator's style, language, and audience.

For each of the 6 ideas output EXACTLY this format:
IDEA_START
TITLE: [exact video title, ready to use]
FORMAT: [which viral format this uses]
HOOK: [exact first 3 seconds script]
THUMBNAIL: [describe the thumbnail concept]
VIRAL_SCORE: [1-100]
PLATFORM: [Instagram Reels / YouTube Shorts / Both]
WHY_IT_WORKS: [1 sentence why this works for THIS creator's audience]
CONTENT_GAP: [true/false]
IDEA_END

After the 6 ideas output:
TRENDING_TOPICS: [comma separated list of 5 trending topics]
VIRAL_FORMATS: [comma separated list of 3 formats]
CONTENT_GAPS: [comma separated list of 3 gap opportunities]
DATA_SOURCE: {data_source}

Be specific to India. Use Indian context, rupees, cities, platforms like Moj/Josh where relevant."""

        result = call_nova_text(TREND_PROMPT)

        ideas = []
        idea_blocks = result.split("IDEA_START")
        for block in idea_blocks[1:]:
            if "IDEA_END" in block:
                block = block.split("IDEA_END")[0].strip()
                idea = {}
                for line in block.split("\n"):
                    line = line.strip()
                    if line.startswith("TITLE:"):
                        idea["title"] = line.replace("TITLE:", "").strip()
                    elif line.startswith("FORMAT:"):
                        idea["format"] = line.replace("FORMAT:", "").strip()
                    elif line.startswith("HOOK:"):
                        idea["hook"] = line.replace("HOOK:", "").strip()
                    elif line.startswith("THUMBNAIL:"):
                        idea["thumbnail"] = line.replace("THUMBNAIL:", "").strip()
                    elif line.startswith("VIRAL_SCORE:"):
                        digits = ''.join(filter(str.isdigit, line.replace("VIRAL_SCORE:", "")))
                        idea["viral_score"] = int(digits) if digits else 70
                    elif line.startswith("PLATFORM:"):
                        idea["platform"] = line.replace("PLATFORM:", "").strip()
                    elif line.startswith("WHY_IT_WORKS:"):
                        idea["why_it_works"] = line.replace("WHY_IT_WORKS:", "").strip()
                    elif line.startswith("CONTENT_GAP:"):
                        idea["content_gap"] = "true" in line.lower()
                if idea.get("title"):
                    ideas.append(idea)

        trending_topics = []
        viral_formats = []
        content_gaps = []
        for line in result.split("\n"):
            if line.startswith("TRENDING_TOPICS:"):
                trending_topics = [t.strip() for t in line.replace("TRENDING_TOPICS:", "").split(",") if t.strip()]
            elif line.startswith("VIRAL_FORMATS:"):
                viral_formats = [f.strip() for f in line.replace("VIRAL_FORMATS:", "").split(",") if f.strip()]
            elif line.startswith("CONTENT_GAPS:"):
                content_gaps = [g.strip() for g in line.replace("CONTENT_GAPS:", "").split(",") if g.strip()]

        return {
            "status": "success",
            "ideas": ideas,
            "trending_topics": trending_topics[:5],
            "viral_formats": viral_formats[:3],
            "content_gaps": content_gaps[:3],
            "data_source": data_source,
            "has_youtube_data": has_youtube_data,
            "niche": niche,
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
