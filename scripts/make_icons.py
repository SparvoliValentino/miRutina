"""Generate PWA and iOS icons from the app's brand mark."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1] / "assets" / "icons"
root.mkdir(parents=True, exist_ok=True)
size = 1024
icon = Image.new("RGB", (size, size), "#101b1b")
draw = ImageDraw.Draw(icon)
draw.rounded_rectangle((190, 190, 834, 834), radius=170, fill="#b3ef73")
font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 500)
bounds = draw.textbbox((0, 0), "M", font=font)
draw.text(((size - (bounds[2] - bounds[0])) / 2 - bounds[0] - 18,
           (size - (bounds[3] - bounds[1])) / 2 - bounds[1] - 12),
          "M", font=font, fill="#13241b")
draw.ellipse((668, 670, 737, 739), fill="#4c8060")
for output_size, filename in [(192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png")]:
    icon.resize((output_size, output_size), Image.Resampling.LANCZOS).save(root / filename, optimize=True)
