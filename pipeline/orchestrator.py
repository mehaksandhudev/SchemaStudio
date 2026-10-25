"""
orchestrator.py
SchemaStudio Universal Autonomous Production Pipeline Orchestrator.
Connects topic selection, 5-act research, speech generation, FLUX visual synthesis,
subtitles, 4K video mastering, and safe YouTube publishing.
"""

from __future__ import annotations
import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

from config.channel_config import ChannelConfig, ProfileConfig, get_channel_config
from pipeline.script_generator import ScriptGenerator
from pipeline.tts_engine import TTSEngine
from pipeline.image_generator import ImageGenerator
from pipeline.thumbnail_generator import ThumbnailGenerator
from pipeline.video_renderer import VideoRenderer
from pipeline.youtube_uploader import YouTubeUploader

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("SchemaStudio.Pipeline")


class SchemaStudioPipeline:
    def __init__(self, channel_config: Optional[ChannelConfig] = None):
        self.channel_config = channel_config or get_channel_config()
        self.profile: ProfileConfig = self.channel_config.get_profile()

        self.script_gen = ScriptGenerator(self.channel_config)
        self.tts = TTSEngine()
        self.image_gen = ImageGenerator()
        self.thumbnail_gen = ThumbnailGenerator()
        self.renderer = VideoRenderer()
        self.uploader = YouTubeUploader(self.channel_config)

        self.output_root = Path(__file__).resolve().parent.parent / "output"
        self.output_root.mkdir(parents=True, exist_ok=True)

    def produce_video(
        self,
        topic: str,
        publish_to_youtube: bool = False
    ) -> Dict[str, Any]:
        """
        Executes end-to-end studio video production.
        """
        logger.info(f"=== Starting Production for '{topic}' ===")
        logger.info(f"Channel: {self.channel_config.channel_name} ({self.channel_config.channel_handle})")
        logger.info(f"Profile: {self.profile.niche_name} ({self.profile.profile_id})")

        safe_slug = "".join(c if c.isalnum() else "_" for c in topic.lower())[:32]
        run_dir = self.output_root / safe_slug
        run_dir.mkdir(parents=True, exist_ok=True)

        # 1. Generate Script
        logger.info("Phase 1: Generating 5-act script...")
        script_data = self.script_gen.generate_script(topic)
        with open(run_dir / "script.json", "w", encoding="utf-8") as f:
            json.dump(script_data, f, indent=2)

        # 2. Generate Audio Narration
        logger.info("Phase 2: Synthesizing voice narration...")
        full_narration = " ".join(s["narration"] for s in script_data.get("scenes", []))
        if not full_narration.strip():
            full_narration = "In the quiet geometry of thought, every discovery begins with a single question."
        
        audio_path = run_dir / "narration.mp3"
        self.tts.generate(full_narration, audio_path, voice_config=self.profile.voice)

        # 3. Generate Scene Visuals
        logger.info("Phase 3: Synthesizing visual assets...")
        scene_images = []
        for scene in script_data.get("scenes", []):
            img_path = run_dir / f"scene_{scene['scene_number']:02d}.jpg"
            self.image_gen.generate(
                scene["visual_prompt"],
                img_path,
                profile_visuals=self.profile.visuals
            )
            scene_images.append(img_path)

        # 4. Generate High-CTR Thumbnail
        logger.info("Phase 4: Rendering high-impact thumbnail...")
        thumb_path = run_dir / "thumbnail.jpg"
        base_img = scene_images[0] if scene_images else run_dir / "base.jpg"
        self.thumbnail_gen.generate_thumbnail(
            base_img,
            topic,
            thumb_path,
            thumbnail_profile=self.profile.thumbnail
        )

        # 5. Master Final 4K Video
        logger.info("Phase 5: Mastering final video...")
        master_video_path = run_dir / "final_video.mp4"
        self.renderer.assemble_final_video(
            audio_path=audio_path,
            scene_images=scene_images,
            output_video_path=master_video_path
        )

        result = {
            "status": "completed",
            "topic": topic,
            "channel": self.channel_config.channel_name,
            "profile": self.profile.profile_id,
            "paths": {
                "script": str(run_dir / "script.json"),
                "audio": str(audio_path),
                "thumbnail": str(thumb_path),
                "video": str(master_video_path)
            }
        }

        # 6. YouTube Publishing (Optional or Manual Review)
        if publish_to_youtube:
            if self.channel_config.require_manual_review:
                logger.info("Manual review gate enabled. Video is ready in output directory pending approval.")
                result["youtube_status"] = "pending_manual_review"
            else:
                logger.info("Uploading directly to YouTube...")
                upload_res = self.uploader.upload_video(
                    video_path=master_video_path,
                    title=topic,
                    description=full_narration[:500],
                    thumbnail_path=thumb_path
                )
                result["youtube"] = upload_res

        logger.info(f"=== Production Finished: {master_video_path} ===")
        return result


if __name__ == "__main__":
    topic = sys.argv[1] if len(sys.argv) > 1 else "The Hidden Geometry of Perception"
    pipeline = SchemaStudioPipeline()
    res = pipeline.produce_video(topic=topic, publish_to_youtube=False)
    print(json.dumps(res, indent=2))
