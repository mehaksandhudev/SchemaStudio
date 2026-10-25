"""
channel_config.py
SchemaStudio Dynamic Multi-Channel Configuration System.
Decouples hardcoded channel details into runtime JSON/YAML profiles.
"""

from __future__ import annotations
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field
import yaml

CONFIG_DIR = Path(__file__).resolve().parent
ROOT_DIR = CONFIG_DIR.parent
PROFILES_DIR = ROOT_DIR / "profiles"
CHANNEL_JSON_PATH = ROOT_DIR / "channel.json"


class VoiceSettings(BaseModel):
    tts_engine_preference: List[str] = Field(default_factory=lambda: ["elevenlabs", "edge_tts"])
    edge_tts_voice: str = "en-US-ChristopherNeural"
    edge_tts_rate: str = "-4%"
    edge_tts_pitch: str = "-2Hz"
    elevenlabs_voice_id: Optional[str] = None
    elevenlabs_settings: Dict[str, float] = Field(default_factory=dict)


class ProfileConfig(BaseModel):
    profile_id: str
    niche_name: str
    description: str = ""
    branding: Dict[str, Any] = Field(default_factory=dict)
    script: Dict[str, Any] = Field(default_factory=dict)
    visuals: Dict[str, Any] = Field(default_factory=dict)
    voice: VoiceSettings = Field(default_factory=VoiceSettings)
    thumbnail: Dict[str, Any] = Field(default_factory=dict)

    @classmethod
    def load(cls, profile_name_or_path: str) -> "ProfileConfig":
        """Load a profile from YAML by profile name (e.g. 'tech_documentary' or 'default_psychology')."""
        target = Path(profile_name_or_path)
        if not target.is_file():
            # Check in profiles dir with or without .yaml
            candidate = PROFILES_DIR / f"{profile_name_or_path}.yaml"
            if candidate.is_file():
                target = candidate
            else:
                candidate = PROFILES_DIR / profile_name_or_path
                if candidate.is_file():
                    target = candidate
                else:
                    # Fallback to default_psychology
                    target = PROFILES_DIR / "default_psychology.yaml"

        with open(target, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}

        # Parse voice config
        if "voice" in data and isinstance(data["voice"], dict):
            data["voice"] = VoiceSettings(**data["voice"])

        return cls(**data)


class ChannelConfig(BaseModel):
    channel_name: str = Field(default="My YouTube Channel", description="Visible name of the YouTube channel")
    channel_handle: str = Field(default="@MyChannel", description="YouTube channel handle or alias")
    active_profile: str = Field(default="default_psychology", description="Active profile in profiles/ directory")
    upload_privacy: Literal["private", "unlisted", "public"] = Field(
        default="private",
        description="Default YouTube upload privacy status (default private for safety)"
    )
    autopilot_cadence_days: int = Field(default=1, description="Interval in days between autonomous uploads")
    default_tags: List[str] = Field(default_factory=lambda: ["Documentary", "Educational", "Deep Dive", "4K Video"])
    require_manual_review: bool = Field(
        default=True,
        description="Whether videos require human one-click approval before YouTube publishing"
    )

    def get_profile(self) -> ProfileConfig:
        """Fetch the active ProfileConfig object."""
        return ProfileConfig.load(self.active_profile)

    def save(self, filepath: Optional[Path] = None) -> None:
        """Persist current settings to channel.json."""
        target = filepath or CHANNEL_JSON_PATH
        with open(target, "w", encoding="utf-8") as f:
            json.dump(self.model_dump(), f, indent=2)

    @classmethod
    def load(cls, filepath: Optional[Path] = None) -> "ChannelConfig":
        """Load from channel.json, falling back to environment variables or defaults."""
        target = filepath or CHANNEL_JSON_PATH
        data: Dict[str, Any] = {}
        if target.is_file():
            try:
                with open(target, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                data = {}

        # Allow environment variable overrides
        if os.getenv("CHANNEL_NAME"):
            data["channel_name"] = os.getenv("CHANNEL_NAME")
        if os.getenv("CHANNEL_HANDLE"):
            data["channel_handle"] = os.getenv("CHANNEL_HANDLE")
        if os.getenv("ACTIVE_PROFILE"):
            data["active_profile"] = os.getenv("ACTIVE_PROFILE")
        if os.getenv("UPLOAD_PRIVACY"):
            data["upload_privacy"] = os.getenv("UPLOAD_PRIVACY")

        return cls(**data)


def list_available_profiles() -> List[Dict[str, str]]:
    """List all available profile files in the profiles directory."""
    profiles = []
    if not PROFILES_DIR.exists():
        return profiles

    for p in PROFILES_DIR.glob("*.yaml"):
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}
                profiles.append({
                    "id": p.stem,
                    "name": data.get("niche_name", p.stem.replace("_", " ").title()),
                    "description": data.get("description", ""),
                    "file": p.name
                })
        except Exception:
            profiles.append({
                "id": p.stem,
                "name": p.stem.replace("_", " ").title(),
                "description": "",
                "file": p.name
            })
    return profiles


# Global singleton helper
_current_channel_config: Optional[ChannelConfig] = None

def get_channel_config() -> ChannelConfig:
    global _current_channel_config
    if _current_channel_config is None:
        _current_channel_config = ChannelConfig.load()
    return _current_channel_config

def reload_channel_config() -> ChannelConfig:
    global _current_channel_config
    _current_channel_config = ChannelConfig.load()
    return _current_channel_config
