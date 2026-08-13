// Every tunable lives here. No magic numbers in modules. (CLAUDE.md)
//
// WORLD UNITS: one figure is 1.0 tall. The hill apex is y = 0. The camera is
// what turns world space into screen space, so the composition can breathe
// from a tight shot on the boulder to the full tableau.

// Scroll / pin
export const PIN_VH = 250;
export const SCROLL_EASE_TAU = 120;

// Dither
export const TEMPORAL_HZ = 12;
export const BUFFER_SCALE = 1;

// ---- Adaptive quality ---------------------------------------------------
// Budget is the GPU-side cost of one frame, not the frame interval: we are
// deciding whether OUR work fits, not whether the browser is busy elsewhere.
export const QUALITY_BUDGET_MS = 8.0;
export const QUALITY_WINDOW = 90;   // frames per decision
export const QUALITY_PATIENCE = 2;  // consecutive windows before acting

// Choreography beats (SPEC §6)
export const STRAIN_END = 0.3;
export const LEFT_START = 0.3;
export const LEFT_DUR = 0.25;
export const RIGHT_START = 0.55;
export const RIGHT_DUR = 0.2;
export const ALIGN_START = 0.75;

// ---- Camera -------------------------------------------------------------
// At p=0 only the TOP ARC of the boulder peeps above the bottom edge — the
// upper frame is clear blue for the nav and headline. The camera then
// descends and pulls back, revealing the boulder, the figures, and finally
// the hill. The reveal completes before the flankers arrive.
export const CAM_ZOOM_NEAR = 0.235;
export const CAM_ZOOM_FAR = 0.101;
export const CAM_Y_NEAR = 11.38;
export const CAM_Y_FAR = 5.45;
export const CAM_REVEAL_END = 0.38;

// ---- Hill (convex summit) ----------------------------------------------
// The ground arcs UP to a crest and passes behind the boulder, which rests
// against the slope. Ink belongs to the contours; between them it stays dark.
export const HILL_H0 = 1.42;        // horizon height at x = 0
export const HILL_ARC_K = 0.062; // how hard the walls curve up
export const HILL_CREST_GAIN = 1.6;
export const HILL_SLOPE = 0.55;
export const HILL_SEED = 42.197;
export const HILL_BANDS = 1.7;
export const HILL_RELIEF = 0.5;
export const HILL_ELEV_DRIFT = 0.016;
export const HILL_BAND_SCROLL = 0.16;
export const HILL_PULSE_SPEED = 0.55;
export const HILL_BASE = 0.05;
export const HILL_RIM = 0.45;
export const HILL_W_FINE = 0.4;
export const HILL_W_MAJOR = 0.82;
export const HILL_W_PULSE = 0.5;
export const FOOT_COMPRESS = 0.5;

// ---- Sky (technical wireframe underlay) --------------------------------
export const SKY_INK = 0.2; // ceiling — nav and headline sit over this
export const SKY_STIPPLE = 0.1;

// ---- Atlas --------------------------------------------------------------
export const ATLAS_W = 2048;
export const ATLAS_H = 4096;

// ---- Figures (world units) ---------------------------------------------
export const FIGURE_H = 2.3;
export const FIGURE_ASPECT = 0.62;
export const FIGURE_XS = [0.0, -1.0, 1.0]; // final planted positions
export const FIGURE_START_XS = [0.0, -4.2, 4.2]; // where the flankers walk in from
export const FIGURE_TONE = 1.0;
export const FIGURE_TONE_GAMMA = 0.58; // < 1 lifts midtones toward solid ink
// Engraving, generated in the fragment shader at screen resolution.
export const FIGURE_CONTOUR_PITCH = 14.0; // depth rings per muscle belly
export const FIGURE_CONTOUR_CUT = 0.28;
export const FIGURE_HATCH_PITCH = 58.0;   // burin strokes across the figure
export const FIGURE_HATCH_CUT = 0.4;
export const FIGURE_CROSS_CUT = 0.32;
export const FIGURE_LINE = 0.3;
export const FIGURE_STRAIN_GAIN = 0.35;
// The group rides with the rock: driven down as it settles onto them, rising
// as they straighten under it. Without this the boulder lifts off their hands
// at the end of the scroll and reads as floating away.
export const PUSH_FOLLOW = 0.62;
export const FIGURE_REVEAL_BAND = 0.5;
// WALK_STRIDES * WALK_BLEND MUST be a whole number: the walk->plant crossfade
// can only start on an exact gait frame, otherwise the blend hands off
// mid-stride and the figure snaps. 4 * 0.75 = 3.
export const WALK_STRIDES = 4;
export const WALK_BLEND = 0.75; // approach fraction where walk -> plant begins
export const WALK_STRAIN = 0.22;  // effort while still climbing
export const PLANT_STRAIN = 0.45; // effort on first contact with the rock
export const MAX_STRAIN = 0.9;    // effort once fully committed

// ---- Boulder (procedural GLSL — no atlas cell) --------------------------
export const BOULDER_R = 3.4;
export const BOULDER_Y = 6.79;
export const BOULDER_DESCENT = 0.09;
export const BOULDER_RISE = 0.11;
export const BOULDER_SPIN = 0.85;
export const BOULDER_TONE = 1.0;
export const BOULDER_NEST = 0.72;
export const BOULDER_SEAM = 0.85;
export const BOULDER_HATCH = 0.4;

// ---- Idle regression (SPEC §6) -----------------------------------------
// Stop scrolling and the rock settles back down while the tremor worsens: the
// thesis of the piece stated as physics. Applied as an offset ADDED to the
// p-derived value, never as a mutation of p, so reversibility survives.
export const IDLE_VEL_REF = 0.16;  // |velocity| at which regression is fully off
export const IDLE_SINK = 0.085;    // world units the rock gives back
export const IDLE_TREMOR = 0.85;   // extra tremor amplitude, as a fraction
export const IDLE_BREATH_HZ = 0.32;
export const IDLE_ONSET_TAU = 420; // ms for regression to fade in/out

// ---- Tremor (idle motion — wall-clock, SPEC §2 exemption) ---------------
export const TREMOR_FREQ = 7.5;
export const TREMOR_AMP = 0.012;
export const TREMOR_PHASES = [0.0, 2.1, 4.3];

// Debug overlay
export const OVERLAY_UPDATE_MS = 250;

// ---- Dither ------------------------------------------------------------
// Ordered Bayer alone reads as a woven grid at close range. Blending a little
// per-cell hash into the threshold breaks the weave into organic stipple,
// which is what an engraving's tone actually looks like.
export const DITHER_NOISE = 0.3;

// ---- Headline ------------------------------------------------------------
// The copy resolves out of the same dither as the art, holds while the frame
// is still mostly empty, then dissolves back out as the boulder climbs into
// the space it occupies. Leaving it up would just stack white text on white
// rock; the artwork gets the frame once there is artwork worth looking at.
export const HEADLINE_IN_START = 0.015;
export const HEADLINE_IN_END = 0.09;
export const HEADLINE_OUT_START = 0.17;
export const HEADLINE_OUT_END = 0.27;
