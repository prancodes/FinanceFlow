// src/entry-server.jsx
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

/**
 * @param {string} url
 */
export function render(url) {
  const helmetContext = {};
  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>,
  );

  const { helmet } = helmetContext;
  const head = helmet
    ? `
      ${helmet.title.toString()}
      ${helmet.meta.toString()}
      ${helmet.link.toString()}
    `
    : "";

  return { html, head };
}
