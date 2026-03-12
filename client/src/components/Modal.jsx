// Reusable Modal Component
import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, title, children, onClose, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-96',
    md: 'w-2xl',
    lg: 'w-4xl',
    full: 'w-11/12'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} border border-slate-200 animate-in fade-in zoom-in-95`}>
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1 transition text-2xl"
          >
            <FiX />
          </button>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
