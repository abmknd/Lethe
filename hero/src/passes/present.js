// Present pass: blits the half-res dithered buffer to the canvas.
// Nearest sampling on the buffer texture keeps the dot pitch pixel-locked.

import * as THREE from 'three';

const VERT = /* glsl */ `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uSrc;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(uSrc, vUv);
}
`;

export function createPresentPass() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { uSrc: { value: null } },
    depthTest: false,
    depthWrite: false,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  return {
    render(renderer, srcTexture) {
      material.uniforms.uSrc.value = srcTexture;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    },
    destroy() {
      quad.geometry.dispose();
      material.dispose();
    },
  };
}
