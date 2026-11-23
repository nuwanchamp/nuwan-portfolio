import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Fonts used only on a canvas aren't fetched until something draws with them, which would be the
// first dust sample (too late: it'd sample the fallback font). Ask for them up front instead.
if (typeof document !== 'undefined' && document.fonts) {
  for (const font of [
    '600 64px Fraunces',
    '400 20px "Plus Jakarta Sans"',
    '600 20px "Plus Jakarta Sans"',
    '400 16px "JetBrains Mono"',
  ]) {
    document.fonts.load(font).catch(() => {});
  }
}

// Fetch the home scene's images while the logo intro plays, so home can form straight away.
for (const src of ['/nuwan.jpeg', '/icons/linkedin.png', '/icons/github.png', '/icons/whatsapp.png', '/icons/mail.svg']) {
  new Image().src = src;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
