precision highp float;

// Instanced quads placed in WORLD space, projected through the camera.
// One draw call for the boulder and all three figures. (SPEC §3)

uniform float uAspect;
uniform float uTime;
uniform vec2 uCam;
uniform float uZoom;
uniform float uTremorFreq;
uniform float uTremorAmp;
uniform float uTremorBoost; // idle regression: the shake worsens when stalled
uniform float uSync;      // 0 = independent phases, 1 = lockstep

attribute vec4 aRectA;    // atlas UV rect (u0, v0, du, dv) — pose A
attribute vec4 aRectB;    // atlas UV rect — pose B
attribute float aPoseMix; // 0 = A, 1 = B
attribute vec2 aOffset;   // world position
attribute vec2 aScale;    // world half-extent
attribute float aMirror;
attribute float aPhase;
attribute float aReveal;
attribute float aStrain;

varying vec2 vUvA;
varying vec2 vUvB;
varying float vPoseMix;
varying float vLocalY;
varying vec2 vLocal;   // 0..1 across the figure itself, for object-space marks
varying float vReveal;
varying float vStrain;

void main() {
  vec2 cellUv = uv;
  cellUv.x = mix(cellUv.x, 1.0 - cellUv.x, step(0.5, aMirror));

  vUvA = aRectA.xy + cellUv * aRectA.zw;
  vUvB = aRectB.xy + cellUv * aRectB.zw;
  vPoseMix = aPoseMix;
  vLocalY = uv.y;
  vLocal = uv;
  vReveal = aReveal;
  vStrain = aStrain;

  // Tremor: wall-clock idle motion, scaled by effort. uSync collapses the
  // per-figure phase offsets into lockstep.
  float phase = uTime * uTremorFreq + aPhase * (1.0 - uSync);
  vec2 tremor = vec2(sin(phase * 1.7) * 0.6, -abs(sin(phase))) * uTremorAmp * uTremorBoost * aStrain;

  vec2 world = aOffset + tremor + position.xy * 2.0 * aScale;
  vec2 q = (world - uCam) * uZoom;
  gl_Position = vec4(2.0 * q.x / uAspect, 2.0 * q.y, 0.0, 1.0);
}
