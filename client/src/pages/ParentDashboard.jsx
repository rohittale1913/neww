import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../store/authStore';
import { FiUsers, FiBarChart2, FiDollarSign, FiCheckCircle } from 'react-icons/fi';

const ParentDashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    { icon: <FiUsers />, label: 'Child Attendance', value: '92%', bg: 'bg-indigo-50' },
    { icon: <FiBarChart2 />, label: 'Average Score', value: '85%', bg: 'bg-cyan-50' },
    { icon: <FiDollarSign />, label: 'Outstanding Fees', value: '$50', bg: 'bg-rose-50' },
    { icon: <FiCheckCircle />, label: 'Pending Assignments', value: '2', bg: 'bg-violet-50' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Welcome, {user?.name}! 👨‍👩‍👧</h1>
          <p className="text-slate-600 text-sm mt-2">Monitor your child's academic progress and activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.bg} rounded-xl shadow-sm border border-slate-200 p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl text-slate-700">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Child's Recent Results</h2>
            <div className="space-y-3">
              {[
                { subject: 'Mathematics', score: '92', grade: 'A+' },
                { subject: 'English', score: '88', grade: 'A' },
                { subject: 'Science', score: '85', grade: 'B+' }
              ].map((result, idx) => (
                <div key={idx} className="p-3 bg-indigo-50 rounded-lg flex justify-between items-center border border-indigo-100">
                  <div>
                    <p className="font-medium text-slate-800">{result.subject}</p>
                    <p className="text-sm text-slate-600">Score: {result.score}%</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">{result.grade}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Notifications</h2>
            <div className="space-y-3">
              {[
                { message: 'Report card uploaded', date: '2026-03-10', type: 'success' },
                { message: 'Fee payment due on 2026-03-20', date: '2026-03-05', type: 'warning' },
                { message: 'School holiday on 2026-03-31', date: '2026-03-01', type: 'info' }
              ].map((notif, idx) => (
                <div key={idx} className={`p-3 rounded-lg text-sm border ${
                  notif.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                  notif.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-100' :
                  'bg-blue-50 text-blue-800 border-blue-100'
                }`}>
                  <p className="font-medium">{notif.message}</p>
                  <p className="text-xs mt-1 opacity-75">{notif.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
