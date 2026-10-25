"""
Faceless YouTube Automation — Studio Dashboard Server
Serves the web dashboard, provides live pipeline triggers, logs, and video streaming.
"""

import asyncio
import datetime
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path
from typing import Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

load_dotenv()

BASE_DIR = Path(__file__).parent.parent
OUTPUT_DIR = BASE_DIR / "output"
DASHBOARD_DIR = Path(__file__).parent

if str(BASE_DIR / "pipeline") not in sys.path:
    sys.path.insert(0, str(BASE_DIR / "pipeline"))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

app = FastAPI(title="Faceless YouTube Studio Dashboard", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global active process tracking
active_process = None
active_logs: List[str] = []
websocket_clients: List[WebSocket] = []


class GenerateRequest(BaseModel):
    topic: str
    minutes: int = 10
    publish: bool = False
    privacy: str = "private"
    dry_run: bool = False


def broadcast_log(line: str):
    global active_logs
    active_logs.append(line)
    if len(active_logs) > 500:
        active_logs = active_logs[-500:]

    disconnected = []
    for client in websocket_clients:
        try:
            asyncio.run(client.send_json({"type": "log", "data": line}))
        except Exception:
            disconnected.append(client)
    for dc in disconnected:
        if dc in websocket_clients:
            websocket_clients.remove(dc)


def run_pipeline_thread(topic: str, minutes: int, publish: bool, privacy: str, dry_run: bool):
    global active_process, active_logs
    active_logs = [f"🚀 Starting Faceless YouTube Automation for topic: '{topic}'..."]

    cmd = [
        sys.executable,
        str(BASE_DIR / "pipeline" / "orchestrator.py"),
        topic,
        "--minutes", str(minutes),
    ]
    if publish:
        cmd.extend(["--publish", "--privacy", privacy])
    if dry_run:
        cmd.append("--dry-run")

    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"

    try:
        active_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            cwd=str(BASE_DIR),
            env=env
        )

        for line in iter(active_process.stdout.readline, ''):
            if line:
                broadcast_log(line.rstrip())

        active_process.stdout.close()
        return_code = active_process.wait()
        broadcast_log(f"🏁 Process completed with exit code: {return_code}")
    except Exception as e:
        broadcast_log(f"❌ Execution error: {e}")
    finally:
        active_process = None


def run_autopilot_thread(minutes: int = 10, publish: bool = True, privacy: str = "private", dry_run: bool = False):
    global active_process, active_logs
    active_logs = [f"🤖 Starting Fully Autonomous Autopilot Production Cycle..."]

    cmd = [
        sys.executable,
        str(BASE_DIR / "pipeline" / "autopilot.py"),
        "--count", "1",
        "--minutes", str(minutes),
        "--privacy", privacy,
    ]
    if publish:
        cmd.append("--publish")
    else:
        cmd.append("--no-publish")
    if dry_run:
        cmd.append("--dry-run")

    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"

    try:
        active_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            cwd=str(BASE_DIR),
            env=env
        )

        for line in iter(active_process.stdout.readline, ''):
            if line:
                broadcast_log(line.rstrip())

        active_process.stdout.close()
        return_code = active_process.wait()
        broadcast_log(f"🏁 Autopilot cycle completed with exit code: {return_code}")
    except Exception as e:
        broadcast_log(f"❌ Autopilot execution error: {e}")
    finally:
        active_process = None


def run_resume_thread(topic_dir: Path):
    global active_process, active_logs
    active_logs = [f"🎬 Resuming production for topic: '{topic_dir.name}' (skipping completed scenes)..."]

    cmd = [
        sys.executable,
        "-u",
        str(BASE_DIR / "pipeline" / "resume_production.py"),
        "--topic-dir",
        str(topic_dir),
    ]

    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"

    try:
        active_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            cwd=str(BASE_DIR),
            env=env
        )

        for line in iter(active_process.stdout.readline, ''):
            if line:
                broadcast_log(line.rstrip())

        active_process.stdout.close()
        return_code = active_process.wait()
        broadcast_log(f"🏁 Resumed production finished with exit code: {return_code}")
    except Exception as e:
        broadcast_log(f"❌ Resume execution error: {e}")
    finally:
        active_process = None


class ResumeRequest(BaseModel):
    topic_id: str


@app.post("/api/resume")
def resume_pipeline(req: ResumeRequest):
    global active_process
    if active_process is not None:
        raise HTTPException(status_code=400, detail="A production pipeline is already running.")

    topic_dir = OUTPUT_DIR / req.topic_id
    if not topic_dir.exists():
        raise HTTPException(status_code=404, detail="Topic directory not found.")

    thread = threading.Thread(
        target=run_resume_thread,
        args=(topic_dir,),
        daemon=True
    )
    thread.start()
    return {"status": "started", "topic_id": req.topic_id}


