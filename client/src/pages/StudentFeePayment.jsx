import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { feeAPI } from '../services/api';
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import Modal from '../components/Modal';
import useAuthStore from '../store/authStore';

const StudentFeePayment = () => {
  const { user, studentProfile } = useAuthStore();
  const [feeSummary, setFeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
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
    fetchStudentFees();
  }, [studentProfile?._id]);

  const fetchStudentFees = async () => {
    try {
      setLoading(true);
      // Get student ID from studentProfile (set during login)
      const studentId = studentProfile?._id;
      
      if (!studentId) {
        console.error('❌ Student ID not found. Available data:', {
          user: user?._id,
          studentProfile: studentProfile?._id,
          fullProfile: studentProfile
        });
        setFeeSummary({
          student: null,
          academicYear: '2024-2025',
          totalFees: 0,
          totalAmount: 0,
          paidAmount: 0,
          dueAmount: 0,
          paidCount: 0,
          pendingCount: 0,
          overdueCount: 0,
          fees: []
        });
        return;
      }

      console.log('📚 Fetching fees for student:', studentId);
      
      // Fetch student fees summary
      const response = await feeAPI.getSummary(studentId, { academicYear: '2024-2025' });
      const summary = response.data;
      
      // Ensure fees array exists
      if (!summary.fees) {
        summary.fees = [];
      }
      
      console.log('📊 Student fees loaded:', {
        totalFees: summary.totalFees,
        totalAmount: summary.totalAmount,
        studentId: studentId,
        academicYear: summary.academicYear,
        fees: summary.fees.length
      });
      
      setFeeSummary(summary);
    } catch (error) {
      console.error('❌ Failed to fetch student fees:', error);
      // Set empty summary on error
      setFeeSummary({
        student: null,
        academicYear: '2024-2025',
        totalFees: 0,
        totalAmount: 0,
        paidAmount: 0,
        dueAmount: 0,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
        fees: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = (fee) => {
    setSelectedFee(fee);
    setPaymentData({
      amountPaid: fee.dueAmount.toString(),
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
      fetchStudentFees();
    } catch (error) {
      alert('Failed to record payment: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <FiCheckCircle className="text-green-600 text-2xl" />;
      case 'pending': return <FiClock className="text-orange-600 text-2xl" />;
      case 'overdue': return <FiAlertCircle className="text-red-600 text-2xl" />;
      case 'partially_paid': return <FiDollarSign className="text-blue-600 text-2xl" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'partially_paid': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your fees...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
            My Fees & Payments
          </h1>
          <p className="text-slate-500 mt-2">View and pay your school fees</p>
        </div>

        {/* Summary Cards */}
        {feeSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-600 uppercase">Total Fees</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">${feeSummary.totalAmount?.toFixed(2) || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <p className="text-xs font-semibold text-green-600 uppercase">Amount Paid</p>
              <p className="text-3xl font-bold text-green-900 mt-2">${feeSummary.paidAmount?.toFixed(2) || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <p className="text-xs font-semibold text-orange-600 uppercase">Amount Due</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">${feeSummary.dueAmount?.toFixed(2) || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <p className="text-xs font-semibold text-purple-600 uppercase">Status</p>
              <div className="mt-2 flex items-center gap-2">
                {feeSummary.dueAmount === 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <p className="text-lg font-bold text-purple-900">Fully Paid</p>
                  </>
                ) : feeSummary.paidAmount > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <p className="text-lg font-bold text-purple-900">Partial</p>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <p className="text-lg font-bold text-purple-900">Pending</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {feeSummary && (
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Payment Progress</span>
              <span className="text-sm font-semibold text-slate-700">
                {feeSummary.totalAmount > 0 ? Math.round((feeSummary.paidAmount / feeSummary.totalAmount) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${feeSummary.totalAmount > 0 ? (feeSummary.paidAmount / feeSummary.totalAmount) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Fee Details Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">Fee Details</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Fee Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Total Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Paid Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Due Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {feeSummary?.fees && feeSummary.fees.length > 0 ? (
                  feeSummary.fees.map(fee => (
                    <tr key={fee._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        <span className="capitalize">{fee.feeType}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">
                        ${fee.totalAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-700 text-right">
                        ${fee.paidAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-orange-700 text-right">
                        ${fee.dueAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(fee.status)}`}>
                          {fee.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No fee records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        {selectedFee?.paymentCount > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Payment History for {selectedFee?.feeType}</h3>
            <div className="space-y-3">
              {/* Payment history would be displayed here */}
              <p className="text-sm text-slate-600">{selectedFee?.paymentCount} payment(s) recorded</p>
            </div>
          </div>
        )}
      </div>

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase">Total Due</p>
                  <p className="text-xl font-bold text-slate-900">${selectedFee.dueAmount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase">Already Paid</p>
                  <p className="text-xl font-bold text-green-600">${selectedFee.paidAmount?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-600 font-semibold">$</span>
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
                Max: ${selectedFee.dueAmount?.toFixed(2)}
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
                rows="3"
                placeholder="Add any notes about this payment"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition font-semibold"
              >
                {processing ? 'Processing...' : 'Record Payment'}
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>

            {/* Important Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              <p className="font-semibold mb-1">📋 Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Payments are processed immediately and cannot be reversed</li>
                <li>You will receive a confirmation email</li>
                <li>Keep your transaction ID for reference</li>
              </ul>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default StudentFeePayment;
