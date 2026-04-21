---
model: fal-ai/gpt-image-1.5
aspectRatio: 16:9
resolution: 2K
imageSize: 1536x1024
quality: high
inputFidelity: high
---

# Diagram illustration

Template uses a two-part structure. Sections named "Subject" and "Negative prompt"
are always sent. Sections named "Style" and "Style negatives" are only sent when
no reference image is provided.

## Subject

Schematic editorial diagram illustrating the concept: {{subject}}.

Composition: shows a clear relationship — flow, sequence, hierarchy, or feedback loop. Nodes connected by arrows or lines, evenly weighted, carefully aligned. Rhythmic spacing, generous negative space, reads left-to-right or top-to-bottom. Small dots, arrows, and brackets anchor structure.

Treat this as a diagram silhouette — shapes and arrows — with legibility of form, not of text. No rendered text labels inside the image (labels will be added separately in the article caption).

Mood: considered, explanatory, quietly authoritative. The visual confidence of an editorial data illustration.

## Style

Information-design aesthetic inspired by editorial infographics (think New York Times, The Pudding, FiveThirtyEight). Clean vector shapes, thin linework, subtle grain texture. Flat design. Palette on warm off-white (#FAF7F2) background, deep navy (#0B1F3A) for primary strokes and fills, soft terracotta (#D97757) for emphasis nodes or flow markers, muted charcoal (#1A1A1A) for secondary linework.

## Negative prompt

face, person, human figure, realistic textures, readable text, readable letters, readable words, typography, logos, brand marks, ui mockup, screenshot, cluttered, chaotic, messy handwriting, watermark, signature, cartoonish

## Style negatives

photograph, photo-realistic, 3d render, cgi, neon, saturated, cheap icons, generic infographic clipart, gradients
