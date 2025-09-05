import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Item, Project, Client, Invoice, InventoryTransaction, CompanyProfile, Settings, User, InvoiceItem, Payment } from '../types';
import { mockItems, mockProjects, mockClients, mockInvoices, mockTransactions, mockCompanyProfile, mockSettings, mockUsers, mockPayments } from '../data/mockData';

interface IDataContext {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  transactions: InventoryTransaction[];
  addTransaction: (transaction: InventoryTransaction) => void;
  companyProfile: CompanyProfile;
  setCompanyProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addInvoice: (clientId: string, invoiceItems: InvoiceItem[], amountPaid: number) => void;
  addPaymentToInvoice: (invoiceId: string, amount: number) => void;
}

const DataContext = createContext<IDataContext | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>(mockItems);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(mockTransactions);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(mockCompanyProfile);
  const [settings, setSettings] = useState<Settings>(mockSettings);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const addTransaction = useCallback((transaction: InventoryTransaction) => {
    setTransactions(prev => [transaction, ...prev]);

    setItems(prevItems => prevItems.map(item => {
      if (item.id === transaction.itemId) {
        const newStock = transaction.type === 'receipt'
          ? item.stock + transaction.quantity
          : item.stock - transaction.quantity;
        return { ...item, stock: newStock };
      }
      return item;
    }));

    if (transaction.type === 'issue' && transaction.projectId) {
      const item = items.find(i => i.id === transaction.itemId);
      if (item) {
        const costToAdd = item.price * transaction.quantity;
        setProjects(prevProjects => prevProjects.map(project => {
          if (project.id === transaction.projectId) {
            return { ...project, cost: project.cost + costToAdd };
          }
          return project;
        }));
      }
    }
  }, [items]);

  const addInvoice = useCallback((clientId: string, invoiceItems: InvoiceItem[], amountPaid: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * (settings.vatPercentage / 100);
    const totalAmount = subtotal + vatAmount;

    const amountDue = totalAmount - amountPaid;
    let status: Invoice['status'] = 'unpaid';
    if (amountDue <= 0) {
        status = 'paid';
    } else if (amountPaid > 0) {
        status = 'partial';
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `${settings.invoicePrefix}${settings.nextInvoiceNumber.toString().padStart(3, '0')}`,
      clientId: client.id,
      clientName: client.name,
      date: new Date().toISOString().split('T')[0],
      status: status,
      items: invoiceItems,
      vat: vatAmount,
      totalAmount: totalAmount,
      amountPaid: amountPaid,
      amountDue: amountDue
    };
    setInvoices(prev => [newInvoice, ...prev]);

    if (amountPaid > 0) {
        const newPayment: Payment = {
            id: Date.now().toString(),
            invoiceId: newInvoice.id,
            amount: amountPaid,
            date: newInvoice.date
        };
        setPayments(prev => [newPayment, ...prev]);
    }

    invoiceItems.forEach(item => {
      addTransaction({
        id: `${Date.now().toString()}-${item.itemId}`,
        type: 'issue',
        itemId: item.itemId,
        quantity: item.quantity,
        date: newInvoice.date,
        invoiceId: newInvoice.id,
        notes: `Sale via invoice ${newInvoice.invoiceNumber}`,
      });
    });

    setClients(prevClients => prevClients.map(c => 
      c.id === clientId ? { ...c, balance: c.balance + amountDue } : c
    ));

    setSettings(prevSettings => ({
      ...prevSettings,
      nextInvoiceNumber: prevSettings.nextInvoiceNumber + 1
    }));
  }, [clients, settings, addTransaction]);

  const addPaymentToInvoice = useCallback((invoiceId: string, amount: number) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const newPayment: Payment = {
        id: Date.now().toString(),
        invoiceId: invoiceId,
        amount: amount,
        date: new Date().toISOString().split('T')[0]
    };
    setPayments(prev => [newPayment, ...prev]);

    setInvoices(prevInvoices => prevInvoices.map(inv => {
        if (inv.id === invoiceId) {
            const newAmountPaid = inv.amountPaid + amount;
            const newAmountDue = inv.amountDue - amount;
            let newStatus: Invoice['status'] = 'partial';
            if (newAmountDue <= 0) {
                newStatus = 'paid';
            }
            return { ...inv, amountPaid: newAmountPaid, amountDue: newAmountDue, status: newStatus };
        }
        return inv;
    }));

    setClients(prevClients => prevClients.map(c => 
        c.id === invoice.clientId ? { ...c, balance: c.balance - amount } : c
    ));
  }, [invoices]);

  const value = {
    items, setItems,
    projects, setProjects,
    clients, setClients,
    invoices, setInvoices,
    payments, setPayments,
    transactions, addTransaction,
    companyProfile, setCompanyProfile,
    settings, setSettings,
    users, setUsers,
    addInvoice,
    addPaymentToInvoice
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): IDataContext => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};