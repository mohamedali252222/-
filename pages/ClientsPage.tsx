import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table, { type Column } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Client } from '../types';
import { CURRENCY } from '../constants';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/icons/IconComponents';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';

const DEFAULT_CLIENT: Omit<Client, 'id'> = {
  name: '',
  contactPerson: '',
  phone: '',
  balance: 0,
  paymentTerms: 'deferred',
};

const ClientsPage: React.FC = () => {
  const { clients, setClients } = useData();
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({ ...DEFAULT_CLIENT });
  
  useEffect(() => {
    if (currentItem) {
      setFormData(currentItem);
    } else {
      setFormData({ ...DEFAULT_CLIENT });
    }
  }, [currentItem]);
  
  const handleOpenModal = (client: Client | null) => {
    setCurrentItem(client);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItem) {
      setClients(clients.map(c => c.id === currentItem.id ? { ...formData, id: currentItem.id } : c));
      showNotification('تم تعديل بيانات العميل بنجاح!', 'success');
    } else {
      const newClient: Client = { ...formData, id: Date.now().toString(), paymentTerms: formData.paymentTerms as Client['paymentTerms'] };
      setClients([newClient, ...clients]);
      showNotification('تم إضافة العميل بنجاح!', 'success');
    }
    handleCloseModal();
  };
  
  const handleDeleteClient = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      setClients(clients.filter(c => c.id !== id));
      showNotification('تم حذف العميل بنجاح.', 'info');
    }
  };

  const columns: Column<Client>[] = [
    { header: 'اسم العميل', accessor: 'name' },
    { header: 'مسؤول التواصل', accessor: 'contactPerson' },
    { header: 'الهاتف', accessor: 'phone' },
    { header: 'شروط الدفع', accessor: (client: Client) => client.paymentTerms === 'immediate' ? 'فوري' : 'آجل' },
    { header: 'الرصيد المستحق', accessor: (client: Client) => `${client.balance.toLocaleString()} ${CURRENCY}` },
  ];

  const renderClientActions = (client: Client) => (
    <>
      <Button variant="secondary" onClick={() => handleOpenModal(client)}><PencilIcon className="w-4 h-4" /></Button>
      <Button variant="danger" onClick={() => handleDeleteClient(client.id)}><TrashIcon className="w-4 h-4" /></Button>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">إدارة العملاء</h1>
        <Button icon={PlusIcon} onClick={() => handleOpenModal(null)}>إضافة عميل جديد</Button>
      </div>
      
      <Card>
        <Table<Client>
          columns={columns}
          data={clients}
          renderActions={renderClientActions}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}>
        <form onSubmit={handleSaveClient} className="space-y-4">
          <Input label="اسم العميل" name="name" value={formData.name} onChange={handleFormChange} required />
          <Input label="مسؤول التواصل" name="contactPerson" value={formData.contactPerson} onChange={handleFormChange} required />
          <Input label="الهاتف" name="phone" value={formData.phone} onChange={handleFormChange} required />
          <Input label="الرصيد المستحق" name="balance" type="number" value={formData.balance} onChange={handleFormChange} required />
          <div>
            <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">شروط الدفع</label>
            <select
              id="paymentTerms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="deferred">آجل</option>
              <option value="immediate">فوري</option>
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

export default ClientsPage;
