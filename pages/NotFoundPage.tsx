
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">الصفحة غير موجودة</h2>
      <p className="text-gray-600 mt-2">عذراً, الصفحة التي تبحث عنها غير موجودة.</p>
      <Link to="/dashboard" className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
        العودة للرئيسية
      </Link>
    </div>
  );
};

export default NotFoundPage;
