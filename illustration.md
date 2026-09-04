# Illustration

How Relethe's generated art is made. This is the normative reference for the
animated **spot illustrations** in `src/assets/spot-illustrations/`, and for the
dither that ties them to the rendered plates.

Companion docs: `redesign.md` (the design system) · `REBRAND-HANDOFF.md` (state
and rules) · `REBRAND-PLAN.md` (the phases).

---

## 1. What these are

A spot illustration is an **animated 3D mark, generated in a fragment shader**.
No sprite sheet, no video, no Lottie. Each one is a ~3KB module that renders a
signed-distance field, lights it, and reduces it to one bit of ink through an
ordered dither.

They live in `src/assets` beside the images because that is what they are:
finished art you import and place. They are simply generated rather than stored,
which buys three things a sprite cannot:

- **resolution independence** — sharp at any size and any DPR, no `@2x`
- **token awareness** — the ink is read off the CSS custom properties at
  runtime, so a brand colour change reaches the art with no re-export
- **real motion** — physics rather than keyframes, so a bounce is a bounce

```tsx
import { EmptyBox } from '../../assets/spot-illustrations';
<EmptyBox size={180} />
```

### The files

| File | What |
|---|---|
| `prelude.ts` | the shared GLSL: dither, primitives, marcher, lighting, clock, ballistics |
| `SpotIllustration.tsx` | the WebGL host — one triangle, one shader, one draw call |
| `empty-box.tsx` | an open box, turning. Nothing is wrong |
| `broken-ball.tsx` | a ball of bricks that spins up and comes apart. Their end |
| `broken-gear.tsx` | a gear that drops, cracks and splits. Our end |
| `success-monument.tsx` | three solids stack themselves, then take a bow |
| `gavel.tsx` | a gavel strikes a sounding block. A request accepted |
| `index.ts` | the barrel |

Every asset is `PRELUDE + its own map() + its own main()`. An asset file should
be a **shape and a timeline** and nothing else; anything a second asset would
also need belongs in the prelude.

---

## 2. The pipeline

```
SDF geometry  →  raymarch  →  light  →  luminance  →  Bayer dither  →  1-bit ink
```

**Why 3D and not flat.** A dithered flat shape is just a noisy shape. A dithered
*shaded* shape is an engraving: the stipple density becomes the shading, which
is the entire point of the technique and the reason the brand's rendered plates
read as they do. Two earlier passes drew flat SDF silhouettes; they were legible
and dead.

**Why SDFs and not meshes.** No geometry to ship, no loader, no rig. Rigid-body
motion is a transform on the sample point, so "this piece broke off and is now
tumbling" costs one matrix rather than a skinning pipeline.

---

## 3. The dither

Recovered, not invented. The GLSL hero was retired in `39078d9`; its eight
shaders live in `31d2b93`, and `hero/src/shaders/dither.frag.glsl` is the house
style. **Do not re-derive this — read that file.**

An 8×8 ordered Bayer threshold, blended toward per-cell hash noise, density in
and one bit out.

| Constant | Value | Why |
|---|---|---|
| `DITHER_NOISE` | **0.10** | The hash blend exists to stop pure Bayer weaving a visible grid. At the hero's landscape scale that grid is the problem; at spot scale the **speckle** is, and it eats the seams between parts. The hero used 0.30. |
| `CLUSTER` | **1.0** | Device pixels per threshold cell. Tried 0.5 (2×2 blocks) to fight a washed-out look; the grain got heavy and lumpy and the silhouette got no crisper. It was the wrong lever — see §5. |
| threshold remap | `t * 63/64 + 0.5/64` | Into (0,1) exclusive, so density 0 **never** inks and density 1 **always** does. Without it the empty corners speckle and the solid core holes. |
| `TEMPORAL_HZ` | **12** | The lattice steps through 8 whole-cell offsets. Whole cells because a sub-cell offset resamples the lattice and shimmers; 12Hz because at 60 the stipple boils and at 0 it freezes into a visible weave. |

