from __future__ import annotations

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SCENE_DIR = ROOT / 'public' / 'images' / 'scene'
MAX_WIDTH = 2560
MAX_HEIGHT = 2560

for name in ['scene-personal.png', 'scene-professional.png']:
    source = SCENE_DIR / name
    if not source.exists():
        raise FileNotFoundError(f'Missing source image: {source}')

    with Image.open(source) as image:
        image = image.convert('RGB')
        image.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
        output = SCENE_DIR / name.replace('.png', '.webp')
        image.save(output, 'WEBP', quality=82, method=6)
        print(f'Converted {source.name} -> {output.name}')
