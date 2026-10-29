import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../components/auth/Login';
import { login } from '../services/auth';

vi.mock('../services/auth', () => ({ login: vi.fn() }));

const fill = async (user, name = 'alice', pw = 'secret') => {
  await user.type(screen.getByLabelText('Username'), name);
  await user.type(screen.getByLabelText('Password'), pw);
};

describe('Login', () => {
  it('shows the brand, empty fields and a hint instead of a reset link', () => {
    render(<Login onLoggedIn={vi.fn()} />);
    expect(screen.getByRole('img', { name: 'AF Connect' })).toHaveAttribute('src', '/logo 1.png');
    expect(screen.getByRole('heading', { name: 'AF Connect' })).toBeInTheDocument();
    expect(screen.getByText('Regional reporting')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toHaveFocus();
    expect(screen.getByLabelText('Username')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByText(/ask an administrator/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('signs in on submit (trimming the username) and reports the user', async () => {
    login.mockResolvedValue({ username: 'alice', is_staff: false });
    const onLoggedIn = vi.fn();
    const user = userEvent.setup();
    render(<Login onLoggedIn={onLoggedIn} />);
    await fill(user, '  alice  ');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(onLoggedIn).toHaveBeenCalledWith({ username: 'alice', is_staff: false }));
    expect(login).toHaveBeenCalledWith('alice', 'secret');
  });

  it('submits with Enter', async () => {
    login.mockResolvedValue({ username: 'alice' });
    const onLoggedIn = vi.fn();
    const user = userEvent.setup();
    render(<Login onLoggedIn={onLoggedIn} />);
    await fill(user);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(onLoggedIn).toHaveBeenCalled());
  });

  it('disables the form while signing in', async () => {
    let finish;
    login.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const user = userEvent.setup();
    render(<Login onLoggedIn={vi.fn()} />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    expect(screen.getByLabelText('Username')).toBeDisabled();
    finish({ username: 'alice' });
  });

  it('shows the error in an alert, clears the password and re-enables the form', async () => {
    login.mockRejectedValue(new Error('Invalid username or password.'));
    const onLoggedIn = vi.fn();
    const user = userEvent.setup();
    render(<Login onLoggedIn={onLoggedIn} />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password.');
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('Username')).toHaveValue('alice');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    expect(onLoggedIn).not.toHaveBeenCalled();
  });

  it('shows the session-expired notice', () => {
    render(<Login notice="Session expired, please sign in again." onLoggedIn={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Session expired, please sign in again.');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<Login onLoggedIn={vi.fn()} />);
    const field = screen.getByLabelText('Password');
    expect(field).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(field).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(field).toHaveAttribute('type', 'password');
  });
});
