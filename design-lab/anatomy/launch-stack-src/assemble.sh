#!/bin/sh
# Joins the figure's parts with the Raptor's drawing helpers (lines 92-305 of its build).
# build.mjs is the interactive figure; build-clean.mjs the annotated, self-running one for the website.
cd "$(dirname "$0")/.."
for pair in "build.mjs:tail.mjs" "build-clean.mjs:tail-clean.mjs"; do
  out="${pair%%:*}"; tail="${pair##*:}"
  [ -f "launch-stack/$tail" ] || continue
  { cat launch-stack/head.mjs; echo; echo "const ex = (F, s) => [F.o[0], F.o[1], F.o[2] + s];"; echo "/* ── helpers, verbatim from examples/raptor-engine/build.mjs ── */"; sed -n '92,104p;106,305p' raptor-engine/build.mjs | sed 's/ride: ride ?? rideOf(piece, move),/ride: ride ?? rideOf(piece, move ?? PIECES[piece].move),/'; cat launch-stack/body.mjs "launch-stack/$tail"; } > "launch-stack/$out"
done
