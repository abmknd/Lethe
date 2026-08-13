// Fullscreen Bayer-dither pass: density texture in, two-color 1-bit out.
// Runs in the half-res buffer's pixel space (gl_FragCoord = buffer px).

import * as THREE from 'three';
import { DITHER_NOISE } from '../config/timeline.js';
import vert from '../shaders/fullscreen.vert.glsl?raw';
import frag from '../shaders/dither.frag.glsl?raw';

export function createDitherPass({ field, ink }) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uDensity: { value: null },
      uTemporalOffset: { value: new THREE.Vector2(0, 0) },
      uField: { value: new THREE.Color(field) },
      uInk: { value: new THREE.Color(ink) },
      uNoise: { value: DITHER_NOISE },
    },
    depthTest: false,
    depthWrite: false,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  return {
    /** Dither densityTexture into `target` (a half-res buffer). */
    render(renderer, densityTexture, target, temporalOffset) {
      material.uniforms.uDensity.value = densityTexture;
      material.uniforms.uTemporalOffset.value.set(temporalOffset[0], temporalOffset[1]);
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
    },
    destroy() {
      quad.geometry.dispose();
      material.dispose();
    },
  };
}
