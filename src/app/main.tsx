import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'normalize.css/normalize.css';
import '@/shared/styles/font-faces.css';
import '@/shared/styles/reset.css';
import './index.css';
import '@/shared/lib/i18n/index';
import App from './app';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
