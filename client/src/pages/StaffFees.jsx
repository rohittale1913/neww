import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { feeAPI } from '../services/api';
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle, FiDownload } from 'react-icons/fi';
import Alert from '../components/Alert';

const StaffFees = () => {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchFees();
  }, [statusFilter]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const feesResponse = await feeAPI.getMyFees(params);
      setFees(feesResponse.data);

      // Calculate stats
      if (feesResponse.data.length > 0) {
        const stats = {
          total: feesResponse.data.length,
          paid: feesResponse.data.filter(f => f.status === 'paid').length,
          pending: feesResponse.data.filter(f => f.status === 'pending').length,
          overdue: feesResponse.data.filter(f => f.status === 'overdue').length,
          totalAmount: feesResponse.data.reduce((sum, f) => sum + f.amount, 0),
          paidAmount: feesResponse.data.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0),
          pendingAmount: feesResponse.data.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0)
        };
        setStats(stats);
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to fetch fees' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-orange-600 bg-orange-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      case 'partially_paid':
        return 'text-blue-600 bg-blue-50';
      case 'waived':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <FiCheckCircle className="text-green-600" />;
      case 'pending':
        return <FiClock className="text-orange-600" />;
      case 'overdue':
        return <FiAlertCircle className="text-red-600" />;
      default:
        return <FiDollarSign className="text-gray-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header */}
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent">
            My Salary & Fees
          </h1>
          <p className="text-slate-500 mt-2">View and track your salary and deductions</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl text-blue-600 text-2xl">
                <FiDollarSign />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase">Total Amount</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">${stats.totalAmount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl text-green-600 text-2xl">
                <FiCheckCircle />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase">Processed</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">${stats.paidAmount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-4 rounded-2xl text-orange-600 text-2xl">
                <FiClock />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase">Pending</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">${stats.pendingAmount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-2xl text-red-600 text-2xl">
                <FiAlertCircle />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase">Overdue</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.overdue || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 flex-wrap">
          {['all', 'pending', 'paid', 'overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Fees Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Loading your salary details...
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No salary records found
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(fee.status)}
                        <span className="font-medium text-slate-900">
                          {fee.feeDescription || fee.feeType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">${fee.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(fee.status)}`}>
                        {fee.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{fee.month || 'N/A'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-3">Salary Payment Information</h3>
          <ul className="space-y-2 text-slate-700 text-sm">
            <li>• Salaries are processed on the last working day of each month</li>
            <li>• For salary deduction queries, contact the HR/Accounts department</li>
            <li>• Keep records of all salary slips for future reference</li>
            <li>• Fees marked as "Waived" have been exempted as per school policy</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffFees;
