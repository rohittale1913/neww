import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { authAPI, accountantAPI, librarianAPI, transportManagerAPI } from '../services/api';
import { FiTrash2 } from 'react-icons/fi';

const StaffUsersView = () => {
  const [activeRole, setActiveRole] = useState('accountant');
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

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
  }, []);

  const fetchStaffUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAll?.() || { data: [] };
      const allUsers = response.data || [];
      const staff = allUsers.filter(user =>
        ['accountant', 'librarian', 'transport_manager'].includes(user.role)
      );
      
      // Fetch profiles for each staff member based on their role
      const staffWithProfiles = await Promise.all(
        staff.map(async (user) => {
          try {
            let profileData = {};
            
            if (user.role === 'accountant') {
              const profileResponse = await accountantAPI.getAll?.() || { data: [] };
              const profiles = profileResponse.data || [];
              const profile = profiles.find(p => p.userId === user._id || p.userId?.id === user._id || p.userId?._id === user._id);
              if (profile) {
                profileData = {
                  qualification: profile.qualification || '-',
                  experience: profile.experience || '-',
                  bankAccount: profile.bankAccount || '-',
                  ifscCode: profile.ifscCode || '-'
                };
              }
            } else if (user.role === 'librarian') {
              const profileResponse = await librarianAPI.getAll?.() || { data: [] };
              const profiles = profileResponse.data || [];
              const profile = profiles.find(p => p.userId === user._id || p.userId?.id === user._id || p.userId?._id === user._id);
              if (profile) {
                profileData = {
                  qualification: profile.qualification || '-',
                  experience: profile.experience || '-',
                  specialization: profile.specialization || '-'
                };
              }
            } else if (user.role === 'transport_manager') {
              const profileResponse = await transportManagerAPI.getAll?.() || { data: [] };
              const profiles = profileResponse.data || [];
              const profile = profiles.find(p => p.userId === user._id || p.userId?.id === user._id || p.userId?._id === user._id);
              if (profile) {
                profileData = {
                  qualification: profile.qualification || '-',
                  experience: profile.experience || '-',
                  licenseNumber: profile.licenseNumber || '-',
                  licenseExpiry: profile.licenseExpiry || null
                };
              }
            }
            
            return { ...user, ...profileData };
          } catch (err) {
            console.error('Failed to fetch profile for staff member:', user._id);
            return user;
          }
        })
      );
      
      setStaffUsers(staffWithProfiles);
    } catch (err) {
      setError('Failed to fetch staff users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (userId) => {
    try {
      setLoading(true);
      await authAPI.delete(userId);
      setStaffUsers(staffUsers.filter(s => s._id !== userId));
      setSuccess('Staff member deleted successfully');
      setDeleteConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff member');
    } finally {
      setLoading(false);
    }
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
    .filter(user => user.role === activeRole)
    .filter(staff => {
      const matchName = staff.name.toLowerCase().includes(filters.searchName.toLowerCase());
      const matchEmail = staff.email.toLowerCase().includes(filters.searchEmail.toLowerCase());
      
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
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
                          <td className="py-3 px-4 font-medium text-gray-900">{staff.name}</td>
                          <td className="py-3 px-4 text-gray-600">{staff.email}</td>
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
                          <td className="py-3 px-4 text-gray-600">{staff.phone || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              staff.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {staff.isActive ? '✓ Active' : '✕ Inactive'}
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
      </div>
    </DashboardLayout>
  );
};

export default StaffUsersView;
