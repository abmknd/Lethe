// Offscreen render targets at floor(css / BUFFER_SCALE), DPR-independent,
// Nearest up/down, no mips — constant dot pitch on every device. (SPEC §4)

import * as THREE from 'three';
import { BUFFER_SCALE } from '../config/timeline.js';

function makeTarget(w, h) {
  return new THREE.WebGLRenderTarget(w, h, {
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    generateMipmaps: false,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export function createBuffers() {
  let scale = BUFFER_SCALE;
  let w = 2;
  let h = 2;

  // density (scene renders here) and present (dithered 1-bit image).
  let density = makeTarget(w, h);
  let present = makeTarget(w, h);

  return {
    get density() {
      return density;
    },
    get present() {
      return present;
    },
    get size() {
      return { w, h };
    },

    get scale() {
      return scale;
    },

    /** Adaptive quality lowers this; the dot simply gets bigger. */
    setScale(next) {
      scale = next;
    },

    /** cssW/cssH are CSS pixels — never multiplied by devicePixelRatio. */
    resize(cssW, cssH) {
      const nw = Math.max(2, Math.floor(cssW / scale));
      const nh = Math.max(2, Math.floor(cssH / scale));
      if (nw === w && nh === h) return false;
      w = nw;
      h = nh;
      density.setSize(w, h);
      present.setSize(w, h);
      return true;
    },

    destroy() {
      density.dispose();
      present.dispose();
    },
  };
}
