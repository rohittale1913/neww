import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { authAPI, accountantAPI, librarianAPI, transportManagerAPI } from '../services/api';
import { FiTrash2 } from 'react-icons/fi';
import StaffProfileModal from '../components/StaffProfileModal';
import EditStaffModal from '../components/EditStaffModal';

const StaffUsersView = () => {
  const [activeRole, setActiveRole] = useState('accountant');
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    searchName: '',
    searchEmail: '',
    specialization: '',
    licenseStatus: ''
  });

  const specializations = ['Reference', 'Research', 'Cataloging', 'General'];

  useEffect(() => {
    fetchStaffUsers();
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
  }, [activeRole]);

  const fetchStaffUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      let allStaffData = [];
      const token = localStorage.getItem('token');
      
      console.log('Token available:', !!token);
      console.log('Current role:', activeRole);

      // Fetch based on active role
      if (activeRole === 'accountant') {
        try {
          const response = await accountantAPI.getAll();
          console.log('Accountants response status:', response.status);
          console.log('Accountants response data:', response.data);
          allStaffData = response.data || [];
        } catch (apiErr) {
          console.error('Accountant API error:', apiErr.response?.status, apiErr.response?.data);
          throw apiErr;
        }
      } else if (activeRole === 'librarian') {
        try {
          const response = await librarianAPI.getAll();
          console.log('Librarians response status:', response.status);
          console.log('Librarians response data:', response.data);
          allStaffData = response.data || [];
        } catch (apiErr) {
          console.error('Librarian API error:', apiErr.response?.status, apiErr.response?.data);
          throw apiErr;
        }
      } else if (activeRole === 'transport_manager') {
        try {
          const response = await transportManagerAPI.getAll();
          console.log('Transport managers response status:', response.status);
          console.log('Transport managers response data:', response.data);
          allStaffData = response.data || [];
        } catch (apiErr) {
          console.error('Transport manager API error:', apiErr.response?.status, apiErr.response?.data);
          throw apiErr;
        }
      }

      console.log('Final staff data:', allStaffData);
      console.log('Staff count:', allStaffData.length);
      
      // Ensure allStaffData is an array
      if (!Array.isArray(allStaffData)) {
        console.warn('Response data is not an array:', allStaffData);
        allStaffData = [];
      }
      
      setStaffUsers(allStaffData);
    } catch (err) {
      console.error('Complete error object:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Failed to fetch staff users. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please login again';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to view staff';
      } else if (err.response?.status === 404) {
        errorMessage = 'Endpoint not found. Please check the server configuration.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setStaffUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      setLoading(true);
      
      // Delete based on active role
      if (activeRole === 'accountant') {
        await accountantAPI.delete(staffId);
      } else if (activeRole === 'librarian') {
        await librarianAPI.delete(staffId);
      } else if (activeRole === 'transport_manager') {
        await transportManagerAPI.delete(staffId);
      }
      
      setStaffUsers(staffUsers.filter(s => s._id !== staffId));
      setSuccess('Staff member deleted successfully');
      setDeleteConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (staff) => {
    try {
      let fullProfile = null;
      
      if (activeRole === 'accountant') {
        const response = await accountantAPI.getAll();
        fullProfile = response.data?.find(a => a._id === staff._id);
      } else if (activeRole === 'librarian') {
        const response = await librarianAPI.getAll();
        fullProfile = response.data?.find(l => l._id === staff._id);
      } else if (activeRole === 'transport_manager') {
        const response = await transportManagerAPI.getAll();
        fullProfile = response.data?.find(t => t._id === staff._id);
      }
      
      if (fullProfile) {
        setSelectedStaff(fullProfile);
      } else {
        setSelectedStaff(staff);
      }
    } catch (err) {
      console.error('Failed to fetch full staff profile:', err);
      setSelectedStaff(staff);
    }
  };

  const handleEditSave = (updatedStaff) => {
    setSuccess('Staff profile updated successfully');
    setEditingStaff(null);
    // Refresh the staff list
    fetchStaffUsers();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getLicenseStatus = (licenseExpiry) => {
    if (!licenseExpiry) return 'unknown';
    const today = new Date();
    const expiry = new Date(licenseExpiry);
    return expiry > today ? 'active' : 'expired';
  };

  const getRoleColor = (role) => {
    const colors = {
      accountant: 'bg-green-100 text-green-800',
      librarian: 'bg-yellow-100 text-yellow-800',
      transport_manager: 'bg-indigo-100 text-indigo-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getHeaderColor = (role) => {
    const colors = {
      accountant: 'bg-green-50',
      librarian: 'bg-yellow-50',
      transport_manager: 'bg-indigo-50'
    };
    return colors[role] || 'bg-gray-50';
  };

  const filteredStaff = staffUsers
    .filter(staff => {
      const staffName = (staff.name || '').toLowerCase();
      const staffEmail = (staff.email || '').toLowerCase();
      const searchName = filters.searchName.toLowerCase();
      const searchEmail = filters.searchEmail.toLowerCase();
      
      const matchName = !searchName || staffName.includes(searchName);
      const matchEmail = !searchEmail || staffEmail.includes(searchEmail);
      
      if (activeRole === 'librarian') {
        const matchSpecialization = !filters.specialization || staff.specialization === filters.specialization;
        return matchName && matchEmail && matchSpecialization;
      }
      
      if (activeRole === 'transport_manager') {
        const matchLicense = !filters.licenseStatus || getLicenseStatus(staff.licenseExpiry) === filters.licenseStatus;
        return matchName && matchEmail && matchLicense;
      }
      
      return matchName && matchEmail;
    });

  const getRoleLabel = (role) => {
    const labels = {
      accountant: 'Accountants',
      librarian: 'Librarians',
      transport_manager: 'Transport Managers'
    };
    return labels[role] || role;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Staff Users Management</h1>
          {/* <p className="text-slate-600 text-sm mt-2">View and manage accountants, librarians, and transport managers</p> */}
        </div>

        {/* Role Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex border-b border-slate-200">
            {['accountant', 'librarian', 'transport_manager'].map(role => (
              <button
                key={role}
                onClick={() => {
                  setActiveRole(role);
                  setFilters({ searchName: '', searchEmail: '', specialization: '', licenseStatus: '' });
                }}
                className={`flex-1 py-3 font-medium text-center transition border-b-2 ${
                  activeRole === role
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                {getRoleLabel(role)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Search Name</label>
                  <input
                    type="text"
                    name="searchName"
                    value={filters.searchName}
                    onChange={handleFilterChange}
                    placeholder="Staff name..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Search Email</label>
                  <input
                    type="email"
                    name="searchEmail"
                    value={filters.searchEmail}
                    onChange={handleFilterChange}
                    placeholder="Email..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Librarian Specialization Filter */}
                {activeRole === 'librarian' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Specialization</label>
                    <select
                      name="specialization"
                      value={filters.specialization}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Specializations</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Transport Manager License Filter */}
                {activeRole === 'transport_manager' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">License Status</label>
                    <select
                      name="licenseStatus"
                      value={filters.licenseStatus}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Licenses</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                )}
              </div>
              <button
                onClick={() => setFilters({ searchName: '', searchEmail: '', specialization: '', licenseStatus: '' })}
                className="mt-4 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition text-sm font-medium"
              >
                Reset Filters
              </button>
            </div>

            {/* Results */}
            {error && <div className="text-rose-600 bg-rose-50 p-3 rounded mb-4 border border-rose-200">{error}</div>}
            {success && <div className="text-emerald-600 bg-emerald-50 p-3 rounded mb-4 border border-emerald-200">{success}</div>}

            {loading ? (
              <p className="text-gray-600">Loading staff users...</p>
            ) : filteredStaff.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`border-b ${getHeaderColor(activeRole)}`}>
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Qualification</th>
                      {activeRole === 'librarian' && (
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Specialization</th>
                      )}
                      {activeRole === 'transport_manager' && (
                        <>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">License Number</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">License Expiry</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">License Status</th>
                        </>
                      )}
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Experience</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((staff, idx) => {
                      const licenseStatus = activeRole === 'transport_manager' ? getLicenseStatus(staff.licenseExpiry) : null;
                      return (
                        <tr
                          key={staff._id}
                          className={`border-b transition ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:${activeRole === 'accountant' ? 'bg-green-50' : activeRole === 'librarian' ? 'bg-yellow-50' : 'bg-indigo-50'}`}
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">
                            <button
                              onClick={() => handleViewProfile(staff)}
                              className="text-blue-600 hover:text-blue-800 hover:underline transition"
                            >
                              {staff.name || '-'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{staff.email || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{staff.phone || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{staff.qualification || '-'}</td>
                          {activeRole === 'librarian' && (
                            <td className="py-3 px-4 text-gray-600">{staff.specialization || '-'}</td>
                          )}
                          {activeRole === 'transport_manager' && (
                            <>
                              <td className="py-3 px-4 text-gray-600">{staff.licenseNumber || '-'}</td>
                              <td className="py-3 px-4 text-gray-600">
                                {staff.licenseExpiry ? new Date(staff.licenseExpiry).toLocaleDateString() : '-'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  licenseStatus === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {licenseStatus === 'active' ? 'Active' : 'Expired'}
                                </span>
                              </td>
                            </>
                          )}
                          <td className="py-3 px-4 text-gray-600">{staff.experience || '-'} yrs</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              staff.isActive !== false
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {staff.isActive !== false ? '✓ Active' : '✕ Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {currentUserId !== staff._id && (
                              <button
                                onClick={() => setDeleteConfirm(staff._id)}
                                className="text-red-600 hover:text-red-800 font-medium transition p-1"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No {getRoleLabel(activeRole).toLowerCase()} found matching filters.</p>
            )}
            <div className="mt-4 text-sm text-gray-600">
              Total: {filteredStaff.length} {getRoleLabel(activeRole).toLowerCase()}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Delete Staff Member?</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this staff member? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteStaff(deleteConfirm)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staff Profile Modal */}
        <StaffProfileModal 
          staff={selectedStaff} 
          role={activeRole}
          onClose={() => setSelectedStaff(null)}
          onEdit={() => setEditingStaff(selectedStaff)}
        />

        {/* Edit Staff Modal */}
        <EditStaffModal
          staff={editingStaff}
          role={activeRole}
          onClose={() => setEditingStaff(null)}
          onSave={handleEditSave}
        />
      </div>
    </DashboardLayout>
  );
};

export default StaffUsersView;