The temporal offsets are the hero's, verbatim:
`[0,0] [3,1] [6,4] [1,6] [5,2] [2,5] [7,7] [4,3]`.

**Ink is darkness.** `density = 1 - luminance`. Lit faces get few dots, shadowed
ones get many. That is the engraving convention and it is what makes a lit top
and a shadowed underside read as one solid form.

---

## 4. Colour: the duotone

Coverage is one bit — a pixel is inked or it is not — but **the ink takes one of
two tones by how dark the area is**:

```glsl
vec3 col = mix(u_ink2, u_ink, smoothstep(0.08, 0.88, density));
```

- `u_ink` — **Blue 600** (`--color-blue-600`), carries the shadows
- `u_ink2` — **Blue 500** (`--color-blue-500`), carries the mid-lit stipple

A shaded underside then separates from a lit face **by hue as well as by dot
count**, which is what stops the composition reading flat.

Blue 500 rather than a tint of Blue 600, deliberately: both tones are real steps
on the ramp, so the lighter one stays saturated. A washed tint is exactly the
flatness this is meant to fix.

The `0.08..0.88` band is wide on purpose. A narrow crossover makes the two inks
read as two flat plates; graded across nearly the whole range they read as a
ramp between them.

Both are read from the cascade at runtime, never hard-coded in the shader.

---

## 5. The contrast curve, and the silhouette

### The curve

```glsl
lum = clamp((lum - 0.16) / (0.88 - 0.16), 0.0, 1.0);   // expand the useful band
lum = lum * lum * (3.0 - 2.0 * lum);                    // then an S-curve
dens = mix(0.13, 1.0, 1.0 - lum);                       // floor, so lit ≠ empty
```

Expansion **alone** would clip the deeps flat. The S keeps the midtones that
carry the shading and only steepens the slope between them.

The floor of **0.13** matters as much as the curve: at 0.02 a lit face went
essentially empty and merged with the card.

### The silhouette is drawn solid

```glsl
float graze = 1.0 - abs(dot(n, -rd));
float edge  = smoothstep(0.62, 0.93, graze);
return max(dens, edge);
```

**This is the single highest-value line in the shading.** A lit face has low ink
density *by design*, so a lit face at the object's edge dissolves against a
white card and the form loses its boundary. Shading cannot fix that, because the
problem is exactly where shading says "bright".

So the grazing band is forced to full ink regardless of light. The object always
has a hard contour; inside it, the ramp does its normal work.

Reaching for heavier dither clustering to solve this is the wrong instinct and
was tried first. Contrast problems at the **boundary** are fixed at the
boundary.

---

## 6. Lighting

Diffuse with a key, hemispheric ambient, five-tap AO, and a grazing term. **No
cast shadow, and no ground plane.**

Dropping both removed an 18-step shadow march from every shaded pixel — most of
what these cost — and AO alone gives all the contact darkening the eye asks for
at this size. The floor is the bottom of the frame; falling pieces clamp to a
rest height and stop.

AO radii are **tight** (`0.006 … 0.061`). The near taps are what darken a *seam*
between two touching parts, which is the whole reason a brick ball reads as
bricks rather than as a lump.

---

## 7. Motion

### Reverse-method looping

```glsl
float pingPong(float t, float cycle){
  float ph = mod(t, cycle * 2.0);
  return ph < cycle ? ph : cycle * 2.0 - ph;
}
```

Every position and angle downstream is a **pure function of this clock**, so
running it backwards runs the whole animation backwards: pieces rise off the
ground, retrace the exact arcs they fell along, and reassemble.

This is the only way to get a reversal that *matches* the break. Hand-animating
a separate reassembly drifts from the path the pieces actually took.

It is also seamless for free: the turning points are where velocity is zero and
the frames either side are identical, so **there is nothing to fade**. Verified
pixel-exact — frames at `t` and `2·CYCLE − t` differ by zero pixels.

### Not every asset should reverse

Ping-pong is right when the event is a **collapse**: running it backwards is a
free, exactly-matching reassembly. It is wrong when the event is an **arrival**.

