import React, { useState, useEffect } from 'react';
import { studentAPI, feeAPI } from '../services/api';
import { FiCreditCard, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import Modal from './Modal';

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amountPaid: '',
    paymentMethod: 'online',
    transactionId: '',
    remarks: ''
  });
  const [processing, setProcessing] = useState(false);

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

  const handlePaymentClick = (fee) => {
    setSelectedFee(fee);
    setPaymentData({
      amountPaid: fee.dueAmount?.toString() || '',
      paymentMethod: 'online',
      transactionId: `TXN-${Date.now()}`,
      remarks: ''
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFee || !paymentData.amountPaid) {
      alert('Please enter payment amount');
      return;
    }

    const amount = parseFloat(paymentData.amountPaid);
    if (amount <= 0 || amount > selectedFee.dueAmount) {
      alert(`Payment amount must be between 0 and ${selectedFee.dueAmount}`);
      return;
    }

    try {
      setProcessing(true);
      
      await feeAPI.recordPayment({
        feeId: selectedFee._id,
        amountPaid: amount,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        remarks: paymentData.remarks
      });

      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      fetchFees();
    } catch (error) {
      alert('Failed to record payment: ' + error.message);
    } finally {
      setProcessing(false);
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
      library: 'Library Fee',
      sports: 'Sports Fee',
      registration: 'Registration Fee',
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
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-700">Total Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-700">Paid Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-700">Due Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fees.map((fee, idx) => (
                  <tr key={fee._id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {getFeeTypeLabel(fee.feeType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-slate-900">
                      ₹{fee.totalAmount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                      ₹{fee.paidAmount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-orange-600">
                      ₹{fee.dueAmount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(fee.status)}
                    </td>
                    <td className="px-6 py-4">
                      {fee.status !== 'paid' && (
                        <button
                          onClick={() => handlePaymentClick(fee)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                        >
                          Pay
                        </button>
                      )}
                      {fee.status === 'paid' && (
                        <span className="text-green-600 font-semibold text-xs">✓ Paid</span>
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
          <p className="text-xs text-slate-600 mb-4">Please click the "Pay" button in the table to make a payment.</p>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        {selectedFee && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {/* Fee Summary */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-3">Fee: {getFeeTypeLabel(selectedFee.feeType)}</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase">Total</p>
                  <p className="text-lg font-bold text-slate-900">₹{selectedFee.totalAmount?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase">Paid</p>
                  <p className="text-lg font-bold text-green-600">₹{selectedFee.paidAmount?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase">Due</p>
                  <p className="text-lg font-bold text-red-600">₹{selectedFee.dueAmount?.toLocaleString('en-IN') || 0}</p>
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-600 font-semibold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedFee.dueAmount}
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Max: ₹{selectedFee.dueAmount?.toLocaleString('en-IN') || 0}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="online">Online Transfer</option>
                <option value="card">Credit/Debit Card</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
              </select>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Optional: Reference number"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Remarks
              </label>
              <textarea
                value={paymentData.remarks}
                onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Optional: Any additional notes"
                rows="2"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Submit Payment'}
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StudentFees;
