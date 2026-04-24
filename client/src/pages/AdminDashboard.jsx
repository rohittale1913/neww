import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentAPI, teacherAPI, accountantAPI, attendanceAPI, feeAPI, examAPI } from '../services/api';
import { FiUsers, FiDollarSign, FiCheckCircle, FiCalendar, FiFileText, FiAward } from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    pendingFees: 0,
    presentToday: 0,
    totalExams: 0,
    upcomingExams: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [students, teachers, staff, fees, exams] = await Promise.all([
          studentAPI.getAll(),
          teacherAPI.getAll(),
          accountantAPI.getAll(),
          feeAPI.getPending(),
          examAPI.getAll()
        ]);

        const examsData = exams.data || [];
        const now = new Date();
        const upcomingCount = examsData.filter(e => new Date(e.date) > now).length;

        setStats({
          totalStudents: students.data.length,
          totalTeachers: teachers.data.length,
          totalStaff: staff.data.length,
          pendingFees: fees.data.length,
          presentToday: 0,
          totalExams: examsData.length,
          upcomingExams: upcomingCount
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
      className={`bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 hover:border-slate-300 transition duration-300 p-6 flex items-center gap-4 transform hover:scale-105 hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`text-5xl p-4 rounded-2xl ${bgColor} shadow-md`}>
        <Icon className={iconColor} />
      </div>
      <div className="flex flex-col">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-4xl font-bold text-slate-900 mt-2">{loading ? '-' : value}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent">Welcome Back!</h1>
            <p className="text-slate-500 mt-3 text-lg">Here's your school management overview</p>
          </div>
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
            onClick={() => navigate('/admin/fees')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            icon={FiCheckCircle} 
            label="Attendance Module" 
            value={stats.presentToday}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
            onClick={() => navigate('/admin/attendance')}
          />
          <StatCard 
            icon={FiAward} 
            label="Total Exams" 
            value={stats.totalExams}
            bgColor="bg-indigo-100"
            iconColor="text-indigo-600"
            onClick={() => navigate('/admin/exams')}
          />
          <StatCard 
            icon={FiFileText} 
            label="Upcoming Exams" 
            value={stats.upcomingExams}
            bgColor="bg-sky-100"
            iconColor="text-sky-600"
            onClick={() => navigate('/admin/exams')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 10H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Recent Students</h2>
            </div>
            <div className="text-slate-500 text-center py-12">
              <p className="text-sm">No recent activity</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Pending Tasks</h2>
            </div>
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
