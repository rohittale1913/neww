import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { FiUsers, FiBookOpen, FiBriefcase } from 'react-icons/fi';

const AdminRegistrationMenu = () => {
  const navigate = useNavigate();

  const registrationOptions = [
    {
      title: 'Register Student',
      description: 'Add a new student with complete academic and personal information',
      icon: FiUsers,
      path: '/admin/register-student',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      bgHover: 'hover:bg-blue-50'
    },
    {
      title: 'Register Teacher',
      description: 'Add a new teacher with qualification and subject information',
      icon: FiBookOpen,
      path: '/admin/register-teacher',
      color: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      bgHover: 'hover:bg-emerald-50'
    },
    {
      title: 'Register Staff',
      description: 'Add administrative staff (Accountant, Librarian, Transport Manager, etc)',
      icon: FiBriefcase,
      path: '/admin/register-staff',
      color: 'bg-violet-100',
      iconColor: 'text-violet-600',
      bgHover: 'hover:bg-violet-50'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Registration</h1>
          <p className="text-slate-600 mt-2">Select the type of user you want to register</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrationOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.title}
                onClick={() => navigate(option.path)}
                className={`bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition cursor-pointer p-6 ${option.bgHover}`}
              >
                <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${option.iconColor}`} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">{option.title}</h2>
                <p className="text-slate-600 text-sm mb-6">{option.description}</p>
                <button className={`w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition`}>
                  Register Now
                </button>
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Registration Tips</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Ensure all required fields are filled correctly</li>
            <li>• Email addresses must be unique for each user</li>
            <li>• Set strong passwords for new accounts</li>
           
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminRegistrationMenu;
