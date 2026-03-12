import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentAPI, attendanceAPI, feeAPI } from '../services/api';
import { FiUsers, FiDollarSign, FiCheckCircle, FiCalendar } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingFees: 0,
    presentToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [students, fees] = await Promise.all([
          studentAPI.getAll(),
          feeAPI.getPending()
        ]);

        setStats({
          totalStudents: students.data.length,
          totalTeachers: 0, // Would fetch from teacher API
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

  const StatCard = ({ icon: Icon, label, value, bgColor, iconColor }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition p-6 flex items-center gap-4">
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
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Welcome Back! 👋</h1>
          <p className="text-slate-600 mt-2">Here's your school management overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={FiUsers} 
            label="Total Students" 
            value={stats.totalStudents}
            bgColor="bg-blue-100"
            iconColor="text-primary"
          />
          <StatCard 
            icon={FiUsers} 
            label="Total Teachers" 
            value={stats.totalTeachers}
            bgColor="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <StatCard 
            icon={FiDollarSign} 
            label="Pending Fees" 
            value={stats.pendingFees}
            bgColor="bg-rose-100"
            iconColor="text-rose-600"
          />
          <StatCard 
            icon={FiCheckCircle} 
            label="Present Today" 
            value={stats.presentToday}
            bgColor="bg-violet-100"
            iconColor="text-accent"
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
