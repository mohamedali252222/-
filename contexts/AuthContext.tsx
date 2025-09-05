import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { useData } from './DataContext';
import { useNotification } from './NotificationContext';

interface IAuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const { users, setUsers } = useData();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('authUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('authUser');
    }
  }, [user]);
  
  const login = async (email: string, password: string): Promise<void> => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser && foundUser.password === password) {
      setUser(foundUser);
      showNotification(`مرحباً بك، ${foundUser.name}`, 'success');
    } else {
      showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'error');
      throw new Error('Authentication failed');
    }
  };

  const logout = () => {
    setUser(null);
    showNotification('تم تسجيل الخروج بنجاح.', 'info');
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) {
      throw new Error("No user is currently logged in.");
    }
    
    // Find the latest user data from the source of truth
    const currentUserFromData = users.find(u => u.id === user.id);
    
    if (!currentUserFromData || currentUserFromData.password !== currentPassword) {
      showNotification('كلمة المرور الحالية غير صحيحة.', 'error');
      throw new Error("Incorrect current password.");
    }

    // Update the password in the main users array
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, password: newPassword } : u
    );
    setUsers(updatedUsers);

    // Update the password in the current session state
    const updatedCurrentUser = { ...user, password: newPassword };
    setUser(updatedCurrentUser);
    
    showNotification('تم تغيير كلمة المرور بنجاح!', 'success');
  };


  const value = { user, login, logout, changePassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};