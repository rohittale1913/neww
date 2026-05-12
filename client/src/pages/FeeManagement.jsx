import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { feeAPI, classAssignmentAPI, studentAPI } from '../services/api';
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle, FiFilter, FiDownload } from 'react-icons/fi';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    paidRecords: 0,
    pendueRecords: 0,
    overdueRecords: 0,
    partiallyPaidRecords: 0,
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    classId: '',
    studentId: '',
    status: 'all',
    feeType: 'all',
    academicYear: '2024-2025'
  });

  useEffect(() => {
    fetchData();
    fetchClasses();
  }, [filters, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(filters.classId && { classId: filters.classId }),
        ...(filters.studentId && { studentId: filters.studentId }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.feeType !== 'all' && { feeType: filters.feeType }),
        academicYear: filters.academicYear
      };

      const [feesRes, statsRes] = await Promise.all([
        feeAPI.getAll(params),
        feeAPI.getStatistics({ 
          classId: filters.classId, 
          academicYear: filters.academicYear 
        })
      ]);

      const feesArray = Array.isArray(feesRes.data) ? feesRes.data : (feesRes.data?.fees || []);
      setFees(feesArray);
      
      if (feesRes.data?.pagination) {
        setTotalPages(feesRes.data.pagination.pages);
      }
      
      setStats(statsRes.data?.overall || stats);
    } catch (error) {
      console.error('Failed to fetch fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await classAssignmentAPI.getAllClasses();
      const classesArray = Array.isArray(res) ? res : (res.data || []);
      
      const formattedClasses = classesArray.map(c => ({
        _id: c._id,
        label: `${c.className} - ${c.section}`
      }));
      
      setClasses(formattedClasses);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchStudents = async (classId) => {
    if (!classId) {
      setStudents([]);
      return;
    }
    
    try {
      const res = await studentAPI.getByClass(classId);
      const studentsArray = Array.isArray(res.data) ? res.data : (res.data?.students || []);
      
      setStudents(studentsArray.map(s => ({
        _id: s._id,
        name: s.name,
        studentId: s.studentId
      })));
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    
    if (name === 'classId' && value !== '') {
      fetchStudents(value);
    }
    
    setCurrentPage(1);
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

  const handleExportCSV = () => {
    let csv = 'Student,Class,Fee Type,Total Amount,Collected,Due,Status,Due Date\n';
    
    fees.forEach(fee => {
      csv += `"${fee.studentId?.name || 'Unknown'}","${fee.studentId?.class || 'N/A'}","${fee.feeType}",${fee.totalAmount},${fee.paidAmount},${fee.dueAmount},"${fee.status}","${new Date(fee.dueDate).toLocaleDateString()}"\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `fees-report-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-green-600 bg-clip-text text-transparent">
              Fee Reports & Monitoring
            </h1>
            <p className="text-slate-500 mt-2">View fee statistics, payments, and collection status by class and student</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FiDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase">Total Amount</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">₹{stats.totalAmount?.toFixed(2) || 0}</p>
              </div>
              <FiDollarSign className="text-4xl text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase">Collected</p>
                <p className="text-2xl font-bold text-green-900 mt-1">₹{stats.paidAmount?.toFixed(2) || 0}</p>
              </div>
              <FiCheckCircle className="text-4xl text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase">Pending/Due</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">₹{stats.dueAmount?.toFixed(2) || 0}</p>
              </div>
              <FiClock className="text-4xl text-orange-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase">Overdue</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{stats.overdueRecords || 0}</p>
              </div>
              <FiAlertCircle className="text-4xl text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Filter Fees</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              name="academicYear"
              value={filters.academicYear}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>

            <select
              name="classId"
              value={filters.classId}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.label}</option>
              ))}
            </select>

            <select
              name="studentId"
              value={filters.studentId}
              onChange={handleFilterChange}
              disabled={!filters.classId}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-gray-100"
            >
              <option value="">All Students</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>

            <select
              name="feeType"
              value={filters.feeType}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Fee Types</option>
              <option value="tuition">Tuition</option>
              <option value="transport">Transport</option>
              <option value="uniform">Uniform</option>
              <option value="activities">Activities</option>
              <option value="exam">Exam</option>
              <option value="library">Library</option>
              <option value="sports">Sports</option>
            </select>
          </div>
        </div>

        {/* Fee Records Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">Fee Records ({stats.totalRecords})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Fee Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Total</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Collected</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Due</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500 text-sm">Loading...</td>
                  </tr>
                ) : fees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500 text-sm">No fee records found</td>
                  </tr>
                ) : (
                  fees.map(fee => (
                    <tr key={fee._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{fee.studentId?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{fee.studentId?.class || 'N/A'}</td>
                      <td className="px-6 py-4 capitalize text-sm text-slate-700">{fee.feeType}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm text-right">₹{fee.totalAmount?.toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold text-green-700 text-sm text-right">₹{fee.paidAmount?.toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold text-orange-700 text-sm text-right">₹{fee.dueAmount?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(fee.dueDate).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FeeManagement;
