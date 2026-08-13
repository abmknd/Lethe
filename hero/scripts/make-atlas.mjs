// make-atlas.mjs — authors the 4-channel density atlas.
//
//   R = tonal density   G = linework   B = strain mask   A = silhouette
//
// This is the art step. Everything is built from signed distance fields:
// anatomy as smooth-blended masses, shading from a cylinder normal derived
// from the SDF, muscle separations cut as grooves, and engraving marks that
// follow the form. Rendered at 2x and box-downsampled.
//
// The medium is WHITE INK ON BLUE, so the dark lines of an engraving are
// ABSENCES of ink. Contours, hatching and muscle seams are therefore cut out
// of the tonal density; the G channel carries only marks that add ink.
//
// sharp resolves from the parent repo's node_modules (Node walks up), so this
// adds no dependency to hero/.
//
//   node scripts/make-atlas.mjs

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stat } from 'node:fs/promises';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public/atlas.png');

const AW = 2048; // atlas width
const AH = 4096; // atlas height
const SS = 2; // supersample factor

// ------------------------------------------------------------------ math

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const clamp01 = (x) => clamp(x, 0, 1);
const mix = (a, b, t) => a + (b - a) * t;
const fract = (x) => x - Math.floor(x);
function smoothstep(e0, e1, x) {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

/** Polynomial smooth min — blends masses into one body instead of a pile. */
function smin(a, b, k) {
  const h = clamp01(0.5 + (0.5 * (b - a)) / k);
  return mix(b, a, h) - k * h * (1 - h);
}

function sdSeg(px, py, ax, ay, bx, by, r) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const t = clamp01((pax * bax + pay * bay) / (bax * bax + bay * bay || 1e-9));
  return Math.hypot(pax - bax * t, pay - bay * t) - r;
}

/** Distance to a segment's core line — used for muscle seams. */
function segDist(px, py, ax, ay, bx, by) {
  return sdSeg(px, py, ax, ay, bx, by, 0);
}

function sdEll(px, py, cx, cy, rx, ry) {
  const dx = (px - cx) / rx;
  const dy = (py - cy) / ry;
  return (Math.hypot(dx, dy) - 1) * Math.min(rx, ry);
}

function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return mix(
    mix(hash2(ix, iy), hash2(ix + 1, iy), ux),
    mix(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), ux),
    uy,
  );
}
function fbm(x, y) {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < 4; i++) {
    v += a * vnoise(x, y);
    x = x * 1.97 + 5.1;
    y = y * 1.97 - 3.3;
    a *= 0.5;
  }
  return v;
}

// ------------------------------------------------------------------ anatomy

// The build is drawn wider than life inside its cell. At a 2px dot pitch the
// figure only gets ~60 dots across on screen, and a naturalistic width simply
// dissolves — the mass has to be exaggerated to survive the medium.
const WIDEN = 1.24;

/**
 * Skeleton for one pose. Centralised so the SDF, the muscle seams and the
 * strain mask all read from the same joint positions.
 *
 * pose 0 = SETTLE, 1 = MAX_STRAIN.
 * turn 0 = straight back view, 1 = three-quarter.
 * gait null = planted; 0..1 = walk-cycle phase.
 * lean = forward pitch (walking uphill).
 */
