import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import RebrandPage from './RebrandPage';

// Standalone entry for the staged rebrand — bypasses the app router so the
// preview isn't blocked by unrelated pages. Served at /rebrand.html in dev.
createRoot(document.getElementById('rebrand-root')!).render(
  <StrictMode>
    <RebrandPage />
  </StrictMode>,
);
