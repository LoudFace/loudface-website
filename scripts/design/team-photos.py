"""Resize a team member's studio headshot for the site (2026-09-28, the leads' new Slack photos).

  python3 scripts/design/team-photos.py <suffix> <slug> [<slug> ...]
  e.g. python3 scripts/design/team-photos.py -v2 arnel-bukva tamara-pavlovic andrea-van-wyk abhay-tyagi

Reads design-lab/v11-image-originals/team/<slug>.png (a square headshot) and writes, under public/images/home-v11:
  team/<slug><suffix>.jpg     800x800  every photo slot; each slot crops it with object-fit: cover
  avatars/<slug><suffix>.png  96x96    the same photo in a circle, transparent corners
Then set the same suffix for the slug in PHOTO_SUFFIX (src/app/home-v11/ui.tsx). /images is cached for a year, so a new
photo always gets a new file name.

The photo is used as shot: same background, same framing (Arnel, 2026-09-28: "Just keep the photo as is").
"""
import os, sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'design-lab/v11-image-originals/team')
OUT = os.path.join(ROOT, 'public/images/home-v11')


def build(slug, suffix):
    im = Image.open(os.path.join(SRC, f'{slug}.png')).convert('RGB')
    im.resize((800, 800), Image.LANCZOS).save(f'{OUT}/team/{slug}{suffix}.jpg', quality=85, optimize=True, progressive=True)

    # the circle is drawn at 4x and scaled down, so its edge is smooth
    Z = 384
    av = im.resize((Z, Z), Image.LANCZOS).convert('RGBA')
    m = Image.new('L', (Z, Z), 0)
    ImageDraw.Draw(m).ellipse((0, 0, Z - 1, Z - 1), fill=255)
    av.putalpha(m)
    av.convert('RGBa').resize((96, 96), Image.LANCZOS).convert('RGBA').save(f'{OUT}/avatars/{slug}{suffix}.png', optimize=True)
    print(slug, 'ok')


if __name__ == '__main__':
    suffix, *slugs = sys.argv[1:]
    for slug in slugs:
        build(slug, suffix)
