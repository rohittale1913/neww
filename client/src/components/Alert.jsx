// Alert/Toast Component
import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

const Alert = ({ type = 'success', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeClasses = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  const iconClasses = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-blue-500'
  };

  const Icon = type === 'error' ? FiAlertCircle : FiCheckCircle;

  return (
    <div className={`border rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top ${typeClasses[type]}`}>
      <Icon className={`text-xl flex-shrink-0 ${iconClasses[type]}`} />
      <span className="flex-1 font-medium">{message}</span>
      <button onClick={onClose} className="text-lg hover:opacity-60 transition flex-shrink-0">
        <FiX />
      </button>
    </div>
  );
};

export default Alert;
