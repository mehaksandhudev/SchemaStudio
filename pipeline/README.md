# ⚙️ SchemaStudio Pipeline Architecture Guide

The SchemaStudio pipeline transforms abstract topic inputs into master-rendered 4K YouTube videos.

## 📦 Modules Overview

| Module | Purpose | Primary Engine | Zero-Cost Fallback |
| :--- | :--- | :--- | :--- |
| `script_generator.py` | 5-Act narrative structuring | Groq / Gemini 2.0 Flash | Offline structured template |
| `tts_engine.py` | Neural voice synthesis | ElevenLabs Multilingual v2 | Microsoft Edge-TTS 7.3.1 |
| `image_generator.py` | Scene visual synthesis | Modal FLUX.1 GPU | Pollinations FLUX API |
| `thumbnail_generator.py`| High-CTR composite graphics | Pillow + Scrim shaders | Local high-contrast typography |
| `video_renderer.py` | Ken Burns pan/zoom & -14 LUFS | FFmpeg 4K Master Engine | FFmpeg static still audio mux |
| `youtube_auth.py` | Google OAuth2 consent & status | InstalledAppFlow (port 0) | Offline credentials check |
| `youtube_uploader.py` | Video & chapter uploading | YouTube Data API v3 | Manual review staging |
| `daily_job.py` | Autopilot scheduler | Cron / Continuous loop | Manual review trigger |

## 🧪 Testing an Individual Component

Run any module standalone from the project root:

```bash
# Test YouTube authentication and quota
python -m pipeline.youtube_auth --status

# Test TTS voice generation
python -m pipeline.tts_engine

# Test end-to-end production
python -m pipeline.orchestrator "The Psychology of Flow State"
```