function rig(pose, turn, gait, lean) {
  const sq = 1 - pose * 0.045;
  const walking = gait !== null;
  const ph = walking ? gait * Math.PI * 2 : 0;

  // Walk cycle: feet swing fore/aft, lift through the swing phase, hips rise
  // at the passing position.
  const stride = walking ? 0.15 : 0;
  const lift = walking ? 0.075 : 0;
  const bob = walking ? 0.022 * Math.cos(2 * ph) : 0;

  const foot = [-1, 1].map((s) => {
    const p = ph + (s > 0 ? Math.PI : 0);
    return {
      x: 0.5 + s * (walking ? 0.085 : 0.155 + pose * 0.022) + Math.sin(p) * stride,
      y: 0.015 + Math.max(0, Math.cos(p)) * lift,
    };
  });

  return {
    sq,
    walking,
    lean,
    armPhase: ph,
    foot,
    hipY: (0.435 + bob) * sq,
    waistY: (0.55 + bob) * sq,
    latY: (0.685 + bob) * sq,
    shY: (0.715 + bob) * sq,
    neckY: (0.775 + bob) * sq,
    headY: (0.85 + bob) * sq,
    handY: (0.965 + bob) * sq - pose * 0.02,
    spread: walking ? 0.17 : 0.215 + pose * 0.045,
    hipX: [-1, 1].map((s) => 0.5 + s * 0.072),
  };
}

/** Lean shear: the upper body pitches forward over the feet when climbing. */
function shear(nx, v, r) {
  return nx - r.lean * v * v;
}

/**
 * Both fields at once.
 *   u = SMOOTH union  -> the silhouette, one continuous body
 *   m = HARD min      -> which muscle you are inside, and how deep
 *
 * Shading reads the gradient of `m`, so every muscle belly domes on its own
 * normal. Where two bellies meet, that gradient creases and the forms turn
 * away from each other, so the separation appears because of the anatomy
 * rather than because a line was drawn on top of it. Drawn seams read as
 * annotation, which is exactly how the previous pass failed.
 */
