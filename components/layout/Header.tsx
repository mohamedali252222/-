import React, { useState } from 'react';
import { UserCircleIcon, LogoutIcon, KeyIcon } from '../icons/IconComponents';
import { useAuth } from '../../contexts/AuthContext';
import { roleNames } from '../../pages/UsersPage';
import ChangePasswordModal from '../auth/ChangePasswordModal';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null; // Don't render header if not logged in
  }

  return (
    <>
      <header className="h-20 bg-white shadow-md flex items-center justify-between px-6 no-print">
        <div>
          {/* Placeholder for search bar or page title */}
        </div>
        <div className="flex items-center">
          <div className="text-end me-4">
            <p className="font-semibold text-gray-700">{user.name}</p>
            <p className="text-sm text-gray-500">{roleNames[user.role]}</p>
          </div>
          <UserCircleIcon className="w-10 h-10 text-gray-400" />
          <button
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="p-2 me-2 text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="تغيير كلمة المرور"
          >
            <KeyIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 me-4 text-gray-500 hover:text-red-600 transition-colors"
            aria-label="تسجيل الخروج"
          >
            <LogoutIcon className="w-6 h-6" />
          </button>
        </div>
      </header>
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
};

export default Header;