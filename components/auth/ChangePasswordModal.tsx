import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { changePassword } = useAuth();
  const { showNotification } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('كلمتا المرور الجديدتان غير متطابقتين.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('يجب أن تكون كلمة المرور 6 أحرف على الأقل.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      handleClose();
    } catch (error) {
      // Notification is already shown in the auth context for wrong password
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="تغيير كلمة المرور">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="كلمة المرور الحالية" 
          name="currentPassword" 
          type="password" 
          value={currentPassword} 
          onChange={e => setCurrentPassword(e.target.value)} 
          required 
        />
        <Input 
          label="كلمة المرور الجديدة" 
          name="newPassword" 
          type="password" 
          value={newPassword} 
          onChange={e => setNewPassword(e.target.value)} 
          required 
        />
        <Input 
          label="تأكيد كلمة المرور الجديدة" 
          name="confirmPassword" 
          type="password" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          required 
        />
        <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>إلغاء</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'جارِ الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;