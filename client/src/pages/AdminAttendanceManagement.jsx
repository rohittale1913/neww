import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { attendanceAPI, studentAPI } from '../services/api';
import { FiUsers, FiCheckCircle, FiX, FiCalendar } from 'react-icons/fi';

const AdminAttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, leave: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await attendanceAPI.getAll();
        
        // Filter by selected date
        const filteredAttendance = response.data.filter(record => {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === selectedDate;
        });

        setAttendance(filteredAttendance);

        // Calculate statistics
        const stats = {
          total: filteredAttendance.length,
          present: filteredAttendance.filter(r => r.status === 'present').length,
          absent: filteredAttendance.filter(r => r.status === 'absent').length,
          leave: filteredAttendance.filter(r => r.status === 'leave').length
        };
        setStats(stats);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedDate]);

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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Section</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendanceList.length > 0 ? (
                  filteredAttendanceList.map((record) => (
                    <tr key={record._id} className="border-b border-slate-100 hover:bg-blue-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.studentId?.studentId || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{record.studentId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{record.studentId?.class || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{record.studentId?.section || 'N/A'}</td>
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAttendanceManagement;
