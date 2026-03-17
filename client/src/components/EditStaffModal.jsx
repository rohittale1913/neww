import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { accountantAPI, librarianAPI, transportManagerAPI } from '../services/api';

const EditStaffModal = ({ staff, role, onClose, onSave }) => {
  const [formData, setFormData] = useState(staff || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      setFormData(staff);
    }
  }, [staff]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Find the actual staff ID by looking up the profile
      let staffId = staff._id;
      
      // If this looks like a User ID, try to find the actual Staff record
      if (staff.userId && !staff.qualification) {
        let response;
        if (role === 'accountant') {
          response = await accountantAPI.getAll();
        } else if (role === 'librarian') {
          response = await librarianAPI.getAll();
        } else if (role === 'transport_manager') {
          response = await transportManagerAPI.getAll();
        }
        
        const profiles = response?.data || [];
        const actualProfile = profiles.find(p => 
          p.userId === staff._id || p.userId?.id === staff._id || p.userId?._id === staff._id
        );
        if (actualProfile) {
          staffId = actualProfile._id;
        }
      }

      let response;
      const updateData = {
        name: formData.name,
        qualification: formData.qualification,
        experience: formData.experience,
        department: formData.department
      };

      if (role === 'accountant') {
        updateData.bankAccount = formData.bankAccount;
        updateData.ifscCode = formData.ifscCode;
        response = await accountantAPI.update(staffId, updateData);
      } else if (role === 'librarian') {
        updateData.specialization = formData.specialization;
        response = await librarianAPI.update(staffId, updateData);
      } else if (role === 'transport_manager') {
        updateData.licenseNumber = formData.licenseNumber;
        updateData.licenseExpiry = formData.licenseExpiry;
        updateData.busesManaged = formData.busesManaged;
        updateData.routesManaged = formData.routesManaged;
        response = await transportManagerAPI.update(staffId, updateData);
      }

      onSave(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update staff member');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!staff) return null;

  const getRoleTitle = () => {
    switch (role) {
      case 'accountant': return 'Accountant';
      case 'librarian': return 'Librarian';
      case 'transport_manager': return 'Transport Manager';
      default: return 'Staff Member';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-slate-900">Edit {getRoleTitle()} Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification</label>
                <select
                  name="qualification"
                  value={formData.qualification || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Qualification</option>
                  <option value="D.El.Ed">D.El.Ed (Diploma in Elementary Education)</option>
                  <option value="B.A">B.A (Bachelor of Arts)</option>
                  <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                  <option value="B.Com">B.Com (Bachelor of Commerce)</option>
                  <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                  <option value="B.P.Ed">B.P.Ed (Bachelor of Physical Education)</option>
                  <option value="B.Ed">B.Ed (Bachelor of Education)</option>
                  <option value="M.A">M.A (Master of Arts)</option>
                  <option value="M.Sc">M.Sc (Master of Science)</option>
                  <option value="M.Com">M.Com (Master of Commerce)</option>
                  <option value="M.Tech">M.Tech (Master of Technology)</option>
                  <option value="M.Ed">M.Ed (Master of Education)</option>
                  <option value="M.B.A">M.B.A (Master of Business Administration)</option>
                  <option value="Ph.D">Ph.D (Doctor of Philosophy)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (Years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Account Number</label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'librarian' && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Library Information
              </h3>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Specialization</label>
                <select
                  name="specialization"
                  value={formData.specialization || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Specialization</option>
                  <option value="Reference">Reference</option>
                  <option value="Research">Research</option>
                  <option value="Cataloging">Cataloging</option>
                  <option value="General">General</option>
                </select>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">License Expiry Date</label>
                  <input
                    type="date"
                    name="licenseExpiry"
                    value={formData.licenseExpiry ? formData.licenseExpiry.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Buses Managed</label>
                  <input
                    type="text"
                    name="busesManaged"
                    value={formData.busesManaged || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Routes Managed</label>
                  <input
                    type="text"
                    name="routesManaged"
                    value={formData.routesManaged || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaffModal;
