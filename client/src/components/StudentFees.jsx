import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { FiCreditCard, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchFees();
  }, [statusFilter]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentAPI.getMyFees({
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setFees(response.data.fees);
      setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: FiCheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: FiClock },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: FiAlertCircle },
      partially_paid: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: FiCreditCard }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-4 h-4" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const getFeeTypeLabel = (feeType) => {
    const types = {
      tuition: 'Tuition Fee',
      transport: 'Transport Fee',
      uniform: 'Uniform Fee',
      activities: 'Activities Fee',
      exam: 'Exam Fee',
      other: 'Other'
    };
    return types[feeType] || feeType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading fees...</p>
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

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">₹{summary.totalAmount?.toLocaleString('en-IN') || 0}</p>
              </div>
              <FiCreditCard className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600 mt-2">₹{summary.paidAmount?.toLocaleString('en-IN') || 0}</p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-red-50 to-rose-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Due Amount</p>
                <p className="text-2xl font-bold text-red-600 mt-2">₹{summary.dueAmount?.toLocaleString('en-IN') || 0}</p>
              </div>
              <FiAlertCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Status</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {summary.dueAmount === 0 ? '✓ Clear' : summary.dueAmount > 0 ? 'Due' : '-'}
                </p>
              </div>
              <div className={`w-8 h-8 ${summary.dueAmount === 0 ? 'text-green-600' : 'text-orange-600'} opacity-50`}>
                {summary.dueAmount === 0 ? '✓' : '!'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'paid', 'overdue', 'partially_paid'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === status
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status === 'partially_paid' ? 'Partial' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Fees Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Fee Records</h3>
        </div>

        {fees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FiCreditCard className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-500">No fee records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Fee Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Academic Year</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-700">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Paid Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fees.map((fee, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {getFeeTypeLabel(fee.feeType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fee.academicYear || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-slate-900">
                      ₹{fee.amount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(fee.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fee.paymentMethod ? (
                        <span className="capitalize">{fee.paymentMethod}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      {summary && summary.dueAmount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-bold text-slate-900 mb-2">Outstanding Payment Due</h3>
          <p className="text-sm text-slate-700 mb-4">
            You have an outstanding fee amount of <span className="font-bold text-red-600">₹{summary.dueAmount?.toLocaleString('en-IN') || 0}</span>
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors">
              Pay Now
            </button>
            <button className="px-4 py-2 border border-amber-300 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors">
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;
