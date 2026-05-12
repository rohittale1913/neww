import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { feeAPI, classAPI } from '../services/api';
import { FiFilter, FiDownload, FiSearch } from 'react-icons/fi';
import Alert from '../components/Alert';

const AccountantManageFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    status: '',
    studentName: ''
  });
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (fees.length > 0) {
      filterFees();
    }
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all fees
      const feesRes = await feeAPI.getAll();
      const feesData = feesRes.data || feesRes;
      const feesArray = feesData.fees || feesData;
      setFees(Array.isArray(feesArray) ? feesArray : []);

      // Fetch classes for filter dropdown
      const classesRes = await classAPI.getAll();
      const classesData = Array.isArray(classesRes) ? classesRes : (classesRes.data || []);
      const uniqueClasses = [...new Map(
        classesData
          .filter((item) => item?.className)
          .map((item) => [item.className, item])
      ).values()];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Failed to fetch fees data:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load fees data'
      });
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFees = () => {
    let filtered = fees;

    if (filters.class) {
      filtered = filtered.filter(f => 
        f.classId?.className === filters.class || f.classId === filters.class
      );
    }

    if (filters.section) {
      filtered = filtered.filter(f => 
        f.classId?.section === filters.section
      );
    }

    if (filters.status) {
      filtered = filtered.filter(f => f.status === filters.status);
    }

    if (filters.studentName) {
      filtered = filtered.filter(f =>
        f.studentId?.name?.toLowerCase().includes(filters.studentName.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredFees = filterFees();

  const getSectionForClass = (className) => {
    return [...new Set(
      classes
        .filter(c => c.className === className)
        .map(c => c.section)
    )];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Class', 'Section', 'Fee Type', 'Total Amount', 'Paid Amount', 'Due Amount', 'Status', 'Due Date'];
    const rows = filteredFees.map(fee => [
      fee.studentId?.name || 'N/A',
      fee.classId?.className || 'N/A',
      fee.classId?.section || 'N/A',
      fee.feeType || 'N/A',
      fee.totalAmount || '0',
      fee.paidAmount || '0',
      fee.dueAmount || '0',
      fee.status || 'N/A',
      fee.dueDate?.split('T')[0] || 'N/A'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `fees-management-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setAlert({
      type: 'success',
      message: '✓ CSV exported successfully'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-purple-600 bg-clip-text text-transparent">
            Manage Fees
          </h1>
          <p className="text-slate-500 mt-2">View and monitor student fees across all classes and sections</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
              <select
                value={filters.class}
                onChange={(e) => setFilters({ ...filters, class: e.target.value, section: '' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">All Classes</option>
                {classes.map((c, idx) => (
                  <option key={idx} value={c.className}>{c.className}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Section</label>
              <select
                value={filters.section}
                onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                disabled={!filters.class}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-gray-100"
              >
                <option value="">All Sections</option>
                {filters.class && getSectionForClass(filters.class).map((section, idx) => (
                  <option key={idx} value={section}>{section}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Student Name</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filters.studentName}
                  onChange={(e) => setFilters({ ...filters, studentName: e.target.value })}
                  placeholder="Search student..."
                  className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total Records</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{filteredFees.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-green-600 font-medium">Paid</p>
            <p className="text-3xl font-bold text-green-900 mt-1">
              {filteredFees.filter(f => f.status === 'paid').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
            <p className="text-sm text-yellow-600 font-medium">Partially Paid</p>
            <p className="text-3xl font-bold text-yellow-900 mt-1">
              {filteredFees.filter(f => f.status === 'partially_paid').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <p className="text-sm text-red-600 font-medium">Pending/Overdue</p>
            <p className="text-3xl font-bold text-red-900 mt-1">
              {filteredFees.filter(f => f.status === 'pending' || f.status === 'overdue').length}
            </p>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
          >
            <FiDownload /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading fees data...</div>
          ) : filteredFees.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No fees found matching the selected filters</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Student Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Class</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Section</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Fee Type</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Total</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Paid</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Due</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredFees.map((fee) => (
                    <tr key={fee._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3 text-sm text-slate-900 font-medium">{fee.studentId?.name || 'N/A'}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{fee.classId?.className || 'N/A'}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{fee.classId?.section || 'N/A'}</td>
                      <td className="px-6 py-3 text-sm text-slate-600 capitalize">{fee.feeType || 'N/A'}</td>
                      <td className="px-6 py-3 text-sm text-right text-slate-900 font-semibold">₹{(fee.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm text-right text-green-600 font-semibold">₹{(fee.paidAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm text-right text-red-600 font-semibold">₹{(fee.dueAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(fee.status)}`}>
                          {fee.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600">{fee.dueDate?.split('T')[0] || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountantManageFees;
