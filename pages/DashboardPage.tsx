import React from 'react';
import Card from '../components/ui/Card';
import { dashboardData } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useData } from '../contexts/DataContext';
import { CURRENCY } from '../constants';

const KPICard: React.FC<{ title: string; value: string | number; change?: string; unit?: string }> = ({ title, value, change, unit }) => (
  <Card>
    <h4 className="text-gray-500 font-medium">{title}</h4>
    <div className="flex items-baseline justify-between mt-2">
      <p className="text-3xl font-bold text-gray-800">{value} {unit}</p>
      {change && <span className={`text-sm font-semibold ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</span>}
    </div>
  </Card>
);

const DashboardPage: React.FC = () => {
  const { items, clients } = useData();

  // FIX: Add placeholder 'change' properties and an explicit type to the `kpis`
  // array to match the KPICard component's props and resolve the TypeScript error.
  const kpis: { title: string; value: string | number; change?: string; unit?: string }[] = [
    { title: 'إجمالي الأصناف', value: items.length, change: '+2' },
    { title: 'مخزون منخفض', value: items.filter(i => i.stock < i.lowStockThreshold).length, change: '+1' },
    { title: 'مستحقات العملاء', value: clients.reduce((sum, c) => sum + c.balance, 0).toLocaleString(), unit: CURRENCY },
    { title: 'حركات اليوم', value: 12, change: '-5%' }, // This would come from transactions data
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم الرئيسية</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(kpi => (
          <KPICard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} unit={kpi.unit} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="حركة المخزون (آخر 6 أشهر)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.stockMovement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="in" name="وارد" stroke="#3b82f6" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="out" name="صادر" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="الأصناف الأكثر حركة">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.topItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#374151' }}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="الكمية" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
