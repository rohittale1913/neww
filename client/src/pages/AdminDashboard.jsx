import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentAPI, teacherAPI, accountantAPI, attendanceAPI, feeAPI } from '../services/api';
import { FiUsers, FiDollarSign, FiCheckCircle, FiCalendar } from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    pendingFees: 0,
    presentToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [students, teachers, staff, fees] = await Promise.all([
          studentAPI.getAll(),
          teacherAPI.getAll(),
          accountantAPI.getAll(),
          feeAPI.getPending()
        ]);

        setStats({
          totalStudents: students.data.length,
          totalTeachers: teachers.data.length,
          totalStaff: staff.data.length,
          pendingFees: fees.data.length,
          presentToday: 0
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, bgColor, iconColor, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition p-6 flex items-center gap-4 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`text-3xl p-3 rounded-lg ${bgColor}`}>
        <Icon className={iconColor} />
      </div>
      <div>
        <p className="text-slate-600 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : value}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Welcome Back !</h1>
            {/* <p className="text-slate-600 mt-2">Here's your school management overview</p> */}
          </div>
              {/* <button
                onClick={() => navigate('/admin/registration')}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                + Register User
              </button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={FiUsers} 
            label="Total Students" 
            value={stats.totalStudents}
            bgColor="bg-blue-100"
            iconColor="text-primary"
            onClick={() => navigate('/admin/students-view')}
          />
          <StatCard 
            icon={FiUsers} 
            label="Total Teachers" 
            value={stats.totalTeachers}
            bgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            onClick={() => navigate('/admin/teachers-view')}
          />
          <StatCard 
            icon={FiUsers} 
            label="Total Staff" 
            value={stats.totalStaff}
            bgColor="bg-orange-100"
            iconColor="text-orange-600"
            onClick={() => navigate('/admin/staff-view')}
          />
          <StatCard 
            icon={FiDollarSign} 
            label="Pending Fees" 
            value={stats.pendingFees}
            bgColor="bg-rose-100"
            iconColor="text-rose-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Students</h2>
            <div className="text-slate-500 text-center py-12">
              <p className="text-sm">No recent activity</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Pending Tasks</h2>
            <div className="text-slate-500 text-center py-12">
              <p className="text-sm">No pending tasks</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
