// Alert/Toast Component
import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

const Alert = ({ type = 'success', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeClasses = {
    success: 'bg-green-50 text-green-900 border-green-300',
    error: 'bg-red-50 text-red-900 border-red-300',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-300',
    info: 'bg-blue-50 text-blue-900 border-blue-300'
  };

  const iconClasses = {
    success: 'text-green-600 text-base',
    error: 'text-red-600 text-base',
    warning: 'text-yellow-600 text-base',
    info: 'text-blue-600 text-base'
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
