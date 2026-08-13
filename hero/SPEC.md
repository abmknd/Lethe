# HERO — "Three" (Sisyphus, inverted)

A single interactive hero section. Not a full-page scroll narrative.
1-bit dithered engraving aesthetic, two colors only.

---

## 1. ART DIRECTION — NON-NEGOTIABLE

### Palette
Exactly two colors. No greys, no alpha blending in the final image.
Every tonal value must be produced by dot/line density, never by opacity.

  --field: #0000F2   /* Blue 600 — design-system token, the site canvas */
  --ink:   #FFFFFF   /* White — design-system token */

(Art-director override 2026-08-11: palette locked to the established design
tokens. The hero must be seamless with the page canvas — no warmer variant.)

### Mark systems (all three must be present)
1. STIPPLE      — tonal gradients on figures and boulder. Produced by the
                  dither pass from the density map.
2. CONTOUR LINE — topographic isolines. The ground is entirely this.
                  Musculature is defined by it. Procedural where possible.
3. FACET FILL   — nested concentric polygons inside boulder facets.
                  Authored in the atlas.

### Composition
Square-ish, symmetrical, heraldic. Center figure is a straight back view.
Flanking figures are 3/4 views turned inward (author ONE 3/4 asset, mirror
it for the opposite side). All backs fully turned — no faces, ever.
Boulder is large, faceted, occupies the upper half and visually presses down.

### Background
Faint wireframe geodesic domes / concentric arc grids, like a technical
drawing underlay. 100% procedural GLSL. Ink density ~0.15 of foreground.

### Anti-goals
- No gradients rendered as gradients. Everything is dots or lines.
- No color beyond the two tokens.
- No antialiasing on ink edges. Crisp, pixel-locked.
- No drop shadows, no glows, no blur except as a density falloff.

---

## 2. SCOPE — HERO ONLY

The interaction lives in the hero and nowhere else.

- Hero wrapper is `position: sticky`, pinned for 250vh of scroll.
- After the pin releases, the rest of the page scrolls normally.
- An IntersectionObserver MUST pause the rAF loop the moment the canvas
  leaves the viewport, and resume on re-entry. A hero canvas that keeps
  rendering while the user reads the page below is a battery bug.
- The piece must be a beautiful STATIC POSTER at p=0. It is the hero image.
  It cannot start as a blank or loading state.

### Reversibility (hard requirement)
`scrub(p)` must be a PURE FUNCTION of p. No accumulated state, no one-shot
triggers, no "hasFired" booleans. Users scroll up and down in heroes. Every
frame must be reconstructible from p alone. Idle/tremor motion is the only
thing allowed to depend on wall-clock time.

---

## 3. THE CORE ARCHITECTURE — DENSITY IN, 1-BIT OUT

All artwork ships as a grayscale DENSITY FIELD, never as final 1-bit art.

### Atlas channel packing (one 2048² RGBA KTX2 atlas)
  R = tonal density   0..1   (drives the dither)
  G = linework        0..1   (crisp contour/hatch marks)
  B = strain mask     0..1   (lats, glutes, calves, forearms, traps)
  A = silhouette / coverage

### The one shader operation
```glsl
precision highp float;   // REQUIRED — mediump is 16-bit on Adreno/Mali

// screen-space, pixel-locked to the low-res buffer
float t = bayer8(ivec2(mod(gl_FragCoord.xy + uTemporalOffset, 8.0)));

float d = tex.r * uTone                       // base tone
        + tex.g * uLine                       // linework
        + tex.b * uStrain * 0.35;             // effort darkens the muscle

d *= uReveal;                                 // materialize / dematerialize

float ink = step(t, d);
gl_FragColor = vec4(mix(FIELD, INK, ink * tex.a), 1.0);
```

Every animation in the piece is a change to `d`. That is the whole system.
- Strain rising      → uStrain up
- Figure appearing   → uReveal 0→1, biased by a vertical gradient
- Pose change        → mix() two atlas regions' density before the step
- Text resolving     → same step(), density from an SDF

### Pose keyframes
3 density keyframes per figure: SETTLE / PRESS / MAX_STRAIN.
Crossfade in density space, then threshold. Because output is 1-bit, a
cross-dissolve reads as a dither transition, not a mushy fade. Do not build
a skeletal rig — rotating baked contour linework breaks the engraving
illusion immediately.

