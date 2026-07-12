#!/usr/bin/env python3
"""
iso-helpers.py — correct-by-construction primitives for LoudFace blueprint plates.

WHY THIS EXISTS: across the homepage-section work the HUMAN kept catching GEOMETRY bugs the
agent shipped by hand — reversed stack order (lowest slab painted on top), screen-flat lines
floating off a tilted iso face, labels clipping the plate edge, text sitting on shapes. Every
one was a rule the agent "knew" but re-broke while hand-placing coordinates. Prose rules get
skimmed; a FUNCTION that only does it right cannot be violated. So the hard-won rules are
encoded here. Copy this module, compose with it, and the geometry is correct by construction.

The five guarantees baked in:
  1. cube()      — depth-ramped faces (top lightest, sides darker) so it never reads inside-out.
  2. floor()     — iso tile field painted back-to-front by (ix+iy). Never inside-out.
  3. vstack()    — a vertical exploded stack painted BOTTOM-TO-TOP (raised part nearer = last).
  4. face_rows() — detail ON an iso face drawn along the face's in-plane vectors (iso-aligned),
                   never screen-horizontal/vertical, so it sits on the surface.
  5. emit()      — LABELS ALWAYS LAST. Shapes list + labels list; labels concatenated on top.
  + gutter labels (gL/gR): text lives in a margin, a leader reaches in — text never on a shape.
  6. area_under()/area_between() — chart fills bounded by the LINE'S OWN points, never a straight
     chord between endpoints (a chord leaks past a concave/convex curve — the growth-chart leak).

Portable: the logic is language-agnostic; if you build inline JS, mirror these guarantees.
Ramp = the host brand's --primary-* (indigo for LoudFace). Shared <defs> + .plate CSS live in
references/plate-css.md — include them ONCE per page.
"""
C, S = 0.86603, 0.5  # cos30, sin30 — the fixed isometric basis
L50,L1,L2,L3,L4 = "var(--primary-50)","var(--primary-100)","var(--primary-200)","var(--primary-300)","var(--primary-400)"
INK = "var(--primary-600)"                     # THE line-work colour (every stroke)
SHADOW = "var(--surface-400)"                  # cast-shadow tiles only, at fill-opacity .2

# ---------- raw primitives ----------
def P(pts, fill=None, stroke=INK, sw=1, extra="", fo=None):
    d = "M" + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "z"
    a = [f'd="{d}"', f'fill="{fill}"' if fill else 'fill="none"']
    if fo is not None: a.append(f'fill-opacity="{fo}"')
    if stroke: a.append(f'stroke="{stroke}" stroke-width="{sw}"')
    if extra: a.append(extra)
    return f'<path {" ".join(a)}/>'
def Ln(x1,y1,x2,y2, sw=1, dash=None, extra=""):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="M{x1:.1f},{y1:.1f} L{x2:.1f},{y2:.1f}" fill="none" stroke="{INK}" stroke-width="{sw}"{da} {extra}/>'
def Tx(x,y,t,cls="",anchor="start"):
    c = f' class="{cls}"' if cls else ""
    return f'<text x="{x:.0f}" y="{y:.0f}" text-anchor="{anchor}"{c}>{t}</text>'
def arrow(x1,y1,x2,y2, dash=None, sw=1, cls=""):
    da=f' stroke-dasharray="{dash}"' if dash else ""; cc=f' class="{cls}"' if cls else ""
    return f'<path d="M{x1:.1f},{y1:.1f} L{x2:.1f},{y2:.1f}" fill="none" stroke="{INK}" stroke-width="{sw}"{da}{cc} marker-end="url(#fx-arr)"/>'

# ---------- chart area fills (GUARANTEE 6: bounded by the LINE'S OWN points, never a chord) ----------
def area_under(pts, y_base, fill=L50, hatch=False, extra=""):
    """A filled area under a polyline/curve, closed straight DOWN to y_base and back.
    pts = the EXACT same (x,y) list you draw the line from. Passing a straight chord between the
    two endpoints instead (P([start, end, corner])) leaks the fill past any concave/convex curve —
    the hatch-above-the-line defect the human caught on the growth chart. Pass the curve, not its
    ends. hatch=True uses the shared url(#fx-hatch) pattern instead of a flat ramp step."""
    f = "url(#fx-hatch)" if hatch else fill
    poly = list(pts) + [(pts[-1][0], y_base), (pts[0][0], y_base)]
    return P(poly, fill=f, stroke=None, extra=extra)
def area_between(upper, lower, fill=L50, hatch=False, extra=""):
    "Area BETWEEN two curves (e.g. actual vs expected-baseline). Both are point lists, same x-order."
    f = "url(#fx-hatch)" if hatch else fill
    return P(list(upper) + list(reversed(lower)), fill=f, stroke=None, extra=extra)

# ---------- isometric geometry (the basis: matrix(0.86603 0.5 -0.86603 0.5 tx ty)) ----------
def corners(tx,ty,s):
    "top,right,bottom,left screen corners of a unit-square tile at local origin (tx,ty)."
    return (tx,ty),(tx+C*s,ty+S*s),(tx,ty+s),(tx-C*s,ty+S*s)
def tile(tx,ty,s,fill,extra=""):
    t,r,b,l = corners(tx,ty,s); return P([t,r,b,l], fill=fill, extra=extra)
