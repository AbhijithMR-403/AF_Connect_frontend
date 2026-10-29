import { config } from '../config/env.js';
import { AUTH_EXPIRED_EVENT, getCookie } from './http.js';

export class AuthError extends Error {
  constructor(message, { status, fieldErrors } = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors || {};
  }
}

const url = (path) => `${config.api.baseUrl}${path}`;

const ensureCsrf = async () => {
  if (!getCookie('csrftoken')) {
    await fetch(url('/auth/csrf/'), { credentials: 'include' });
  }
};

const post = async (path, body) => {
  await ensureCsrf();
  return fetch(url(path), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
    body: JSON.stringify(body || {}),
  });
};

const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const THROTTLED = 'Too many attempts, try again in a minute.';
const GENERIC = 'Something went wrong. Please try again.';

// Current user, or null when not signed in.
export const me = async () => {
  const response = await fetch(url('/auth/me/'), { credentials: 'include' });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new AuthError(GENERIC, { status: response.status });
  return response.json();
};

export const login = async (username, password) => {
  const response = await post('/auth/login/', { username, password });
  if (response.ok) return response.json();
  if (response.status === 429) throw new AuthError(THROTTLED, { status: 429 });
  if (response.status === 400) {
    const data = await readJson(response);
    throw new AuthError(data.detail || 'Invalid username or password.', { status: 400 });
  }
  throw new AuthError(GENERIC, { status: response.status });
};

export const logout = async () => {
  try {
    await post('/auth/logout/');
  } catch {
    // network error: the page reload that follows will re-check the session anyway
  }
};

export const changePassword = async ({ oldPassword, newPassword1, newPassword2 }) => {
  const response = await post('/auth/password-change/', {
    old_password: oldPassword,
    new_password1: newPassword1,
    new_password2: newPassword2,
  });
  if (response.ok) return;
  if (response.status === 401 || response.status === 403) {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    throw new AuthError('Your session has expired. Please sign in again.', { status: response.status });
  }
  if (response.status === 429) throw new AuthError(THROTTLED, { status: 429 });
  if (response.status === 400) {
    throw new AuthError('Please fix the errors below.', { status: 400, fieldErrors: await readJson(response) });
  }
  throw new AuthError(GENERIC, { status: response.status });
};