### Instancing
Three figures = one InstancedMesh. Per-instance attributes:
`aAtlasRect` (back vs 3/4), `aMirror`, `aPhase`, `aReveal`, `aStrain`.
One draw call.

---

## 4. RESOLUTION & DITHER STABILITY

The most likely failure of this build is dither shimmer. Rules:

- Render the scene into an offscreen RenderTarget at exactly
  `floor(cssWidth / 2) × floor(cssHeight / 2)`, independent of devicePixelRatio.
- Apply the dither pass in that buffer's pixel space.
- Upscale to the canvas with magFilter = NearestFilter, minFilter = NearestFilter,
  generateMipmaps = false.
- Result: dot pitch is a constant 2 CSS px on every device. Non-negotiable.
- `uTemporalOffset` advances at most 12 times per second, not per frame, and
  steps in whole Bayer cells. Per-frame temporal dither strobes and is a
  photosensitivity risk.

---

## 5. PROCEDURAL ELEMENTS (no textures)

### Topographic ground
```glsl
float h = fbm(uv * 3.0 + uDrift);
h += impactRipples(uv);              // sin(dist*k - t*w) * decay, per figure foot
float r = fract(h * uContourCount);
float line = 1.0 - smoothstep(0.0, uLineWidth, min(r, 1.0 - r));
```
Contour count increases and isolines compress under the figures as strain rises.

### Wireframe domes
Polar coords per dome center. `fract(radius * N)` for arcs, `fract(theta * M)`
for meridians, masked to a dome shape. Three overlapping domes, slow
independent rotation, converging to aligned at p=1.

---

## 6. CHOREOGRAPHY (p = 0 → 1 across the 250vh pin)

| p         | beat                                                                    |
|-----------|-------------------------------------------------------------------------|
| 0.00      | ONE figure, centered, back turned, arms up. Boulder at rest height.      |
|           | Idle only: breath, tremor, dither crawl. Reads as a finished poster.     |
| 0.00–0.30 | Strain climbs. Boulder descends ~4% of hero height. uStrain 0→1.         |
|           | Ground isolines compress beneath him. Tremor amplitude rises.            |
| 0.30      | Lowest point. He is failing.                                             |
| 0.30–0.55 | LEFT figure materializes OUT OF THE DITHER — uReveal 0→1 with a          |
|           | ground-up vertical gradient bias. Do not slide it in from offscreen.     |
|           | Boulder descent halts.                                                   |
| 0.55–0.75 | RIGHT figure materializes, mirrored, same technique.                     |
| 0.75–1.00 | uSync 0→1: the three tremor phases converge into lockstep.               |
|           | Boulder rises above its p=0 height. Domes rotate into alignment.         |
|           | Headline resolves out of the dither.                                     |

### Idle regression
When scroll velocity ≈ 0, the boulder sinks slightly and tremor intensifies.
Subtle — a few pixels. This is the thesis of the piece expressed as physics.
Must not break reversibility: implement as a time-based offset ADDED to the
p-derived value, never as a mutation of p.

---

## 7. TYPOGRAPHY

Headline is real DOM text (accessible, selectable, SEO-visible), positioned
over the canvas, revealed with a CSS `mask-image` driven by the same p.
The mask is a tiled Bayer PNG so the text resolves out of dither like
everything else. Do not render the headline in WebGL.

---

## 8. PERFORMANCE & ACCESSIBILITY

Budget: total hero payload < 1.2MB. 60fps on a mid-range Android.
Because the render buffer is half-res, this should be comfortable.

- Atlas as KTX2/ETC1S. Self-host the Basis transcoder in `public/vendor/`.
  Never load decoders from a CDN.
- `createImageBitmap` for decode; flush the GPU upload queue before first paint.
- LCP element is a static poster `<img>` of the p≈0.9 frame, shown immediately,
  crossfaded out on the canvas's first rendered frame.
- `prefers-reduced-motion: reduce` → freeze uTemporalOffset, disable tremor,
  disable idle regression, snap p to 1.0. Show the poster, essentially.
- No WebGL → poster image only. The page must be complete without the canvas.
- Keyboard: the hero must not trap focus or block tabbing past it.
