export interface Item {
  id: string;
  name: string;
  code: string;
  unit: string;
  stock: number;
  price: number;
  lowStockThreshold: number;
  category: string;
}

export interface Project {
  id: string;
  name: string;
  supervisor: string;
  status: 'active' | 'completed' | 'on-hold';
  cost: number;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  balance: number;
  paymentTerms: 'immediate' | 'deferred';
}

export interface InvoiceItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  status: 'paid' | 'unpaid' | 'partial';
  totalAmount: number;
  vat: number;
  items: InvoiceItem[];
  amountPaid: number;
  amountDue: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
}

export interface CompanyProfile {
  name: string;
  logoUrl: string;
  address: string;
  taxRegistration: string;
  contactInfo: string;
}

export interface Settings {
  vatPercentage: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
}

export interface InventoryTransaction {
  id: string;
  type: 'receipt' | 'issue';
  itemId: string;
  quantity: number;
  date: string;
  projectId?: string; // Optional: only for 'issue' type
  invoiceId?: string; // Optional: for sales issues
  notes?: string;
}

export type UserRole = 'admin' | 'warehouse_manager' | 'accountant' | 'project_supervisor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}