function figureFields(x, y, pose, turn, gait = null, lean = 0) {
  const axis = 0.5 + turn * 0.045;
  const nx0 = (x - axis) / (WIDEN * mix(1, 0.84, turn)) + 0.5;
  const r = rig(pose, turn, gait, lean);
  const nx = shear(nx0, y, r);

  let u = 1e3;
  let m = 1e3;
  const K = 0.028;
  const add = (d, k) => {
    u = smin(u, d, k === undefined ? K : k);
    m = Math.min(m, d);
  };

  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? -1 : 1;
    const fore = turn > 0 && s < 0 ? 0.86 : 1;
    const f = r.foot[i];
    const hx = r.hipX[i];
    const kx = mix(hx, f.x, 0.55) + (f.x - hx) * 0.18;
    const ky = mix(f.y, r.hipY, 0.47);

    add(sdEll(nx, y, f.x, f.y + 0.012, 0.05 * fore, 0.026), 0.02);
    add(sdSeg(nx, y, f.x, f.y + 0.02, mix(f.x, kx, 0.45), mix(f.y, ky, 0.45), 0.036 * fore));
    // gastrocnemius: two heads, the medial one lower and fuller
    add(sdEll(nx, y, mix(f.x, kx, 0.66) - s * 0.016, mix(f.y, ky, 0.7), 0.036 * fore, 0.064));
    add(sdEll(nx, y, mix(f.x, kx, 0.66) + s * 0.021, mix(f.y, ky, 0.62), 0.032 * fore, 0.055));
    // thigh sweep, then the two hamstring bellies
    add(sdSeg(nx, y, kx, ky, hx, r.hipY, 0.062 * fore));
    add(sdEll(nx, y, mix(kx, hx, 0.5) - s * 0.02, mix(ky, r.hipY, 0.5), 0.045 * fore, 0.085));
    add(sdEll(nx, y, mix(kx, hx, 0.55) + s * 0.026, mix(ky, r.hipY, 0.5), 0.04 * fore, 0.078));
    add(sdEll(nx, y, 0.5 + s * 0.062, r.hipY + 0.024, 0.072 * fore, 0.062));

    // latissimus wing
    add(sdSeg(nx, y, 0.5 + s * 0.045, r.waistY - 0.01, 0.5 + s * (0.182 * fore), r.latY, 0.058 * fore), 0.045);
    // erector spinae column: these two are what carve the spinal furrow
    add(sdEll(nx, y, 0.5 + s * 0.034, (r.hipY + r.latY) * 0.5, 0.03, 0.105), 0.02);
    add(sdEll(nx, y, 0.5 + s * 0.15, r.shY + 0.008, 0.062 * fore, 0.056));
  }

  add(sdEll(nx, y, 0.5, r.shY - 0.03, 0.132, 0.062), 0.022);
  add(sdEll(nx, y, 0.5, (r.shY + r.waistY) * 0.5 + 0.03, 0.15, 0.088), 0.03);
  add(sdSeg(nx, y, 0.5, r.hipY, 0.5, r.waistY, 0.08));
  add(sdSeg(nx, y, 0.5, r.shY - 0.01, 0.5, r.neckY, 0.043));
  add(sdEll(nx, y, 0.5 + turn * 0.012, r.headY, 0.057, 0.068), 0.022);

  for (const s of [-1, 1]) {
    const fore = turn > 0 && s < 0 ? 0.84 : 1;
    if (r.walking) {
      const sw = Math.sin(r.armPhase + (s > 0 ? 0 : Math.PI));
      const shx = 0.5 + s * 0.145;
      const shy = r.shY - 0.015;
      const elx = shx + s * 0.028 + sw * 0.055;
      const ely = shy - 0.175;
      const hx2 = elx + s * 0.016 + sw * 0.075;
      const hy2 = ely - 0.155;
      add(sdSeg(nx, y, shx, shy, elx, ely, 0.048 * fore), 0.03);
      add(sdSeg(nx, y, elx, ely, hx2, hy2, 0.039 * fore), 0.026);
      add(sdEll(nx, y, hx2, hy2 - 0.022, 0.032 * fore, 0.03), 0.018);
    } else {
      const ex = 0.5 + s * r.spread;
      const ey = r.handY - 0.125;
      add(sdSeg(nx, y, 0.5 + s * 0.13, r.shY + 0.015, ex, ey, 0.046 * fore), 0.03);
      add(sdEll(nx, y, 0.5 + s * (0.13 + r.spread) * 0.5, (r.shY + ey) * 0.5, 0.042 * fore, 0.05), 0.026);
      const wx = 0.5 + s * r.spread * 0.8;
      const wy = r.handY - 0.03;
      add(sdSeg(nx, y, ex, ey, wx, wy, 0.038 * fore), 0.024);
      add(sdEll(nx, y, wx, wy + 0.012, 0.044 * fore, 0.036), 0.018);
      for (let f = 0; f < 4; f++) {
        const t = f / 3 - 0.5;
        const bx = wx + t * 0.05 - s * 0.006;
        const by = wy + 0.028;
        add(
          sdSeg(nx, y, bx, by - 0.012, bx - s * 0.022 - t * 0.012, by + 0.03 - Math.abs(t) * 0.012, 0.0125 * fore),
          0.009,
        );
      }
    }
  }

  return { u, m };
}

function figureStrain(x, y, pose, turn, gait, lean) {
  const axis = 0.5 + turn * 0.045;
  const nx0 = (x - axis) / (WIDEN * mix(1, 0.84, turn)) + 0.5;
  const r = rig(pose, turn, gait, lean);
  const nx = shear(nx0, y, r);
  const g = (cx, cy, rad) => Math.exp(-(((nx - cx) ** 2 + (y - cy) ** 2) / (rad * rad)));

  let m = g(0.5, r.shY - 0.02, 0.075) * 0.95;
  for (const s of [-1, 1]) {
    m = Math.max(m, g(0.5 + s * 0.115, r.latY - 0.07, 0.085));
    m = Math.max(m, g(0.5 + s * 0.032, r.waistY + 0.01, 0.05) * 0.8);
    m = Math.max(m, g(0.5 + s * 0.062, r.hipY + 0.02, 0.062) * 0.9);
    m = Math.max(m, g(0.5 + s * 0.15, r.shY + 0.005, 0.05) * 0.85);
    m = Math.max(m, g(0.5 + s * 0.24, r.handY - 0.1, 0.055) * 0.9);
  }
  for (let i = 0; i < 2; i++) {
    const f = r.foot[i];
    m = Math.max(m, g(f.x, f.y + 0.14, 0.058));
  }
  return clamp01(m);
}

