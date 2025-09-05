import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table, { type Column } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Project } from '../types';
import { CURRENCY } from '../constants';
import { PlusIcon, PencilIcon, TrashIcon, CubeIcon } from '../components/icons/IconComponents';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';

const DEFAULT_PROJECT: Omit<Project, 'id'> = {
  name: '',
  supervisor: '',
  status: 'active',
  cost: 0,
};

const ProjectsPage: React.FC = () => {
  const { projects, setProjects, items, addTransaction } = useData();
  const { showNotification } = useNotification();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  
  const [currentItem, setCurrentItem] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({ ...DEFAULT_PROJECT });

  const [issueData, setIssueData] = useState({ itemId: '', quantity: 0 });
  
  useEffect(() => {
    if (currentItem) {
      setFormData(currentItem);
    } else {
      setFormData({ ...DEFAULT_PROJECT });
    }
  }, [currentItem]);

  const handleOpenEditModal = (project: Project | null) => {
    setCurrentItem(project);
    setIsEditModalOpen(true);
  };

  const handleOpenIssueModal = (project: Project) => {
    setCurrentItem(project);
    setIssueData({ itemId: items[0]?.id || '', quantity: 0 });
    setIsIssueModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsIssueModalOpen(false);
    setCurrentItem(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({
      ...prev,
      [name]: isNumber ? parseFloat(value) || 0 : value,
    }));
  };

  const handleIssueFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setIssueData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItem) {
      setProjects(projects.map(p => p.id === currentItem.id ? { ...formData, id: currentItem.id, cost: p.cost } : p));
      showNotification('تم تعديل المشروع بنجاح!', 'success');
    } else {
      const newProject: Project = { ...formData, id: Date.now().toString(), status: formData.status as Project['status'] };
      setProjects([newProject, ...projects]);
      showNotification('تم إضافة المشروع بنجاح!', 'success');
    }
    handleCloseModals();
  };
  
  const handleDeleteProject = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      setProjects(projects.filter(p => p.id !== id));
      showNotification('تم حذف المشروع بنجاح.', 'info');
    }
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToIssue = items.find(i => i.id === issueData.itemId);

    if (!currentItem || !itemToIssue || issueData.quantity <= 0) {
        showNotification('بيانات غير صحيحة. الرجاء التأكد من الصنف والكمية.', 'error');
        return;
    }

    if (itemToIssue.stock < issueData.quantity) {
        showNotification(`الكمية المطلوبة (${issueData.quantity}) أكبر من الرصيد المتاح (${itemToIssue.stock}).`, 'error');
        return;
    }
    
    addTransaction({
        id: Date.now().toString(),
        type: 'issue',
        itemId: itemToIssue.id,
        quantity: issueData.quantity,
        projectId: currentItem.id,
        date: new Date().toISOString().split('T')[0],
    });

    showNotification(`تم صرف ${issueData.quantity} ${itemToIssue.unit} لمشروع ${currentItem.name}.`, 'success');
    handleCloseModals();
  };

  const columns: Column<Project>[] = [
    { header: 'اسم المشروع', accessor: 'name' },
    { header: 'المشرف', accessor: 'supervisor' },
    { header: 'الحالة', accessor: (project: Project) => {
      const statusMap = {
        active: { text: 'نشط', color: 'bg-green-100 text-green-800' },
        completed: { text: 'مكتمل', color: 'bg-blue-100 text-blue-800' },
        'on-hold': { text: 'معلق', color: 'bg-yellow-100 text-yellow-800' },
      };
      const status = statusMap[project.status];
      return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>{status.text}</span>;
    }},
    { header: 'التكلفة الإجمالية', accessor: (project: Project) => `${project.cost.toLocaleString()} ${CURRENCY}` },
  ];

  const renderProjectActions = (project: Project) => (
    <>
      <Button onClick={() => handleOpenIssueModal(project)}>صرف أصناف</Button>
      <Button variant="secondary" onClick={() => handleOpenEditModal(project)}><PencilIcon className="w-4 h-4" /></Button>
      <Button variant="danger" onClick={() => handleDeleteProject(project.id)}><TrashIcon className="w-4 h-4" /></Button>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المشاريع</h1>
        <Button icon={PlusIcon} onClick={() => handleOpenEditModal(null)}>إضافة مشروع جديد</Button>
      </div>
      
      <Card>
        <Table<Project>
          columns={columns}
          data={projects}
          renderActions={renderProjectActions}
        />
      </Card>

      <Modal isOpen={isEditModalOpen} onClose={handleCloseModals} title={currentItem ? 'تعديل مشروع' : 'إضافة مشروع جديد'}>
        <form onSubmit={handleSaveProject} className="space-y-4">
          <Input label="اسم المشروع" name="name" value={formData.name} onChange={handleFormChange} required />
          <Input label="المشرف" name="supervisor" value={formData.supervisor} onChange={handleFormChange} required />
          <Input label="التكلفة المبدئية" name="cost" type="number" value={formData.cost} onChange={handleFormChange} required disabled={!!currentItem} />
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="on-hold">معلق</option>
            </select>
          </div>
          <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
            <Button type="button" variant="secondary" onClick={handleCloseModals}>إلغاء</Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isIssueModalOpen} onClose={handleCloseModals} title={`صرف أصناف لمشروع: ${currentItem?.name}`}>
        <form onSubmit={handleIssueSubmit} className="space-y-4">
            <div>
                <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-1">الصنف</label>
                <select id="itemId" name="itemId" value={issueData.itemId} onChange={handleIssueFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    {items.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.name} (الرصيد: {item.stock})
                        </option>
                    ))}
                </select>
            </div>
            <Input label="الكمية المطلوبة" name="quantity" type="number" value={issueData.quantity} onChange={handleIssueFormChange} required />

            <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
                <Button type="button" variant="secondary" onClick={handleCloseModals}>إلغاء</Button>
                <Button type="submit">تأكيد الصرف</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
