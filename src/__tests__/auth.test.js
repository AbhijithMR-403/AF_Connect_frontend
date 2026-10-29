import { describe, it, expect, vi } from 'vitest';
import { AuthError, changePassword, login, logout, me } from '../services/auth';
import { AUTH_EXPIRED_EVENT } from '../services/http';

const json = (status, body = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
const calls = () => global.fetch.mock.calls;
const lastPost = () => calls().at(-1);

describe('csrf handling', () => {
  it('fetches a csrf cookie first when none is present, then echoes it in X-CSRFToken', async () => {
    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.endsWith('/auth/csrf/')) {
        document.cookie = 'csrftoken=tok123';
        return json(200);
      }
      return json(200, { username: 'alice', is_staff: false });
    });
    await login('alice', 'pw');
    expect(calls()[0][0]).toMatch(/\/auth\/csrf\/$/);
    const [url, init] = lastPost();
    expect(url).toMatch(/\/auth\/login\/$/);
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(init.headers['X-CSRFToken']).toBe('tok123');
    expect(JSON.parse(init.body)).toEqual({ username: 'alice', password: 'pw' });
  });

  it('skips the csrf round trip when the cookie already exists', async () => {
    document.cookie = 'csrftoken=have';
    global.fetch = vi.fn().mockResolvedValue(json(200, {}));
    await login('a', 'b');
    expect(calls()).toHaveLength(1);
  });
});

describe('login', () => {
  const withCookie = (response) => {
    document.cookie = 'csrftoken=t';
    global.fetch = vi.fn().mockResolvedValue(response);
  };

  it('returns the user on success', async () => {
    withCookie(json(200, { username: 'alice', is_staff: true }));
    await expect(login('alice', 'pw')).resolves.toEqual({ username: 'alice', is_staff: true });
  });

  it('uses the server message on 400', async () => {
    withCookie(json(400, { detail: 'Invalid username or password.' }));
    await expect(login('a', 'b')).rejects.toMatchObject({ message: 'Invalid username or password.', status: 400 });
  });

  it('falls back to a default message when the 400 body is not JSON', async () => {
    withCookie({ status: 400, ok: false, json: async () => { throw new Error('x'); } });
    await expect(login('a', 'b')).rejects.toThrow('Invalid username or password.');
  });

  it('explains throttling on 429', async () => {
    withCookie(json(429));
    await expect(login('a', 'b')).rejects.toThrow(/too many attempts/i);
  });

  it('gives a generic error otherwise', async () => {
    withCookie(json(500));
    const err = await login('a', 'b').catch((e) => e);
    expect(err).toBeInstanceOf(AuthError);
    expect(err.status).toBe(500);
  });
});

describe('me', () => {
  it('returns the user', async () => {
    global.fetch = vi.fn().mockResolvedValue(json(200, { username: 'a', is_staff: false }));
    await expect(me()).resolves.toEqual({ username: 'a', is_staff: false });
    expect(calls()[0][1]).toEqual({ credentials: 'include' });
  });

  it.each([401, 403])('returns null on %i', async (status) => {
    global.fetch = vi.fn().mockResolvedValue(json(status));
    await expect(me()).resolves.toBeNull();
  });

  it('throws on server errors so the app can show the login page', async () => {
    global.fetch = vi.fn().mockResolvedValue(json(500));
    await expect(me()).rejects.toBeInstanceOf(AuthError);
  });
});

describe('logout', () => {
  it('posts to /auth/logout/', async () => {
    document.cookie = 'csrftoken=t';
    global.fetch = vi.fn().mockResolvedValue(json(204));
    await logout();
    expect(lastPost()[0]).toMatch(/\/auth\/logout\/$/);
  });

  it('swallows network errors', async () => {
    document.cookie = 'csrftoken=t';
    global.fetch = vi.fn().mockRejectedValue(new TypeError('offline'));
    await expect(logout()).resolves.toBeUndefined();
  });
});

describe('changePassword', () => {
  const args = { oldPassword: 'o', newPassword1: 'n1', newPassword2: 'n2' };
  const withCookie = (response) => {
    document.cookie = 'csrftoken=t';
    global.fetch = vi.fn().mockResolvedValue(response);
  };

  it('maps fields to the Django form names', async () => {
    withCookie(json(200));
    await changePassword(args);
    expect(JSON.parse(lastPost()[1].body)).toEqual({ old_password: 'o', new_password1: 'n1', new_password2: 'n2' });
  });

  it('surfaces per-field errors on 400', async () => {
    withCookie(json(400, { old_password: ['wrong'], new_password2: ['too short'] }));
    const err = await changePassword(args).catch((e) => e);
    expect(err.fieldErrors).toEqual({ old_password: ['wrong'], new_password2: ['too short'] });
  });

  it('announces an expired session on 403', async () => {
    withCookie(json(403));
    const onExpired = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    await expect(changePassword(args)).rejects.toThrow(/session has expired/i);
    window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
    expect(onExpired).toHaveBeenCalled();
  });

  it('explains throttling and generic failures', async () => {
    withCookie(json(429));
    await expect(changePassword(args)).rejects.toThrow(/too many attempts/i);
    withCookie(json(500));
    await expect(changePassword(args)).rejects.toThrow(/something went wrong/i);
  });
});
