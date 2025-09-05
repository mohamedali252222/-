import { HomeIcon, CubeIcon, FolderIcon, UserGroupIcon, DocumentTextIcon, CogIcon, SwitchHorizontalIcon, UsersIcon } from './components/icons/IconComponents';
import { UserRole } from './types';

export const NAV_LINKS = [
  { name: 'الرئيسية', href: '/dashboard', icon: HomeIcon, requiredRole: ['admin', 'warehouse_manager', 'accountant', 'project_supervisor', 'viewer'] },
  { name: 'الأصناف', href: '/items', icon: CubeIcon, requiredRole: ['admin', 'warehouse_manager'] },
  { name: 'المشاريع', href: '/projects', icon: FolderIcon, requiredRole: ['admin', 'warehouse_manager', 'project_supervisor'] },
  { name: 'حركات المخزن', href: '/transactions', icon: SwitchHorizontalIcon, requiredRole: ['admin', 'warehouse_manager'] },
  { name: 'العملاء', href: '/clients', icon: UserGroupIcon, requiredRole: ['admin', 'accountant'] },
  { name: 'الفواتير', href: '/invoices', icon: DocumentTextIcon, requiredRole: ['admin', 'accountant'] },
  { name: 'المستخدمين', href: '/users', icon: UsersIcon, requiredRole: ['admin'] },
  { name: 'الإعدادات', href: '/settings', icon: CogIcon, requiredRole: ['admin'] },
];

export const CURRENCY = 'ج.م'; // EGP in Arabic

export const ROLES: Record<UserRole, string[]> = {
  admin: ['/dashboard', '/items', '/projects', '/transactions', '/clients', '/invoices', '/users', '/settings'],
  warehouse_manager: ['/dashboard', '/items', '/projects', '/transactions'],
  accountant: ['/dashboard', '/clients', '/invoices'],
  project_supervisor: ['/dashboard', '/projects'],
  viewer: ['/dashboard'],
};
