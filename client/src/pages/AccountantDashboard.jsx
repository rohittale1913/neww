import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../store/authStore';
import { FiDollarSign, FiFileText, FiUsers, FiBarChart2 } from 'react-icons/fi';

const AccountantDashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    { icon: <FiDollarSign />, label: 'Total Fee Collection', value: '$50,000', bg: 'bg-emerald-50' },
    { icon: <FiFileText />, label: 'Pending Payments', value: '45', bg: 'bg-rose-50' },
    { icon: <FiUsers />, label: 'Students', value: '500', bg: 'bg-indigo-50' },
    { icon: <FiBarChart2 />, label: 'Revenue', value: '$75,000', bg: 'bg-violet-50' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Welcome, {user?.name}! 💰</h1>
          <p className="text-slate-600 text-sm mt-2">Manage finances, track fee collections, and monitor transactions</p>
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {[
                { student: 'John Doe', amount: '$500', date: '2026-03-10' },
                { student: 'Jane Smith', amount: '$500', date: '2026-03-09' },
                { student: 'Mike Johnson', amount: '$500', date: '2026-03-08' }
              ].map((trans, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg flex justify-between border border-slate-100">
                  <div>
                    <p className="font-medium text-slate-800">{trans.student}</p>
                    <p className="text-sm text-slate-600">{trans.date}</p>
                  </div>
                  <p className="font-bold text-emerald-600">{trans.amount}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Monthly Fee Summary</h2>
            <div className="space-y-3">
              {[
                { month: 'January', collected: '$15,000', pending: '$5,000' },
                { month: 'February', collected: '$18,000', pending: '$3,000' },
                { month: 'March', collected: '$17,000', pending: '$8,000' }
              ].map((month, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-medium text-slate-800">{month.month}</p>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-emerald-600">Collected: {month.collected}</span>
                    <span className="text-rose-600">Pending: {month.pending}</span>
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

export default AccountantDashboard;
