import React from 'react';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import { InventoryTransaction } from '../types';
import { useData } from '../contexts/DataContext';

const InventoryTransactionsPage: React.FC = () => {
  const { transactions, items, projects, invoices, clients } = useData();

  const dataWithDetails = transactions.map(t => {
    const item = items.find(i => i.id === t.itemId);
    let beneficiary = 'N/A';
    let typeText = 'استلام بضاعة';
    let typeColor = 'text-green-600';

    if (t.type === 'issue') {
      typeText = 'صرف';
      typeColor = 'text-red-600';
      if (t.projectId) {
        const project = projects.find(p => p.id === t.projectId);
        beneficiary = `مشروع: ${project?.name || 'غير معروف'}`;
      } else if (t.invoiceId) {
        const invoice = invoices.find(inv => inv.id === t.invoiceId);
        const client = clients.find(c => c.id === invoice?.clientId);
        beneficiary = `عميل: ${client?.name || 'غير معروف'} (فاتورة ${invoice?.invoiceNumber})`;
      }
    }

    return {
      ...t,
      itemName: item?.name || 'غير معروف',
      beneficiary,
      typeText,
      typeColor
    };
  });

  const columns: Column<typeof dataWithDetails[0]>[] = [
    { header: 'التاريخ', accessor: 'date' },
    { header: 'نوع الحركة', accessor: (t) => <span className={`font-semibold ${t.typeColor}`}>{t.typeText}</span> },
    { header: 'الصنف', accessor: 'itemName' },
    { header: 'الكمية', accessor: 'quantity' },
    { header: 'الجهة المستفيدة', accessor: 'beneficiary' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">سجل حركات المخزن</h1>
      
      <Card>
        <Table<typeof dataWithDetails[0]>
          columns={columns}
          data={dataWithDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
        />
      </Card>
    </div>
  );
};

export default InventoryTransactionsPage;