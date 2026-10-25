# ⚬️ SchemaStudio

<div align="center">

**The Open-Source, Self-Hosted Autonomous 4K YouTube Production Pipeline**

* From deep-dive research to 5-act scriptwriting, neural voiceovers, FLUX visuals, 4K mastering, and YouTube Cloud upload. *


[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-brightgreen.svg)](https://www.python.org/)
[![Edge-TTS](https://img.shields.io/badge/TTS-Edge--TTS%20(Zero--Cost)-ff69b4.svg)](https://github.com/rany2/edge-tts)
</div>

---

## 🌟 What is SchemaStudio?

**SchemaStudio** is a self-hosted, universal alternative to closed automation tools. It enables content creators and engineers to run an end-to-end autonomous YouTube channel from a single workstation or cloud server.

### ⚢ Highlights

- **100% Free Out-of-the-Box**: Runs free using Edge-TTS (neural speech) and Pollinations FLEX (visuals).
- **Pro Upgrades**: Drop in your `ELEVENLABS_API_KEY` ``MODAL_TOKEN_ID``for instant studio-grade voiceover and FLUX.1 GPU rendering.
- **Universal Niche Profiles**: Switch between Pasychology, Tech Engineering, History, Finance, and Sci-Fi with 1 click in `profiles/`.
- **Dynamic Channel Config**: Brand name, handle, privacy, and cadence decouple cleanly into `channel.json`.
- **Manual Review Gate**: Run hands-off on autopilot, or require 1-click human approval before pushing to YouTube Cloud.
- **Web Studio Pro UI**: Real-time dashboard available at `http://localhost:8000` for profile management and YOuTube OAuth2 status.

---

## 🎩 Quickstart

```bash
# 1. Clone repo
git clone https://github.com/mehaksandhudev/SchemaStudio.git
cd SchemaStudio

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start Web Studio Dashboard
python dashboard/server.py
```

---

## 🞼 YouTube OAuth2 Connection

Place your `client_secrets.json` from Google Cloud Console into `credentials/client_secrets.json`, then run:
```bash
python -m pipeline.youtube_auth --login
```

---

## 🎨 Built-in Niche Profiles (`Profiles/`)

- **default_psychology**: 2D minimalist charcoal sketch, introspective tone, Christopher/Ryan voices
- **tech_documentary**: Isometric technical blueprints, authoritative tone, Guy/Brian voices
- **history_deepdive**: Baroque chiaroscuro oil painting, epic documentary tone, Ryan/Thomas voices
- **finance_crypto**: Minimalist vector charts, dark glassmorphism, Andrew/Christopher voices- **cifi_philosophy**: Brutalist space concept art, existential philosophy tone

---

## 🧩 License
MIT License. See [LICENSE](LICENSE) for details.