def check_and_auto_resume_on_startup():
    """Scans output directory on boot for any interrupted video generations and resumes them."""
    time.sleep(2)
    if not OUTPUT_DIR.exists():
        return
    for item in sorted(OUTPUT_DIR.iterdir(), key=lambda x: x.stat().st_mtime if x.exists() else 0, reverse=True):
        if item.is_dir() and (item / "script.json").exists():
            if not (item / "longform_video.mp4").exists():
                broadcast_log(f"🛡️ [CRASH RECOVERY] Interrupted production detected: '{item.name}'. Auto-resuming pipeline...")
                run_resume_thread(item)
                break


@app.on_event("startup")
def server_startup_handler():
    threading.Thread(target=check_and_auto_resume_on_startup, daemon=True).start()


class SetThumbnailRequest(BaseModel):
    variant: str


@app.post("/api/topics/{topic_id}/set_thumbnail")
def set_topic_thumbnail(topic_id: str, req: SetThumbnailRequest):
    topic_dir = OUTPUT_DIR / topic_id
    if not topic_dir.exists():
        raise HTTPException(status_code=404, detail="Topic not found")
    
    if req.variant.lower() == "b":
        src = topic_dir / "thumbnail_variant_b.jpg"
    else:
        src = topic_dir / "thumbnail_variant_a.jpg"
        if not src.exists():
            src = topic_dir / "thumbnail_raw.jpg"
            
    if not src.exists():
        raise HTTPException(status_code=404, detail=f"Variant {req.variant.upper()} image not found")
        
    shutil.copy2(src, topic_dir / "thumbnail.jpg")
    broadcast_log(f"🖼️ [THUMBNAIL] Active YouTube upload thumbnail for '{topic_id}' set to Variant {req.variant.upper()}.")
    return {"status": "success", "active_variant": req.variant.upper(), "message": f"Active thumbnail set to Variant {req.variant.upper()}"}


# --- Autopilot Background Cron Loop ---
AUTOPILOT_CONFIG_FILE = OUTPUT_DIR / "autopilot_config.json"

def get_autopilot_config() -> dict:
    if AUTOPILOT_CONFIG_FILE.exists():
        try:
            with open(AUTOPILOT_CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "enabled": False,
        "mode": "manual",  # "manual" or "cron"
        "interval": "weekly_sunday",  # "weekly_sunday", "every_3_days", "every_7_days", "daily"
        "minutes": 10,
        "publish": True,
        "privacy": "private",
        "last_run": None,
        "next_run": None
    }

def save_autopilot_config(cfg: dict):
    AUTOPILOT_CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(AUTOPILOT_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)

def background_cron_worker():
    """Checks every 60 seconds if a scheduled cron run is due."""
    import time
    while True:
        try:
            time.sleep(60)
            cfg = get_autopilot_config()
            if not cfg.get("enabled") or cfg.get("mode") != "cron":
                continue

            if active_process is not None:
                continue

            # Check if next_run is due
            now = datetime.datetime.utcnow()
            next_run_str = cfg.get("next_run")
            if next_run_str:
                try:
                    next_run = datetime.datetime.fromisoformat(next_run_str.replace("Z", "+00:00")).replace(tzinfo=None)
                    if now >= next_run:
                        broadcast_log(f"⏰ [CRON SCHEDULER TRIGGERED] Launching scheduled video production...")
                        # Run thread
                        run_autopilot_thread(
                            minutes=cfg.get("minutes", 10),
                            publish=cfg.get("publish", True),
                            privacy=cfg.get("privacy", "private")
                        )
                        # Compute next run
                        cfg["last_run"] = now.isoformat() + "Z"
                        if cfg["interval"] == "daily":
                            next_dt = now + datetime.timedelta(days=1)
                        elif cfg["interval"] == "every_3_days":
                            next_dt = now + datetime.timedelta(days=3)
                        else:  # weekly_sunday / every_7_days
                            next_dt = now + datetime.timedelta(days=7)
                        cfg["next_run"] = next_dt.isoformat() + "Z"
                        save_autopilot_config(cfg)
                except Exception as ex:
                    print(f"Cron check error: {ex}")
        except Exception as e:
            print(f"Cron worker loop error: {e}")

# Start cron daemon
cron_thread = threading.Thread(target=background_cron_worker, daemon=True)
cron_thread.start()



@app.get("/api/status")
def get_system_status():
    load_dotenv()
    return {
        "gemini": bool(os.getenv("LLM_API_KEY")),
        "tavily": bool(os.getenv("TAVILY_API_KEY")),
        "elevenlabs": bool(os.getenv("ELEVENLABS_API_KEY")),
        "pexels": bool(os.getenv("PEXELS_API_KEY") and os.getenv("PEXELS_API_KEY") != "pending"),
        "pixabay": bool(os.getenv("PIXABAY_API_KEY")),
        "modal_flux": bool(os.getenv("FLUX_MODAL_ENDPOINT")),
        "is_running": active_process is not None
    }


