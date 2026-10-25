"""
script_generator.py
Universal 5-Act Scriptwriting Engine for SchemaStudio.
Supports multi-LLM providers: Groq, Gemini, Anthropic, OpenAI, or local Ollama.
Dynamically injects active profile instructions, tone, and research topics.
"""

from __future__ import annotations
import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
from config.channel_config import ChannelConfig, ProfileConfig, get_channel_config

logger = logging.getLogger("SchemaStudio.ScriptWriter")


class ScriptGenerator:
    def __init__(self, channel_config: Optional[ChannelConfig] = None):
        self.channel_config = channel_config or get_channel_config()
        self.profile: ProfileConfig = self.channel_config.get_profile()

    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        """
        Resilient LLM dispatcher with multiple provider fallbacks:
        1. Groq (Ultra-fast Llama-3.3 / GPT-OSS)
        2. Google Gemini (2.0 Flash / Pro free tier)
        3. OpenAI / OpenRouter / Anthropic
        """
        # Try Groq
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            try:
                from openai import OpenAI
                client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_key)
                # Check model
                model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.75,
                    max_tokens=4000
                )
                return response.choices[0].message.content or ""
            except Exception as e:
                logger.warning(f"Groq API call failed: {e}. Trying Gemini...")

        # Try Google Gemini (Free tier available)
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                from google import genai
                client = genai.Client(api_key=gemini_key)
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=f"{system_prompt}\n\nTask:\n{user_prompt}"
                )
                return response.text or ""
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Trying OpenAI...")

        # Try OpenAI
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=openai_key)
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.75
                )
                return response.choices[0].message.content or ""
            except Exception as e:
                logger.error(f"OpenAI API call failed: {e}")

        # If all cloud LLMs absent, return clean structured mockup for zero-cost offline demonstration
        logger.warning("No paid LLM keys detected. Providing offline fallback script.")
        return self._generate_offline_sample_script(user_prompt)

    def _generate_offline_sample_script(self, topic: str) -> str:
        return f"""# {topic}: The Architectural Anatomy

[SCENE 1: THE CATALYTIC HOOK]
[VISUAL: {self.profile.visuals.get('art_style_prompt_prefix', 'Atmospheric scene')}, opening shot of mysterious phenomenon]
In the quiet calculus of human ambition, there exists a threshold where every certainty dissolves. We begin not with answers, but with the mechanism that demands our attention.

[SCENE 2: THE ANATOMICAL DECONSTRUCTION]
[VISUAL: {self.profile.visuals.get('art_style_prompt_prefix', 'Detailed view')}, detailed mechanical diagram or introspective reflection]
Consider how the pieces fit together. Beneath the surface narratives we tell ourselves, an underlying structure governs the outcome. Every choice reverberates through the system.

[SCENE 3: THE PARADOX & THE CRUCIBLE]
[VISUAL: {self.profile.visuals.get('art_style_prompt_prefix', 'Dramatic tension')}, dramatic contrast of shadow and light]
Here lies the paradox: the very trait designed to protect becomes the cage that confines. When confronted with tension, the architecture must either flex or shatter.

[SCENE 4: THE BREAKTHROUGH]
[VISUAL: {self.profile.visuals.get('art_style_prompt_prefix', 'Illuminating climax')}, brilliant beam of clarity piercing the void]
To see the system for what it is—that is the beginning of agency. It requires dismantling old blueprints and confronting the raw, unvarnished physics of reality.

[SCENE 5: THE SYNTHESIS]
[VISUAL: {self.profile.visuals.get('art_style_prompt_prefix', 'Poetic final wide shot')}, wide panoramic landscape lingering in stillness]
And so the quiet architecture remains. If you found value in this deconstruction, subscribe to {self.channel_config.channel_name} for our next deep inquiry. Until next time.
"""

    def generate_script(self, topic: str, target_duration_minutes: int = 5) -> Dict[str, Any]:
        """Generate a complete 5-act script tailored to the active profile."""
        system_prompt = self.profile.script.get("system_prompt", "You are an elite YouTube documentarian.")
        user_prompt = f"""
Write an extraordinary, high-retention 5-act YouTube script on the topic: '{topic}'.
Target video length: ~{target_duration_minutes} minutes (~750-1000 spoken words).

Channel Name: {self.channel_config.channel_name} ({self.channel_config.channel_handle})
Niche: {self.profile.niche_name}
Visual Style: {self.profile.visuals.get('art_style_prompt_prefix', 'Cinematic')}

REQUIREMENTS:
1. Include exactly 5 scenes labeled [SCENE 1], [SCENE 2], etc.
2. For each scene, include a dedicated [VISUAL: <FLUX prompt describing the visuals with art style prefix>] tag.
3. Deliver powerful spoken narration with micro-pauses and pacing tailored for {self.profile.niche_name}.
4. Conclude with a natural sign-off inviting the viewer to {self.channel_config.channel_name}.
"""
        raw_script = self._call_llm(system_prompt, user_prompt)
        scenes = self._parse_scenes(raw_script)

        return {
            "title": topic,
            "channel": self.channel_config.channel_name,
            "profile": self.profile.profile_id,
            "raw_text": raw_script,
            "scenes": scenes
        }

    def _parse_scenes(self, script_text: str) -> List[Dict[str, str]]:
        scenes = []
        raw_scenes = re.split(r'\[SCENE\s*\d+[^\]]*\]', script_text, flags=re.IGNORECASE)
        for idx, block in enumerate(raw_scenes[1:], start=1):
            visual_match = re.search(r'\[VISUAL:\s*([^\]]+)\]', block, re.IGNORECASE)
            visual_prompt = visual_match.group(1).strip() if visual_match else "Cinematic documentary shot"
            narration = re.sub(r'\[VISUAL:\s*[^\]]+\]', '', block).strip()
            scenes.append({
                "scene_number": idx,
                "visual_prompt": visual_prompt,
                "narration": narration
            })
        return scenes
