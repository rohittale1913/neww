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
    <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-2xl text-slate-600 hover:text-primary transition lg:hidden">
          <FiMenu />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden lg:block">School ERP</h1>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-slate-500 text-xl hover:text-primary transition relative">
          <FiBell />
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-medium text-slate-700">{user?.name || 'User'}</span>
        </div>
        <button 
          onClick={handleLogout} 
          className="text-slate-500 text-xl hover:text-rose-500 transition flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-rose-50"
          title="Logout"
        >
          <FiLogOut />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