@app.get("/api/topics")
def list_generated_topics():
    if not OUTPUT_DIR.exists():
        return []

    topics = []
    for item in OUTPUT_DIR.iterdir():
        if item.is_dir() and (item / "script.json").exists():
            pub_file = item / "publishing_info.json"
            is_pub = False
            yid = None
            if pub_file.exists():
                try:
                    with open(pub_file, "r", encoding="utf-8") as pf:
                        p_data = json.load(pf)
                        yid = p_data.get("longform", {}).get("id") or p_data.get("video_id")
                        if yid and not str(yid).startswith("dry_run"):
                            is_pub = True
                except Exception:
                    pass

            topic_info = {
                "id": item.name,
                "title": item.name.replace("_", " ").title(),
                "path": str(item),
                "has_video": (item / "longform_video.mp4").exists(),
                "has_thumbnail": (item / "thumbnail.jpg").exists(),
                "has_chapters": (item / "youtube_chapters.txt").exists(),
                "is_published": is_pub or pub_file.exists(),
                "youtube_id": yid,
                "shorts": [f.name for f in item.glob("short_*.mp4")]
            }

            try:
                with open(item / "script.json", "r", encoding="utf-8") as f:
                    s_data = json.load(f)
                    opts = s_data.get("title_options", [])
                    if opts:
                        topic_info["title"] = opts[0]
                    topic_info["concept"] = s_data.get("psychological_concept", "")
                    topic_info["duration"] = s_data.get("total_duration_minutes", 10)
            except Exception:
                pass

            topics.append(topic_info)

    return sorted(topics, key=lambda x: x["id"], reverse=True)


@app.get("/api/topic/{topic_id}")
def get_topic_details(topic_id: str):
    topic_dir = OUTPUT_DIR / topic_id
    if not topic_dir.exists():
        raise HTTPException(status_code=404, detail="Topic not found")

    details = {"id": topic_id, "files": {}}

    script_path = topic_dir / "script.json"
    if script_path.exists():
        with open(script_path, "r", encoding="utf-8") as f:
            details["script"] = json.load(f)

    chapters_path = topic_dir / "youtube_chapters.txt"
    if chapters_path.exists():
        with open(chapters_path, "r", encoding="utf-8") as f:
            details["chapters"] = f.read()

    pub_path = topic_dir / "publishing_info.json"
    if pub_path.exists():
        try:
            with open(pub_path, "r", encoding="utf-8") as f:
                pub_info = json.load(f)
                details["publishing"] = pub_info
        except Exception:
            pass

    pinned_path = topic_dir / "pinned_comment.txt"
    if pinned_path.exists():
        try:
            with open(pinned_path, "r", encoding="utf-8") as f:
                details["pinned_comment"] = f.read()
        except Exception:
            pass
            
    # Fetch real-time YouTube Data API stats for Master Video & All Companion Shorts
    vid = details.get("publishing", {}).get("longform", {}).get("id") or details.get("publishing", {}).get("video_id")
    if vid and not str(vid).startswith("dry_run"):
        try:
            from pipeline.youtube_uploader import get_video_analytics, get_authenticated_service
            analytics = get_video_analytics(vid)
            if analytics and "error" not in analytics:
                details["live_stats"] = analytics
                
                # Live update local publishing_info.json if changed
                if pub_path.exists():
                    try:
                        with open(pub_path, "r", encoding="utf-8") as f:
                            p_curr = json.load(f)
                        p_curr["longform"]["status"] = analytics.get("privacy", "public")
                        p_curr["longform"]["views"] = analytics.get("views", 0)
                        p_curr["longform"]["likes"] = analytics.get("likes", 0)
                        p_curr["longform"]["comments"] = analytics.get("comments", 0)
                        if analytics.get("privacy") == "public":
                            p_curr["longform"]["publish_at_display"] = "Live (Public)"
                            p_curr["scheduled_display"] = "Live (Public)"
                            
                        # Also fetch real-time stats for each companion Short!
                        if "shorts" in p_curr and isinstance(p_curr["shorts"], list):
                            for s_item in p_curr["shorts"]:
                                sid = s_item.get("id")
                                if sid and not str(sid).startswith("dry_run"):
                                    s_analytics = get_video_analytics(sid)
                                    if s_analytics and "error" not in s_analytics:
                                        s_item["views"] = s_analytics.get("views", 0)
                                        s_item["likes"] = s_analytics.get("likes", 0)
                                        s_item["comments"] = s_analytics.get("comments", 0)
                                        s_item["status"] = s_analytics.get("privacy", "public")
                                        if s_analytics.get("privacy") == "public":
                                            s_item["publish_at_display"] = "Live (Public)"

                        with open(pub_path, "w", encoding="utf-8") as f:
                            json.dump(p_curr, f, indent=2)
                        details["publishing"] = p_curr
                    except Exception:
                        pass
        except Exception as e:
            print(f"Analytics sync note: {e}")

    details["has_longform"] = (topic_dir / "longform_video.mp4").exists()
    details["has_thumbnail"] = (topic_dir / "thumbnail.jpg").exists()
    details["has_thumbnail_b"] = (topic_dir / "thumbnail_variant_b.jpg").exists()
    details["has_community_card"] = (topic_dir / "community_quote_card.jpg").exists()
    details["shorts"] = [f.name for f in topic_dir.glob("short_*.mp4")]

    # Detect active thumbnail variant
    active_variant = "A"
    thumb_path = topic_dir / "thumbnail.jpg"
    thumb_b_path = topic_dir / "thumbnail_variant_b.jpg"
    if thumb_path.exists() and thumb_b_path.exists():
        if thumb_path.stat().st_size == thumb_b_path.stat().st_size:
            active_variant = "B"
    details["active_thumbnail_variant"] = active_variant

    # Load Community Tab Poll & Quote Data
    comm_path = topic_dir / "community_post.json"
    if comm_path.exists():
        try:
            with open(comm_path, "r", encoding="utf-8") as f:
                details["community_post"] = json.load(f)
        except Exception:
            pass
    elif (topic_dir / "script.json").exists():
        try:
            from pipeline.community_generator import create_community_package_for_topic
            details["community_post"] = create_community_package_for_topic(topic_dir)
            details["has_community_card"] = (topic_dir / "community_quote_card.jpg").exists()
        except Exception as e:
            print(f"Community generator note: {e}")

    # Extract rich 20+ SEO tags from metadata engine
    try:
        from pipeline.youtube_uploader import prepare_longform_metadata
        meta = prepare_longform_metadata(topic_dir)
        details["tags"] = meta.get("snippet", {}).get("tags", [])
    except Exception:
        details["tags"] = [
            "SchemaStudio", "SchemaStudio", "Quiet Schema", "psychology",
            "deep psychology", "human behavior", "behavioral science", "cognitive psychology",
            "mental models", "introspection", "attachment styles", "subconscious mind",
            "emotional intelligence", "self improvement", "mindset", "personal growth"
        ]

    return details


