"""
thumbnail_generator.py
Universal 4K High-CTR Thumbnail Engine for SchemaStudio.
Composes profile visual assets, dramatic gradient scrims, and punchy typography.
"""

from __future__ import annotations
import os
from pathlib import Path
from typing import Optional, Dict, Any
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance


class ThumbnailGenerator:
    def __init__(self, output_dir: Optional[Path] = None):
        self.output_dir = output_dir or Path(__file__).resolve().parent.parent / "output" / "thumbnails"
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_thumbnail(
        self,
        base_image_path: Path,
        headline_text: str,
        output_path: Path,
        thumbnail_profile: Optional[Dict[str, Any]] = None,
        width: int = 1920,
        height: int = 1080
    ) -> Path:
        """
        Creates a high-impact YouTube thumbnail by compositing:
        1. High-contrast base artwork (FLUX or generated asset)
        2. Dark vignette / gradient scrim for text readability
        3. Bold high-contrast typography
        """
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if base_image_path.exists():
            base = Image.open(base_image_path).convert("RGBA")
            base = base.resize((width, height), Image.Resampling.LANCZOS)
        else:
            base = Image.new("RGBA", (width, height), color=(15, 20, 30, 255))

        # Enhance contrast
        enhancer = ImageEnhance.Contrast(base.convert("RGB"))
        base = enhancer.enhance(1.2).convert("RGBA")

        # Create gradient overlay
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # Left-side dark scrim for headline readability
        for x in range(int(width * 0.7)):
            alpha = int(220 * (1.0 - (x / (width * 0.7))))
            draw.line([(x, 0), (x, height)], fill=(10, 12, 16, alpha))

        composite = Image.alpha_composite(base, overlay)
        draw = ImageDraw.Draw(composite)

        # Typography
        accent_color = "#FFD700"  # Default gold
        if thumbnail_profile and "contrast_accent" in thumbnail_profile:
            accent_color = thumbnail_profile["contrast_accent"]

        # Word wrap headline
        words = headline_text.upper().split()
        lines = []
        cur_line = []
        for w in words:
            if len(" ".join(cur_line + [w])) <= 16:
                cur_line.append(w)
            else:
                if cur_line:
                    lines.append(" ".join(cur_line))
                cur_line = [w]
        if cur_line:
            lines.append(" ".join(cur_line))

        # Draw text with drop shadow
        font_size = 92
        try:
            # Try system font
            font = ImageFont.truetype("arialbd.ttf", font_size)
        except Exception:
            try:
                font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
            except Exception:
                font = ImageFont.load_default()

        y_offset = int(height * 0.35)
        for line in lines[:3]:
            # Drop shadow
            draw.text((124, y_offset + 4), line, fill=(0, 0, 0, 240), font=font)
            # Foreground text
            draw.text((120, y_offset), line, fill=accent_color, font=font)
            y_offset += font_size + 24

        final_img = composite.convert("RGB")
        final_img.save(output_path, "JPEG", quality=95)
        return output_path
