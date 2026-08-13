// Scrubber: slider drives p directly through scroll.setP. Also applies the
// ?p= deep link at boot (returns the parsed value so main.js can order boot).

export function readDeepLinkP() {
  const raw = new URLSearchParams(window.location.search).get('p');
  if (raw === null) return null;
  const p = parseFloat(raw);
  return Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : null;
}

export function createScrubber({ scroll }) {
  const wrap = document.createElement('div');
  wrap.style.cssText = [
    'position:fixed', 'bottom:8px', 'left:8px', 'right:8px', 'z-index:100',
    'display:flex', 'align-items:center', 'gap:8px',
    'font:11px ui-monospace,monospace', 'color:#fff',
  ].join(';');

  const input = document.createElement('input');
  input.type = 'range';
  input.min = '0';
  input.max = '1';
  input.step = '0.001';
  input.value = '0';
  input.style.cssText = 'flex:1;accent-color:#fff;';
  input.setAttribute('aria-label', 'Timeline scrubber');

  const label = document.createElement('span');
  label.textContent = 'p=0.000';
  label.style.cssText = 'min-width:64px;text-align:right;';

  input.addEventListener('input', () => {
    scroll.setP(parseFloat(input.value));
  });

  // Reflect native scrolling back into the slider.
  const id = setInterval(() => {
    if (document.activeElement !== input) input.value = String(scroll.p);
    label.textContent = `p=${scroll.p.toFixed(3)}`;
  }, 100);

  wrap.appendChild(input);
  wrap.appendChild(label);
  document.body.appendChild(wrap);

  return {
    destroy() {
      clearInterval(id);
      wrap.remove();
    },
  };
}
