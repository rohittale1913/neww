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
    <nav className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-base text-gray-600 hover:text-gray-800 rounded-lg p-2 transition lg:hidden">
          <FiMenu size={18} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 hidden lg:block">School ERP</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-600 text-base hover:text-gray-800 transition relative p-2 rounded-lg">
          <FiBell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 border border-gray-300">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</span>
        </div>
        <button 
          onClick={handleLogout} 
          className="text-gray-600 text-base hover:text-gray-800 transition flex items-center gap-1 px-3 py-2 rounded-lg font-medium"
          title="Logout"
        >
          <FiLogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
