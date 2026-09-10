import { PERMISSIONS } from './permissions.js';

const env = import.meta.env || {};
const API_BASE_URL = (env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const SESSION_PATH = env.VITE_AUTH_SESSION_PATH || '/api/v1/auth/session';

const publicSession = () => ({
  authenticated: false,
  user: null,
  roles: [],
  grants: [{ permission: PERMISSIONS.VIEW_PUBLISHED_PLAN, scope: { type: 'global' } }],
});

export function normalizeSession(payload) {
  if (!payload || payload.authenticated !== true) return publicSession();
  if (!payload.user?.id || !Array.isArray(payload.roles) || !Array.isArray(payload.grants)) throw new Error('Resposta de sessão inválida.');
  return {
    authenticated: true,
    user: {
      id: String(payload.user.id),
      name: payload.user.name ? String(payload.user.name) : '',
      email: payload.user.email ? String(payload.user.email) : '',
    },
    roles: payload.roles.map((role) => ({ code: String(role.code), name: String(role.name || role.code) })),
    grants: payload.grants.map((grant) => ({ permission: String(grant.permission), scope: grant.scope || { type: 'global' } })),
  };
}

async function loadApiSession({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${SESSION_PATH}`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (response.status === 401) return publicSession();
  if (!response.ok) throw new Error(`Não foi possível carregar a sessão (${response.status}).`);
  return normalizeSession(await response.json());
}

export function createSessionClient() {
  return {
    load: loadApiSession,
  };
}