@app.post("/api/generate")
def start_generation(req: GenerateRequest):
    global active_process
    if active_process is not None:
        raise HTTPException(status_code=400, detail="A video generation pipeline is already running.")

    thread = threading.Thread(
        target=run_pipeline_thread,
        args=(req.topic, req.minutes, req.publish, req.privacy, req.dry_run),
        daemon=True
    )
    thread.start()

    return {"status": "started", "topic": req.topic}


@app.get("/api/media/{topic_id}/{filename}")
def stream_media(topic_id: str, filename: str):
    file_path = OUTPUT_DIR / topic_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    media_type = "video/mp4" if filename.endswith(".mp4") else "image/jpeg"
    if filename.endswith(".mp3"):
        media_type = "audio/mpeg"
    elif filename.endswith(".json") or filename.endswith(".txt"):
        media_type = "text/plain"

    return FileResponse(file_path, media_type=media_type)


@app.get("/api/comparison/voice")
def get_voice_comparison():
    file_path = OUTPUT_DIR / "voice_before_after_comparison.mp4"
    if file_path.exists():
        return FileResponse(file_path, media_type="video/mp4")
    raise HTTPException(status_code=404, detail="Comparison video not found")


@app.get("/api/comparison/before_audio")
def get_before_audio():
    file_path = BASE_DIR / "scratch" / "voice_calm_test" / "current_george_mastered.mp3"
    if file_path.exists():
        return FileResponse(file_path, media_type="audio/mpeg")
    raise HTTPException(status_code=404, detail="Before audio not found")


@app.get("/api/comparison/after_audio")
def get_after_audio():
    file_path = BASE_DIR / "scratch" / "voice_calm_test" / "warm_adam_mastered.mp3"
    if file_path.exists():
        return FileResponse(file_path, media_type="audio/mpeg")
    raise HTTPException(status_code=404, detail="After audio not found")


class PrivacyRequest(BaseModel):
    topic_id: str
    video_id: str
    privacy_status: str

