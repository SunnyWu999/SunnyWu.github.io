"""Cut public/images/guide/guide-sheet.png (3 x 2 grid of poses on white) into separate
transparent pose images: wave, surprised, sassy, dance, thinking, curtsy."""
from PIL import Image, ImageFilter, ImageChops
import collections, os, sys

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'guide')
POSES = ['wave', 'surprised', 'sassy', 'dance', 'thinking', 'curtsy']

def cut_white(im, thr=232):
    im = im.convert('RGBA'); w, h = im.size; px = im.load()
    mask = Image.new('L', (w, h), 0); mp = mask.load(); q = collections.deque()
    ok = lambda x, y: min(px[x, y][:3]) >= thr
    for x in range(w):
        for y in (0, h - 1):
            if ok(x, y) and not mp[x, y]: mp[x, y] = 255; q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if ok(x, y) and not mp[x, y]: mp[x, y] = 255; q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if 0 <= nx < w and 0 <= ny < h and not mp[nx, ny] and ok(nx, ny):
                mp[nx, ny] = 255; q.append((nx, ny))
    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1))
    im.putalpha(ImageChops.multiply(ImageChops.invert(mask), im.split()[3]))
    box = im.split()[3].point(lambda v: 255 if v > 20 else 0).getbbox()
    return im.crop(box) if box else im

# usage: python3 scripts/split_guide.py [sheet-file-name] [pose names in reading order...]
if len(sys.argv) > 2:
    POSES = sys.argv[2:]
sheet_path = os.path.join(ROOT, sys.argv[1] if len(sys.argv) > 1 else 'guide-sheet.png')
if not os.path.exists(sheet_path):
    sys.exit(f'Put the character sheet at {sheet_path} first.')
sheet = Image.open(sheet_path)
W, H = sheet.size
for i, pose in enumerate(POSES):
    col, row = i % 3, i // 3
    cell = sheet.crop((col * W // 3, row * H // 2, (col + 1) * W // 3, (row + 1) * H // 2))
    doll = cut_white(cell)
    doll.thumbnail((900, 900))
    doll.save(os.path.join(ROOT, f'{pose}.webp'), 'WEBP', quality=90)
    print(pose, doll.size)
