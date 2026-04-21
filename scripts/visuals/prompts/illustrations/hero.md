---
model: fal-ai/gpt-image-1.5
aspectRatio: 16:9
resolution: 2K
imageSize: 1536x1024
quality: high
inputFidelity: high
---

# Hero illustration

Template uses a two-part structure. Sections named "Subject" and "Negative prompt"
are always sent to fal. Sections named "Style" and "Style negatives" are only
sent when NO reference image is provided — when a reference is passed (via
`--reference`), it drives the visual style and sending conflicting text
instructions (palette, texture, "no gradients") would fight the image.

## Subject

Editorial illustration for a B2B SaaS article, depicting: {{subject}}.

Composition: one clear focal idea, generous negative space on the right third so the image reads cleanly behind or beside a headline, subtle geometric motifs (circles, arrows, offset rectangles) reinforcing the concept, slight asymmetry, confident and considered — not busy.

Mood: intelligent, calm, forward-looking. The feeling of a serious publication's section opener.

## Style

Minimalist editorial illustration, clean vector-forward aesthetic, subtle grain texture, muted color palette anchored by warm off-white (#FAF7F2) background with accents in deep navy (#0B1F3A), soft terracotta (#D97757), and charcoal (#1A1A1A). Flat shapes with thin linework, 2–3 overlapping planes for depth.

## Negative prompt

face, person, people, human figure, realistic skin, watermark, signature, text, letters, words, typography, logos, brand marks, ui mockup, screenshot, cluttered, chaotic

## Style negatives

photograph, photo-realistic, 3d render, cgi, stock photo aesthetic, neon, saturated colors, cheap illustration, generic tech cliche (glowing brains, circuit boards, robots, blue abstract data mesh), gradients
