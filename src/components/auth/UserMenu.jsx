import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, KeyRound, LogOut, Shield, User } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

const itemClass =
  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700';

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.username}`}
        className="w-full flex items-center justify-center gap-2 px-3 lg:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs lg:text-sm"
      >
        <User className="w-4 h-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
        <span className="hidden lg:inline font-medium text-gray-700 dark:text-gray-300 max-w-[10rem] truncate">{user.username}</span>
        <ChevronDown className="w-3 h-3 flex-shrink-0 text-gray-500" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-56 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.username}</p>
            {user.is_staff && <p className="text-xs text-gray-500 dark:text-gray-400">Staff</p>}
          </div>
          <button role="menuitem" type="button" className={itemClass} onClick={() => { setOpen(false); setChangingPassword(true); }}>
            <KeyRound className="w-4 h-4" /> Change password
          </button>
          {user.is_staff && (
            <a role="menuitem" href="/admin/" className={itemClass}>
              <Shield className="w-4 h-4" /> Admin panel
            </a>
          )}
          <button role="menuitem" type="button" className={itemClass} onClick={onLogout}>
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      )}

      {changingPassword && <ChangePasswordModal onClose={() => setChangingPassword(false)} />}
    </div>
  );
};

export default UserMenu;