There are three looping patterns in use, and picking the wrong one is a
storytelling mistake rather than a technical one:

| Pattern | Used by | Why |
|---|---|---|
| ping-pong | `broken-ball`, `broken-gear`, `gavel` | the event is reversible in kind — a collapse rebuilds, a strike lifts |
| never loops | `empty-box` | the lid opens once and stays; the turn carries on underneath |
| **saturate, then loop a gesture** | `success-monument` | the build is a one-time arrival, so its clock saturates at `min(gT, BUILT)` and the dance runs forever on a second clock |

Un-stacking the monument would undo the very thing the mark exists to say. Two
clocks — one that saturates, one that loops — is how an asset arrives once and
then keeps expressing.

A repeating gesture also needs a **rest**. The monument rocks for two beats then
holds for two. Rocking without pause stops reading as celebration and starts
reading as a wobble it cannot control.

### Assembly is the same physics as collapse

`success-monument` builds rather than breaks, and it uses `fallWithBounce`
unchanged: each piece is dropped with `v0 = 0` onto the one below and thuds into
place. **A success and a failure obeying the same arithmetic is the point** —
what differs is the sequence, not the mechanics, and that is why the set reads
as one family.

It also demonstrates the reversal paying for itself twice over. There is no
disassembly animation anywhere in that file; running the clock backwards lifts
every piece along the exact arc it fell on.

Two details worth copying:

- the celebratory rock pivots at the **base**, not the centre. A monument tips
  on its footing; pivoting at the middle reads as a floating object being
  waggled.
- the rock's envelope is `sin(PI * fract(beat))`, so every beat starts and ends
  at exactly zero. The stack is upright at each boundary, which is what makes
  two hops read as one gesture rather than as a stutter.

### Ballistics

```glsl
float fallWithBounce(tau, h0, v0, g, rest, out landed)
```

Two arcs then still. **Restitution 0.34** — a dead plastic thud, not a rubber
ball. The first impact speed comes out of the ballistic itself, so the bounce is
proportional to the fall rather than a fixed hop.

Position is `p0 + v·t + ½g·t²` and orientation is `ω·t`. No easing curves: a
thing that has broken should obey the same arithmetic a dropped object does.

### Never animate an angle backwards

The most expensive bug in this work, hit twice:

- a spin written `w * ta * (1 - set)` **unwinds to zero** as a piece settles. It
  visibly rotates back the way it came.
- a tilt lerped to a fixed `-π/2` from wherever it happens to be takes the long
  way round and rolls the piece over.

**Freeze** the spin at its landing value, and ease the tilt to the *nearest*
flat pose:

```glsl
ax = mix(ax, rnd1((ax - 1.5708) / PI) * PI + 1.5708, set);
```

At most a quarter turn, always forward.

### Rotation order

`rotX(tilt) * rotZ(spin)`, **not** the reverse. Composed the other way, the tilt
lays a disc flat and then `rotZ` — about the *world* z — stands it straight back
up on its edge. The spin belongs in body space and the lay-flat in world space,
so the tilt comes first in the product.

---

## 8. Framing

### Use a look-at

Tilting the ray about the origin does **not** aim a camera; it swings the frame
off the subject. With `ro=(0,0.10,1.52)` and a `-0.20` tilt the visible band at
z=0 ran `-0.674..+0.208` — the subject sat near the top edge and anything on the
floor fell out of shot.

### The canvas is not square

`p` is normalised by `u_res.y`, so a **wider** canvas widens the visible x range
and leaves the subject's scale alone. Assets whose pieces travel sideways get
the room: 200×180 for the box, 270×180 for the two that scatter.

Each asset owns its natural width and scales it with `size`, so a caller only
ever sets a height.

### Entrances are not exempt

A piece falling in from above the frame is still clipping. `success-monument`
dropped its pieces from 0.30 above rest, which put the sphere's crown outside
the top edge for the whole first beat; it reads as a rendering bug, not as an
entrance. Measured down to 0.15, where the whole cycle is clean.

