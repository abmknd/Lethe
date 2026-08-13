precision highp float;

// Density out, 1-bit later. Every animation here is arithmetic on `d`:
//   strain rising    -> + tex.b * strain
//   pose change      -> mix() two atlas regions BEFORE the threshold
//   materialization  -> * reveal, biased ground-up
// (SPEC §3)
//
// The ENGRAVING IS GENERATED HERE, not baked into the atlas. A figure renders
// roughly 4.6x minified, so any stroke authored at texture resolution is
// averaged into flat grey by the mip chain. The atlas therefore carries only
// smooth fields — tone, muscle depth, strain, silhouette — and every mark is
// built from them with fwidth, so strokes hold a constant screen width at any
// camera zoom. This is the same reason the boulder reads sharp.

uniform sampler2D uAtlas;
uniform float uTone;
uniform float uToneGamma;
uniform float uStrainGain;
uniform float uRevealBand;
uniform float uContourPitch;
uniform float uContourCut;
uniform float uHatchPitch;
uniform float uHatchCut;
uniform float uCrossCut;

varying vec2 vUvA;
varying vec2 vUvB;
varying vec2 vLocal;
varying float vPoseMix;
varying float vLocalY;
varying float vReveal;
varying float vStrain;

void main() {
  vec4 a = texture2D(uAtlas, vUvA);
  vec4 b = texture2D(uAtlas, vUvB);
  vec4 tex = mix(a, b, vPoseMix); // crossfade in DENSITY space

  // Lift the midtones hard. Raw lambert leaves the bellies near 50% density,
  // which at a 1px pitch reads as sparse texture rather than as a lit form —
  // an engraved figure is mostly SOLID ink, with the shadows carrying the
  // dither. Gamma here rather than in the atlas so it stays tunable without a
  // two-minute regeneration.
  float tone = clamp(pow(tex.r, uToneGamma) * uTone, 0.0, 1.0);
  float depth = tex.g;              // normalised depth into the nearest muscle
  // Bias the shadow response so only genuinely turned-away surfaces engrave.
  float dark = clamp((1.0 - tone) * 1.15 - 0.08, 0.0, 1.0);

  // Contours of constant depth wrap each belly, so the linework follows the
  // anatomy rather than being laid across it.
  float cv = depth * uContourPitch;
  float wC = max(fwidth(cv), 1e-5);
  float contour = 1.0 - smoothstep(wC * 0.5, wC * 1.7, abs(fract(cv) - 0.5));

  // Burin strokes in the figure's own space, thickening as the form turns away.
  float h1 = (vLocal.x * 0.72 + vLocal.y) * uHatchPitch;
  float wH = max(fwidth(h1), 1e-5);
  float hatch = (1.0 - smoothstep(wH * 0.5, wH * (1.1 + 3.2 * dark), abs(fract(h1) - 0.5)))
              * smoothstep(0.34, 0.86, dark);

  // A second pass crossing them, deep shadow only.
  float h2 = (vLocal.x * -0.86 + vLocal.y * 0.52) * uHatchPitch * 0.92;
  float wX = max(fwidth(h2), 1e-5);
  float cross = (1.0 - smoothstep(wX * 0.5, wX * 1.8, abs(fract(h2) - 0.5)))
              * smoothstep(0.66, 0.97, dark);

  // White ink on blue: the dark lines of an engraving are ABSENCES of ink, so
  // every mark cuts into the tone rather than adding to it.
  float d = tone;
  d *= 1.0 - contour * uContourCut * (0.3 + 0.7 * dark);
  d *= 1.0 - hatch * uHatchCut;
  d *= 1.0 - cross * uCrossCut;

  // Effort brightens the working muscle.
  d += tex.b * vStrain * uStrainGain;

  // Materialize ground-up. Reveal drives COVERAGE, not density, so a partial
  // reveal reads as the form resolving out of the field.
  float sweep = mix(-uRevealBand, 1.0, vReveal);
  float wipe = 1.0 - smoothstep(sweep, sweep + uRevealBand, vLocalY);

  float coverage = tex.a * wipe;
  if (coverage <= 0.003) discard;

  gl_FragColor = vec4(clamp(d, 0.0, 1.0), 0.0, 0.0, coverage);
}
