// Planetary hill: 3D topographic contours with three layered temporal
// motions, plus compression under every planted foot.

import * as THREE from 'three';
import vert from '../shaders/fullscreen.vert.glsl?raw';
import frag from '../shaders/hill.frag.glsl?raw';
import { resolve } from '../shaders/include.js';
import {
  HILL_H0,
  HILL_ARC_K,
  HILL_CREST_GAIN,
  HILL_SLOPE,
  HILL_SEED,
  HILL_BANDS,
  HILL_RELIEF,
  HILL_ELEV_DRIFT,
  HILL_BAND_SCROLL,
  HILL_PULSE_SPEED,
  HILL_BASE,
  HILL_RIM,
  HILL_W_FINE,
  HILL_W_MAJOR,
  HILL_W_PULSE,
  FOOT_COMPRESS,
} from '../config/timeline.js';

export function createHillPass() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: resolve(frag),
    uniforms: {
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uCam: { value: new THREE.Vector2() },
      uZoom: { value: 1 },
      uSeed: { value: HILL_SEED },
      uH0: { value: HILL_H0 },
      uArcK: { value: HILL_ARC_K },
      uCrestGain: { value: HILL_CREST_GAIN },
      uSlope: { value: HILL_SLOPE },
      uBands: { value: HILL_BANDS },
      uRelief: { value: HILL_RELIEF },
      uElevDrift: { value: HILL_ELEV_DRIFT },
      uBandScroll: { value: HILL_BAND_SCROLL },
      uPulseSpeed: { value: HILL_PULSE_SPEED },
      uBase: { value: HILL_BASE },
      uRim: { value: HILL_RIM },
      uWFine: { value: HILL_W_FINE },
      uWMajor: { value: HILL_W_MAJOR },
      uWPulse: { value: HILL_W_PULSE },
      uFootCompress: { value: FOOT_COMPRESS },
      uFeetX: { value: new THREE.Vector3() },
      uFeetW: { value: new THREE.Vector3() },
    },
    depthTest: false,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  return {
    render(renderer, target, s) {
      const u = material.uniforms;
      u.uAspect.value = s.aspect;
      u.uTime.value = s.elapsedS;
      u.uCam.value.set(s.cam[0], s.cam[1]);
      u.uZoom.value = s.zoom;
      u.uFeetX.value.set(s.feetX[0], s.feetX[1], s.feetX[2]);
      u.uFeetW.value.set(s.feetW[0], s.feetW[1], s.feetW[2]);
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
    },
    destroy() {
      quad.geometry.dispose();
      material.dispose();
    },
  };
}
