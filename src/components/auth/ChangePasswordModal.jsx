import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { changePassword } from '../../services/auth';
import PasswordField from './PasswordField';
import { cardClass, errorClass, primaryButtonClass, secondaryButtonClass } from './styles';

const CLOSE_DELAY_MS = 1500;

const ChangePasswordModal = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !submitting && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  useEffect(() => {
    if (!done) return undefined;
    const timer = setTimeout(onClose, CLOSE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [done, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword1 !== newPassword2) {
      setFieldErrors({ new_password2: 'The two new passwords do not match.' });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await changePassword({ oldPassword, newPassword1, newPassword2 });
      setDone(true);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors);
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onMouseDown={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="change-password-title" className={`w-full max-w-sm p-6 ${cardClass}`}>
        <h2 id="change-password-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change password
        </h2>
        {done ? (
          <div role="status" className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" /> Password updated.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || fieldErrors.__all__) && (
              <div role="alert" className={errorClass}>
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{fieldErrors.__all__ ? fieldErrors.__all__.join(' ') : error}</span>
              </div>
            )}
            <PasswordField
              id="old-password" label="Current password" value={oldPassword} onChange={setOldPassword}
              autoComplete="current-password" error={fieldErrors.old_password} disabled={submitting} autoFocus
            />
            <PasswordField
              id="new-password1" label="New password" value={newPassword1} onChange={setNewPassword1}
              autoComplete="new-password" error={fieldErrors.new_password1} disabled={submitting}
            />
            <PasswordField
              id="new-password2" label="Confirm new password" value={newPassword2} onChange={setNewPassword2}
              autoComplete="new-password" error={fieldErrors.new_password2} disabled={submitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              At least 8 characters, not too common, not only numbers.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} disabled={submitting} className={secondaryButtonClass}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className={primaryButtonClass}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Update password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
