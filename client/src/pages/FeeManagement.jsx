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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Fee Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <FiDollarSign className="text-4xl text-blue-500" />
            <div>
              <p className="text-gray-600 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">${stats.totalAmount || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <FiCheckCircle className="text-4xl text-green-500" />
            <div>
              <p className="text-gray-600 text-sm">Paid</p>
              <p className="text-2xl font-bold text-gray-800">{stats.paid || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <FiClock className="text-4xl text-orange-500" />
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Fee Records</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-600">No fees found</td>
                </tr>
              ) : (
                fees.slice(0, 10).map((fee) => (
                  <tr key={fee._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">{fee.studentId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 capitalize">{fee.feeType}</td>
                    <td className="px-6 py-4 font-semibold">${fee.amount}</td>
                    <td className={`px-6 py-4 capitalize font-semibold ${getStatusColor(fee.status)}`}>
                      {fee.status}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
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
