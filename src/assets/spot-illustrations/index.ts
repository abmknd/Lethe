/**
 * SPOT ILLUSTRATIONS — animated 3D marks, one per file.
 *
 * These sit in `src/assets` with the images because that is what they are: a
 * finished piece of art you import and place. The difference is that they are
 * GENERATED rather than stored — a raymarched signed-distance field, lit, then
 * reduced to one bit through the brand's Bayer dither — so a 3KB module
 * replaces a sprite sheet and stays sharp at any size and any DPR.
 *
 * TO USE ONE:
 *
 *     import { EmptyBox } from '../../assets/spot-illustrations';
 *     <EmptyBox size={180} />
 *
 * Each asset carries its own natural width and its own reduced-motion still
 * frame, so a caller only ever sets a height.
 *
 * TO ADD ONE: copy the smallest existing asset file, keep the `PRELUDE +
 * map() + main()` shape, and export a component through `SpotIllustration`.
 * The prelude already has the dither, the primitives, the marcher, the
 * lighting, the ping-pong clock and the ballistics; a new asset should be a
 * shape and a timeline and nothing else.
 *
 * `illustration.md` at the repo root documents the whole technique — every
 * constant, why it holds the value it does, and which were arrived at by
 * measurement rather than by eye.
 */

export { SpotIllustration, type SpotProps } from './SpotIllustration';
export { PRELUDE } from './prelude';

export { EmptyBox, BOX_SOURCE } from './empty-box';
export { BrokenBall, BALL_SOURCE } from './broken-ball';
export { BrokenGear, GEAR_SOURCE } from './broken-gear';
export { SuccessMonument, MONUMENT_SOURCE } from './success-monument';
