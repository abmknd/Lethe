precision highp float;

// The terrain is a HILL: the ground arcs UP to a summit and passes BEHIND the
// boulder, which rests against the slope. This is the whole premise — you
// cannot push a rock up a basin. Contours follow the crest, crowding as the
// ground turns away toward the horizon.
//
// Elevation is a real height field, so the surface normal comes from its
// gradient and the shading is genuine. Three layered temporal motions, from
// the origma globe:
//   1. the elevation field itself drifts   (uTime * uElevDrift)
//   2. the whole contour stack scrolls     (uTime * uBandScroll)
//   3. one band travels through it faster  (uTime * uPulseSpeed)
//
// Between the lines the terrain stays DARK. Ink belongs to the contours.

uniform float uAspect;
uniform float uTime;
uniform vec2 uCam;
uniform float uZoom;
uniform float uSeed;

uniform float uH0;        // horizon height at x = 0
uniform float uArcK;      // how hard the crest arcs over
uniform float uCrestGain; // elevation lost falling away from the summit
uniform float uSlope;     // elevation lost coming toward the viewer
uniform float uBands;
uniform float uRelief;
uniform float uElevDrift;
uniform float uBandScroll;
uniform float uPulseSpeed;
uniform float uBase;
uniform float uRim;
uniform float uWFine;
uniform float uWMajor;
uniform float uWPulse;
uniform float uFootCompress;

uniform vec3 uFeetX;
uniform vec3 uFeetW;

varying vec2 vUv;

#include <lib>

/** Elevation of the terrain at a world point below the horizon. */
float elevation(vec2 w, float t, out float relief) {
  relief = fbm3lo(vec3(w * 0.42, uTime * uElevDrift) + vec3(uSeed, 0.35, 0.0));
  relief += 0.42 * fbm3lo(vec3(w * 1.15, uSeed * 0.21));
  // Highest at the summit, falling away to each side and toward the viewer.
  return -uArcK * w.x * w.x * uCrestGain - t * uSlope + relief * uRelief;
}

void main() {
  vec2 q = (vUv - 0.5) * vec2(uAspect, 1.0);
  vec2 world = q / uZoom + uCam;

  // Horizon arcs DOWN from the summit: a convex hill, not a basin.
  float horizon = uH0 - uArcK * world.x * world.x;
  if (world.y > horizon) discard;

  float t = horizon - world.y; // depth toward the viewer

  float relief;
  float e = elevation(world, t, relief);

  // Isolines pack together under every planted foot — the ground registering
  // the load it is carrying.
  float compress = 0.0;
  for (int i = 0; i < 3; i++) {
    float dx = world.x - uFeetX[i];
    compress += uFeetW[i] * exp(-dx * dx * 1.6);
  }

  float cv = e * uBands * (1.0 + compress * uFootCompress) + uTime * uBandScroll;

  // Surface normal from the height field's own gradient — real shading, not a
  // painted-on gradient.
  float ex = dFdx(e) / max(abs(dFdx(world.x)), 1e-5);
  float ey = dFdy(e) / max(abs(dFdy(world.y)), 1e-5);
  vec3 n = normalize(vec3(-ex * 0.12, -ey * 0.12, 1.0));

  // Constant screen-width bands.
  float w = max(fwidth(cv), 1e-5);
  float fine  = 1.0 - smoothstep(w * 0.45, w * 1.5, abs(fract(cv) - 0.5));
  float major = 1.0 - smoothstep(w * 0.12, w * 0.42, abs(fract(cv * 0.25) - 0.5));
  float pulse = 1.0 - smoothstep(w * 0.35, w * 1.7, abs(fract(cv + uTime * uPulseSpeed) - 0.5));

  // Where the bands crowd past the sampling rate, fade them out rather than
  // letting them smear into a solid mass.
  float fade = 1.0 - smoothstep(0.2, 0.75, w);
  fine *= fade;
  major *= fade;
  pulse *= fade;

  // Terrain tone stays LOW so the field reads through; the lines carry the ink.
  float ndotv = clamp(n.z, 0.0, 1.0);
  float base = uBase * pow(ndotv, 0.6);

  // A crisp bright edge exactly at the horizon line.
  float wh = max(fwidth(t), 1e-5);
  float rim = (1.0 - smoothstep(0.0, wh * 2.0, t)) * uRim;

  float density = base + fine * uWFine + major * uWMajor + pulse * uWPulse + rim;
  gl_FragColor = vec4(clamp(density, 0.0, 1.0), 0.0, 0.0, 1.0);
}
