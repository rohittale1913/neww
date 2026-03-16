import React from 'react';
import { FiX } from 'react-icons/fi';

const StudentProfileModal = ({ student, onClose, onEdit }) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-slate-900">Student Profile</h2>
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
                <p className="text-gray-900">{student.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Email</p>
                <p className="text-gray-900">{student.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Phone</p>
                <p className="text-gray-900">{student.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Gender</p>
                <p className="text-gray-900">{student.gender || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Date of Birth</p>
                <p className="text-gray-900">
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Blood Group</p>
                <p className="text-gray-900">{student.bloodGroup || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Category</p>
                <p className="text-gray-900">{student.category || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Nationality</p>
                <p className="text-gray-900">{student.nationality || '-'}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Academic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Class</p>
                <p className="text-gray-900">{student.class || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Section</p>
                <p className="text-gray-900">{student.section || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Roll Number</p>
                <p className="text-gray-900">{student.rollNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Admission Date</p>
                <p className="text-gray-900">
                  {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Previous School</p>
                <p className="text-gray-900">{student.previousSchool || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Transport Required</p>
                <p className="text-gray-900">{student.transportRequired ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Parent/Guardian Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Name</p>
                <p className="text-gray-900">{student.parentName || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Email</p>
                <p className="text-gray-900">{student.parentEmail || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Contact Number</p>
                <p className="text-gray-900">{student.parentContact || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Emergency Contact</p>
                <p className="text-gray-900">{student.emergencyContact || '-'}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Address Information
            </h3>
            <div>
              <p className="text-sm font-semibold text-slate-600">Address</p>
              <p className="text-gray-900">{student.address || '-'}</p>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Additional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Aadhar Number</p>
                <p className="text-gray-900">{student.aadharNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  student.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.isActive ? '✓ Active' : '✕ Inactive'}
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
