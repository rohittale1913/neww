import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { FiCalendar, FiCheck, FiX, FiClock, FiFileText } from 'react-icons/fi';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentAPI.getMyAttendance({ month, year });
      setAttendance(response.data.attendance);
      setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'late':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <FiCheck className="text-green-600" />;
      case 'absent':
        return <FiX className="text-red-600" />;
      case 'leave':
        return <FiFileText className="text-yellow-600" />;
      case 'late':
        return <FiClock className="text-orange-600" />;
      default:
        return null;
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading && !attendance.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {months.map((m, idx) => (
              <option key={idx} value={idx + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase">Total Days</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalDays}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase">Present</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{summary.presentDays}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-red-50 to-rose-50 p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase">Absent</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{summary.absentDays}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase">Leave</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{summary.leaveDays}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase">Percentage</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{summary.attendancePercentage}%</p>
          </div>
        </div>
      )}

      {/* Attendance List */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Attendance Records</h3>
        </div>
        
        {attendance.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FiCalendar className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-500">No attendance records for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendance.map((record, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                      {new Date(record.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.classId?.className || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="capitalize">{record.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
