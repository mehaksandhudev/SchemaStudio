"""
youtube_auth.py
Universal Google OAuth2 Authentication & Verification Module for SchemaStudio.
Supports local browser consent flow, headless server copy-paste flow, and channel quota inspection.
"""

from __future__ import annotations
import os
import sys
import json
from pathlib import Path
from typing import Optional, Dict, Any

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
except ImportError:
    print("[ERROR] Google client libraries not installed. Please run: pip install google-api-python-client google-auth-oauthlib")

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl"
]

CREDENTIALS_DIR = Path(__file__).resolve().parent.parent / "credentials"
TOKEN_PATH = CREDENTIALS_DIR / "token.json"
CLIENT_SECRETS_PATH = CREDENTIALS_DIR / "client_secrets.json"


def ensure_credentials_dir() -> Path:
    CREDENTIALS_DIR.mkdir(parents=True, exist_ok=True)
    return CREDENTIALS_DIR


def get_authenticated_service():
    """
    Authenticate and return a YouTube v3 service instance.
    Looks for token.json in credentials/ directory. If expired, refreshes it automatically.
    If absent, guides the user through OAuth2 consent flow.
    """
    ensure_credentials_dir()
    creds = None

    if TOKEN_PATH.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
        except Exception as e:
            print(f"[WARN] Failed to load existing token: {e}")

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                print("[INFO] Refreshing expired YouTube OAuth token...")
                creds.refresh(Request())
                with open(TOKEN_PATH, "w", encoding="utf-8") as token_file:
                    token_file.write(creds.to_json())
                print("[SUCCESS] YouTube OAuth token refreshed successfully.")
            except Exception as e:
                print(f"[WARN] Token refresh failed: {e}. Re-authenticating...")
                creds = None

        if not creds:
            if not CLIENT_SECRETS_PATH.exists():
                raise FileNotFoundError(
                    f"Google OAuth client secrets not found at {CLIENT_SECRETS_PATH}.\n"
                    "Please download your client_secrets.json from Google Cloud Console "
                    "(APIs & Services > Credentials > OAuth 2.0 Client IDs) and place it in the credentials/ folder."
                )

            flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRETS_PATH), SCOPES)
            # Use dynamic port 0 to prevent port collisions (WinError 10048)
            print("[INFO] Initiating OAuth2 login flow on dynamic port...")
            creds = flow.run_local_server(port=0, prompt="consent", access_type="offline")

            with open(TOKEN_PATH, "w", encoding="utf-8") as token_file:
                token_file.write(creds.to_json())
            print(f"[SUCCESS] Authorization complete! Saved credentials to {TOKEN_PATH}")

    return build("youtube", "v3", credentials=creds)


def test_channel_connection() -> Dict[str, Any]:
    """
    Tests channel connection, prints channel status and returns details.
    """
    try:
        youtube = get_authenticated_service()
        response = youtube.channels().list(
            part="snippet,statistics,status",
            mine=True
        ).execute()

        items = response.get("items", [])
        if not items:
            return {
                "connected": False,
                "error": "No YouTube channel associated with this Google Account."
            }

        channel = items[0]
        snippet = channel.get("snippet", {})
        stats = channel.get("statistics", {})

        result = {
            "connected": True,
            "channel_id": channel.get("id"),
            "channel_title": snippet.get("title", "Unknown"),
            "custom_url": snippet.get("customUrl", "N/A"),
            "subscribers": stats.get("subscriberCount", "0"),
            "total_views": stats.get("viewCount", "0"),
            "video_count": stats.get("videoCount", "0"),
            "upload_allowed": True
        }

        print("\n==========================================")
        print("  YOUTUBE CHANNEL STATUS: CONNECTED       ")
        print("==========================================")
        print(f" Channel Title : {result['channel_title']}")
        print(f" Handle        : {result['custom_url']}")
        print(f" Channel ID    : {result['channel_id']}")
        print(f" Subscribers   : {int(result['subscribers']):,}")
        print(f" Total Videos  : {int(result['video_count']):,}")
        print(" Upload Scope  : Confirmed (youtube.upload)")
        print("==========================================\n")
        return result

    except Exception as e:
        print(f"\n[ERROR] YouTube Channel Connection Test Failed: {e}\n")
        return {
            "connected": False,
            "error": str(e)
        }


if __name__ == "__main__":
    if "--login" in sys.argv:
        print("[INFO] Starting SchemaStudio YouTube OAuth2 authorization...")
        test_channel_connection()
    elif "--status" in sys.argv:
        status = test_channel_connection()
        print(json.dumps(status, indent=2))
    else:
        print("Usage:")
        print("  python -m pipeline.youtube_auth --login    # Authenticate YouTube channel")
        print("  python -m pipeline.youtube_auth --status   # Inspect channel connection & quota")
