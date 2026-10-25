# 🎨 SchemaStudio Niche Profiles Guide

SchemaStudio decouples channel niche concepts, art styles, tones, and voiceover settings into declarative YAML files inside this directory.

## 📁 Directory Structure

```
profiles/
├── default_psychology.yaml   # Charcoal sketch, introspective human behavior
├── tech_documentary.yaml     # Isometric schematics, engineering deep-dives
├── history_deepdive.yaml     # Baroque chiaroscuro, dramatic turning points
├── finance_crypto.yaml       # Dark glassmorphism, market liquidity regime
└── scifi_philosophy.yaml     # Brutalist deep space, cosmic philosophy
```

## 🛠️ Anatomy of a Profile Schema

Every YAML file in this directory implements the following specification:

```yaml
profile_id: "custom_niche_id"
niche_name: "Display Name for Web Studio"
description: "1-2 sentence overview of the niche."

branding:
  default_title_prefix: "Category Prefix:"
  tone_of_voice: "Authoritative, engaging, contemplative"

script:
  research_prompts:
    - "Candidate topic prompt 1"
    - "Candidate topic prompt 2"
  system_prompt: |
    Your 5-act scriptwriting instructions tailored to this domain.

visuals:
  art_style_prompt_prefix: "Prefix appended to all image generation prompts..."
  prompt_suffix: "Suffix appended to generation prompts (8k, cinematic lighting)..."
  aspect_ratios: ["16:9", "9:16"]

voice:
  edge_tts_voice: "en-US-ChristopherNeural"
  edge_tts_rate: "-4%"
  edge_tts_pitch: "-2Hz"
  elevenlabs_voice_id: "ErXwobaYiN019PkySvjV" # Optional

thumbnail:
  style_theme: "Color palette and visual style for high-CTR thumbnails"
  dominant_colors: ["#0A0D14", "#FFD700"]
  contrast_accent: "#FFD700"
```

## 🚀 Creating a New Profile

1. Copy any existing profile file: `cp profiles/default_psychology.yaml profiles/my_niche.yaml`
2. Edit the visual prefixes, system prompt, and preferred voice.
3. Refresh the Web Studio dashboard at `http://localhost:8000` -- your new profile will automatically appear in the active dropdown!
