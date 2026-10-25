"""
tts_engine.py
Zero-Cost Resilient Neural Text-to-Speech Engine for SchemaStudio.
Supports ElevenLabs (paid studio quality) with seamless automatic fallback
to Edge-TTS (100% free high-fidelity neural voices with millisecond timestamp markers).
"""

from __future__ import annotations
import os
import asyncio
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

try:
    import edge_tts
except ImportError:
    edge_tts = None

logger = logging.getLogger("SchemaStudio.TTS")


class TTSEngine:
    def __init__(self, elevenlabs_api_key: Optional[str] = None):
        self.elevenlabs_api_key = elevenlabs_api_key or os.getenv("ELEVENLABS_API_KEY", "")

    async def _generate_edge_tts(
        self,
        text: str,
        output_path: Path,
        voice: str = "en-US-ChristopherNeural",
        rate: str = "-4%",
        pitch: str = "-2Hz"
    ) -> Path:
        """Generate high-fidelity speech using Microsoft Edge-TTS (100% Free, No API key needed)."""
        if edge_tts is None:
            raise RuntimeError("edge-tts library not installed. Run `pip install edge-tts>=7.3.1`")

        output_path.parent.mkdir(parents=True, exist_ok=True)
        communicate = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch)
        await communicate.save(str(output_path))
        return output_path

    def _generate_elevenlabs(
        self,
        text: str,
        output_path: Path,
        voice_id: str = "ErXwobaYiN019PkySvjV",
        settings: Optional[Dict[str, float]] = None
    ) -> Path:
        """Generate speech via ElevenLabs API."""
        try:
            from elevenlabs.client import ElevenLabs
            client = ElevenLabs(api_key=self.elevenlabs_api_key)
            audio = client.generate(
                text=text,
                voice=voice_id,
                model="eleven_multilingual_v2"
            )
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "wb") as f:
                for chunk in audio:
                    if chunk:
                        f.write(chunk)
            return output_path
        except Exception as e:
            logger.warning(f"ElevenLabs generation failed ({e}). Falling back to Edge-TTS...")
            raise

    def generate(
        self,
        text: str,
        output_path: Path,
        voice_config: Optional[Any] = None
    ) -> Path:
        """
        Universal entrypoint for speech generation with automatic zero-cost fallback.
        """
        prefer_eleven = bool(self.elevenlabs_api_key and self.elevenlabs_api_key.strip())
        voice_name = getattr(voice_config, "edge_tts_voice", "en-US-ChristopherNeural") if voice_config else "en-US-ChristopherNeural"
        voice_rate = getattr(voice_config, "edge_tts_rate", "-4%") if voice_config else "-4%"
        voice_pitch = getattr(voice_config, "edge_tts_pitch", "-2Hz") if voice_config else "-2Hz"
        voice_id = getattr(voice_config, "elevenlabs_voice_id", "ErXwobaYiN019PkySvjV") if voice_config else "ErXwobaYiN019PkySvjV"

        if prefer_eleven:
            try:
                logger.info(f"Generating voice with ElevenLabs (Voice: {voice_id})...")
                return self._generate_elevenlabs(text, output_path, voice_id=voice_id)
            except Exception as e:
                logger.warning(f"ElevenLabs failed: {e}. Executing automatic zero-cost Edge-TTS fallback.")

        # Zero-cost fallback to Edge-TTS
        logger.info(f"Generating voice with Edge-TTS (Voice: {voice_name}, Rate: {voice_rate})...")
        loop = asyncio.get_event_loop() if asyncio.get_event_loop().is_running() else asyncio.new_event_loop()
        if loop.is_running():
            # In existing running event loop (e.g. inside FastAPI or async runner)
            import nest_asyncio
            nest_asyncio.apply()
        return loop.run_until_complete(
            self._generate_edge_tts(text, output_path, voice=voice_name, rate=voice_rate, pitch=voice_pitch)
        )
