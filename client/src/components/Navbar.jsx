import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiLogOut, FiBell, FiUser } from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-gradient-to-r from-white via-slate-50 to-white shadow-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-2xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition lg:hidden">
          <FiMenu />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent hidden lg:block">School ERP</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-slate-500 text-xl hover:text-blue-600 transition relative p-2 hover:bg-blue-50 rounded-lg">
          <FiBell />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-br from-red-500 to-rose-500 rounded-full shadow-lg"></span>
        </button>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 hover:border-blue-300 transition">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</span>
        </div>
        <button 
          onClick={handleLogout} 
          className="text-slate-500 text-xl hover:text-red-600 transition flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 font-medium"
          title="Logout"
        >
          <FiLogOut />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
