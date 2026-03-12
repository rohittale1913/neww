import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../store/authStore';
import { FiBook, FiUsers, FiBarChart2, FiCheckCircle } from 'react-icons/fi';

const LibrarianDashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    { icon: <FiBook />, label: 'Total Books', value: '2,500', bg: 'bg-indigo-50' },
    { icon: <FiCheckCircle />, label: 'Books Issued', value: '450', bg: 'bg-emerald-50' },
    { icon: <FiUsers />, label: 'Active Members', value: '850', bg: 'bg-violet-50' },
    { icon: <FiBarChart2 />, label: 'Overdue Books', value: '12', bg: 'bg-rose-50' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Welcome, {user?.name}! 📚</h1>
          <p className="text-slate-600 text-sm mt-2">Manage library inventory, track book issues, and maintain member records</p>
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recently Issued Books</h2>
            <div className="space-y-3">
              {[
                { book: 'The Great Gatsby', student: 'John Doe', issueDate: '2026-03-10' },
                { book: 'To Kill a Mockingbird', student: 'Jane Smith', issueDate: '2026-03-09' },
                { book: '1984', student: 'Mike Johnson', issueDate: '2026-03-08' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-medium text-slate-800">{item.book}</p>
                  <div className="flex justify-between text-sm mt-1 text-slate-600">
                    <span>{item.student}</span>
                    <span>{item.issueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Overdue Books</h2>
            <div className="space-y-3">
              {[
                { book: 'Python Programming', student: 'Alex Brown', daysOverdue: '5 days' },
                { book: 'Data Science Basics', student: 'Sarah Davis', daysOverdue: '3 days' },
                { book: 'Web Development', student: 'Tom Wilson', daysOverdue: '7 days' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-rose-50 rounded-lg border-l-4 border border-rose-200">
                  <p className="font-medium text-slate-800">{item.book}</p>
                  <div className="flex justify-between text-sm mt-1 text-slate-600">
                    <span>{item.student}</span>
                    <span className="text-rose-600 font-medium">{item.daysOverdue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LibrarianDashboard;
