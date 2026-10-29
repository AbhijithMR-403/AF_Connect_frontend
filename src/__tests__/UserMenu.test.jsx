import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserMenu from '../components/auth/UserMenu';

vi.mock('../services/auth', async (orig) => ({ ...(await orig()), changePassword: vi.fn() }));

const open = async (user) => user.click(screen.getByRole('button', { name: /account menu for/i }));

describe('UserMenu', () => {
  it('is closed by default and toggles with the button', async () => {
    const user = userEvent.setup();
    render(<UserMenu user={{ username: 'alice', is_staff: false }} onLogout={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: 'Account menu for alice' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('hides the admin link and staff badge for regular users', async () => {
    const user = userEvent.setup();
    render(<UserMenu user={{ username: 'alice', is_staff: false }} onLogout={vi.fn()} />);
    await open(user);
    expect(screen.queryByRole('menuitem', { name: /admin panel/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Staff')).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /change password/i })).toBeInTheDocument();
  });

  it('shows the admin link and staff badge for staff', async () => {
    const user = userEvent.setup();
    render(<UserMenu user={{ username: 'bob', is_staff: true }} onLogout={vi.fn()} />);
    await open(user);
    expect(screen.getByRole('menuitem', { name: /admin panel/i })).toHaveAttribute('href', '/admin/');
    expect(screen.getByText('Staff')).toBeInTheDocument();
  });

  it('closes on Escape and on an outside click', async () => {
    const user = userEvent.setup();
    render(<div><span>outside</span><UserMenu user={{ username: 'alice', is_staff: false }} onLogout={vi.fn()} /></div>);
    await open(user);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await open(user);
    await user.click(screen.getByText('outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('calls onLogout', async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup();
    render(<UserMenu user={{ username: 'alice', is_staff: false }} onLogout={onLogout} />);
    await open(user);
    await user.click(screen.getByRole('menuitem', { name: /log out/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('opens the change-password dialog and closes the menu', async () => {
    const user = userEvent.setup();
    render(<UserMenu user={{ username: 'alice', is_staff: false }} onLogout={vi.fn()} />);
    await open(user);
    await user.click(screen.getByRole('menuitem', { name: /change password/i }));
    expect(screen.getByRole('dialog', { name: 'Change password' })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
