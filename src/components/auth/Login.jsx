import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { login } from '../../services/auth';
import PasswordField from './PasswordField';
import { cardClass, errorClass, inputClass, labelClass, primaryButtonClass } from './styles';

export const Brand = () => (
  <div className="flex flex-col items-center text-center mb-6">
    <img src="/logo 1.png" alt="AF Connect" className="h-16 w-auto object-contain mb-4" />
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AF Connect</h1>
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Regional reporting</p>
  </div>
);

const Login = ({ notice = '', onLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const user = await login(username.trim(), password);
      onLoggedIn(user);
    } catch (err) {
      setError(err.message);
      setPassword('');
      setSubmitting(false);
    }
  };

  const message = error || notice;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className={`w-full max-w-sm p-6 sm:p-8 ${cardClass}`}>
        <Brand />
        {message && (
          <div role="alert" className={errorClass}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className={labelClass}>Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              disabled={submitting}
              className={inputClass}
            />
          </div>
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={submitting}
          />
          <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Forgot your password? Ask an administrator.
        </p>
      </div>
    </div>
  );
};

export default Login;
