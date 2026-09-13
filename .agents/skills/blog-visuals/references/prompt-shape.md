# Why simpler prompts win with references

This is the single most important lesson from production. If you only
read one reference file in this skill, read this one.

## The problem

Early on, the pipeline built elaborate fal prompts that wrapped Claude's
subject with composition instructions, mood, style descriptors, and
exclusion clauses. When a reference image was attached, the prompt also
included a "match the reference exactly" directive.

The outputs looked AI-generated: muddy shapes, scattered text labels
that shouldn't have been there, generic "concept art" vibes. Not on
brand. Not contextual.

## The fix

In reference mode (when `--reference` is attached), the final prompt is
the subject string verbatim. Nothing else. No "Editorial illustration
for a B2B SaaS article, depicting:" preamble. No "Composition: generous
negative space on the right third..." No "Mood: intelligent, calm..."
No strict-exclusion clause. No reference directive.

The fal `/edit` endpoint with strong image references carries all the
aesthetic load itself. Every extra sentence in the text prompt pulls it
away from the references. The moment we dropped them, outputs matched
brand tightly.

## What this means for you

When writing the `subject` field for an illustration shot, pretend you're
writing the prompt you'd type into the fal playground with those
references already attached. Describe the scene, nothing else.

### Shape of a good subject

One sentence. One concrete object. Where it sits in the frame.

```
A gold medal on a three-tiered podium, centered in the lower half
of the frame.
```

```
A 3D wooden three-legged stool, each leg a different clean geometric
shape, centered on the ground.
```

```
A 3D clipboard with a paper clipped on, showing four checkbox rows
with green ticks. Centered in the lower half of the frame.
```

### Shape of a bad subject

- Lists of labeled elements
- Explicit arrangements with counts ("four nodes", "three columns")
- Text labels the model should render
- Mood / atmospheric language ("quiet", "considered")
- Composition notes ("generous negative space on the right")

```
A three-column diagram labelled 'Measure', 'Retrofit', and 'Place'.
The Measure column shows a dashboard tracking prompts across five
AI engines. The Retrofit column shows a document with structured
headings and schema markup...
```

fal will render this as mangled text on generic rectangles. The
references can't save it because the text prompt is fighting them.

### Rule of thumb

If the subject mentions:
- A specific number of items → simplify to ONE item
- Labels or words → remove them (the reference shows the aesthetic; words are always a risk)
- Composition directions → remove them
- Mood adjectives → remove them

Keep only: the object, the position in frame, optional single descriptor
for material (3D, wooden, glass, metal).

## Why charts + screenshots carry the structural load instead

An article about "four selection criteria" doesn't need an illustration
that shows four labeled criteria. That's what the body copy does. The
illustration works BETTER if it's a clean visual metaphor for the
conclusion — a clipboard with ticks, a podium with a medal, a three-
legged stool.

When the article needs structured information (the actual four criteria,
the real engagement ranges, a process diagram), those should be a CHART
or a TABLE, not an illustration. Structure goes in structured formats;
illustrations carry atmosphere and metaphor.

## Validation in practice

Before running `illustrate.ts`, look at each shot's subject in
`.visuals-cache/<slug>/plan.json` and ask:

1. Is this one sentence? Can I cut it to one?
2. Does it name one concrete object, or a composed scene?
3. Does it try to label anything with text?

If any answer is "no / yes to the labels question", rewrite the subject
directly in `plan.json` and run `--skip-plan --skip-illustrate`... wait,
`--skip-illustrate` skips the step, use just `--skip-plan` to re-run
illustrate with the edited subjects.

## Historical note

The `renderPrompt()` function in `scripts/visuals/lib/prompts.ts` still
handles both modes. In NO-reference mode it keeps the old template
wrapping because that mode has to carry the aesthetic load entirely
through text. In reference mode it returns subject verbatim. If you're
ever maintaining this code and tempted to add "just a little" composition
hint to the reference-mode branch — don't. It will regress the quality.
