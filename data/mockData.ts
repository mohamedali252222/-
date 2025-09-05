import { Item, Project, Client, Invoice, CompanyProfile, Settings, InventoryTransaction, User, Payment } from '../types';
// FIX: Import the CURRENCY constant to be used in dashboardData.
import { CURRENCY } from '../constants';

export const mockItems: Item[] = [
  { id: '1', name: 'أسمنت بورتلاندي', code: 'CEM-001', unit: 'طن', stock: 150, price: 1800, lowStockThreshold: 20, category: 'مواد بناء' },
  { id: '2', name: 'حديد تسليح 16مم', code: 'STL-016', unit: 'طن', stock: 75, price: 25000, lowStockThreshold: 10, category: 'حديد وصلب' },
  { id: '3', name: 'رمل ناعم', code: 'SND-002', unit: 'م³', stock: 300, price: 120, lowStockThreshold: 50, category: 'مواد بناء' },
  { id: '4', name: 'مواسير PVC 4 بوصة', code: 'PVC-004', unit: 'متر', stock: 800, price: 45, lowStockThreshold: 100, category: 'سباكة' },
  { id: '5', name: 'دهان بلاستيك أبيض', code: 'PNT-001', unit: 'جالون', stock: 45, price: 350, lowStockThreshold: 10, category: 'دهانات' },
  { id: '6', name: 'سلك كهرباء 2مم', code: 'WIR-002', unit: 'لفة', stock: 120, price: 280, lowStockThreshold: 25, category: 'كهرباء' },
];

export const mockProjects: Project[] = [
  { id: '1', name: 'مشروع بناء برج النخيل', supervisor: 'م. أحمد علي', status: 'active', cost: 1250000 },
  { id: '2', name: 'تطوير طرق منطقة شرق القاهرة', supervisor: 'م. سارة محمود', status: 'active', cost: 780000 },
  { id: '3', name: 'صيانة مبنى الهيئة العامة', supervisor: 'م. خالد إبراهيم', status: 'completed', cost: 350000 },
];

export const mockClients: Client[] = [
  { id: '1', name: 'شركة المقاولون العرب', contactPerson: 'أ. محمد فتحي', phone: '01012345678', balance: 45000, paymentTerms: 'deferred' },
  { id: '2', name: 'شركة أوراسكوم للإنشاءات', contactPerson: 'أ. هدى كامل', phone: '01298765432', balance: 0, paymentTerms: 'immediate' },
  { id: '3', name: 'مؤسسة البناء الحديث', contactPerson: 'أ. عمر شريف', phone: '01122334455', balance: 12000, paymentTerms: 'deferred' },
];

export const mockInvoices: Invoice[] = [
    {
        id: '1', invoiceNumber: 'INV-2024-001', clientId: '1', clientName: 'شركة المقاولون العرب', date: '2024-05-15', status: 'partial', totalAmount: 51300, vat: 6300,
        amountPaid: 6300, amountDue: 45000,
        items: [
            { itemId: '1', itemName: 'أسمنت بورتلاندي', quantity: 10, unitPrice: 1800, total: 18000 },
            { itemId: '2', itemName: 'حديد تسليح 16مم', quantity: 1, unitPrice: 25000, total: 25000 },
        ]
    },
    {
        id: '2', invoiceNumber: 'INV-2024-002', clientId: '2', clientName: 'شركة أوراسكوم للإنشاءات', date: '2024-05-20', status: 'paid', totalAmount: 10260, vat: 1260,
        amountPaid: 10260, amountDue: 0,
        items: [
            { itemId: '4', itemName: 'مواسير PVC 4 بوصة', quantity: 200, unitPrice: 45, total: 9000 },
        ]
    },
    {
        id: '3', invoiceNumber: 'INV-2024-003', clientId: '3', clientName: 'مؤسسة البناء الحديث', date: '2024-06-01', status: 'unpaid', totalAmount: 17100, vat: 2100,
        amountPaid: 0, amountDue: 17100,
        items: [
            { itemId: '5', itemName: 'دهان بلاستيك أبيض', quantity: 20, unitPrice: 350, total: 7000 },
            { itemId: '6', itemName: 'سلك كهرباء 2مم', quantity: 30, unitPrice: 280, total: 8400 },
        ]
    },
];

export const mockPayments: Payment[] = [
    { id: '1', invoiceId: '1', amount: 6300, date: '2024-05-15' },
    { id: '2', invoiceId: '2', amount: 10260, date: '2024-05-20' },
];

export const mockTransactions: InventoryTransaction[] = [];

export const mockCompanyProfile: CompanyProfile = {
    name: 'شركة الميل للمقاولات',
    logoUrl: 'https://picsum.photos/seed/elmeel-logo/200/80',
    address: '123 شارع النيل، القاهرة، مصر',
    taxRegistration: '123-456-789',
    contactInfo: 'info@elmeel.com | 02-12345678'
};

export const mockSettings: Settings = {
    vatPercentage: 14,
    invoicePrefix: 'INV-2024-',
    nextInvoiceNumber: 4
};

export const mockUsers: User[] = [
  { id: '1', name: 'أحمد المصري', email: 'admin@elmeel.com', role: 'admin', password: 'password123' },
  { id: '2', name: 'سارة محمود', email: 'accountant@elmeel.com', role: 'accountant', password: 'password123' },
  { id: '3', name: 'خالد إبراهيم', email: 'warehouse@elmeel.com', role: 'warehouse_manager', password: 'password123' },
];

export const dashboardData = {
    kpis: [
        { title: 'إجمالي الأصناف', value: mockItems.length, change: '+2' },
        { title: 'مخزون منخفض', value: mockItems.filter(i => i.stock < i.lowStockThreshold).length, change: '+1' },
        { title: 'مستحقات العملاء', value: mockClients.reduce((sum, c) => sum + c.balance, 0).toLocaleString(), unit: CURRENCY },
        { title: 'حركات اليوم', value: 12, change: '-5%' },
    ],
    stockMovement: [
        { name: 'يناير', in: 400, out: 240 },
        { name: 'فبراير', in: 300, out: 139 },
        { name: 'مارس', in: 200, out: 980 },
        { name: 'أبريل', in: 278, out: 390 },
        { name: 'مايو', in: 189, out: 480 },
        { name: 'يونيو', in: 239, out: 380 },
    ],
    topItems: [
        { name: 'حديد تسليح 16مم', value: 450 },
        { name: 'أسمنت بورتلاندي', value: 320 },
        { name: 'مواسير PVC 4 بوصة', value: 250 },
        { name: 'رمل ناعم', value: 180 },
    ]
};