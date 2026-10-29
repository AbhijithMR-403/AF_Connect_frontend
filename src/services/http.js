// Shared fetch helpers. Auth is a Django session cookie (same origin as /admin/), so no tokens here.
export const AUTH_EXPIRED_EVENT = 'auth:expired';

export const getCookie = (name) => {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

// Wrapper for data requests: sends the session cookie and tells the app when it is gone.
export const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, { credentials: 'include', ...options });
  if (response.status === 401 || response.status === 403) {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  return response;
};

// Wrapped so tests can stub it (jsdom cannot reload).
export const reloadPage = () => window.location.reload();
