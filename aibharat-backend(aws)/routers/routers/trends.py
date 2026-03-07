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
    "Education": "27", "Tech": "28", "Entertainment": "24",
    "Comedy": "23", "Fitness": "17", "Food": "26",
    "Music": "10", "Gaming": "20", "News": "25",
}

class TrendRequest(BaseModel):
    niche: Optional[str] = None
    refresh: Optional[bool] = False
    ref_channel: Optional[str] = None

def fetch_youtube_trending(category_id: str = None) -> list:
    try:
        params = {
            "part": "snippet,statistics",
            "chart": "mostPopular",
            "regionCode": "IN",
            "maxResults": 15,
            "key": YOUTUBE_API_KEY,
        }
        if category_id:
            params["videoCategoryId"] = category_id
        resp = requests.get("https://www.googleapis.com/youtube/v3/videos", params=params, timeout=8)
        data = resp.json()
        if "error" in data:
            print(f"[YouTube] API error: {data['error']['message']}")
            return []
        videos = []
        for item in data.get("items", []):
            s = item.get("snippet", {})
            st = item.get("statistics", {})
            videos.append({
                "title": s.get("title", ""),
                "channel": s.get("channelTitle", ""),
                "views": int(st.get("viewCount", 0)),
                "likes": int(st.get("likeCount", 0)),
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
        niche = req.niche or (profile.get("niche", "").split(",")[0].strip() if profile else "General")
        category_id = INDIA_CATEGORIES.get(niche.strip())

        videos = fetch_youtube_trending(category_id)
        general = fetch_youtube_trending(None) if category_id else []
        all_videos = videos + general

        has_youtube_data = len(all_videos) > 0
        if has_youtube_data:
            video_summary = "\n".join([
                f"- \"{v['title']}\" by {v['channel']} — {v['views']:,} views"
                for v in all_videos[:15]
            ])
            data_source = "YouTube India Trending (live)"
        else:
            video_summary = "Use your knowledge of Indian creator trends as of early 2026."
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

        if req.ref_channel:
            profile_ctx += f"\n- MIMIC THIS CHANNEL'S STYLE: {req.ref_channel} — study their hooks, thumbnail style, energy, pacing, and format. Generate ideas that match their vibe but with completely original topics."

        PROMPT = f"""You are India's #1 content strategy AI for creators.

{profile_ctx}

TRENDING ON YOUTUBE INDIA RIGHT NOW ({data_source}):
{video_summary}

Generate exactly 6 video ideas for this creator. For EACH idea use EXACTLY this format (no extra text between markers):

IDEA_START
TITLE: [video title]
FORMAT: [viral format used]
HOOK: [exact first 3 seconds script]
THUMBNAIL: [thumbnail concept]
VIRAL_SCORE: [number 1-100]
PLATFORM: [Instagram Reels / YouTube Shorts / Both]
WHY_IT_WORKS: [one sentence]
CONTENT_GAP: [true or false]
ESTIMATED_VIEWS: [e.g. 50K-200K]
TREND_USED: [which trending topic this rides]
IDEA_END

Then output EXACTLY these lines (comma separated, no newlines within):
TRENDING_TOPICS: topic1, topic2, topic3, topic4, topic5
VIRAL_FORMATS: format1, format2, format3
CONTENT_GAPS: gap1, gap2, gap3

IMPORTANT: Use Indian context. Output ALL 6 ideas. Do not skip any field."""

        result = call_nova_text(PROMPT)
        print(f"[TRENDS RAW PREVIEW] {result[:400]}")

        ideas = []
        for block in result.split("IDEA_START")[1:]:
            if "IDEA_END" not in block:
                continue
            block = block.split("IDEA_END")[0].strip()
            idea = {}
            for line in block.split("\n"):
                line = line.strip()
                if line.startswith("TITLE:"):             idea["title"] = line[6:].strip()
                elif line.startswith("FORMAT:"):          idea["format_used"] = line[7:].strip()
                elif line.startswith("HOOK:"):            idea["hook"] = line[5:].strip()
                elif line.startswith("THUMBNAIL:"):       idea["thumbnail_concept"] = line[10:].strip()
                elif line.startswith("VIRAL_SCORE:"):
                    digits = "".join(filter(str.isdigit, line[12:]))
                    idea["viral_score"] = int(digits) if digits else 70
                elif line.startswith("PLATFORM:"):        idea["platform"] = line[9:].strip()
                elif line.startswith("WHY_IT_WORKS:"):    idea["why_this_will_work"] = line[13:].strip()
                elif line.startswith("CONTENT_GAP:"):     idea["content_gap"] = "true" in line.lower()
                elif line.startswith("ESTIMATED_VIEWS:"): idea["estimated_views"] = line[16:].strip()
                elif line.startswith("TREND_USED:"):      idea["trend_used"] = line[11:].strip()
            if idea.get("title"):
                idea.setdefault("estimated_views", "50K-200K")
                idea.setdefault("trend_used", "")
                ideas.append(idea)

        trending_topics, viral_formats, content_gaps = [], [], []
        for line in result.split("\n"):
            if line.startswith("TRENDING_TOPICS:"):
                trending_topics = [t.strip() for t in line[16:].split(",") if t.strip()]
            elif line.startswith("VIRAL_FORMATS:"):
                viral_formats = [f.strip() for f in line[14:].split(",") if f.strip()]
            elif line.startswith("CONTENT_GAPS:"):
                content_gaps = [g.strip() for g in line[13:].split(",") if g.strip()]

        print(f"[TRENDS] Parsed {len(ideas)} ideas, {len(trending_topics)} topics, {len(content_gaps)} gaps")

        return {
            "status": "success",
            "ideas": ideas,
            "trending_topics": trending_topics[:5],
            "viral_formats": viral_formats[:3],
            "content_gaps": content_gaps[:3],
            "data_source": data_source,
            "has_youtube_data": has_youtube_data,
            "niche": niche,
            "personalization_level": "full" if profile else "generic",
            "best_time_to_post": {
                "instagram": "6-8 PM IST",
                "youtube": "5-7 PM IST",
                "reason": "Peak Indian audience activity hours on weekdays"
            },
            "weekly_content_plan": [
                {
                    "day": d,
                    "idea": ideas[i]["title"] if i < len(ideas) else "",
                    "format": ideas[i].get("format_used", "Reel") if i < len(ideas) else "Reel"
                }
                for i, d in enumerate(["Monday", "Wednesday", "Friday", "Saturday", "Sunday"])
            ]
        }

    except Exception as e:
        print(f"[TRENDS ERROR] {e}")
        return {"status": "error", "message": str(e)}
