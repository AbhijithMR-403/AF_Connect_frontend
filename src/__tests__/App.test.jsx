import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { login, logout, me } from '../services/auth';
import { AUTH_EXPIRED_EVENT, reloadPage } from '../services/http';

vi.mock('../services/auth', () => ({ me: vi.fn(), login: vi.fn(), logout: vi.fn(), changePassword: vi.fn() }));
vi.mock('../services/http', async (orig) => ({ ...(await orig()), reloadPage: vi.fn() }));
// Data-heavy dashboard parts are out of scope here; the header (with the user menu) stays real.
vi.mock('../components/FilterBar', () => ({ default: () => <div>filters</div> }));
vi.mock('../components/PipelineTabs', () => ({ default: ({ children }) => <div>tabs{children}</div> }));
vi.mock('../components/SalesPipeline', () => ({ default: () => <div>sales</div> }));
vi.mock('../components/OnboardingPipeline', () => ({ default: () => null }));
vi.mock('../components/DefaulterPipeline', () => ({ default: () => null }));
vi.mock('../components/RegionalView', () => ({ default: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('App auth gate', () => {
  it('shows a loading state, never the login form, while the session is checked', () => {
    me.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Username')).not.toBeInTheDocument();
  });

  it('shows the login screen when signed out', async () => {
    me.mockResolvedValue(null);
    render(<App />);
    expect(await screen.findByLabelText('Username')).toBeInTheDocument();
    expect(screen.queryByText('filters')).not.toBeInTheDocument();
  });

  it('treats a failing session check as signed out', async () => {
    me.mockRejectedValue(new Error('network'));
    render(<App />);
    expect(await screen.findByLabelText('Username')).toBeInTheDocument();
  });

  it('reloads after a successful sign-in so no stale dashboard state survives', async () => {
    me.mockResolvedValue(null);
    login.mockResolvedValue({ username: 'alice', is_staff: false });
    const user = userEvent.setup();
    render(<App />);
    await user.type(await screen.findByLabelText('Username'), 'alice');
    await user.type(screen.getByLabelText('Password'), 'pw');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(reloadPage).toHaveBeenCalled());
  });

  it('renders the dashboard with the account menu when signed in', async () => {
    me.mockResolvedValue({ username: 'alice', is_staff: false });
    render(<App />);
    expect(await screen.findByText('filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account menu for alice' })).toBeInTheDocument();
  });

  it('logs out via the menu and reloads', async () => {
    me.mockResolvedValue({ username: 'alice', is_staff: false });
    logout.mockResolvedValue();
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Account menu for alice' }));
    await user.click(screen.getByRole('menuitem', { name: /log out/i }));
    await waitFor(() => expect(reloadPage).toHaveBeenCalled());
    expect(logout).toHaveBeenCalled();
  });

  it('drops back to the login screen with a notice when the session expires', async () => {
    me.mockResolvedValue({ username: 'alice', is_staff: false });
    render(<App />);
    await screen.findByText('filters');
    act(() => { window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT)); });
    expect(await screen.findByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Session expired, please sign in again.');
    expect(screen.queryByText('filters')).not.toBeInTheDocument();
  });
});
