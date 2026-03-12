import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const StudentDashboard = () => {
  const stats = [
    { label: 'Attendance', value: '85%', bg: 'bg-indigo-50', icon: '📊' },
    { label: 'Pending Assignments', value: '3', bg: 'bg-cyan-50', icon: '📝' },
    { label: 'Total Fees', value: '$500', bg: 'bg-rose-50', icon: '💳' },
    { label: 'GPA', value: '3.8', bg: 'bg-violet-50', icon: '🎯' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Welcome, Student! 👋</h1>
          <p className="text-slate-600 text-sm mt-2">Track your academic progress and upcoming activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.bg} rounded-xl shadow-sm border border-slate-200 p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Upcoming Classes</h2>
            <div className="space-y-3">
              {['Math - 9:00 AM', 'English - 10:30 AM', 'Physics - 1:00 PM'].map((cls, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border-l-4 border-primary text-slate-800">
                  {cls}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Announcements</h2>
            <div className="space-y-3">
              {['Final exams schedule released', 'Holiday notice', 'Fee submission deadline'].map((ann, idx) => (
                <div key={idx} className="p-4 bg-indigo-50 rounded-lg text-indigo-900 text-sm border border-indigo-100\">
                  {ann}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
