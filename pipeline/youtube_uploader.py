"""
youtube_uploader.py
Universal YouTube Cloud Publisher for SchemaStudio.
Uploads 4K video masters, thumbnail artwork, tags, and chapter markers.
Pulls metadata, branding, and privacy policies from dynamic ChannelConfig.
"""

from __future__ import annotations
import os
import time
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

try:
    from googleapiclient.http import MediaFileUpload
except ImportError:
    MediaFileUpload = None

from pipeline.youtube_auth import get_authenticated_service
from config.channel_config import ChannelConfig, get_channel_config

logger = logging.getLogger("SchemaStudio.Uploader")


class YouTubeUploader:
    def __init__(self, channel_config: Optional[ChannelConfig] = None):
        self.channel_config = channel_config or get_channel_config()

    def upload_video(
        self,
        video_path: Path,
        title: str,
        description: str,
        thumbnail_path: Optional[Path] = None,
        tags: Optional[List[str]] = None,
        privacy_status: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Uploads master video to YouTube v3 API.
        Respects privacy settings configured in channel.json (default 'private').
        """
        if not video_path.exists():
            raise FileNotFoundError(f"Video file not found at: {video_path}")

        privacy = privacy_status or self.channel_config.upload_privacy
        upload_tags = tags or self.channel_config.default_tags

        # Enrich description with dynamic channel handle and subscribe link
        enriched_description = (
            f"{description}\n\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"Produced autonomously by SchemaStudio for {self.channel_config.channel_name} ({self.channel_config.channel_handle}).\n"
            f"Subscribe: https://youtube.com/{self.channel_config.channel_handle}\n"
        )

        youtube = get_authenticated_service()

        body = {
            "snippet": {
                "title": title[:100],
                "description": enriched_description,
                "tags": upload_tags,
                "categoryId": "27"  # Education
            },
            "status": {
                "privacyStatus": privacy,
                "selfDeclaredMadeForKids": False
            }
        }

        logger.info(f"Uploading {video_path.name} to YouTube (Privacy: {privacy})...")
        media = MediaFileUpload(str(video_path), chunksize=-1, resumable=True, mimetype="video/mp4")
        request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                logger.info(f"Upload progress: {int(status.progress() * 100)}%")

        video_id = response.get("id")
        logger.info(f"[SUCCESS] Video successfully uploaded to YouTube! Video ID: {video_id}")

        # Upload Custom Thumbnail if present
        if thumbnail_path and thumbnail_path.exists() and video_id:
            try:
                logger.info(f"Setting custom thumbnail: {thumbnail_path.name}...")
                youtube.thumbnails().set(
                    videoId=video_id,
                    media_body=MediaFileUpload(str(thumbnail_path), mimetype="image/jpeg")
                ).execute()
                logger.info("[SUCCESS] Custom thumbnail uploaded.")
            except Exception as e:
                logger.warning(f"Thumbnail upload failed: {e}")

        return {
            "video_id": video_id,
            "url": f"https://youtu.be/{video_id}",
            "privacy": privacy,
            "title": title
        }
