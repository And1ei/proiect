import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted fonts (all subsets incl. latin-ext; unicode-range loads only what a page uses).
// Fraunces "full" files carry every axis: wght, opsz, SOFT, WONK.
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/dm-mono/400.css';
import './styles/global.css';
import App from './App';
import { SITE_STATS } from './content/stats';

// Read by the site check to compare every rendered count with the computed one
window.__siteStats = SITE_STATS;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
