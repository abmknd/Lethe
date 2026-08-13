precision highp float;

// Procedural geodesic boulder — analytic, so it stays razor-sharp at any
// camera zoom, and it ROTATES as it is pushed.
//
// Each fragment inside the silhouette is lifted onto the sphere, rotated into
// object space, then assigned to the nearest of NF Fibonacci-distributed face
// directions. That Voronoi partition on the sphere IS the geodesic net: real
// pentagons and hexagons, each carrying its own nested concentric fill.

uniform float uAspect;
uniform float uTime;
uniform vec2 uCam;
uniform float uZoom;

uniform vec2 uCenter;   // world
uniform float uRadius;  // world
uniform float uSpin;    // radians
uniform float uTone;
uniform float uNest;
uniform float uSeam;
uniform float uHatch;

varying vec2 vUv;

#include <lib>

const int NF = 58;
const float LIGHT_X = -0.42;
const float LIGHT_Y = 0.66;
const float LIGHT_Z = 0.62;

/** Fibonacci sphere direction — computed, never a uniform array. */
vec3 fibDir(float fi, float n) {
  float y = 1.0 - (fi + 0.5) / n * 2.0;
  float r = sqrt(max(0.0, 1.0 - y * y));
  float phi = fi * 2.399963229728653;
  return vec3(cos(phi) * r, y, sin(phi) * r);
}

float hash1(float x) {
  return fract(sin(x * 127.1) * 43758.5453);
}

mat3 rotY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}
mat3 rotX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

void main() {
  vec2 q = (vUv - 0.5) * vec2(uAspect, 1.0);
  vec2 world = q / uZoom + uCam;

  vec2 rel = world - uCenter;

  // Silhouette, slightly irregular so it reads as hewn rock, not a ball.
  float a = atan(rel.y, rel.x);
  float R = uRadius * (1.0 + 0.014 * cos(a * 3.0 + 0.7) + 0.009 * cos(a * 5.0 - 1.2));
  float r = length(rel);
  float sd = r - R;
  if (sd > 0.0) discard;

  // Lift onto the sphere and rotate into object space: the facets turn with
  // the rock instead of being painted on the screen.
  float zz = sqrt(max(0.0, R * R - r * r));
  vec3 view = normalize(vec3(rel.x, rel.y, zz));
  vec3 n = rotX(uSpin * 0.35) * rotY(uSpin) * view;

  // Nearest face direction, and the runner-up — their gap is the distance to
  // the facet's own boundary.
  float best = -2.0;
  float second = -2.0;
  float bi = 0.0;
  for (int i = 0; i < NF; i++) {
    float fi = float(i);
    float dp = dot(n, fibDir(fi, float(NF)));
    if (dp > best) {
      second = best;
      best = dp;
      bi = fi;
    } else if (dp > second) {
      second = dp;
    }
  }
  vec3 fn = fibDir(bi, float(NF));
  float edge = best - second;

  // Flat shading off the facet's own normal — planes read as planes.
  float lam = clamp(dot(fn, vec3(LIGHT_X, LIGHT_Y, LIGHT_Z)), 0.0, 1.0);
  float jitter = hash1(bi * 7.1);
  float tone = clamp((0.4 + 0.4 * lam) * (0.9 + 0.2 * jitter), 0.0, 1.0) * uTone;

  // Nested concentric polygons following the facet's boundary. Pitch and
  // phase vary per face, so no two read alike.
  float pitch = 36.0 + floor(jitter * 6.0) * 9.0;
  float nv = edge * pitch + jitter * 6.28;
  float wN = max(fwidth(nv), 1e-5);
  float nested = 1.0 - smoothstep(wN * 0.4, wN * 1.25, abs(fract(nv) - 0.5));
  tone *= 1.0 - nested * uNest;

  // Hard seams between faces.
  float wE = max(fwidth(edge), 1e-5);
  float seam = 1.0 - smoothstep(wE * 0.8, wE * 2.6, edge);
  tone *= 1.0 - seam * uSeam;

  // Hatch opens up on faces turned away from the light.
  float ang = jitter * 3.14;
  vec3 t1 = normalize(cross(fn, vec3(0.0, 1.0, 0.02)));
  float hu = dot(n, t1) * (34.0 + jitter * 12.0) + cos(ang) * 2.0;
  float wH = max(fwidth(hu), 1e-5);
  float hatch = (1.0 - smoothstep(wH * 0.5, wH * (1.2 + 2.4 * (1.0 - lam)), abs(fract(hu) - 0.5)))
              * smoothstep(0.35, 0.85, 1.0 - lam);
  tone *= 1.0 - hatch * uHatch;

  // Crest highlight and a crisp rim to hold the silhouette.
  float crest = smoothstep(0.72, 0.97, lam) * (1.0 - seam);
  float wS = max(fwidth(sd), 1e-5);
  float rim = 1.0 - smoothstep(wS * 0.6, wS * 2.2, abs(sd) - wS * 0.8);
  tone = max(tone, max(crest * 0.55, rim * 0.85));

  // Coverage feathers the outermost texel so the silhouette is not jagged.
  float coverage = 1.0 - smoothstep(-wS * 1.2, 0.0, sd);

  gl_FragColor = vec4(clamp(tone, 0.0, 1.0), 0.0, 0.0, coverage);
}
