// Three figures as ONE InstancedMesh, one draw call. (SPEC §3)
//
// Positioned in world units; the camera does the projection. The boulder is
// no longer here — it is an analytic GLSL pass so it stays sharp at any zoom.

import * as THREE from 'three';
import vert from '../shaders/figures.vert.glsl?raw';
import frag from '../shaders/figures.frag.glsl?raw';
import { loadAtlas, uvRect } from './atlas.js';
import {
  FIGURE_H,
  FIGURE_ASPECT,
  FIGURE_TONE,
  FIGURE_TONE_GAMMA,
  FIGURE_CONTOUR_PITCH,
  FIGURE_CONTOUR_CUT,
  FIGURE_HATCH_PITCH,
  FIGURE_HATCH_CUT,
  FIGURE_CROSS_CUT,
  FIGURE_STRAIN_GAIN,
  FIGURE_REVEAL_BAND,
  TREMOR_FREQ,
  TREMOR_AMP,
  TREMOR_PHASES,
} from '../config/timeline.js';

const COUNT = 3; // three figures; the boulder is a procedural pass

export function createFigures({ onReady } = {}) {
  const atlas = loadAtlas(onReady);

  const geometry = new THREE.InstancedBufferGeometry();
  const plane = new THREE.PlaneGeometry(1, 1);
  geometry.index = plane.index;
  geometry.attributes.position = plane.attributes.position;
  geometry.attributes.uv = plane.attributes.uv;
  geometry.instanceCount = COUNT;

  const rectA = new Float32Array(COUNT * 4);
  const rectB = new Float32Array(COUNT * 4);
  const poseMix = new Float32Array(COUNT);
  const offset = new Float32Array(COUNT * 2);
  const scale = new Float32Array(COUNT * 2);
  const mirror = new Float32Array(COUNT);
  const phase = new Float32Array(COUNT);
  const reveal = new Float32Array(COUNT);
  const strain = new Float32Array(COUNT);

  const halfH = FIGURE_H / 2;
  const halfW = halfH * FIGURE_ASPECT;

  const setRect = (arr, i, r) => {
    arr[i * 4] = r[0];
    arr[i * 4 + 1] = r[1];
    arr[i * 4 + 2] = r[2];
    arr[i * 4 + 3] = r[3];
  };

  for (let f = 0; f < 3; f++) {
    const i = f;
    setRect(rectA, i, uvRect(f === 0 ? 'BACK_SETTLE' : 'TQ_SETTLE'));
    setRect(rectB, i, uvRect(f === 0 ? 'BACK_MAX' : 'TQ_MAX'));
    scale[i * 2] = halfW;
    scale[i * 2 + 1] = halfH;
    mirror[i] = f === 1 ? 1 : 0; // left flank turns inward
    phase[i] = TREMOR_PHASES[f];
    reveal[i] = f === 0 ? 1 : 0;
  }

  const attr = (arr, size, dynamic) => {
    const a = new THREE.InstancedBufferAttribute(arr, size);
    if (dynamic) a.setUsage(THREE.DynamicDrawUsage);
    return a;
  };

  const aRectA = attr(rectA, 4, true);
  const aRectB = attr(rectB, 4, true);
  const aOffset = attr(offset, 2, true);
  const aPoseMix = attr(poseMix, 1, true);
  const aReveal = attr(reveal, 1, true);
  const aStrain = attr(strain, 1, true);

  geometry.setAttribute('aRectA', aRectA);
  geometry.setAttribute('aRectB', aRectB);
  geometry.setAttribute('aPoseMix', aPoseMix);
  geometry.setAttribute('aOffset', aOffset);
  geometry.setAttribute('aScale', attr(scale, 2));
  geometry.setAttribute('aMirror', attr(mirror, 1));
  geometry.setAttribute('aPhase', attr(phase, 1));
  geometry.setAttribute('aReveal', aReveal);
  geometry.setAttribute('aStrain', aStrain);

  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uAtlas: { value: atlas },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uCam: { value: new THREE.Vector2() },
      uZoom: { value: 1 },
      uTremorFreq: { value: TREMOR_FREQ },
      uTremorAmp: { value: TREMOR_AMP },
      uTremorBoost: { value: 1 },
      uSync: { value: 0 },
      uTone: { value: FIGURE_TONE },
      uToneGamma: { value: FIGURE_TONE_GAMMA },
      uContourPitch: { value: FIGURE_CONTOUR_PITCH },
      uContourCut: { value: FIGURE_CONTOUR_CUT },
      uHatchPitch: { value: FIGURE_HATCH_PITCH },
      uHatchCut: { value: FIGURE_HATCH_CUT },
      uCrossCut: { value: FIGURE_CROSS_CUT },
      uStrainGain: { value: FIGURE_STRAIN_GAIN },
      uRevealBand: { value: FIGURE_REVEAL_BAND },
    },
    depthTest: false,
    depthWrite: false,
    // Source-over on the density channel so figures occlude what is behind
    // them; alpha untouched so the buffer's A stays 1 for the dither.
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquationAlpha: THREE.AddEquation,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  });

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  return {
    /**
     * s: { elapsedS, aspect, cam:[x,y], zoom, sync,
     *      figures: [{ x, y, reveal, strain, poseMix, rectA, rectB } x3] }
     */
    render(renderer, target, s) {
      const u = material.uniforms;
      u.uTime.value = s.elapsedS;
      u.uAspect.value = s.aspect;
      u.uCam.value.set(s.cam[0], s.cam[1]);
      u.uZoom.value = s.zoom;
      u.uSync.value = s.sync;
      u.uTremorBoost.value = s.tremorBoost;

      s.figures.forEach((f, i) => {
        offset[i * 2] = f.x;
        offset[i * 2 + 1] = f.y;
        reveal[i] = f.reveal;
        strain[i] = f.strain;
        poseMix[i] = f.poseMix;
        setRect(rectA, i, f.rectA);
        setRect(rectB, i, f.rectB);
      });

      aRectA.needsUpdate = true;
      aRectB.needsUpdate = true;
      aReveal.needsUpdate = true;
      aStrain.needsUpdate = true;
      aPoseMix.needsUpdate = true;
      aOffset.needsUpdate = true;

      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
    },

    destroy() {
      geometry.dispose();
      plane.dispose();
      material.dispose();
      atlas.dispose();
    },
  };
}
