# routers/analyze.py
import uuid
from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from core.config import jobs
from services.analyzer import run_analysis

router = APIRouter(prefix="/api/analyze", tags=["analyze"])


@router.post("")
async def analyze_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "processing", "progress": 5}

    tmp_path = f"/tmp/{job_id}_{file.filename}"
    with open(tmp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    background_tasks.add_task(run_analysis, job_id, tmp_path, file.filename)
    return {"job_id": job_id}


@router.get("/{job_id}")
async def get_analysis(job_id: str):
    if job_id not in jobs:
        return JSONResponse(status_code=404, content={"error": "Job not found"})
    return jobs[job_id]