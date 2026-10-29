import { describe, it, expect, vi } from 'vitest';
import { apiFetch, getCookie, reloadPage, AUTH_EXPIRED_EVENT } from '../services/http';

const respond = (status) => vi.fn().mockResolvedValue({ status, ok: status < 400 });

describe('getCookie', () => {
  it('reads and decodes a cookie, null when absent', () => {
    document.cookie = 'csrftoken=abc%20123';
    expect(getCookie('csrftoken')).toBe('abc 123');
    expect(getCookie('missing')).toBeNull();
  });

  it('does not match on a name prefix', () => {
    document.cookie = 'csrftoken_other=zzz';
    document.cookie = 'csrftoken=real';
    expect(getCookie('csrftoken')).toBe('real');
  });
});

describe('apiFetch', () => {
  it('sends the session cookie and keeps caller options', async () => {
    global.fetch = respond(200);
    await apiFetch('/x', { method: 'GET', headers: { A: '1' } });
    expect(global.fetch).toHaveBeenCalledWith('/x', { credentials: 'include', method: 'GET', headers: { A: '1' } });
  });

  it.each([401, 403])('announces an expired session on %i', async (status) => {
    global.fetch = respond(status);
    const onExpired = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    const res = await apiFetch('/x');
    window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
    expect(res.status).toBe(status);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it.each([200, 404, 500])('stays quiet on %i', async (status) => {
    global.fetch = respond(status);
    const onExpired = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    await apiFetch('/x');
    window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
    expect(onExpired).not.toHaveBeenCalled();
  });
});

describe('reloadPage', () => {
  it('reloads the window', () => {
    const reload = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({ reload });
    reloadPage();
    expect(reload).toHaveBeenCalled();
  });
});
