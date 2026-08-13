// Procedural geodesic boulder — analytic GLSL, resolution-independent, and it
// rotates as it is pushed. Composites source-over so it occludes the sky.

import * as THREE from 'three';
import vert from '../shaders/fullscreen.vert.glsl?raw';
import frag from '../shaders/boulder.frag.glsl?raw';
import { resolve } from '../shaders/include.js';
import { BOULDER_R, BOULDER_TONE, BOULDER_NEST, BOULDER_SEAM, BOULDER_HATCH } from '../config/timeline.js';

export function createBoulderPass() {
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
      uCenter: { value: new THREE.Vector2() },
      uRadius: { value: BOULDER_R },
      uSpin: { value: 0 },
      uTone: { value: BOULDER_TONE },
      uNest: { value: BOULDER_NEST },
      uSeam: { value: BOULDER_SEAM },
      uHatch: { value: BOULDER_HATCH },
    },
    depthTest: false,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquationAlpha: THREE.AddEquation,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
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
      u.uCenter.value.set(0, s.boulderY);
      u.uSpin.value = s.spin;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
    },
    destroy() {
      quad.geometry.dispose();
      material.dispose();
    },
  };
}
