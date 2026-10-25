"""
daily_job.py
Autonomous Scheduled Autopilot Runner for SchemaStudio.
Executes scheduled topic research, content synthesis, rendering, and safe deployment.
"""

from __future__ import annotations
import os
import sys
import time
import random
import logging
from config.channel_config import get_channel_config
from pipeline.orchestrator import SchemaStudioPipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("SchemaStudio.Autopilot")


def run_autopilot_cycle():
    config = get_channel_config()
    profile = config.get_profile()

    logger.info(f"Triggering Autopilot cycle for {config.channel_name}...")
    logger.info(f"Niche Profile: {profile.niche_name}")

    # Pick or generate topic from research prompts
    research_prompts = profile.script.get("research_prompts", [
        "The subtle mechanics of decision fatigue",
        "Why complex systems fail unexpectedly",
        "The silent paradox of modern specialization"
    ])
    selected_topic = random.choice(research_prompts)
    logger.info(f"Selected Candidate Topic: {selected_topic}")

    pipeline = SchemaStudioPipeline(channel_config=config)
    result = pipeline.produce_video(
        topic=selected_topic,
        publish_to_youtube=not config.require_manual_review
    )
    logger.info("Autopilot production cycle finished successfully.")
    return result


if __name__ == "__main__":
    run_autopilot_cycle()
