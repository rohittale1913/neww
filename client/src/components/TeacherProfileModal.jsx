import React from 'react';
import { FiX } from 'react-icons/fi';

const TeacherProfileModal = ({ teacher, onClose, onEdit }) => {
  if (!teacher) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-slate-900">Teacher Profile</h2>
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
                <p className="text-gray-900">{teacher.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Email</p>
                <p className="text-gray-900">{teacher.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Phone</p>
                <p className="text-gray-900">{teacher.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Gender</p>
                <p className="text-gray-900">{teacher.gender || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Date of Birth</p>
                <p className="text-gray-900">
                  {teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Blood Group</p>
                <p className="text-gray-900">{teacher.bloodGroup || '-'}</p>
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
                <p className="text-gray-900">{teacher.qualification || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Experience (Years)</p>
                <p className="text-gray-900">{teacher.experience || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Employment Type</p>
                <p className="text-gray-900">{teacher.employmentType || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Joining Date</p>
                <p className="text-gray-900">
                  {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Subjects and Classes */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Subjects & Classes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Subjects</p>
                <p className="text-gray-900">
                  {teacher.subjects && teacher.subjects.length > 0
                    ? teacher.subjects.join(', ')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Classes</p>
                <p className="text-gray-900">
                  {teacher.classes && teacher.classes.length > 0
                    ? teacher.classes.join(', ')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Class Teacher</p>
                <p className="text-gray-900">{teacher.isClassTeacher ? 'Yes' : 'No'}</p>
              </div>
              {teacher.isClassTeacher && (
                <div>
                  <p className="text-sm font-semibold text-slate-600">Class Teacher Of</p>
                  <p className="text-gray-900">{teacher.classTeacherOf || '-'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Address Information
            </h3>
            <div>
              <p className="text-sm font-semibold text-slate-600">Address</p>
              <p className="text-gray-900">{teacher.address || '-'}</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Status
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Account Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                  teacher.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {teacher.isActive ? '✓ Active' : '✕ Inactive'}
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileModal;
