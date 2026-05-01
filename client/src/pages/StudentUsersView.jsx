import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { authAPI, studentAPI } from '../services/api';
import { FiSearch, FiTrash2, FiDownload } from 'react-icons/fi';
import StudentProfileModal from '../components/StudentProfileModal';
import EditStudentModal from '../components/EditStudentModal';
import { exportToCSV } from '../utils/csvExport';

const StudentUsersView = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filters
  const [filters, setFilters] = useState({
    searchName: '',
    searchEmail: '',
    class: '',
    section: '',
    bloodGroup: ''
  });

  const classes = ['9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  useEffect(() => {
    fetchStudents();
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
    setCurrentPage(1);
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAll?.() || { data: [] };
      const allUsers = response.data || [];
      const studentUsers = allUsers.filter(user => user.role === 'student');
      
      // Fetch student profiles for each student
      const studentsWithProfiles = await Promise.all(
        studentUsers.map(async (user) => {
          try {
            const profileResponse = await studentAPI.getAll?.() || { data: [] };
            const profiles = profileResponse.data || [];
            const studentProfile = profiles.find(p => p.userId === user._id || p.userId?.id === user._id || p.userId?._id === user._id);
            
            return {
              ...user,
              class: studentProfile?.class || '-',
              section: studentProfile?.section || '-',
              rollNumber: studentProfile?.rollNumber || '-',
              bloodGroup: studentProfile?.bloodGroup || '-'
            };
          } catch (err) {
            console.error('Failed to fetch profile for student:', user._id);
            return user;
          }
        })
      );
      
      setStudents(studentsWithProfiles);
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (userId) => {
    try {
      setLoading(true);
      await authAPI.delete(userId);
      setStudents(students.filter(s => s._id !== userId));
      setSuccess('Student deleted successfully');
      setDeleteConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (student) => {
    try {
      const response = await studentAPI.getAll?.() || { data: [] };
      const profiles = response.data || [];
      const fullProfile = profiles.find(p => 
        p.userId === student._id || p.userId?.id === student._id || p.userId?._id === student._id
      );
      
      if (fullProfile) {
        setSelectedStudent({
          ...student,
          ...fullProfile,
          email: student.email,
          phone: student.phone,
          isActive: student.isActive
        });
      } else {
        setSelectedStudent(student);
      }
    } catch (err) {
      console.error('Failed to fetch full student profile:', err);
      setSelectedStudent(student);
    }
  };

  const handleEditSave = (updatedStudent) => {
    setSuccess('Student profile updated successfully');
    setEditingStudent(null);
    // Refresh the students list
    fetchStudents();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredStudents = students.filter(student => {
    const studentName = (student.name || '').toLowerCase();
    const studentEmail = (student.email || '').toLowerCase();
    const searchName = filters.searchName.toLowerCase();
    const searchEmail = filters.searchEmail.toLowerCase();
    
    const matchName = !searchName || studentName.includes(searchName);
    const matchEmail = !searchEmail || studentEmail.includes(searchEmail);
    const matchClass = !filters.class || student.class === filters.class;
    const matchSection = !filters.section || student.section === filters.section;
    const matchBlood = !filters.bloodGroup || student.bloodGroup === filters.bloodGroup;

    return matchName && matchEmail && matchClass && matchSection && matchBlood;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleExportCSV = () => {
    const dataToExport = filteredStudents.map(student => ({
      'Name': student.name,
      'Email': student.email,
      'Class': student.class || '-',
      'Section': student.section || '-',
      'Roll No.': student.rollNumber || '-',
      'Blood Group': student.bloodGroup || '-',
      'Phone': student.phone || '-',
      'Status': student.isActive ? 'Active' : 'Inactive'
    }));
    exportToCSV(dataToExport, 'students');
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent">Student Users </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search Name</label>
              <input
                type="text"
                name="searchName"
                value={filters.searchName}
                onChange={handleFilterChange}
                placeholder="Student name..."
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
              <select
                name="class"
                value={filters.class}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Section</label>
              <select
                name="section"
                value={filters.section}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Sections</option>
                {sections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Group</label>
              <select
                name="bloodGroup"
                value={filters.bloodGroup}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Groups</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => setFilters({ searchName: '', searchEmail: '', class: '', section: '', bloodGroup: '' })}
            className="mt-4 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition text-sm font-medium"
          >
            Reset Filters
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredStudents.length === 0}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <FiDownload /> Export CSV
          </button>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {error && <div className="text-rose-600 bg-rose-50 p-3 rounded mb-4 border border-rose-200">{error}</div>}
          {success && <div className="text-emerald-600 bg-emerald-50 p-3 rounded mb-4 border border-emerald-200">{success}</div>}

          {loading ? (
            <p className="text-gray-600">Loading students...</p>
          ) : filteredStudents.length > 0 ? (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Class</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Section</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll No.</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Blood Group</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student, idx) => (
                    <tr
                      key={student._id}
                      className={`border-b transition ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <button
                          onClick={() => handleViewProfile(student)}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition"
                        >
                          {student.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.email}</td>
                      <td className="py-3 px-4 text-gray-600">{student.class || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{student.section || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{student.rollNumber || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{student.bloodGroup || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{student.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          student.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.isActive ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {currentUserId !== student._id && (
                          <button
                            onClick={() => setDeleteConfirm(student._id)}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} records
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                    return pageNum <= totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          ) : (
            <p className="text-gray-600 text-center py-8">No students found matching filters.</p>
          )}
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredStudents.length} student(s)
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Delete Student?</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this student? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteStudent(deleteConfirm)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Profile Modal */}
        <StudentProfileModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)}
          onEdit={() => setEditingStudent(selectedStudent)}
        />

        {/* Edit Student Modal */}
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={handleEditSave}
        />
      </div>
    </DashboardLayout>
  );
};

export default StudentUsersView;
