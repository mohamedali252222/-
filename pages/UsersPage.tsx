import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table, { type Column } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { User, UserRole } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/icons/IconComponents';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';

const DEFAULT_USER: Omit<User, 'id' | 'password'> = {
  name: '',
  email: '',
  role: 'viewer',
};

export const roleNames: Record<UserRole, string> = {
  admin: 'مدير النظام',
  warehouse_manager: 'مدير المخزن',
  accountant: 'محاسب',
  project_supervisor: 'مشرف مشروع',
  viewer: 'مشاهد',
};

const UsersPage: React.FC = () => {
  const { users, setUsers } = useData();
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<User, 'id' | 'password'>>({ ...DEFAULT_USER });
  const [password, setPassword] = useState('');
  
  const handleOpenModal = (user: User | null) => {
    setCurrentItem(user);
    if (user) {
      const { password, ...userData } = user; // Exclude password from form
      setFormData(userData);
    } else {
      setFormData({ ...DEFAULT_USER });
    }
    setPassword(''); // Always reset password field on modal open
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItem) {
      // Editing existing user
      const originalUser = users.find(u => u.id === currentItem.id);
      if (!originalUser) return;

      const updatedUser: User = {
        ...originalUser,
        ...formData,
        role: formData.role as UserRole,
        // Only update password if a new one is provided
        password: password ? password : originalUser.password,
      };
      setUsers(users.map(u => (u.id === currentItem.id ? updatedUser : u)));
      showNotification('تم تعديل بيانات المستخدم بنجاح!', 'success');
    } else {
      // Adding new user
      if (!password) {
        showNotification('كلمة المرور مطلوبة للمستخدم الجديد.', 'error');
        return;
      }
      const newUser: User = {
        ...formData,
        id: Date.now().toString(),
        password: password,
        role: formData.role as UserRole,
      };
      setUsers([newUser, ...users]);
      showNotification('تم إضافة المستخدم بنجاح!', 'success');
    }
    handleCloseModal();
  };
  
  const handleDeleteUser = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      // Prevent deleting the last admin user maybe? For now, simple delete.
      if (users.length === 1) {
        showNotification('لا يمكن حذف المستخدم الوحيد في النظام.', 'error');
        return;
      }
      setUsers(users.filter(u => u.id !== id));
      showNotification('تم حذف المستخدم بنجاح.', 'info');
    }
  };

  const columns: Column<User>[] = [
    { header: 'اسم المستخدم', accessor: 'name' },
    { header: 'البريد الإلكتروني', accessor: 'email' },
    { header: 'الصلاحية', accessor: (user: User) => roleNames[user.role] },
  ];

  const renderUserActions = (user: User) => (
    <>
      <Button variant="secondary" onClick={() => handleOpenModal(user)}><PencilIcon className="w-4 h-4" /></Button>
      <Button variant="danger" onClick={() => handleDeleteUser(user.id)}><TrashIcon className="w-4 h-4" /></Button>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين والصلاحيات</h1>
        <Button icon={PlusIcon} onClick={() => handleOpenModal(null)}>إضافة مستخدم جديد</Button>
      </div>
      
      <Card>
        <Table<User>
          columns={columns}
          data={users}
          renderActions={renderUserActions}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}>
        <form onSubmit={handleSaveUser} className="space-y-4">
          <Input label="اسم المستخدم" name="name" value={formData.name} onChange={handleFormChange} required />
          <Input label="البريد الإلكتروني" name="email" type="email" value={formData.email} onChange={handleFormChange} required />
          <Input 
            label={currentItem ? 'كلمة مرور جديدة (اتركه فارغاً لعدم التغيير)' : 'كلمة المرور'}
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!currentItem} // Required only for new users
            autoComplete="new-password"
          />
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">الصلاحية</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {Object.entries(roleNames).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>إلغاء</Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;