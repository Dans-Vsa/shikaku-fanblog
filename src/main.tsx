import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Font self-host (OFL) — hanya bobot yang dipakai.
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/permanent-marker/400.css';
import '@fontsource/reenie-beanie/400.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@/styles/globals.css';
import '@/lib/i18n';
import { setupGsap } from '@/lib/gsap-setup';
import App from '@/app/App';

setupGsap();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