@app.post("/api/update_privacy")
def update_video_privacy(req: PrivacyRequest):
    try:
        from pipeline.youtube_uploader import get_authenticated_service
        service = get_authenticated_service()
        if not service:
            raise HTTPException(status_code=500, detail="YouTube API service not authenticated")

        body = {
            "id": req.video_id,
            "status": {
                "privacyStatus": req.privacy_status,
                "selfDeclaredMadeForKids": False
            }
        }
        service.videos().update(part="status", body=body).execute()

        # Update publishing_info.json locally
        pub_path = OUTPUT_DIR / req.topic_id / "publishing_info.json"
        if pub_path.exists():
            with open(pub_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if "longform" in data and isinstance(data["longform"], dict):
                data["longform"]["status"] = req.privacy_status
            elif "privacy" in data:
                data["privacy"] = req.privacy_status
            with open(pub_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

        return {"status": "success", "new_privacy": req.privacy_status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SchedulePackageRequest(BaseModel):
    topic_id: str
    dry_run: bool = False

@app.get("/api/next_schedule_preview")
def get_next_schedule_preview():
    try:
        from pipeline.youtube_uploader import compute_next_available_release_schedule
        sched = compute_next_available_release_schedule(output_root=OUTPUT_DIR, shorts_count=3)
        return {"status": "success", "schedule": sched}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/schedule_package")
def schedule_video_package(req: SchedulePackageRequest):
    topic_dir = OUTPUT_DIR / req.topic_id
    if not topic_dir.exists():
        raise HTTPException(status_code=404, detail="Topic directory not found")

    try:
        from pipeline.youtube_uploader import publish_topic_package
        results = publish_topic_package(
            topic_dir=topic_dir,
            privacy_status="private",
            upload_shorts=True,
            dry_run=req.dry_run,
            auto_schedule=True
        )

        # Save publishing receipt
        receipt_path = topic_dir / "publishing_info.json"
        with open(receipt_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)

        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheduling error: {e}")


class AutopilotConfigRequest(BaseModel):
    enabled: bool = False
    mode: str = "manual"  # "manual" or "cron"
    interval: str = "weekly_sunday"  # "weekly_sunday", "every_3_days", "every_7_days", "daily"
    minutes: int = 10
    publish: bool = True
    privacy: str = "private"

@app.get("/api/autopilot/config")
def get_autopilot_settings():
    return get_autopilot_config()

@app.post("/api/autopilot/config")
def update_autopilot_settings(req: AutopilotConfigRequest):
    cfg = get_autopilot_config()
    cfg["enabled"] = req.enabled
    cfg["mode"] = req.mode
    cfg["interval"] = req.interval
    cfg["minutes"] = req.minutes
    cfg["publish"] = req.publish
    cfg["privacy"] = req.privacy
    
    # If enabling cron and no next_run exists, set next run
    if req.enabled and req.mode == "cron":
        now = datetime.datetime.utcnow()
        if req.interval == "daily":
            next_dt = now + datetime.timedelta(days=1)
        elif req.interval == "every_3_days":
            next_dt = now + datetime.timedelta(days=3)
        else:
            next_dt = now + datetime.timedelta(days=7)
        cfg["next_run"] = next_dt.isoformat() + "Z"
    elif not req.enabled:
        cfg["next_run"] = None

    save_autopilot_config(cfg)
    return {"status": "success", "config": cfg}

class AutopilotRunRequest(BaseModel):
    minutes: int = 10
    publish: bool = True
    privacy: str = "private"
    dry_run: bool = False

@app.post("/api/autopilot/run")
def trigger_autopilot_run(req: AutopilotRunRequest):
    global active_process
    if active_process is not None:
        raise HTTPException(status_code=400, detail="A production pipeline is already running.")

    thread = threading.Thread(
        target=run_autopilot_thread,
        args=(req.minutes, req.publish, req.privacy, req.dry_run),
        daemon=True
    )
    thread.start()

    return {"status": "started", "mode": "autopilot"}

@app.get("/api/autopilot/history")
def get_autopilot_history():
    history_file = OUTPUT_DIR / "autopilot_history.json"
    if history_file.exists():
        try:
            with open(history_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

@app.get("/api/system/keys_health")
def get_keys_health():
    import requests
    try:
        from tts_engine import get_elevenlabs_keys
    except ImportError:
        from pipeline.tts_engine import get_elevenlabs_keys
    elevenlabs_keys = get_elevenlabs_keys()
    
    el_status = []
    replacement_alerts = []
    
    for idx, k in enumerate(elevenlabs_keys, 1):
        masked = k[:6] + "..." + k[-4:] if len(k) > 10 else "******"
        key_data = {
            "index": idx,
            "masked_key": masked,
            "valid": False,
            "used": 0,
            "limit": 0,
            "remaining": 0,
            "percent_remaining": 0,
            "status": "error",
            "tier": "Unknown",
            "next_reset": None
        }
        try:
            r = requests.get("https://api.elevenlabs.io/v1/user/subscription", headers={"xi-api-key": k}, timeout=6)
            if r.status_code == 200:
                d = r.json()
                used = d.get("character_count", 0)
                limit = d.get("character_limit", 0)
                remaining = max(0, limit - used)
                pct = round((remaining / limit * 100), 1) if limit > 0 else 0
                
                reset_unix = d.get("next_character_count_reset_unix")
                reset_str = None
                if reset_unix:
                    reset_str = datetime.datetime.fromtimestamp(reset_unix).strftime("%b %d, %Y")
                
                status_label = "healthy"
                if remaining == 0:
                    status_label = "exhausted"
                    replacement_alerts.append(f"ElevenLabs Key #{idx} is EXHAUSTED (0 chars remaining). Replace in .env!")
                elif remaining < 1500:
                    status_label = "low"
                    replacement_alerts.append(f"ElevenLabs Key #{idx} is LOW ({remaining:,} chars remaining). Consider refreshing.")
                
                key_data.update({
                    "valid": True,
                    "used": used,
                    "limit": limit,
                    "remaining": remaining,
                    "percent_remaining": pct,
                    "status": status_label,
                    "tier": d.get("tier", "Free Tier").title(),
                    "next_reset": reset_str
                })
        except Exception:
            key_data["status"] = "unreachable"
        
        el_status.append(key_data)

    # Tavily
    tavily_key = os.getenv("TAVILY_API_KEY", "")
    tavily_status = {
        "valid": bool(tavily_key),
        "status": "active" if tavily_key else "missing",
        "masked_key": tavily_key[:6] + "..." + tavily_key[-4:] if len(tavily_key) > 10 else "Not Configured",
        "tier": "Free 1,000 Searches / mo",
        "features": "Deep Psychology Search Enabled"
    }
    if not tavily_key:
        replacement_alerts.append("Tavily API Key is missing in .env! Autonomous web research will fail.")

    # Microsoft Edge-TTS Sanctuary Engine (Andrew)
    edge_tts_status = {
        "valid": True,
        "status": "active",
        "voice": os.getenv("EDGE_TTS_VOICE", "en-US-AndrewMultilingualNeural"),
        "tier": "100% Free & Unlimited",
        "role": "Andrew Sanctuary Voice (Intimate, Empathetic, Meditative -10%)"
    }

    # Gemini 2.5 & Groq
    llm_key = os.getenv("LLM_API_KEY") or os.getenv("GEMINI_API_KEY", "")
    groq_key = os.getenv("GROQ_API_KEY", "")
    llm_status = {
        "gemini_active": bool(llm_key),
        "gemini_model": os.getenv("LLM_MODEL", "gemini-2.5-flash"),
        "groq_failover_active": bool(groq_key),
        "groq_model": os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    }

    # YouTube Data API
    yt_client_secret = BASE_DIR / "client_secrets.json"
    yt_token = (BASE_DIR / "youtube_token.pickle").exists() or (BASE_DIR / "token.json").exists()
    youtube_status = {
        "client_secrets": yt_client_secret.exists(),
        "authenticated": yt_token,
        "status": "ready" if yt_token else "needs_auth",
        "daily_limit": "10,000 units / day",
        "mode": "Cloud Scheduler & Pinned Comments"
    }

    overall = "healthy"
    if any(k["status"] == "exhausted" for k in el_status) or replacement_alerts:
        overall = "warning" if any(k["status"] == "healthy" for k in el_status) else "critical"

    return {
        "overall_status": overall,
        "replacement_alerts": replacement_alerts,
        "elevenlabs": el_status,
        "tavily": tavily_status,
        "edge_tts": edge_tts_status,
        "llm": llm_status,
        "youtube": youtube_status
    }


@app.get("/api/system/preflight")
def get_preflight_diagnostics(minutes: int = 10):
    try:
        from preflight_check import run_preflight_diagnostics
        report = run_preflight_diagnostics(estimated_minutes=minutes)
        return {"status": "success", "report": report}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/logs")
def get_logs(since: int = 0):
    global active_logs, active_process
    return {
        "logs": active_logs[since:],
        "total": len(active_logs),
        "is_running": active_process is not None
    }


class LogPayload(BaseModel):
    message: str


@app.post("/api/logs/append")
def append_log(payload: LogPayload):
    broadcast_log(payload.message)
    return {"status": "ok"}


@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_clients.append(websocket)
    # Send history
    for line in active_logs[-100:]:
        await websocket.send_json({"type": "log", "data": line})

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in websocket_clients:
            websocket_clients.remove(websocket)


# Serve Static UI & Assets (Zero Caching)
NO_CACHE_HEADERS = {
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0"
}

@app.get("/style.css")
def get_css():
    css_file = DASHBOARD_DIR / "style.css"
    if css_file.exists():
        return FileResponse(css_file, media_type="text/css", headers=NO_CACHE_HEADERS)
    raise HTTPException(status_code=404, detail="CSS not found")


@app.get("/channel_logo.jpg")
def get_channel_logo():
    logo_file = DASHBOARD_DIR / "channel_logo.jpg"
    if not logo_file.exists():
        logo_file = OUTPUT_DIR / "branding" / "quiet_schema_gemini_logo.jpg"
    if logo_file.exists():
        return FileResponse(logo_file, media_type="image/jpeg", headers=NO_CACHE_HEADERS)
    raise HTTPException(status_code=404, detail="Logo not found")


@app.get("/app.js")
def get_js():
    js_file = DASHBOARD_DIR / "app.js"
    if js_file.exists():
        return FileResponse(js_file, media_type="application/javascript", headers=NO_CACHE_HEADERS)
    raise HTTPException(status_code=404, detail="JS not found")


@app.get("/")
def get_index():
    index_file = DASHBOARD_DIR / "index.html"
    if index_file.exists():
        with open(index_file, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read(), headers=NO_CACHE_HEADERS)
    return HTMLResponse("<h1>SchemaStudio Initializing...</h1>")


@app.get("/studio")
def get_studio_page():
    studio_file = DASHBOARD_DIR / "studio.html"
    if studio_file.exists():
        with open(studio_file, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read(), headers=NO_CACHE_HEADERS)
    index_file = DASHBOARD_DIR / "index.html"
    if index_file.exists():
        with open(index_file, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read(), headers=NO_CACHE_HEADERS)
    return HTMLResponse("<h1>Studio Dashboard Initializing...</h1>")


@app.get("/credits")
def get_credits_page():
    credits_file = DASHBOARD_DIR / "credits.html"
    if credits_file.exists():
        with open(credits_file, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read(), headers=NO_CACHE_HEADERS)
    return HTMLResponse("<h1>Credits Monitor Initializing...</h1>")



class MaximizeTagsRequest(BaseModel):
    video_id: Optional[str] = None
    topic: Optional[str] = None


@app.post("/api/youtube/maximize_tags")
def api_maximize_tags(req: MaximizeTagsRequest):
    """Packs candidate tags up to ~485 chars and updates YouTube Data API live."""
    from pipeline.youtube_uploader import get_authenticated_service, pack_youtube_tags_to_limit, US_VIRAL_KEYWORDS
    try:
        service = get_authenticated_service()
        if not service:
            raise HTTPException(status_code=500, detail="YouTube service not authenticated")
        
        existing_tags = []
        target_video_id = req.video_id
        if req.topic:
            t_dir = OUTPUT_DIR / req.topic
            script_file = t_dir / "script.json"
            if script_file.exists():
                with open(script_file, "r", encoding="utf-8") as f:
                    sdata = json.load(f)
                    existing_tags = sdata.get("tags", [])
            pub_info = t_dir / "publishing_info.json"
            if pub_info.exists() and not target_video_id:
                with open(pub_info, "r", encoding="utf-8") as f:
                    pdata = json.load(f)
                    target_video_id = pdata.get("video_id") or pdata.get("longform", {}).get("id")

        if not target_video_id:
            packed = pack_youtube_tags_to_limit(existing_tags + US_VIRAL_KEYWORDS, max_limit=485)
            chars = sum(len(x) + (2 if ' ' in x else 0) for x in packed) + len(packed) - 1
            return {"status": "success", "tags": packed, "char_count": chars, "tag_count": len(packed), "updated_youtube": False}

        v_res = service.videos().list(part="snippet", id=target_video_id).execute()
        items = v_res.get("items", [])
        if not items:
            raise HTTPException(status_code=404, detail="Video not found on YouTube")
        
        snippet = items[0]["snippet"]
        live_tags = snippet.get("tags", [])
        packed = pack_youtube_tags_to_limit(existing_tags + live_tags + US_VIRAL_KEYWORDS, max_limit=485)
        chars = sum(len(x) + (2 if ' ' in x else 0) for x in packed) + len(packed) - 1

        snippet["tags"] = packed
        service.videos().update(part="snippet", body={"id": target_video_id, "snippet": snippet}).execute()

        # Save packed tags back to topic script.json and publishing_info.json if present
        if req.topic:
            t_dir = OUTPUT_DIR / req.topic
            s_file = t_dir / "script.json"
            if s_file.exists():
                try:
                    with open(s_file, "r", encoding="utf-8") as f:
                        sd = json.load(f)
                    sd["tags"] = packed
                    with open(s_file, "w", encoding="utf-8") as f:
                        json.dump(sd, f, indent=2)
                except Exception:
                    pass
        return {
            "status": "success",
            "video_id": target_video_id,
            "tags": packed,
            "char_count": chars,
            "tag_count": len(packed),
            "updated_youtube": True
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/youtube/sync_comments")
def api_sync_comments():
    """Scans for public videos and posts any pending pinned comments and Short deep dive links."""
    from pipeline.youtube_uploader import sync_pending_comments
    try:
        results = sync_pending_comments()
        return {"status": "success", "synced": len(results), "details": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def background_comment_sync_loop():
    """
    Autonomous background comment synchronizer.
    Every time the dashboard server runs:
    1. Runs immediately on boot (after 4s delay).
    2. Sweeps through all videos to find newly public videos/shorts.
    3. Automatically posts pending pinned comments and deep-dive links.
    4. Repeats silently every 20 minutes in the background.
    """
    time.sleep(4)
    while True:
        try:
            token_file = BASE_DIR / "youtube_token.pickle"
            if token_file.exists():
                broadcast_log("💬 [COMMENTS SYNC] Sweeping YouTube for public videos needing pinned comments...")
                from pipeline.youtube_uploader import sync_pending_comments
                results = sync_pending_comments()
                if results:
                    broadcast_log(f"✅ [COMMENTS SYNC] Successfully posted comments on {len(results)} videos!")
                else:
                    broadcast_log("💬 [COMMENTS SYNC] All published videos and shorts comments are up to date.")
        except Exception as e:
            broadcast_log(f"⚠️ [COMMENTS SYNC] Status note: {e}")
        
        # Sleep for 20 minutes between background sweeps
        time.sleep(1200)


def run_startup_diagnostics_and_report():
    time.sleep(1)
    try:
        from pipeline.preflight_check import run_preflight_diagnostics
        report = run_preflight_diagnostics(estimated_minutes=10)
        
        green = "\033[1;32m"
        yellow = "\033[1;33m"
        red = "\033[1;31m"
        reset = "\033[0m"
        bold = "\033[1m"
        
        print(f"  {bold}🩺 SYSTEM STARTUP PRE-FLIGHT DIAGNOSTICS & RESILIENT FALLBACKS:{reset}")
        for c in report.get("checks", []):
            st = c.get("status", "healthy")
            icon = f"{green}✅{reset}" if st == "healthy" else (f"{yellow}⚠️{reset}" if st == "warning" else f"{red}❌{reset}")
            msg = c.get("message", "")
            fb = c.get("fallback")
            print(f"   {icon} {c.get('service')}: {msg}")
            if fb:
                print(f"      🛡️ {yellow}Automated Fallback: {fb}{reset}")
        print()
        
        broadcast_log("🩺 [PRE-FLIGHT] System Diagnostic Complete:")
        for c in report.get("checks", []):
            status_icon = "✅" if c.get("status") == "healthy" else ("⚠️" if c.get("status") == "warning" else "❌")
            broadcast_log(f"   {status_icon} {c.get('service')}: {c.get('message')}")
            if c.get("fallback"):
                broadcast_log(f"      🛡️ Automated Fallback Engaged: {c.get('fallback')}")
    except Exception as e:
        print(f"  ⚠️ Startup diagnostic note: {e}")


def free_port_if_in_use(port: int = 8500):
    """Automatically terminates zombie/stale processes binding to the dashboard port to avoid Errno 10048."""
    if sys.platform != "win32":
        return
    try:
        current_pid = os.getpid()
        proc = subprocess.run(
            f'netstat -ano | findstr :{port}',
            shell=True,
            capture_output=True,
            text=True
        )
        for line in proc.stdout.strip().splitlines():
            parts = line.strip().split()
            if len(parts) >= 5 and f":{port}" in parts[1] and parts[3] == "LISTENING":
                pid = int(parts[4])
                if pid != current_pid and pid != 0:
                    print(f"⚠️ Port {port} is occupied by zombie PID {pid}. Terminating it cleanly...")
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
                    time.sleep(1)
    except Exception:
        pass


@app.on_event("startup")
def on_server_startup():
    """Starts autonomous background workers and runs diagnostic pre-flight on boot."""
    print_creator_terminal_banner()
    t_diag = threading.Thread(target=run_startup_diagnostics_and_report, daemon=True)
    t_diag.start()
    t = threading.Thread(target=background_comment_sync_loop, daemon=True)
    t.start()


def print_creator_terminal_banner():
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    gold = "\033[1;33m"
    cyan = "\033[1;36m"
    green = "\033[1;32m"
    reset = "\033[0m"
    bold = "\033[1m"
    print(f"""
{gold}================================================================================{reset}
{cyan}  ████████╗██╗  ██╗███████╗     ██████╗ ██╗   ██╗██╗███████╗████████╗{reset}
{cyan}  ╚══██╔══╝██║  ██║██╔════╝    ██╔═══██╗██║   ██║██║██╔════╝╚══██╔══╝{reset}
{cyan}     ██║   ███████║█████╗      ██║   ██║██║   ██║██║█████╗     ██║   {reset}
{cyan}     ██║   ██╔══██║██╔══╝      ██║▄▄ ██║██║   ██║██║██╔══╝     ██║   {reset}
{cyan}     ██║   ██║  ██║███████╗    ╚██████╔╝╚██████╔╝██║███████╗   ██║   {reset}
{cyan}     ╚═╝   ╚═╝  ╚═╝╚══════╝     ╚══▀▀═╝  ╚═════╝ ╚═╝╚══════╝   ╚═╝   {reset}
{cyan}               ███████╗ ██████╗██╗  ██╗███████╗███╗   ███╗ █████╗    {reset}
{cyan}               ██╔════╝██╔════╝██║  ██║██╔════╝████╗ ████║██╔══██╗   {reset}
{cyan}               ███████╗██║     ███████║█████╗  ██╔████╔██║███████║   {reset}
{cyan}               ╚════██║██║     ██╔══██║██╔══╝  ██║╚██╔╝██║██╔══██║   {reset}
{cyan}               ███████║╚██████╗██║  ██║███████╗██║ ╚═╝ ██║██║  ██║   {reset}
{cyan}               ╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝   {reset}
{gold}--------------------------------------------------------------------------------{reset}
  👑 {bold}LEAD ARCHITECT & CREATOR{reset} : {gold}MEHAK SANDHU{reset} ({cyan}@mehaksandhudev{reset})
  🌐 {bold}OFFICIAL REPOSITORY{reset}      : {cyan}https://github.com/mehaksandhudev/faceless-youtube-automation{reset}
  🧠 {bold}AUTONOMOUS STUDIO{reset}        : {bold}SchemaStudio — V3 OBSIDIAN TELEMETRY{reset}
  ⚡ {bold}NEURAL ENGINE{reset}            : 4K UHD Master Compositor • Gemini 2.5 • FLUX
  🚀 {bold}LOCAL DASHBOARD LIVE{reset}     : {green}http://localhost:8500{reset}
{gold}================================================================================{reset}
""")


if __name__ == "__main__":
    import uvicorn
    free_port_if_in_use(8500)
    print_creator_terminal_banner()
    uvicorn.run(app, host="0.0.0.0", port=8500, log_level="info")
