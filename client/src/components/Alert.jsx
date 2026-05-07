// Alert/Toast Component
import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

const Alert = ({ type = 'success', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeClasses = {
    success: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-900 border-emerald-300 shadow-md',
    error: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-900 border-red-300 shadow-md',
    warning: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border-amber-300 shadow-md',
    info: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 border-blue-300 shadow-md'
  };

  const iconClasses = {
    success: 'text-emerald-600 text-2xl',
    error: 'text-red-600 text-2xl',
    warning: 'text-amber-600 text-2xl',
    info: 'text-blue-600 text-2xl'
  };

  const Icon = type === 'error' ? FiAlertCircle : FiCheckCircle;

  return (
    <div className={`border-2 rounded-lg p-5 flex items-center gap-3 animate-in fade-in slide-in-from-top font-semibold ${typeClasses[type]}`}>
      <Icon className={`flex-shrink-0 ${iconClasses[type]}`} />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-lg hover:opacity-70 transition flex-shrink-0">
        <FiX />
      </button>
    </div>
  );
};

export default Alert;
