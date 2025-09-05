import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table, { type Column } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { Invoice, InvoiceItem, Client, Item } from '../types';
import { CURRENCY } from '../constants';
import { PlusIcon, DocumentTextIcon, TrashIcon } from '../components/icons/IconComponents';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import Input from '../components/ui/Input';

const InvoicesPage: React.FC = () => {
  const { invoices, setInvoices, clients, items, addInvoice, companyProfile, addPaymentToInvoice } = useData();
  const { showNotification } = useNotification();
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [newInvoiceData, setNewInvoiceData] = useState<{clientId: string, items: InvoiceItem[], amountPaid: number}>({ clientId: '', items: [], amountPaid: 0 });
  const [newItemEntry, setNewItemEntry] = useState<{itemId: string, quantity: number}>({ itemId: '', quantity: 1 });

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setNewInvoiceData({ clientId: clients[0]?.id || '', items: [], amountPaid: 0 });
    setNewItemEntry({ itemId: items[0]?.id || '', quantity: 1 });
    setIsAddModalOpen(true);
  };
  
  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.amountDue); // Pre-fill with remaining amount
    setIsPaymentModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsAddModalOpen(false);
    setIsPaymentModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذه العملية وقد تؤثر على أرصدة المخزون والعملاء.')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
      showNotification('تم حذف الفاتورة بنجاح.', 'info');
    }
  };
  
  const handlePrint = () => {
    const printArea = document.getElementById('invoice-to-print');
    if (!printArea) {
        showNotification('لا يمكن العثور على محتوى الطباعة.', 'error');
        return;
    }

    const printContent = printArea.innerHTML;
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
        showNotification('فشل في تهيئة نافذة الطباعة.', 'error');
        document.body.removeChild(iframe);
        return;
    }

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>طباعة فاتورة</title>
          <meta charset="UTF-8">
    `);
    
    Array.from(document.styleSheets).forEach(styleSheet => {
      if (styleSheet.href) {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = styleSheet.href;
        doc.head.appendChild(link);
      }
    });

    doc.write(`
          <style>
            html[dir="rtl"] { direction: rtl; }
            body { font-family: 'Cairo', sans-serif; -webkit-print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            .invoice-print-area {
                padding: 1.5cm;
                box-sizing: border-box;
                width: 100%;
                height: 100%;
            }
          </style>
        </head>
        <body dir="rtl">
          <div class="invoice-print-area">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    doc.close();
    
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      }, 250); // A small delay to ensure styles are fully loaded
    };
  };

  const handleAddItemToInvoice = () => {
    const item = items.find(i => i.id === newItemEntry.itemId);
    if (!item) {
        showNotification('الرجاء اختيار صنف صحيح.', 'error');
        return;
    }
    if (newItemEntry.quantity <= 0) {
        showNotification('الرجاء إدخال كمية صحيحة.', 'error');
        return;
    }
    if (item.stock < newItemEntry.quantity) {
        showNotification(`الكمية المطلوبة (${newItemEntry.quantity}) أكبر من الرصيد المتاح (${item.stock}).`, 'error');
        return;
    }

    const existingItemIndex = newInvoiceData.items.findIndex(i => i.itemId === item.id);
    if (existingItemIndex > -1) {
      const updatedItems = [...newInvoiceData.items];
      updatedItems[existingItemIndex].quantity += newItemEntry.quantity;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setNewInvoiceData(prev => ({...prev, items: updatedItems}));
    } else {
      const invoiceItem: InvoiceItem = {
        itemId: item.id,
        itemName: item.name,
        quantity: newItemEntry.quantity,
        unitPrice: item.price,
        total: item.price * newItemEntry.quantity,
      };
      setNewInvoiceData(prev => ({ ...prev, items: [...prev.items, invoiceItem]}));
    }
  };

  const handleRemoveItemFromInvoice = (itemId: string) => {
    setNewInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.itemId !== itemId)
    }));
  };

  const handleSaveInvoice = () => {
    if (!newInvoiceData.clientId) {
      showNotification('الرجاء اختيار عميل.', 'error');
      return;
    }
    if (newInvoiceData.items.length === 0) {
      showNotification('يجب إضافة صنف واحد على الأقل للفاتورة.', 'error');
      return;
    }
    
    addInvoice(newInvoiceData.clientId, newInvoiceData.items, newInvoiceData.amountPaid);
    showNotification('تم إصدار الفاتورة بنجاح!', 'success');
    handleCloseModals();
  };
  
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (paymentAmount <= 0 || paymentAmount > selectedInvoice.amountDue) {
      showNotification(`الرجاء إدخال مبلغ صحيح (بين 0 و ${selectedInvoice.amountDue}).`, 'error');
      return;
    }
    addPaymentToInvoice(selectedInvoice.id, paymentAmount);
    showNotification('تم تسجيل الدفعة بنجاح.', 'success');
    handleCloseModals();
  };
  
  const calculatedTotals = useMemo(() => {
    const subtotal = newInvoiceData.items.reduce((sum, item) => sum + item.total, 0);
    return { subtotal };
  }, [newInvoiceData.items]);

  const columns: Column<Invoice>[] = [
    { header: 'رقم الفاتورة', accessor: 'invoiceNumber' },
    { header: 'اسم العميل', accessor: 'clientName' },
    { header: 'تاريخ الفاتورة', accessor: 'date' },
    { header: 'الحالة', accessor: (invoice: Invoice) => {
      const statusMap = {
        paid: { text: 'مدفوعة', color: 'bg-green-100 text-green-800' },
        unpaid: { text: 'غير مدفوعة', color: 'bg-red-100 text-red-800' },
        partial: { text: 'مدفوعة جزئياً', color: 'bg-yellow-100 text-yellow-800' },
      };
      const status = statusMap[invoice.status];
      return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>{status.text}</span>;
    }},
    { header: 'الإجمالي', accessor: (invoice: Invoice) => `${invoice.totalAmount.toLocaleString()} ${CURRENCY}` },
    { header: 'المتبقي', accessor: (invoice: Invoice) => `${invoice.amountDue.toLocaleString()} ${CURRENCY}` },
  ];

  const renderInvoiceActions = (invoice: Invoice) => (
    <div className="flex space-x-2 space-x-reverse">
      {invoice.status !== 'paid' && <Button onClick={() => handleOpenPaymentModal(invoice)}>تسجيل دفعة</Button>}
      <Button variant="secondary" onClick={() => handleViewInvoice(invoice)}><DocumentTextIcon className="w-4 h-4" /></Button>
      <Button variant="danger" onClick={() => handleDeleteInvoice(invoice.id)}><TrashIcon className="w-4 h-4" /></Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الفواتير</h1>
        <Button icon={PlusIcon} onClick={handleOpenAddModal}>إصدار فاتورة جديدة</Button>
      </div>
      
      <Card>
        <Table<Invoice>
          columns={columns}
          data={invoices}
          renderActions={renderInvoiceActions}
        />
      </Card>
      
      {/* View Invoice Modal */}
      {selectedInvoice && (
        <Modal isOpen={isViewModalOpen} onClose={handleCloseModals} title={`تفاصيل الفاتورة: ${selectedInvoice.invoiceNumber}`}>
          <div id="invoice-to-print">
            <div className="p-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">{companyProfile.name}</h2>
                        <p className="text-sm text-gray-600">{companyProfile.address}</p>
                        <p className="text-sm text-gray-600">{companyProfile.contactInfo}</p>
                    </div>
                    <img src={companyProfile.logoUrl} alt="Company Logo" className="h-16 object-contain"/>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                        <h3 className="font-bold mb-1">فاتورة إلى:</h3>
                        <p>{selectedInvoice.clientName}</p>
                    </div>
                    <div className="text-left">
                        <p><strong>رقم الفاتورة:</strong> {selectedInvoice.invoiceNumber}</p>
                        <p><strong>التاريخ:</strong> {selectedInvoice.date}</p>
                        <p><strong>رقم التسجيل الضريبي:</strong> {companyProfile.taxRegistration}</p>
                    </div>
                </div>

                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-100">
                    <tr className="border-b">
                      <th className="py-2 px-2 font-semibold">الصنف</th>
                      <th className="font-semibold">الكمية</th>
                      <th className="font-semibold">سعر الوحدة</th>
                      <th className="text-left px-2 font-semibold">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map(item => (
                      <tr key={item.itemId} className="border-b">
                        <td className="py-2 px-2">{item.itemName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unitPrice.toLocaleString()}</td>
                        <td className="text-left px-2">{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mt-6">
                    <div className="w-full max-w-sm text-sm">
                        <div className="flex justify-between py-1">
                            <span>المجموع الفرعي:</span>
                            <span>{(selectedInvoice.totalAmount - selectedInvoice.vat).toLocaleString()} {CURRENCY}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span>ضريبة القيمة المضافة:</span>
                            <span>{selectedInvoice.vat.toLocaleString()} {CURRENCY}</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold text-base border-t mt-2">
                            <span>الإجمالي:</span>
                            <span>{selectedInvoice.totalAmount.toLocaleString()} {CURRENCY}</span>
                        </div>
                        <div className="flex justify-between py-1 text-blue-600">
                            <span>المدفوع:</span>
                            <span>{selectedInvoice.amountPaid.toLocaleString()} {CURRENCY}</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold text-lg text-red-600 bg-red-50 p-2 rounded-md">
                            <span>المتبقي:</span>
                            <span>{selectedInvoice.amountDue.toLocaleString()} {CURRENCY}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-xs text-gray-500 text-center">
                  <p>شكراً لتعاملكم معنا.</p>
                </div>
              </div>
          </div>
          <div className="flex justify-end pt-4 space-x-2 space-x-reverse no-print border-t p-4 bg-gray-50 rounded-b-lg">
              <Button onClick={handlePrint} variant="primary">طباعة</Button>
              <Button onClick={handleCloseModals} variant="secondary">إغلاق</Button>
          </div>
        </Modal>
      )}

      {/* Add New Invoice Modal */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseModals} title="إصدار فاتورة جديدة">
        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العميل</label>
              <select 
                value={newInvoiceData.clientId} 
                onChange={(e) => setNewInvoiceData(prev => ({...prev, clientId: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="p-4 border rounded-md space-y-3 bg-gray-50">
                <h4 className="font-semibold">إضافة صنف للفاتورة</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">الصنف</label>
                        <select 
                          value={newItemEntry.itemId} 
                          onChange={(e) => setNewItemEntry(prev => ({...prev, itemId: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                          {items.map(i => <option key={i.id} value={i.id}>{i.name} (الرصيد: {i.stock})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={newItemEntry.quantity}
                          onChange={(e) => setNewItemEntry(prev => ({...prev, quantity: parseInt(e.target.value) || 1}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                </div>
                <Button onClick={handleAddItemToInvoice} className="w-full">إضافة الصنف</Button>
            </div>

            {newInvoiceData.items.length > 0 && (
                <div className="border rounded-md">
                    <table className="w-full text-sm text-right">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-2 font-semibold">الصنف</th><th className="font-semibold">الكمية</th><th className="font-semibold">السعر</th><th className="font-semibold">الإجمالي</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {newInvoiceData.items.map(item => (
                                <tr key={item.itemId} className="border-b">
                                    <td className="p-2">{item.itemName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unitPrice.toLocaleString()}</td>
                                    <td>{item.total.toLocaleString()}</td>
                                    <td>
                                      <button onClick={() => handleRemoveItemFromInvoice(item.itemId)} className="text-red-500 p-1 hover:text-red-700">
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-2 text-left font-bold bg-gray-50">
                      الإجمالي الفرعي: {calculatedTotals.subtotal.toLocaleString()} {CURRENCY}
                    </div>
                </div>
            )}
            
            <Input
              label="المبلغ المدفوع مقدمًا"
              name="amountPaid"
              type="number"
              value={newInvoiceData.amountPaid}
              onChange={(e) => setNewInvoiceData(prev => ({...prev, amountPaid: parseFloat(e.target.value) || 0}))}
            />

            <div className="flex justify-end pt-4 space-x-2 space-x-reverse border-t mt-4">
                <Button onClick={handleCloseModals} variant="secondary">إلغاء</Button>
                <Button onClick={handleSaveInvoice} variant="primary">حفظ وإصدار الفاتورة</Button>
            </div>
        </div>
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={handleCloseModals} title={`تسجيل دفعة للفاتورة: ${selectedInvoice?.invoiceNumber}`}>
        <form onSubmit={handleSavePayment} className="space-y-4">
            <p>المبلغ المتبقي: <strong className="text-red-600">{selectedInvoice?.amountDue.toLocaleString()} {CURRENCY}</strong></p>
            <Input 
                label="قيمة الدفعة"
                name="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                max={selectedInvoice?.amountDue}
                required
            />
             <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
                <Button type="button" variant="secondary" onClick={handleCloseModals}>إلغاء</Button>
                <Button type="submit">تأكيد الدفع</Button>
            </div>
        </form>
      </Modal>

    </div>
  );
};

export default InvoicesPage;