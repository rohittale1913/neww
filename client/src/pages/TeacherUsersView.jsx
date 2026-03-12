import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { authAPI, teacherAPI } from '../services/api';
import { FiTrash2 } from 'react-icons/fi';

const TeacherUsersView = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    searchName: '',
    searchEmail: '',
    employmentType: '',
    isClassTeacher: ''
  });

  const employmentTypes = ['full-time', 'part-time', 'contract'];

  useEffect(() => {
    fetchTeachers();
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAll?.() || { data: [] };
      const allUsers = response.data || [];
      const teacherUsers = allUsers.filter(user => user.role === 'teacher');
      
      // Fetch teacher profiles for each teacher
      const teachersWithProfiles = await Promise.all(
        teacherUsers.map(async (user) => {
          try {
            const profileResponse = await teacherAPI.getAll?.() || { data: [] };
            const profiles = profileResponse.data || [];
            const teacherProfile = profiles.find(p => p.userId === user._id || p.userId?.id === user._id || p.userId?._id === user._id);
            
            return {
              ...user,
              qualification: teacherProfile?.qualification || '-',
              subjects: teacherProfile?.subjects || [],
              classes: teacherProfile?.classes || [],
              experience: teacherProfile?.experience || '-',
              employmentType: teacherProfile?.employmentType || '-',
              isClassTeacher: teacherProfile?.isClassTeacher || false,
              classTeacherOf: teacherProfile?.classTeacherOf || '-'
            };
          } catch (err) {
            console.error('Failed to fetch profile for teacher:', user._id);
            return user;
          }
        })
      );
      
      setTeachers(teachersWithProfiles);
    } catch (err) {
      setError('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };
   

  const handleDeleteTeacher = async (userId) => {
    try {
      setLoading(true);
      await authAPI.delete(userId);
      setTeachers(teachers.filter(t => t._id !== userId));
      setSuccess('Teacher deleted successfully');
      setDeleteConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete teacher');
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

  const filteredTeachers = teachers.filter(teacher => {
    const matchName = teacher.name.toLowerCase().includes(filters.searchName.toLowerCase());
    const matchEmail = teacher.email.toLowerCase().includes(filters.searchEmail.toLowerCase());
    const matchEmployment = !filters.employmentType || teacher.employmentType === filters.employmentType;
    const matchClassTeacher = !filters.isClassTeacher || 
      (filters.isClassTeacher === 'yes' ? teacher.isClassTeacher : !teacher.isClassTeacher);

    return matchName && matchEmail && matchEmployment && matchClassTeacher;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Teacher Users 👨‍🏫</h1>
          <p className="text-slate-600 text-sm mt-2">View and manage all registered teachers in the system</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search Name</label>
              <input
                type="text"
                name="searchName"
                value={filters.searchName}
                onChange={handleFilterChange}
                placeholder="Teacher name..."
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Type</label>
              <select
                name="employmentType"
                value={filters.employmentType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                {employmentTypes.map(type => (
                  <option key={type} value={type} className="capitalize">{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Class Teacher</label>
              <select
                name="isClassTeacher"
                value={filters.isClassTeacher}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setFilters({ searchName: '', searchEmail: '', employmentType: '', isClassTeacher: '' })}
            className="mt-4 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition text-sm font-medium"
          >
            Reset Filters
          </button>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {error && <div className="text-rose-600 bg-rose-50 p-3 rounded mb-4 border border-rose-200">{error}</div>}
          {success && <div className="text-emerald-600 bg-emerald-50 p-3 rounded mb-4 border border-emerald-200">{success}</div>}

          {loading ? (
            <p className="text-gray-600">Loading teachers...</p>
          ) : filteredTeachers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Qualification</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subjects</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Experience</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employment</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Class Teacher</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher, idx) => (
                    <tr
                      key={teacher._id}
                      className={`border-b transition ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-purple-50`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{teacher.name}</td>
                      <td className="py-3 px-4 text-gray-600">{teacher.email}</td>
                      <td className="py-3 px-4 text-gray-600">{teacher.qualification || '-'}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {teacher.subjects ? teacher.subjects.slice(0, 2).join(', ') : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{teacher.experience || '-'} yrs</td>
                      <td className="py-3 px-4 text-gray-600 capitalize">{teacher.employmentType || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          teacher.isClassTeacher
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {teacher.isClassTeacher ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{teacher.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          teacher.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.isActive ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {currentUserId !== teacher._id && (
                          <button
                            onClick={() => setDeleteConfirm(teacher._id)}
                            className="text-red-600 hover:text-red-800 font-medium transition p-1"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No teachers found matching filters.</p>
          )}
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredTeachers.length} teacher(s)
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Delete Teacher?</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this teacher? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTeacher(deleteConfirm)}
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

export default TeacherUsersView;
