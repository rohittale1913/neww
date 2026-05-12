import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../store/authStore';
import { FiDollarSign, FiFileText, FiUsers, FiBarChart2, FiPlus } from 'react-icons/fi';
import { feeAPI } from '../services/api';

const AccountantDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeeStats = async () => {
      try {
        const res = await feeAPI.getStatistics();
        const data = res.data || res;
        
        const totalAmount = data.overall?.totalAmount || 0;
        const paidAmount = data.overall?.paidAmount || 0;
        const dueAmount = data.overall?.dueAmount || 0;
        const pendingCount = data.overall?.pendingRecords || 0;

        setStats([
          { 
            // icon: <FiDollarSign />, 
            label: 'Total Amount', 
            value: `₹${(totalAmount).toLocaleString()}`, 
            bg: 'bg-emerald-50' 
          },
          { 
            // icon: <FiFileText />, 
            label: 'Collected', 
            value: `₹${(paidAmount).toLocaleString()}`, 
            bg: 'bg-green-50' 
          },
          { 
            // icon: <FiUsers />, 
            label: 'Due Amount', 
            value: `₹${(dueAmount).toLocaleString()}`, 
            bg: 'bg-rose-50' 
          },
          { 
            // icon: <FiBarChart2 />,   
            label: 'Pending Fees', 
            value: pendingCount, 
            bg: 'bg-indigo-50' 
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch fee statistics:', error);
        setStats([
          { icon: <FiDollarSign />, label: 'Total Amount', value: '₹0', bg: 'bg-emerald-50' },
          { icon: <FiFileText />, label: 'Collected', value: '₹0', bg: 'bg-green-50' },
          { icon: <FiUsers />, label: 'Due Amount', value: '₹0', bg: 'bg-rose-50' },
          { icon: <FiBarChart2 />, label: 'Pending Fees', value: '0', bg: 'bg-indigo-50' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Welcome, {user?.name} ! </h1>
          {/* <p className="text-slate-600 text-sm mt-2">Manage finances, track fee collections, and monitor transactions</p> */}
        </div>

        {/* Action Card */}
        <button
          onClick={() => navigate('/accountant/fees')}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border border-purple-400"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-2xl font-bold">Create Student Fees</h3>
              {/* <p className="text-purple-100 mt-1">Create fees in bulk for classes and sections</p> */}
            </div>
            <FiPlus className="text-4xl" />
          </div>
        </button>

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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/accountant/fees')}
                className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-md transition flex items-center justify-between"
              >
                <span className="font-medium">View & Manage Fees</span>
                <FiPlus />
              </button>
              <p className="text-sm text-slate-600 text-center mt-4">
                {/* ✓ Use the fee management page to create, update, and monitor all student fees by class and section */}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Module Info</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p>✓ <strong>Total Amount:</strong> All fees created across all classes</p>
              <p>✓ <strong>Collected:</strong> Paid amount from student payments</p>
              <p>✓ <strong>Due Amount:</strong> Remaining balance to be collected</p>
              <p>✓ <strong>Pending Fees:</strong> Number of unpaid fee records</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountantDashboard;
