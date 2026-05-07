import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { feeAPI } from '../services/api';
import { FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        const [allFees, statistics] = await Promise.all([
          feeAPI.getAll(),
          feeAPI.getStatistics()
        ]);
        setFees(allFees.data);
        setStats(statistics.data);
      } catch (error) {
        console.error('Failed to fetch fees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-green-600 bg-clip-text text-transparent">Fee Management</h1>
          {/* <p className="text-slate-500 mt-2">Track and manage student fee payments</p> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl border border-slate-100 hover:border-slate-300 transition p-6 flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 text-5xl p-4 rounded-2xl text-blue-600 shadow-md">
              <FiDollarSign />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Amount</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">${stats.totalAmount || 0}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl border border-slate-100 hover:border-slate-300 transition p-6 flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 text-5xl p-4 rounded-2xl text-green-600 shadow-md">
              <FiCheckCircle />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Paid</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.paid || 0}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl border border-slate-100 hover:border-slate-300 transition p-6 flex items-center gap-4">
            <div className="bg-gradient-to-br from-orange-100 to-yellow-100 text-5xl p-4 rounded-2xl text-orange-600 shadow-md">
              <FiClock />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Fee Records</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm font-medium">Loading fee data...</td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm font-medium">No fee records found</td>
                </tr>
              ) : (
                fees.slice(0, 10).map((fee) => (
                  <tr key={fee._id} className="border-b border-slate-100 hover:bg-green-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{fee.studentId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 capitalize text-sm text-slate-700">{fee.feeType}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">${fee.amount}</td>
                    <td className="px-6 py-4 capitalize font-semibold text-sm">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm ${getStatusColor(fee.status)}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FeeManagement;
