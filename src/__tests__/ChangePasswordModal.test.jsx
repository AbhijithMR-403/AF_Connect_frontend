import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import { AuthError, changePassword } from '../services/auth';

vi.mock('../services/auth', async (orig) => ({ ...(await orig()), changePassword: vi.fn() }));

const fill = async (user, { old = 'old-pw', n1 = 'new-pw-123', n2 = 'new-pw-123' } = {}) => {
  await user.type(screen.getByLabelText('Current password'), old);
  await user.type(screen.getByLabelText('New password'), n1);
  await user.type(screen.getByLabelText('Confirm new password'), n2);
};

afterEach(() => vi.useRealTimers());

describe('ChangePasswordModal', () => {
  it('is an accessible dialog with the three fields and a policy hint', () => {
    render(<ChangePasswordModal onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Change password' })).toBeInTheDocument();
    expect(screen.getByLabelText('Current password')).toHaveFocus();
    expect(screen.getByLabelText('New password')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('blocks a mismatch on the client without calling the API', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordModal onClose={vi.fn()} />);
    await fill(user, { n2: 'different-123' });
    await user.click(screen.getByRole('button', { name: 'Update password' }));
    expect(screen.getByText('The two new passwords do not match.')).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('shows server errors under each field', async () => {
    changePassword.mockRejectedValue(new AuthError('Please fix the errors below.', {
      status: 400,
      fieldErrors: { old_password: ['Your old password was entered incorrectly.'], new_password2: ['This password is too common.'] },
    }));
    const user = userEvent.setup();
    render(<ChangePasswordModal onClose={vi.fn()} />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByText('Your old password was entered incorrectly.')).toBeInTheDocument();
    expect(screen.getByText('This password is too common.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Please fix the errors below.');
    expect(screen.getByLabelText('Current password')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'Update password' })).toBeEnabled();
  });

  it('shows non-field errors', async () => {
    changePassword.mockRejectedValue(new AuthError('x', { status: 400, fieldErrors: { __all__: ['Something global.'] } }));
    const user = userEvent.setup();
    render(<ChangePasswordModal onClose={vi.fn()} />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Something global.');
  });

  it('shows throttling / generic errors from the service', async () => {
    changePassword.mockRejectedValue(new AuthError('Too many attempts, try again in a minute.', { status: 429 }));
    const user = userEvent.setup();
    render(<ChangePasswordModal onClose={vi.fn()} />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/too many attempts/i);
  });

  it('confirms success, then closes itself after a moment', async () => {
    changePassword.mockResolvedValue();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ChangePasswordModal onClose={onClose} />);
    await fill(user);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await user.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Password updated.');
    expect(changePassword).toHaveBeenCalledWith({ oldPassword: 'old-pw', newPassword1: 'new-pw-123', newPassword2: 'new-pw-123' });
    expect(onClose).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(1600); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes with Cancel, Escape and a backdrop click', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<ChangePasswordModal onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.keyboard('{Escape}');
    await user.pointer({ keys: '[MouseLeft]', target: container.firstChild });
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('does not close on Escape or backdrop while saving', async () => {
    changePassword.mockReturnValue(new Promise(() => {}));
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<ChangePasswordModal onClose={onClose} />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Update password' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled());
    await user.keyboard('{Escape}');
    await user.pointer({ keys: '[MouseLeft]', target: container.firstChild });
    expect(onClose).not.toHaveBeenCalled();
  });
});
