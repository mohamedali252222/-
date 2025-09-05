import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '../components/icons/IconComponents';

const AccessDeniedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <svg className="w-24 h-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
      </svg>
      <h1 className="text-4xl font-bold text-gray-800 mt-4">الوصول مرفوض</h1>
      <h2 className="text-xl text-gray-600 mt-2">
        ليس لديك الصلاحية الكافية لعرض هذه الصفحة.
      </h2>
      <p className="text-gray-500 mt-2">
        إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مدير النظام.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors flex items-center"
      >
        <HomeIcon className="w-5 h-5 ms-2"/>
        <span>العودة للرئيسية</span>
      </Link>
    </div>
  );
};

export default AccessDeniedPage;
