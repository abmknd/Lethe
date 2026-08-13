precision highp float;

// Technical drawing underlay: geodesic dome wireframes with true meridians and
// parallels, plus survey arcs. These are DRAFTING MARKS, not dithered rings —
// hairline width, and dim enough that a navbar and a headline sit over them
// without a fight.

uniform float uAspect;
uniform float uTime;
uniform vec2 uCam;
uniform float uZoom;
uniform float uAlign;   // 0..1, domes rotate into alignment
uniform float uInk;     // ceiling on everything here
uniform float uStipple;
uniform float uBoulderY;

varying vec2 vUv;

#include <lib>

/** Hairline at every integer of v, one buffer pixel wide. */
float wire(float v, float gain) {
  float w = max(fwidth(v), 1e-5);
  return 1.0 - smoothstep(w * 0.4, w * (0.9 + gain), abs(fract(v) - 0.5));
}

/**
 * A hemisphere drawn as a wireframe: lift to the sphere, spin, then rule
 * lines along latitude and longitude. This is what gives the reference its
 * engineered look — real projected geometry, not concentric circles.
 */
float dome(vec2 q, vec2 c, float R, float rot, float par, float mer) {
  vec2 rel = (q - c) / R;
  float r2 = dot(rel, rel);
  if (r2 > 1.0) return 0.0;

  float z = sqrt(max(0.0, 1.0 - r2));
  vec3 n = vec3(rel.x, rel.y, z);
  float ca = cos(rot), sa = sin(rot);
  n = vec3(ca * n.x + sa * n.z, n.y, -sa * n.x + ca * n.z);

  float lat = asin(clamp(n.y, -1.0, 1.0));
  float lon = atan(n.x, n.z);

  float a = wire(lat * par, 0.5);
  float b = wire(lon * mer / 3.14159265, 0.5);

  // Meridians converge at the poles and parallels pile up at the limb; fade
  // both rather than letting them clot.
  float polar = 1.0 - smoothstep(0.55, 0.95, abs(n.y));
  float limb = 1.0 - smoothstep(0.82, 1.0, sqrt(r2));
  return max(a * limb, b * polar * limb);
}

void main() {
  vec2 q = (vUv - 0.5) * vec2(uAspect, 1.0);
  vec2 world = q / uZoom + uCam;

  // Anything below the horizon belongs to the terrain pass.
  if (world.y < 0.0 && length(q) < 90.0) {
    // cheap guard only; the hill discards its own complement
  }

  float ink = 0.0;

  // Three domes: one behind the boulder, two flanking. They converge into
  // alignment as the figures synchronise.
  float spin = uTime * 0.02;
  vec2 c0 = vec2(0.0, uBoulderY);
  ink = max(ink, dome(world, c0, 3.4, spin * 0.6 + (1.0 - uAlign) * 0.5, 7.0, 18.0));
  ink = max(ink, dome(world, c0 + vec2(-4.3, -0.5), 2.5, -spin + (1.0 - uAlign) * 0.9, 6.0, 14.0) * 0.85);
  ink = max(ink, dome(world, c0 + vec2(4.3, -0.5), 2.5, spin + (1.0 - uAlign) * -0.9, 6.0, 14.0) * 0.85);

  // Survey arcs: concentric rings centred on the boulder, ruled not dithered.
  float rr = length(world - c0);
  ink = max(ink, wire(rr * 1.15, 0.2) * 0.5 * (1.0 - smoothstep(3.0, 11.0, rr)));

  // A whisper of grain so the empty field is not dead flat.
  float g = fbm3lo(vec3(world * 0.8, 0.0));
  ink = max(ink, smoothstep(0.62, 0.98, g) * uStipple);

  gl_FragColor = vec4(clamp(ink, 0.0, 1.0) * uInk, 0.0, 0.0, 1.0);
}
