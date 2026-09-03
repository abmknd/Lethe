import { useEffect, useRef } from 'react';
import { SHADERS, type ShaderName } from './shaders';

/**
 * SHADER CANVAS — the WebGL harness the animated assets share.
 *
 * One fullscreen triangle, one fragment shader, one draw call. It exists as a
 * design-system component rather than inside the empty state because the
 * `dynamic_icons` workstream needs exactly this and should not grow a second
 * copy of it.
 *
 * WHAT IT TAKES CARE OF, none of which is optional in a real app:
 *
 *   REDUCED MOTION.  `prefers-reduced-motion` freezes the clock at a chosen
 *   still frame instead of dropping the asset. The picture is the message; the
 *   motion is decoration, so the decoration is what goes.
 *
 *   OFF-SCREEN PAUSE.  An IntersectionObserver stops the loop when the canvas
 *   scrolls away. Three of these on one page, all spinning while nobody looks,
 *   is a laptop fan for nothing.
 *
 *   TAB VISIBILITY.  rAF already throttles in a background tab, but the clock
 *   would keep accumulating and the animation would jump on return. The clock
 *   pauses with the tab.
 *
 *   CONTEXT LOSS.  Browsers drop GL contexts under memory pressure and the
 *   canvas silently goes black. The handler cancels the loop and rebuilds.
 *
 *   TEARDOWN.  Program, shaders, buffer and the context itself are released on
 *   unmount. A leaked GL context is not collected promptly and there is a hard
 *   per-page limit of them; leaking one per navigation kills the page.
 *
 * NO WEBGL, NO PROBLEM: it renders nothing and the heading and body still say
 * everything the user needs. The asset is never the only carrier of meaning.
 */

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

/** The frame each shader is frozen at when motion is reduced — chosen so the
 *  shape reads at rest: hand mid-wave, oval whole, gear whole. */
const STILL: Record<ShaderName, number> = { hand: 0.6, oval: 1.2, gear: 1.4 };

/**
 * THE TEMPORAL DITHER, from the retired hero (31d2b93).
 *
 * The Bayer threshold is stepped through eight whole-cell offsets at 12Hz, not
 * per frame. Whole cells because a sub-cell offset resamples the lattice and
 * shimmers; 12Hz because at 60 the stipple boils and at 0 it freezes into a
 * visible weave. These are the hero's numbers verbatim.
 */
const OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [3, 1], [6, 4], [1, 6], [5, 2], [2, 5], [7, 7], [4, 3],
];
const TEMPORAL_HZ = 12;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // Surfaced rather than swallowed: a silent compile failure looks exactly
    // like "the designer's asset is missing", and costs an hour to find.
    console.error('[ShaderCanvas] compile failed:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function ShaderCanvas({
  shader,
  size = 140,
  className,
}: {
  shader: ShaderName;
  /** CSS pixels. The shaders are composed for 140 and scale cleanly. */
  size?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // Read the ink off the cascade so these follow the tokens like everything
    // else. Hard-coding #0000f2 here would be a fourth place the brand blue
    // lives, and the one nobody would think to update.
    const css = getComputedStyle(canvas);
    const hex = (v: string, fallback: string) => {
      const s = v.trim() || fallback;
      const m = /^#?([0-9a-f]{6})$/i.exec(s);
      if (!m) return [0, 0, 0.95] as const;
      const n = parseInt(m[1], 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const;
    };
    const ink = hex(css.getPropertyValue('--color-blue-600'), '#0000f2');
    const field = hex(css.getPropertyValue('--surface-neutral-default'), '#ffffff');

    let raf = 0;
    let visible = true;
    let clock = 0;
    let last = performance.now();
    let gl: WebGLRenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let buf: WebGLBuffer | null = null;
    let vs: WebGLShader | null = null;
    let fs: WebGLShader | null = null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = Math.round(size * dpr);

    const build = () => {
      gl = (canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false }) ||
        canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (!gl) return false;

      vs = compile(gl, gl.VERTEX_SHADER, VERT);
      fs = compile(gl, gl.FRAGMENT_SHADER, SHADERS[shader]);
      if (!vs || !fs) return false;

      prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('[ShaderCanvas] link failed:', gl.getProgramInfoLog(prog));
        return false;
      }
      gl.useProgram(prog);

      // One triangle that covers the clip cube — cheaper than two, and there is
      // no seam down the diagonal for the AA to catch on.
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      gl.viewport(0, 0, px, px);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform2f(gl.getUniformLocation(prog, 'u_res'), px, px);
      gl.uniform3f(gl.getUniformLocation(prog, 'u_ink'), ink[0], ink[1], ink[2]);
      gl.uniform3f(gl.getUniformLocation(prog, 'u_field'), field[0], field[1], field[2]);
      return true;
    };

    let temporalIndex = 0;
    let temporalAt = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (visible) clock += dt;

      // Step the dither offset on its own 12Hz clock, independent of the frame
      // rate — that is what keeps the stipple from boiling at 120Hz.
      if (now - temporalAt >= 1000 / TEMPORAL_HZ) {
        temporalAt = now;
        temporalIndex = (temporalIndex + 1) % OFFSETS.length;
      }

      if (gl && prog) {
        const off = OFFSETS[temporalIndex];
        gl.uniform2f(gl.getUniformLocation(prog, 'u_temporal'), off[0], off[1]);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), reduced ? STILL[shader] : clock);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      // A frozen asset needs exactly one frame, not sixty — and its dither must
      // freeze with it, or a "reduced motion" asset strobes on the spot.
      if (!reduced && visible) raf = requestAnimationFrame(frame);
      else raf = 0;
    };

    const start = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    canvas.width = px;
    canvas.height = px;
    if (!build()) return;
    start();

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) start();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVis = () => {
      visible = !document.hidden;
      if (visible) start();
    };
    document.addEventListener('visibilitychange', onVis);

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => {
      if (build()) start();
    };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      if (gl) {
        if (buf) gl.deleteBuffer(buf);
        if (prog) gl.deleteProgram(prog);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        // DO NOT call WEBGL_lose_context here. A canvas only ever has ONE
        // context: `getContext` hands back the same object every time, and
        // losing it is permanent for that element. React StrictMode mounts an
        // effect, tears it down and mounts it again on the SAME canvas, so
        // force-losing on cleanup handed the second mount a dead context and
        // every compile on it failed with a null info log. It would do the same
        // on any real remount.
        //
        // Nothing leaks by omitting it: the objects above are released, and the
        // context goes when React drops the canvas element.
        gl = null;
      }
    };
  }, [shader, size]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ width: size, height: size, display: 'block' }}
    />
  );
}