// ------------------------------------------------------------------ boulder

// A geodesic solid: points inside the silhouette are lifted onto a hemisphere,
// then partitioned by nearest facet direction. That gives real polygonal faces
// across the surface — pentagons and hexagons — each carrying its own nested
// concentric fill, as in the reference.
const NF = 96;
const DIRS = [];
for (let i = 0; i < NF; i++) {
  const y = 1 - ((i + 0.5) / NF) * 2;
  const rr = Math.sqrt(Math.max(0, 1 - y * y));
  const phi = i * 2.399963229728653; // golden angle
  const j = hash2(i * 7.1, 3.3);
  DIRS.push({
    x: Math.cos(phi) * rr,
    y,
    z: Math.sin(phi) * rr,
    pitch: 26 + (i % 6) * 7,
    phase: j * 6.28,
    tint: 0.9 + 0.2 * j,
    rot: j * 3.14,
  });
}

function boulderSil(u, v) {
  const x = (u - 0.5) * 2;
  const y = (v - 0.5) * 2;
  const r = Math.hypot(x, y);
  const a = Math.atan2(y, x);
  const R = 0.9 + 0.022 * Math.cos(a * 3 + 0.7) + 0.016 * Math.cos(a * 5 - 1.2) + 0.01 * Math.cos(a * 9 + 2.1);
  return { d: r - R, x, y, R, r };
}

function boulderField(u, v) {
  return boulderSil(u, v).d;
}

function boulderFacets(u, v) {
  const { x, y, R, r, d } = boulderSil(u, v);
  const rr = Math.min(1, r / R);
  const z = Math.sqrt(Math.max(0, 1 - rr * rr));
  const px3 = x / R;
  const py3 = y / R;

  let best = -2;
  let second = -2;
  let bi = 0;
  for (let i = 0; i < NF; i++) {
    const D = DIRS[i];
    if (D.z <= 0.02) continue; // back-facing: never visible from here
    const dot = px3 * D.x + py3 * D.y + z * D.z;
    if (dot > best) {
      second = best;
      best = dot;
      bi = i;
    } else if (dot > second) {
      second = dot;
    }
  }
  return { facet: bi, edge: best - second, d };
}

// ------------------------------------------------------------------ render

function renderCell(data, rect, fieldFn, shade) {
  const [rx, ry, rw, rh] = rect;
  const W = rw * SS;
  const H = rh * SS;

  const U = new Float32Array(W * H); // silhouette
  const M = new Float32Array(W * H); // per-muscle
  for (let j = 0; j < H; j++) {
    const v = (j + 0.5) / H;
    for (let i = 0; i < W; i++) {
      const f = fieldFn((i + 0.5) / W, v);
      U[j * W + i] = f.u;
      M[j * W + i] = f.m;
    }
  }

  const px = 1 / W;
  for (let oy = 0; oy < rh; oy++) {
    for (let ox = 0; ox < rw; ox++) {
      let aR = 0;
      let aG = 0;
      let aB = 0;
      let aA = 0;
      let n = 0;

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ox * SS + sx;
          const j = oy * SS + sy;
          const d = U[j * W + i];

          const sil = 1 - smoothstep(0, 1.6 * px, d);
          if (sil <= 0.002) continue;

          // Normal comes from the MUSCLE field so each belly domes on its own.
          const md = M[j * W + i];
          const ml = M[j * W + Math.max(0, i - 1)];
          const mr = M[j * W + Math.min(W - 1, i + 1)];
          const mdn = M[Math.max(0, j - 1) * W + i];
          const mup = M[Math.min(H - 1, j + 1) * W + i];
          let gx = (mr - ml) / (2 * px);
          let gy = (mup - mdn) / (2 * px);
          const gl = Math.hypot(gx, gy) || 1e-6;
          gx /= gl;
          gy /= gl;

          const c = shade({ u: (i + 0.5) / W, v: (j + 0.5) / H, d, md, gx, gy, px });
          aR += c.tone;
          aG += c.line;
          aB += c.strain;
          aA += sil;
          n++;
        }
      }

      const o = ((ry + oy) * AW + (rx + ox)) * 4;
      const inv = n > 0 ? 1 / n : 0;
      data[o] = clamp(aR * inv * 255, 0, 255);
      data[o + 1] = clamp(aG * inv * 255, 0, 255);
      data[o + 2] = clamp(aB * inv * 255, 0, 255);
      data[o + 3] = Math.max(1, clamp((aA / (SS * SS)) * 255, 0, 255));
    }
  }
}

