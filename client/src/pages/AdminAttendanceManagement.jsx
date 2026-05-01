import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { attendanceAPI, studentAPI } from '../services/api';
import { FiUsers, FiCheckCircle, FiX, FiCalendar, FiDownload } from 'react-icons/fi';
import { exportToCSV } from '../utils/csvExport';

const AdminAttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, leave: 0, late: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('all');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedClass, selectedSection]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const params = { date: selectedDate };
        if (selectedClass) params.className = selectedClass;
        if (selectedSection) params.section = selectedSection;

        const response = await attendanceAPI.getAllAttendance(params);

        const records = response.data || [];
        setAttendance(records);

        // Calculate statistics
        const stats = {
          total: records.length,
          present: records.filter(r => r.status === 'present').length,
          absent: records.filter(r => r.status === 'absent').length,
          leave: records.filter(r => r.status === 'leave').length,
          late: records.filter(r => r.status === 'late').length
        };
        setStats(stats);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedDate, selectedClass, selectedSection]);

  useEffect(() => {
    // fetch class list for filters
    const fetchClasses = async () => {
      try {
        const res = await studentAPI.getAll();
        // fallback: there is a class API - use that
      } catch (err) {
        // ignore
      }
    };

    const fetchFromClassesApi = async () => {
      try {
        const res = await attendanceAPI.getAllAttendance({ date: selectedDate });
        // no-op, but keep for parity
      } catch (err) {
        // ignore
      }
    };

    // Better: use classAPI to fetch classes
    import('../services/api').then(({ classAPI }) => {
      classAPI.getAll().then((r) => {
        const cls = r.data || [];
        setClasses(cls);
        // If selectedClass already set, recompute sections
        if (selectedClass) {
          const secs = cls.filter(c => c.className === selectedClass).map(c => c.section);
          setSections([...new Set(secs)]);
        }
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50';
      case 'absent':
        return 'text-red-600 bg-red-50';
      case 'leave':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const StatCard = ({ icon: Icon, label, value, bgColor, iconColor }) => (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl border border-slate-100 hover:border-slate-300 transition p-6 flex items-center gap-4">
      <div className={`text-2xl p-4 rounded-2xl ${bgColor} shadow-md`}>
        <Icon className={iconColor} />
      </div>
      <div className="flex flex-col">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{loading ? '-' : value}</p>
      </div>
    </div>
  );

  const filteredAttendanceList = filter === 'all' 
    ? attendance 
    : attendance.filter(a => a.status === filter);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedAttendance = filteredAttendanceList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAttendanceList.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredAttendanceList, 'attendance', [
      { key: 'studentId.name', label: 'Student Name' },
      { key: 'studentId.rollNumber', label: 'Roll No.' },
      { key: 'className', label: 'Class' },
      { key: 'section', label: 'Section' },
      { key: 'teacherId.name', label: 'Teacher Name' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status' }
    ]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent">Attendance Management</h1>
            {/* <p className="text-slate-500 mt-2">Track and manage student attendance records</p> */}
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-xl border border-blue-200">
            <FiCalendar className="text-blue-600 text-xl" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-900"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={FiUsers}
            label="Total Students"
            value={stats.total}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={FiCheckCircle}
            label="Present"
            value={stats.present}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={FiX}
            label="Absent"
            value={stats.absent}
            bgColor="bg-red-100"
            iconColor="text-red-600"
          />
          <StatCard
            icon={FiCalendar}
            label="Leave"
            value={stats.leave}
            bgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
        </div>

        {/* Filter and Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-600">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    const cls = e.target.value;
                    setSelectedClass(cls);
                    setSelectedSection('');
                    // compute sections
                    const secs = classes.filter(c => c.className === cls).map(c => c.section);
                    setSections([...new Set(secs)]);
                    // refetch attendance for new class
                    setLoading(true);
                    attendanceAPI.getAllAttendance({ date: selectedDate, className: cls }).then(res => {
                      setAttendance(res.data || []);
                      setLoading(false);
                    }).catch(() => setLoading(false));
                  }}
                  className="px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">All Classes</option>
                  {[...new Set(classes.map(c => c.className))].map(cn => (
                    <option key={cn} value={cn}>{cn}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-600">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    const sec = e.target.value;
                    setSelectedSection(sec);
                    setLoading(true);
                    attendanceAPI.getAllAttendance({ date: selectedDate, className: selectedClass, section: sec }).then(res => {
                      setAttendance(res.data || []);
                      setLoading(false);
                    }).catch(() => setLoading(false));
                  }}
                  className="px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">All Sections</option>
                  {sections.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('present')}
                className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ${
                  filter === 'present'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-green-500 hover:text-green-600'
                }`}
              >
                Present
              </button>
              <button
                onClick={() => setFilter('absent')}
                className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ${
                  filter === 'absent'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-red-500 hover:text-red-600'
                }`}
              >
                Absent
              </button>
              <button
                onClick={() => setFilter('leave')}
                className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ${
                  filter === 'leave'
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-yellow-500 hover:text-yellow-600'
                }`}
              >
                Leave
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                <FiDownload /> Export CSV
              </button>
            </div>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Roll No.</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Class-Section</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Teacher Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAttendance.length > 0 ? (
                  paginatedAttendance.map((record) => (
                    <tr key={record._id} className="border-b border-slate-100 hover:bg-blue-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.studentId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{record.studentId?.rollNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{record.className ? `${record.className}-${record.section || ''}` : 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{record.teacherId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold capitalize ${getStatusColor(record.status)} shadow-sm`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                      No attendance records found for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
              <div className="text-sm text-slate-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAttendanceList.length)} of {filteredAttendanceList.length} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAttendanceManagement;
