import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Node >= 22 ships its own global `localStorage` that has no methods unless started with
// --localstorage-file; a late React effect can hit it after jsdom is gone. Use a plain in-memory one.
const memoryStorage = () => {
  let data = {};
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: (key) => { delete data[key]; },
    clear: () => { data = {}; },
  };
};
const storage = memoryStorage();
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true, writable: true });
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true, writable: true });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  storage.clear();
  document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});
