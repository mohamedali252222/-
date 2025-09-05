import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table, { type Column } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Item } from '../types';
import { CURRENCY } from '../constants';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/icons/IconComponents';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';

const DEFAULT_ITEM: Omit<Item, 'id'> = {
  name: '',
  code: '',
  unit: '',
  stock: 0,
  price: 0,
  lowStockThreshold: 10,
  category: '',
};

const ItemsPage: React.FC = () => {
  const { items, setItems, addTransaction } = useData();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<Omit<Item, 'id'>>({ ...DEFAULT_ITEM });
  const [receiveQuantity, setReceiveQuantity] = useState(0);

  useEffect(() => {
    if (currentItem) {
      setFormData(currentItem);
    } else {
      setFormData({ ...DEFAULT_ITEM });
    }
  }, [currentItem]);

  const handleOpenEditModal = (item: Item | null) => {
    setCurrentItem(item);
    setIsEditModalOpen(true);
  };
  
  const handleOpenReceiveModal = (item: Item) => {
    setCurrentItem(item);
    setReceiveQuantity(0);
    setIsReceiveModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsReceiveModalOpen(false);
    setCurrentItem(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItem) {
      // Edit
      setItems(items.map(item => item.id === currentItem.id ? { ...formData, id: currentItem.id, stock: item.stock } : item));
      showNotification('تم تعديل الصنف بنجاح!', 'success');
    } else {
      // Add
      const newItem: Item = { ...formData, id: Date.now().toString() };
      setItems([newItem, ...items]);
      showNotification('تم إضافة الصنف بنجاح!', 'success');
    }
    handleCloseModals();
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      setItems(items.filter(item => item.id !== id));
      showNotification('تم حذف الصنف بنجاح.', 'info');
    }
  };

  const handleReceiveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || receiveQuantity <= 0) {
        showNotification('الرجاء إدخال كمية صحيحة.', 'error');
        return;
    }
    addTransaction({
        id: Date.now().toString(),
        type: 'receipt',
        itemId: currentItem.id,
        quantity: receiveQuantity,
        date: new Date().toISOString().split('T')[0],
    });
    showNotification(`تم استلام ${receiveQuantity} ${currentItem.unit} من ${currentItem.name} بنجاح.`, 'success');
    handleCloseModals();
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Item>[] = [
    { header: 'كود الصنف', accessor: 'code' },
    { header: 'اسم الصنف', accessor: 'name' },
    { header: 'الفئة', accessor: 'category' },
    { header: 'الوحدة', accessor: 'unit' },
    { header: 'الرصيد', accessor: (item: Item) => (
      <span className={item.stock < item.lowStockThreshold ? 'text-red-500 font-bold' : ''}>
        {item.stock}
      </span>
    )},
    { header: 'السعر', accessor: (item: Item) => `${item.price.toLocaleString()} ${CURRENCY}` },
  ];

  const renderItemActions = (item: Item) => (
    <div className="flex space-x-2 space-x-reverse">
        <Button variant="secondary" onClick={() => handleOpenReceiveModal(item)}>استلام بضاعة</Button>
        <Button variant="secondary" onClick={() => handleOpenEditModal(item)}><PencilIcon className="w-4 h-4" /></Button>
        <Button variant="danger" onClick={() => handleDeleteItem(item.id)}><TrashIcon className="w-4 h-4" /></Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الأصناف</h1>
        <Button icon={PlusIcon} onClick={() => handleOpenEditModal(null)}>إضافة صنف جديد</Button>
      </div>
      
      <Card>
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="ابحث بكود أو اسم الصنف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <Table<Item>
          columns={columns}
          data={filteredItems}
          renderActions={renderItemActions}
        />
      </Card>

      <Modal isOpen={isEditModalOpen} onClose={handleCloseModals} title={currentItem ? 'تعديل صنف' : 'إضافة صنف جديد'}>
        <form onSubmit={handleSaveItem} className="space-y-4">
          <Input label="كود الصنف" name="code" value={formData.code} onChange={handleFormChange} required />
          <Input label="اسم الصنف" name="name" value={formData.name} onChange={handleFormChange} required />
          <Input label="الفئة" name="category" value={formData.category} onChange={handleFormChange} />
          <Input label="الوحدة" name="unit" value={formData.unit} onChange={handleFormChange} required />
          <Input label="الرصيد المتاح" name="stock" type="number" value={formData.stock} onChange={handleFormChange} disabled={!!currentItem} required />
          <Input label="حد المخزون المنخفض" name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleFormChange} required />
          <Input label="السعر" name="price" type="number" value={formData.price} onChange={handleFormChange} required />
          <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
            <Button type="button" variant="secondary" onClick={handleCloseModals}>إلغاء</Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isReceiveModalOpen} onClose={handleCloseModals} title={`استلام بضاعة لـ: ${currentItem?.name}`}>
        <form onSubmit={handleReceiveStock} className="space-y-4">
          <p>الرصيد الحالي: <span className="font-bold">{currentItem?.stock} {currentItem?.unit}</span></p>
          <Input label="الكمية المستلمة" name="quantity" type="number" value={receiveQuantity} onChange={(e) => setReceiveQuantity(parseFloat(e.target.value) || 0)} required />
          <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
            <Button type="button" variant="secondary" onClick={handleCloseModals}>إلغاء</Button>
            <Button type="submit">تأكيد الاستلام</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ItemsPage;