/** Edge-pad RGB outward so bilinear taps and mips do not eat the silhouette. */
function dilate(data, rect, passes) {
  const [rx, ry, rw, rh] = rect;
  for (let pass = 0; pass < passes; pass++) {
    const snap = new Uint8Array(data.buffer.slice(0));
    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const o = ((ry + y) * AW + (rx + x)) * 4;
        if (snap[o + 3] > 1) continue;
        let r = 0;
        let g = 0;
        let b = 0;
        let k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= rw || ny >= rh) continue;
            const no = ((ry + ny) * AW + (rx + nx)) * 4;
            if (snap[no + 3] <= 1 && !(pass > 0 && snap[no] > 0)) continue;
            r += snap[no];
            g += snap[no + 1];
            b += snap[no + 2];
            k++;
          }
        }
        if (k) {
          data[o] = r / k;
          data[o + 1] = g / k;
          data[o + 2] = b / k;
        }
      }
    }
  }
}

const LIGHT = (() => {
  const v = [-0.42, 0.66, 0.62];
  const l = Math.hypot(...v);
  return v.map((c) => c / l);
})();

const LIMB_R = 0.075;

const MUSCLE_ROUND = 4.6; // lower = rounder, fuller bellies
const MUSCLE_DEPTH = 0.105; // cell units: deepest belly, for the G channel
const MUSCLE_TURN_MAX = 2.1; // cap on how far an edge may roll from the viewer

function fleshShade(pose, turn, gait, lean) {
  return ({ u, v, md, gx, gy }) => {
    // Treat depth into the muscle as a DOME height, h = sqrt(-md), and take
    // the normal from that. A muscle then curves continuously from edge to
    // belly instead of saturating flat past some threshold.
    const h = Math.sqrt(Math.max(1e-6, -md));
    const k = Math.min(MUSCLE_TURN_MAX, 1 / (2 * h * MUSCLE_ROUND));
    const nx3 = gx * k;
    const ny3 = gy * k;
    const inv = 1 / Math.hypot(nx3, ny3, 1);
    const lam = clamp01((nx3 * LIGHT[0] + ny3 * LIGHT[1] + LIGHT[2]) * inv);

    // NOTHING high-frequency is baked here any more. The figure renders about
    // 4.6x minified, so every stroke written at atlas resolution gets averaged
    // into flat grey by the mip chain — which is exactly why the figures kept
    // reading weak while the boulder, whose marks are generated in its shader,
    // read sharp. The atlas now carries only fields that survive minification;
    // the engraving is generated at screen resolution in figures.frag.glsl.
    return {
      // R: smooth lambert tone.
      tone: clamp01(0.13 + 0.87 * Math.pow(lam, 1.08)),
      // G: normalised depth into the nearest muscle belly. The shader contours
      // this, so the lines wrap each belly's own form at any zoom.
      line: clamp01(-md / MUSCLE_DEPTH),
      // B: where effort shows.
      strain: figureStrain(u, v, pose, turn, gait, lean),
    };
  };
}

