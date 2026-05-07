import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { feeAPI } from '../services/api';
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle, FiEye, FiEdit2, FiTrash2, FiPlus, FiDownload } from 'react-icons/fi';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

const FeeManagement = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('fees');
  const [entityTypeFilter, setEntityTypeFilter] = useState('student');
  const [fees, setFees] = useState([]);
  const [structures, setStructures] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  
  // Modal States
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  
  // Form States
  const [feeForm, setFeeForm] = useState({
    entityType: 'student',
    feeType: 'tuition',
    amount: '',
    dueDate: '',
    feeDescription: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '',
    paymentMethod: 'cash',
    transactionId: ''
  });

  const [structureForm, setStructureForm] = useState({
    entityType: 'student',
    feeName: '',
    feeType: 'tuition',
    amount: '',
    academicYear: new Date().getFullYear().toString()
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, [activeTab, entityTypeFilter, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'fees') {
        const response = await feeAPI.getAll({ 
          entityType: entityTypeFilter, 
          page, 
          limit: 20 
        });
        setFees(response.data.fees);
        setTotalPages(response.data.pages);
        
        // Fetch statistics
        const statsResponse = await feeAPI.getStatistics({ entityType: entityTypeFilter });
        setStats(statsResponse.data);
      } else if (activeTab === 'structures') {
        const response = await feeAPI.getStructures({ entityType: entityTypeFilter });
        setStructures(response.data);
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  // Create Fee
  const handleCreateFee = async (e) => {
    e.preventDefault();
    try {
      await feeAPI.create(feeForm);
      setAlert({ type: 'success', message: 'Fee created successfully' });
      setShowFeeModal(false);
      setFeeForm({
        entityType: 'student',
        feeType: 'tuition',
        amount: '',
        dueDate: '',
        feeDescription: ''
      });
      fetchData();
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to create fee' });
    }
  };

  // Update Fee
  const handleUpdateFee = async (e) => {
    e.preventDefault();
    try {
      await feeAPI.update(selectedFee._id, feeForm);
      setAlert({ type: 'success', message: 'Fee updated successfully' });
      setShowFeeModal(false);
      setSelectedFee(null);
      fetchData();
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to update fee' });
    }
  };

  // Delete Fee
  const handleDeleteFee = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this fee?')) {
      try {
        await feeAPI.delete(feeId);
        setAlert({ type: 'success', message: 'Fee deleted successfully' });
        fetchData();
      } catch (error) {
        setAlert({ type: 'error', message: 'Failed to delete fee' });
      }
    }
  };

  // Record Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await feeAPI.recordPayment(selectedFee._id, paymentForm);
      setAlert({ type: 'success', message: 'Payment recorded successfully' });
      setShowPaymentModal(false);
      setPaymentForm({ amountPaid: '', paymentMethod: 'cash', transactionId: '' });
      fetchData();
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to record payment' });
    }
  };

  // Create Fee Structure
  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      await feeAPI.createStructure(structureForm);
      setAlert({ type: 'success', message: 'Fee structure created successfully' });
      setShowStructureModal(false);
      setStructureForm({
        entityType: 'student',
        feeName: '',
        feeType: 'tuition',
        amount: '',
        academicYear: new Date().getFullYear().toString()
      });
      fetchData();
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to create fee structure' });
    }
  };

  // Delete Fee Structure
  const handleDeleteStructure = async (structureId) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await feeAPI.deleteStructure(structureId);
        setAlert({ type: 'success', message: 'Fee structure deleted successfully' });
        fetchData();
      } catch (error) {
        setAlert({ type: 'error', message: 'Failed to delete fee structure' });
      }
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

  const openEditModal = (fee) => {
    setSelectedFee(fee);
    setFeeForm({
      entityType: fee.entityType,
      feeType: fee.feeType,
      amount: fee.amount,
      dueDate: fee.dueDate?.split('T')[0],
      feeDescription: fee.feeDescription
    });
    setShowFeeModal(true);
  };

  const openPaymentModal = (fee) => {
    setSelectedFee(fee);
    setPaymentForm({ amountPaid: '', paymentMethod: 'cash', transactionId: '' });
    setShowPaymentModal(true);
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
            Fees Management
          </h1>
          <p className="text-slate-500 mt-2">Manage fees for students, teachers, and staff</p>
        </div>

        {/* Statistics Cards */}
        {activeTab === 'fees' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl text-blue-600 text-2xl">
                  <FiDollarSign />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Total Amount</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    ${stats.amounts?.totalAmount || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl text-green-600 text-2xl">
                  <FiCheckCircle />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Paid</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.summary?.paid || 0}</p>
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
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.summary?.pending || 0}</p>
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
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.summary?.overdue || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'fees'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fee Records
          </button>
          <button
            onClick={() => setActiveTab('structures')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'structures'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fee Structures
          </button>
        </div>

        {/* Entity Type Filter */}
        <div className="flex gap-3">
          {['student', 'teacher', 'staff', 'accountant'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setEntityTypeFilter(type);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                entityTypeFilter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}s
            </button>
          ))}
        </div>

        {/* FEE RECORDS TAB */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            {/* Add Fee Button */}
            <button
              onClick={() => {
                setSelectedFee(null);
                setFeeForm({
                  entityType: entityTypeFilter,
                  feeType: 'tuition',
                  amount: '',
                  dueDate: '',
                  feeDescription: ''
                });
                setShowFeeModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <FiPlus /> Add New Fee
            </button>

            {/* Fee Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Entity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Fee Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Due Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        Loading fees...
                      </td>
                    </tr>
                  ) : fees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        No fees found
                      </td>
                    </tr>
                  ) : (
                    fees.map((fee) => (
                      <tr key={fee._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">
                            {fee.entityId?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600 capitalize">{fee.feeType}</span>
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
                          <div className="flex gap-2">
                            {fee.status !== 'paid' && (
                              <button
                                onClick={() => openPaymentModal(fee)}
                                className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                title="Record Payment"
                              >
                                <FiCheckCircle />
                              </button>
                            )}
                            <button
                              onClick={() => openEditModal(fee)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteFee(fee._id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      page === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* FEE STRUCTURES TAB */}
        {activeTab === 'structures' && (
          <div className="space-y-6">
            {/* Add Structure Button */}
            <button
              onClick={() => {
                setStructureForm({
                  entityType: entityTypeFilter,
                  feeName: '',
                  feeType: 'tuition',
                  amount: '',
                  academicYear: new Date().getFullYear().toString()
                });
                setShowStructureModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <FiPlus /> Create Structure
            </button>

            {/* Structure Cards */}
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading structures...</div>
            ) : structures.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No fee structures found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {structures.map((structure) => (
                  <div
                    key={structure._id}
                    className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{structure.feeName}</h3>
                        <p className="text-slate-600 text-sm">{structure.entityCategory}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteStructure(structure._id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <div className="space-y-3 border-t border-slate-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Type:</span>
                        <span className="font-semibold text-slate-900 capitalize">{structure.feeType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Amount:</span>
                        <span className="font-semibold text-slate-900">${structure.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Academic Year:</span>
                        <span className="font-semibold text-slate-900">{structure.academicYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            structure.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {structure.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fee Modal */}
      <Modal isOpen={showFeeModal} onClose={() => setShowFeeModal(false)} title={selectedFee ? 'Edit Fee' : 'Create New Fee'}>
        <form onSubmit={selectedFee ? handleUpdateFee : handleCreateFee} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Entity Type</label>
            <select
              value={feeForm.entityType}
              onChange={(e) => setFeeForm({ ...feeForm, entityType: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="staff">Staff</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fee Type</label>
            <select
              value={feeForm.feeType}
              onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="tuition">Tuition</option>
              <option value="transport">Transport</option>
              <option value="uniform">Uniform</option>
              <option value="activities">Activities</option>
              <option value="exam">Exam</option>
              <option value="salary">Salary</option>
              <option value="bonus">Bonus</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              value={feeForm.amount}
              onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
            <input
              type="date"
              value={feeForm.dueDate}
              onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              value={feeForm.feeDescription}
              onChange={(e) => setFeeForm({ ...feeForm, feeDescription: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              {selectedFee ? 'Update Fee' : 'Create Fee'}
            </button>
            <button
              type="button"
              onClick={() => setShowFeeModal(false)}
              className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Paid</label>
            <input
              type="number"
              step="0.01"
              value={paymentForm.amountPaid}
              onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
              placeholder={`Max: $${selectedFee?.amount}`}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="check">Check</option>
              <option value="online">Online</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction ID (Optional)</label>
            <input
              type="text"
              value={paymentForm.transactionId}
              onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Record Payment
            </button>
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Fee Structure Modal */}
      <Modal
        isOpen={showStructureModal}
        onClose={() => setShowStructureModal(false)}
        title="Create Fee Structure"
      >
        <form onSubmit={handleCreateStructure} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Entity Type</label>
            <select
              value={structureForm.entityType}
              onChange={(e) => setStructureForm({ ...structureForm, entityType: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="staff">Staff</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fee Name</label>
            <input
              type="text"
              value={structureForm.feeName}
              onChange={(e) => setStructureForm({ ...structureForm, feeName: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fee Type</label>
            <select
              value={structureForm.feeType}
              onChange={(e) => setStructureForm({ ...structureForm, feeType: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="tuition">Tuition</option>
              <option value="transport">Transport</option>
              <option value="uniform">Uniform</option>
              <option value="salary">Salary</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              value={structureForm.amount}
              onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Create Structure
            </button>
            <button
              type="button"
              onClick={() => setShowStructureModal(false)}
              className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default FeeManagement;
