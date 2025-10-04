import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('[Main] Application starting...');
console.log('[Main] Environment:', {
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD,
  dev: import.meta.env.DEV,
});

const el = document.getElementById('root');
if (el) {
  console.log('[Main] Root element found, rendering app');
  const root = createRoot(el);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} else {
  console.error('[Main] Root element not found!');
  document.body.innerHTML = '<div style="padding: 40px; font-family: sans-serif;"><h1>⚠️ Critical Error</h1><p>Root element not found. The application cannot start.</p></div>';
}
