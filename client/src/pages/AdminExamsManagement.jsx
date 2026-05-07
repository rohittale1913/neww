import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { examAPI } from '../services/api';
import { FiFileText, FiCalendar, FiUsers, FiAward } from 'react-icons/fi';

const AdminExamsManagement = () => {
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, ongoing: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchExamsData = async () => {
      try {
        setLoading(true);
        const response = await examAPI.getAll();
        
        const examsData = response.data || [];
        setExams(examsData);

        // Calculate statistics
        const now = new Date();
        const upcoming = examsData.filter(e => new Date(e.date) > now).length;
        const completed = examsData.filter(e => new Date(e.endDate || e.date) < now).length;
        const ongoing = examsData.filter(e => {
          const start = new Date(e.date);
          const end = new Date(e.endDate || e.date);
          return start <= now && now <= end;
        }).length;

        setStats({
          total: examsData.length,
          upcoming,
          completed,
          ongoing
        });
      } catch (error) {
        console.error('Failed to fetch exams:', error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExamsData();
  }, []);

  const getStatusColor = (exam) => {
    const now = new Date();
    const start = new Date(exam.date);
    const end = new Date(exam.endDate || exam.date);

    if (now < start) {
      return 'text-yellow-600 bg-yellow-50';
    } else if (now > end) {
      return 'text-green-600 bg-green-50';
    } else {
      return 'text-purple-600 bg-purple-50';
    }
  };

  const getStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.date);
    const end = new Date(exam.endDate || exam.date);

    if (now < start) {
      return 'Upcoming';
    } else if (now > end) {
      return 'Completed';
    } else {
      return 'Ongoing';
    }
  };

  const StatCard = ({ icon: Icon, label, value, bgColor, iconColor }) => (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl border border-slate-100 hover:border-slate-300 transition p-6 flex items-center gap-4">
      <div className={`text-5xl p-4 rounded-2xl ${bgColor} shadow-md`}>
        <Icon className={iconColor} />
      </div>
      <div className="flex flex-col">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{loading ? '-' : value}</p>
      </div>
    </div>
  );

  const getFilteredExams = () => {
    if (filter === 'all') return exams;
    return exams.filter(exam => getStatus(exam).toLowerCase() === filter.toLowerCase());
  };

  const filteredExams = getFilteredExams();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-purple-600 bg-clip-text text-transparent">Exams Management</h1>
          <p className="text-slate-500 mt-2">Track and manage all school examinations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={FiFileText}
            label="Total Exams"
            value={stats.total}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={FiCalendar}
            label="Upcoming"
            value={stats.upcoming}
            bgColor="bg-indigo-100"
            iconColor="text-indigo-600"
          />
          <StatCard
            icon={FiAward}
            label="Ongoing"
            value={stats.ongoing}
            bgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={FiCheckCircle}
            label="Completed"
            value={stats.completed}
            bgColor="bg-green-100"
            iconColor="text-green-600"
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
                onClick={() => setFilter('upcoming')}
                className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ${
                  filter === 'upcoming'
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-yellow-500 hover:text-yellow-600'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('ongoing')}
                className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ${
                  filter === 'ongoing'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-purple-500 hover:text-purple-600'
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ${
                  filter === 'completed'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-green-500 hover:text-green-600'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Exam Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Max Marks</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <tr key={exam._id} className="border-b border-slate-100 hover:bg-purple-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{exam.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{exam.class || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{exam.subject || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(exam.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-semibold">{exam.maxMarks || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm ${getStatusColor(exam)}`}>
                          {getStatus(exam)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                      No exams found in this category
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

export default AdminExamsManagement;
