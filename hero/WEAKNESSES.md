# Known weaknesses

Honest register of what is not yet good enough. Ordered by how much each one
costs the piece. Kept current — if something here gets fixed, delete the entry;
if a new one appears, add it.

## Art

**The flankers are not really three-quarter views.** `turn = 1` narrows the body
by 16%, shifts the axis, and thins the far-side limbs, but the underlying mass
construction is still the back view. They read as near-mirror copies of the
centre figure rather than as bodies rotated in space. A true three-quarter
needs the shoulder girdle foreshortened, the far lat mostly hidden, the spine
off-centre along its length, and the far leg occluded by the near one. That is
a real authoring pass in `make-atlas.mjs`, not a parameter.

**The hill is sparse at full zoom-out.** At `CAM_ZOOM_FAR` the contour stack
has far fewer lines carrying the lower third of the frame than the reference
does. The band count is tied to world-space elevation, so zooming out thins it
out. It probably wants a zoom-compensated band density, so the ON-SCREEN line
pitch stays roughly constant as the camera pulls back.

**Only two planted poses per figure.** SETTLE and MAX, crossfaded. Under load a
body does not interpolate linearly between two states — the weight shifts, the
stance widens, the head drops. A PRESS keyframe exists in the atlas but is
currently unused by the choreography.

**The walk is four frames.** Enough to read as locomotion at this scale, but the
contact frames do the heavy lifting and the passing frames are weak. Eight
would let the knee lift and the hip drop actually register.

## Rendering

**No temporal stability on the figures.** The hill and boulder derive their line
widths from `fwidth`, so they hold together under camera motion. The figures are
sampled from the atlas, so at small on-screen sizes their engraved hatching
aliases against the dot grid while the camera moves. Mips help; they are not a
fix.

**The atlas is a 32MB GPU upload** (2048x4096 RGBA, ~43MB with mips). Fine on
desktop, heavy on mobile. This is the strongest argument for the KTX2/ETC1S
conversion in SPEC §8 — not the 945KB download, which already fits the budget.

## Choreography

**`BOULDER_PRESS` beat is missing.** SPEC §6 calls for the rock to visibly fail
at p=0.30 before help arrives. It descends, but only by `BOULDER_DESCENT` = 0.09
world units, which is a few pixels on screen. It should be unmistakable.

**Idle regression is subtle to the point of being invisible** at the current
`IDLE_SINK`. Correct in structure, undertuned in value.
