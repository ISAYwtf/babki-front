import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@/shared/lib/i18n/index';
import App from './app';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
