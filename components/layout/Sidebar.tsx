import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { companyProfile } = useData();

  const accessibleLinks = NAV_LINKS.filter(link => 
    user && link.requiredRole.includes(user.role)
  );

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col no-print">
      <div className="h-20 flex items-center justify-center bg-gray-900">
        <img src={companyProfile.logoUrl} alt="Company Logo" className="h-12 object-contain"/>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {accessibleLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <link.icon className="w-6 h-6 ms-3" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">&copy; 2024 {companyProfile.name}</p>
      </div>
    </div>
  );
};

export default Sidebar;