function boulderShade({ u, v, d, px }) {
  const { facet, edge } = boulderFacets(u, v);
  const f = DIRS[facet];

  const lam = clamp01(f.x * LIGHT[0] + f.y * LIGHT[1] + f.z * LIGHT[2]);
  let tone = clamp01((0.4 + 0.4 * lam) * f.tint);

  const w = fbm(u * 8.0, v * 8.0) - 0.5;

  // Nested concentric polygons cut into each facet, following that facet's
  // own boundary. Phase and pitch vary per facet so no two faces match.
  const inner = Math.min(-d * 1.6, edge * 3.4);
  const nest = fract(inner * f.pitch + f.phase + w * 0.25);
  const nested = 1 - smoothstep(0, 0.5, Math.min(nest, 1 - nest) * 2);
  tone *= 1 - nested * 0.62;

  const seam = 1 - smoothstep(0, 0.008, edge);
  tone *= 1 - seam * 0.85;

  const hu = u * Math.cos(f.rot) + v * Math.sin(f.rot);
  const hh = fract(hu * 40 + w * 1.4);
  const hatch =
    (1 - smoothstep(0, 0.16 + 0.5 * (1 - lam), Math.min(hh, 1 - hh) * 2)) * smoothstep(0.35, 0.85, 1 - lam);
  tone *= 1 - hatch * 0.4;

  const crest = smoothstep(0.7, 0.97, lam) * (1 - seam);
  const rim = 1 - smoothstep(0, 2.4 * px, Math.abs(d) - 0.8 * px);

  return { tone: clamp01(tone), line: clamp01(Math.max(crest * 0.6, rim * 0.9)), strain: 0 };
}

// ------------------------------------------------------------------ layout

const FW = 512;
const FH = 1024;
const CELLS = {
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

const data = new Uint8Array(AW * AH * 4);
const t0 = Date.now();

const WALK_LEAN = 0.13;
const jobs = [
  ['BACK_SETTLE', 0, 0, null, 0],
  ['BACK_PRESS', 0.5, 0, null, 0],
  ['BACK_MAX', 1, 0, null, 0],
  ['TQ_SETTLE', 0, 1, null, 0],
  ['TQ_PRESS', 0.5, 1, null, 0],
  ['TQ_MAX', 1, 1, null, 0],
  ['WALK_0', 0.15, 1, 0.0, WALK_LEAN],
  ['WALK_1', 0.15, 1, 0.25, WALK_LEAN],
  ['WALK_2', 0.15, 1, 0.5, WALK_LEAN],
  ['WALK_3', 0.15, 1, 0.75, WALK_LEAN],
];

for (const [name, pose, turn, gait, lean] of jobs) {
  process.stdout.write(`  ${name} ... `);
  const s = Date.now();
  renderCell(data, CELLS[name], (u, v) => figureFields(u, v, pose, turn, gait, lean), fleshShade(pose, turn, gait, lean));
  dilate(data, CELLS[name], 3);
  console.log(`${Date.now() - s}ms`);
}

process.stdout.write('  BOULDER ... ');
{
  const s = Date.now();
  renderCell(data, CELLS.BOULDER, (u, v) => { const d = boulderField(u, v); return { u: d, m: d }; }, boulderShade);
  dilate(data, CELLS.BOULDER, 3);
  console.log(`${Date.now() - s}ms`);
}

// rows are written v=0 first (bottom); flip so the PNG is top-down and the
// runtime can use three's default flipY.
await sharp(Buffer.from(data.buffer), { raw: { width: AW, height: AH, channels: 4 } })
  .flip()
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(OUT);

const { size } = await stat(OUT);
console.log(`\natlas ${AW}x${AH} -> ${path.relative(ROOT, OUT)}  ${(size / 1024).toFixed(0)} KB  (${Date.now() - t0}ms)`);