def cube(tx,ty,s,h, top=L1, left=L2, right=L3, top_extra=""):
    "GUARANTEE 1: 3 depth-ramped faces (top lightest -> sides darker). Never inside-out."
    t,r,b,l = corners(tx,ty,s); dn = lambda p:(p[0],p[1]+h)
    return (P([l,b,dn(b),dn(l)], fill=left) + P([b,r,dn(r),dn(b)], fill=right) + P([t,r,b,l], fill=top, extra=top_extra))

def floor(cells, ox, oy, s, h=0, fill_of=None):
    "GUARANTEE 2: iso tile field, painted back-to-front by (ix+iy). cells=[(ix,iy),...]."
    out=[]
    for ix,iy in sorted(cells, key=lambda c:(c[0]+c[1], c[0])):
        tx = ox + (ix-iy)*C*s; ty = oy + (ix+iy)*S*s
        f = (fill_of(ix,iy) if fill_of else (L1,L2,L3))
        out.append(cube(tx,ty,s,h,*f) if h else tile(tx,ty,s,f[0] if isinstance(f,tuple) else f))
    return out

def vstack(parts):
    "GUARANTEE 3: vertical exploded stack painted BOTTOM-TO-TOP. parts=[(y, svg_string),...]."
    "The raised (smaller-y) part is nearer the camera, so it must be drawn LAST to occlude."
    return [svg for _,svg in sorted(parts, key=lambda p:-p[0])]  # largest y (lowest) first

def face_rows(r, e1, n, top=0.20, gap=0.20, vh=0.13, fills=None, dashed_last=False):
    """GUARANTEE 4: n rows ON an iso face, drawn along the face's in-plane vector e1 (iso-aligned).
    r = a corner of the face (screen xy); e1 = the along-width vector = (Bx-Rx, By-Ry).
    Rows step straight DOWN (screen +y). Never uses screen-horizontal lines on the tilt."""
    out=[]; H = 100  # face is normalised in 0..1 along e1; vertical offsets are absolute px
    for k in range(n):
        vtop = top + k*(gap)
        a  = (r[0]+e1[0]*0.12, r[1]+e1[1]*0.12 + vtop*H)
        bb = (r[0]+e1[0]*0.88, r[1]+e1[1]*0.88 + vtop*H)
        c  = (bb[0], bb[1]+vh*H); d = (a[0], a[1]+vh*H)
        if dashed_last and k==n-1:
            out.append(P([a,bb,c,d], fill=None, extra='stroke-dasharray="4 3" class="flick"'))
        else:
            fill = (fills[k] if fills else L4)
            out.append(P([a,bb,c,d], fill=fill))
    return out

# ---------- label gutters (text in the margins, a leader reaches in — never on a shape) ----------
# CLIP-PROOF BY CONSTRUCTION: gL/gR estimate the label's width (~5.9px per char at 10px mono)
# and clamp the anchor so the text can't run off the plate edge — the label-clip defect that
# recurred twice ("DIRECT PUBLISH — LOCKED", "ACTUAL — NO LIFT") is now impossible.
def _w(txt): return len(txt) * 5.9
def gL(y, txt, tx, ty, cls="", gx=92, W=560):   # left gutter, text right-aligned to gx
    gx = max(gx, _w(txt) + 6)                    # keep the left end on-plate
    return [arrow(gx+8, y-3, tx, ty), Tx(gx, y, txt, cls, anchor="end")]
def gR(y, txt, tx, ty, cls="", gx=468, W=560):  # right gutter, text left-aligned at gx
    gx = min(gx, W - 6 - _w(txt))                # keep the right end on-plate
    return [arrow(gx-8, y-3, tx, ty), Tx(gx, y, txt, cls, anchor="start")]
# NEAR-TARGET RULE: only gutter-label a target that is NEAR the edge on that side. For a target
# near the CENTRE of the plate, DON'T use a side gutter — the leader crosses the whole figure and
# the label lands on some other shape (the "9 AHEAD on the MARKETING box" bug). Put a short label
# directly ABOVE or BELOW the central target instead (Tx at the target's x, no leader needed).
def title(txt, x=56, y=30): return [Tx(x, y, txt)]
def caption(txt, cx, y=286): return [Tx(cx, y, txt, anchor="middle")]

# ---------- assembly (GUARANTEE 5: labels always last, on top) ----------
def emit(shapes, labels, vb="0 0 560 300"):
    body = "\n".join(shapes) + "\n" + "\n".join(labels)   # labels concatenated LAST
    return f'<svg viewBox="{vb}" xmlns="http://www.w3.org/2000/svg" fill="none">\n{body}\n</svg>'

# ---------- minimal usage sketch ----------
# SH=[]; LB=[]
# SH.append(Ln(cx,4,cx,214,dash="2 3"))                 # axis, behind
# SH += vstack([(184, cube(cx,184,70,11)),              # exploded stack, bottom-to-top auto
#               (120, cube(cx,120,70,11)),
#               (56,  cube(cx,56,70,11))])
# for y,name in [(184,"SPECS"),(120,"FEATURES"),(56,"HERO")]:
#     LB += gL(y+18, name, cx-C*70+4, y+12)             # labels in the gutter
# LB += title("[ HOMEPAGE ]"); LB += caption("...", cx)
# svg = emit(SH, LB)                                    # labels last, on top
