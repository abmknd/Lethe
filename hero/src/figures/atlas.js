// Loads the authored 4-channel density atlas.
//
//   R = tonal density   G = linework   B = strain mask   A = silhouette
//
// Authored by scripts/make-atlas.mjs. The rects below are the contract the art
// satisfies; nothing downstream knows how the art was made.

import * as THREE from 'three';
import { ATLAS_W, ATLAS_H } from '../config/timeline.js';

const FW = 512;
const FH = 1024;

// [x, y, w, h] in atlas pixels, origin bottom-left.
export const CELLS = {
  BACK_SETTLE: [0, 0, FW, FH],
  BACK_PRESS: [FW, 0, FW, FH],
  BACK_MAX: [FW * 2, 0, FW, FH],
  TQ_SETTLE: [0, FH, FW, FH],
  TQ_PRESS: [FW, FH, FW, FH],
  TQ_MAX: [FW * 2, FH, FW, FH],
  WALK_0: [0, FH * 2, FW, FH],
  WALK_1: [FW, FH * 2, FW, FH],
  WALK_2: [FW * 2, FH * 2, FW, FH],
  WALK_3: [FW * 3, FH * 2, FW, FH],
  BOULDER: [0, FH * 3, FW * 2, FW * 2],
};

/** Cell rect -> UV rect (u0, v0, du, dv). */
export function uvRect(name) {
  const [x, y, w, h] = CELLS[name];
  return [x / ATLAS_W, y / ATLAS_H, w / ATLAS_W, h / ATLAS_H];
}

export const WALK_CYCLE = ['WALK_0', 'WALK_1', 'WALK_2', 'WALK_3'].map(uvRect);

/** Load the atlas. `onReady` fires once the texture is uploadable. */
export function loadAtlas(onReady) {
  const tex = new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}atlas.png`,
    () => onReady && onReady(),
  );
  // Density data, NOT colour — must never be sRGB-decoded.
  tex.colorSpace = THREE.NoColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  return tex;
}
