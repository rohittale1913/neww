import React from 'react';
import { FiX } from 'react-icons/fi';

const StaffProfileModal = ({ staff, role, onClose, onEdit }) => {
  if (!staff) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-slate-900">
            {role === 'accountant' ? 'Accountant' : role === 'librarian' ? 'Librarian' : 'Transport Manager'} Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Name</p>
                <p className="text-gray-900">{staff.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Email</p>
                <p className="text-gray-900">{staff.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Phone</p>
                <p className="text-gray-900">{staff.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Department</p>
                <p className="text-gray-900">{staff.department || '-'}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Professional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Qualification</p>
                <p className="text-gray-900">{staff.qualification || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Experience (Years)</p>
                <p className="text-gray-900">{staff.experience || '-'}</p>
              </div>
            </div>
          </div>

          {/* Role-Specific Information */}
          {role === 'accountant' && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Banking Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Bank Account</p>
                  <p className="text-gray-900">{staff.bankAccount || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">IFSC Code</p>
                  <p className="text-gray-900">{staff.ifscCode || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {role === 'librarian' && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Library Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Specialization</p>
                  <p className="text-gray-900">{staff.specialization || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {role === 'transport_manager' && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Transport Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">License Number</p>
                  <p className="text-gray-900">{staff.licenseNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">License Expiry</p>
                  <p className="text-gray-900">
                    {staff.licenseExpiry ? new Date(staff.licenseExpiry).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">Buses Managed</p>
                  <p className="text-gray-900">{staff.busesManaged || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">Routes Managed</p>
                  <p className="text-gray-900">{staff.routesManaged || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Status
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Account Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                  staff.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {staff.isActive ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 transition font-medium"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffProfileModal;
