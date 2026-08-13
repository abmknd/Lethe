// Sky: technical wireframe underlay — projected geodesic domes and survey
// arcs, kept dim so page chrome reads cleanly over it.

import * as THREE from 'three';
import vert from '../shaders/fullscreen.vert.glsl?raw';
import frag from '../shaders/sky.frag.glsl?raw';
import { resolve } from '../shaders/include.js';
import { SKY_INK, SKY_STIPPLE } from '../config/timeline.js';

export function createSkyPass() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: resolve(frag),
    uniforms: {
      uBufferSize: { value: new THREE.Vector2(2, 2) },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uCam: { value: new THREE.Vector2() },
      uZoom: { value: 1 },
      uInk: { value: SKY_INK },
      uStipple: { value: SKY_STIPPLE },
      uAlign: { value: 0 },
      uBoulderY: { value: 0 },
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
      u.uBufferSize.value.set(target.width, target.height);
      u.uAspect.value = s.aspect;
      u.uTime.value = s.elapsedS;
      u.uCam.value.set(s.cam[0], s.cam[1]);
      u.uZoom.value = s.zoom;
      u.uAlign.value = s.align;
      u.uBoulderY.value = s.boulderY;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
    },
    destroy() {
      quad.geometry.dispose();
      material.dispose();
    },
  };
}
