// Debug overlay: FPS, p, velocity, tier, buffer dims. Updates at a slow
// interval so it never contributes layout churn to the frame budget.

import { OVERLAY_UPDATE_MS } from '../config/timeline.js';

export function createOverlay({ scroll, loop, buffers, quality }) {
  const el = document.createElement('div');
  el.id = 'hero-debug-overlay';
  el.style.cssText = [
    'position:fixed', 'top:8px', 'left:8px', 'z-index:100',
    'font:11px/1.5 ui-monospace,monospace', 'color:#fff',
    'background:rgba(0,0,120,0.75)', 'padding:6px 10px',
    'border:1px solid rgba(255,255,255,0.35)', 'border-radius:4px',
    'pointer-events:none', 'white-space:pre',
  ].join(';');
  document.body.appendChild(el);

  const id = setInterval(() => {
    const { w, h } = buffers.size;
    el.textContent =
      `fps  ${loop.fps.toFixed(0).padStart(3)}  ${loop.visible ? 'run' : 'paused'}\n` +
      `p    ${scroll.p.toFixed(3)}\n` +
      `vel  ${scroll.velocity.toFixed(3)}\n` +
      `tier ${quality.tier}\n` +
      `buf  ${w}x${h}`;
  }, OVERLAY_UPDATE_MS);

  return {
    destroy() {
      clearInterval(id);
      el.remove();
    },
  };
}