### Depth scatter is not free

A piece thrown *toward* the camera projects larger and leaves through the
**bottom** edge. That reads as a clipping bug, not as a throw. Keep the spread
mostly in the picture plane — depth scatter at roughly a third of the lateral.

### Measure the edges

Do not eyeball this. Render the asset across its whole cycle and count inked
pixels on each of the four borders; every count should be **0**.

---

## 9. Two things that must be measured, not assumed

### `PX` — one screen pixel

"One unit is the canvas height" holds **only** for an untilted camera with the
subject at the target depth. Neither is true here: the cameras are tilted and
the gear sits in front of its target. With `PX = 1/180` a 4px roll rendered as
**5.54px**.

Calibrate by rendering the motion and measuring its centroid travel, then
dividing. Currently `0.00428`, giving 4.14px against a 4px target.

**Re-measure if the camera moves.** It is a property of the projection, not of
the canvas.

### Parts must not overlap

A union of two intersecting solids grows edges where they cross, and those
edges read as *extra pieces*. The gear's two halves looked like four.

The trap is that footprint **changes with pose**: in the air a gear half is a
half-disc ~0.165 across; once it settles flat its footprint is the full diameter
~0.33. A separation that clears the first will not clear the second.

Check it with a connected-component count on the landed frame, after dilating to
close the dither's gaps. The answer should equal the number of pieces.

---

## 10. The host

`SpotIllustration.tsx`. One fullscreen triangle, one fragment shader, one draw
call. It takes a shader **source**, not a name from a registry, so an asset file
is self-contained and importable on its own.

What it handles, none of it optional:

- **reduced motion** — freezes the clock at a chosen still frame, and freezes
  the dither with it, or a "reduced motion" asset strobes on the spot
- **off-screen pause** — an IntersectionObserver stops the loop when the canvas
  scrolls away
- **tab visibility** — rAF throttles in a background tab anyway, but the clock
  would keep accumulating and the animation would jump on return
- **context loss** — browsers drop GL contexts under memory pressure
- **teardown** — program, shaders and buffer released on unmount

**Never call `WEBGL_lose_context` in cleanup.** A canvas only ever has one
context: `getContext` returns the same object every time and losing it is
permanent for that element. React StrictMode mounts, tears down and remounts on
the *same* canvas, so force-losing on cleanup hands the second mount a dead
context and every compile fails with a null info log. Nothing leaks by omitting
it — the objects are released and the context goes with the element.

**No WebGL means no canvas**, and the heading and body still carry the message.
The art is never the only carrier of meaning.

---

## 11. Working notes

**Backticks.** These shaders are TypeScript template literals. A backtick inside
one — including in a comment — terminates it early and produces a baffling TS
parse error a long way from the cause. Use `'quotes'` in GLSL comments. This has
bitten three times.

**Verify by measurement.** Nearly every real bug here was found by rendering
offscreen and counting pixels, not by looking: the overlap, the edge clipping,
the `PX` scale, the reversal, the drop-and-return. Screenshots confirm; numbers
prove.

**A useful offscreen harness** creates its own canvas with
`preserveDrawingBuffer: true`, compiles the shader, sets `u_time` explicitly and
reads pixels back. `readPixels` returns zeros on a normally-composited canvas,
which is why the flag matters. If you build several programs on one context,
**`useProgram` before every draw** — uniforms otherwise land on whichever was
last bound.

---

## 12. Open

- The lift tone is roughly one in eight inked pixels. Physically right —
  highlights are sparse — but if the duotone should read more evenly split, the
  lever is the `smoothstep` band in §4.
- Performance is measured at **16.6ms/frame with three assets** on a GTX 1650.
  Untested on integrated graphics; if it bites, cut march steps before DPR.
- No standalone `.html` per asset. It was considered and rejected: a static page
  cannot import the `.ts` source without a build, so it would mean a second copy
  of every shader, and two copies drift. `/rebrand/states` is the preview.
