import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../store/authStore';
import { FiTruck, FiUsers, FiMapPin, FiBarChart2 } from 'react-icons/fi';

const TransportManagerDashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    { icon: <FiTruck />, label: 'Total Buses', value: '15', bg: 'bg-indigo-50' },
    { icon: <FiUsers />, label: 'Students', value: '600', bg: 'bg-emerald-50' },
    { icon: <FiMapPin />, label: 'Routes', value: '12', bg: 'bg-cyan-50' },
    { icon: <FiBarChart2 />, label: 'Drivers', value: '18', bg: 'bg-violet-50' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Welcome, {user?.name}! 🚌</h1>
          <p className="text-slate-600 text-sm mt-2">Manage transport fleet, routes, drivers, and maintenance schedules</p>
        </div>

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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Active Bus Routes</h2>
            <div className="space-y-3">
              {[
                { route: 'Route 1', bus: 'DL-01-AB-1234', driver: 'Ram Kumar', stops: '8' },
                { route: 'Route 2', bus: 'DL-01-AB-2345', driver: 'Rajesh Patel', stops: '10' },
                { route: 'Route 3', bus: 'DL-01-AB-3456', driver: 'Mohan Singh', stops: '7' }
              ].map((route, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-medium text-slate-800">{route.route} - {route.bus}</p>
                  <div className="flex justify-between text-sm mt-1 text-slate-600">
                    <span>Driver: {route.driver}</span>
                    <span>{route.stops} stops</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Bus Maintenance Schedule</h2>
            <div className="space-y-3">
              {[
                { bus: 'DL-01-AB-1234', maintenance: 'Oil Change', dueDate: '2026-03-15' },
                { bus: 'DL-01-AB-2345', maintenance: 'Tire Rotation', dueDate: '2026-03-20' },
                { bus: 'DL-01-AB-3456', maintenance: 'Brake Check', dueDate: '2026-03-12' }
              ].map((maint, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-medium text-slate-800">{maint.bus}</p>
                  <div className="flex justify-between text-sm mt-1 text-slate-600">
                    <span>{maint.maintenance}</span>
                    <span className="text-violet-600 font-medium">{maint.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransportManagerDashboard;
