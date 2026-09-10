import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { developmentSessions } from './dev/session-fixtures.js';

function developmentSession() {
  return {
    name: 'sumi-development-session',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.method !== 'GET' || request.url?.split('?')[0] !== '/api/v1/auth/session') return next();
        const cookie = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('sumi_dev_session='));
        const selected = cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : 'administrator';
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.end(JSON.stringify(developmentSessions[selected] || developmentSessions.administrator));
      });
    },
  };
}

export default defineConfig({ plugins: [tailwindcss(), developmentSession()] });
