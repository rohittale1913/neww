import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiUsers, FiBook, FiBarChart2, FiDollarSign, FiCalendar, FiFileText, FiTruck } from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuthStore();

  const adminMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/admin' },
    { icon: <FiUsers />, label: 'User Registration', path: '/admin/registration' },
    { icon: <FiUsers />, label: 'View Students', path: '/admin/students-view' },
    { icon: <FiUsers />, label: 'View Teachers', path: '/admin/teachers-view' },
    { icon: <FiUsers />, label: 'View Staff', path: '/admin/staff-view' }
  ];

  const teacherMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/teacher' },
    { icon: <FiUsers />, label: 'My Classes', path: '/teacher/classes' },
    { icon: <FiCalendar />, label: 'Attendance', path: '/teacher/attendance' },
    { icon: <FiFileText />, label: 'Assignments', path: '/teacher/assignments' },
    { icon: <FiBarChart2 />, label: 'Exams', path: '/teacher/exams' }
  ];

  const studentMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/student' },
    { icon: <FiCalendar />, label: 'Attendance', path: '/student/attendance' },
    { icon: <FiFileText />, label: 'Assignments', path: '/student/assignments' },
    { icon: <FiBarChart2 />, label: 'Results', path: '/student/results' },
    { icon: <FiDollarSign />, label: 'Fees', path: '/student/fees' },
    { icon: <FiBook />, label: 'Library', path: '/student/library' }
  ];

  const parentMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/parent' },
    { icon: <FiCalendar />, label: 'Child Attendance', path: '/parent/attendance' },
    { icon: <FiBarChart2 />, label: 'Results', path: '/parent/results' },
    { icon: <FiDollarSign />, label: 'Fees', path: '/parent/fees' }
  ];

  const accountantMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/accountant' },
    { icon: <FiDollarSign />, label: 'Fee Collection', path: '/accountant/fees' },
    { icon: <FiFileText />, label: 'Reports', path: '/accountant/reports' },
    { icon: <FiBarChart2 />, label: 'Analytics', path: '/accountant/analytics' }
  ];

  const librarianMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/librarian' },
    { icon: <FiBook />, label: 'Books', path: '/librarian/books' },
    { icon: <FiUsers />, label: 'Members', path: '/librarian/members' },
    { icon: <FiFileText />, label: 'Issue/Return', path: '/librarian/transactions' }
  ];

  const transportManagerMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/transport_manager' },
    { icon: <FiTruck />, label: 'Buses', path: '/transport_manager/buses' },
    { icon: <FiUsers />, label: 'Drivers', path: '/transport_manager/drivers' },
    { icon: <FiBarChart2 />, label: 'Routes', path: '/transport_manager/routes' }
  ];

  let menuItems = [];
  if (user?.role === 'admin') menuItems = adminMenuItems;
  else if (user?.role === 'teacher') menuItems = teacherMenuItems;
  else if (user?.role === 'student') menuItems = studentMenuItems;
  else if (user?.role === 'parent') menuItems = parentMenuItems;
  else if (user?.role === 'accountant') menuItems = accountantMenuItems;
  else if (user?.role === 'librarian') menuItems = librarianMenuItems;
  else if (user?.role === 'transport_manager') menuItems = transportManagerMenuItems;

  return (
    <aside className={`${isOpen ? 'block' : 'hidden'} lg:block w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white h-screen overflow-y-auto shadow-xl`}>
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg">
            <span className="text-white font-bold">E</span>
          </div>
          <h2 className="text-lg font-bold">School ERP</h2>
        </div>
        <p className="text-sm text-slate-400 capitalize ml-13">{user?.role}</p>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition duration-200 mb-1 group"
          >
            <span className="text-lg group-hover:text-secondary transition">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
