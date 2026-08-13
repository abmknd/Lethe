precision highp float;

// 8x8 ordered Bayer dither, buffer-pixel space. Density in, 1-bit out. SPEC §3/§4.

uniform sampler2D uDensity;
uniform vec2 uTemporalOffset; // whole Bayer cells, stepped at <= 12Hz
uniform vec3 uField;
uniform vec3 uInk;
uniform float uNoise;

varying vec2 vUv;

// Compact recursive ordered-Bayer construction (values in [0,1)).
float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float Bayer4(vec2 a) { return Bayer2(0.5 * a) * 0.25 + Bayer2(a); }
float Bayer8(vec2 a) { return Bayer4(0.5 * a) * 0.25 + Bayer4(a); }

float cellHash(vec2 p) {
  p = floor(p);
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec4 tex = texture2D(uDensity, vUv);

  // Ordered threshold, softened toward per-cell noise. Pure Bayer weaves a
  // visible grid at a 1px pitch; the blend gives engraved stipple instead.
  float t = mix(Bayer8(gl_FragCoord.xy + uTemporalOffset),
                cellHash(gl_FragCoord.xy + uTemporalOffset * 3.0),
                uNoise);
  // Remap thresholds into (0,1) exclusive so density 0 never inks and
  // density 1 always inks.
  t = t * (63.0 / 64.0) + (0.5 / 64.0);

  float ink = step(t, tex.r);
  gl_FragColor = vec4(mix(uField, uInk, ink * tex.a), 1.0);
}
