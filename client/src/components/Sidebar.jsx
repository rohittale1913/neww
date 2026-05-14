import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiUsers, FiBook, FiBarChart2, FiDollarSign, FiCalendar, FiFileText, FiTruck, FiClipboard, FiAward } from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuthStore();

  const adminMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/admin' },
    { icon: <FiUsers />, label: 'User Registration', path: '/admin/registration' },
    { icon: <FiUsers />, label: 'View Students', path: '/admin/students-view' },
    { icon: <FiUsers />, label: 'View Teachers', path: '/admin/teachers-view' },
    { icon: <FiUsers />, label: 'View Staff', path: '/admin/staff-view' },
    { icon: <FiBook />, label: 'Class Assignments', path: '/admin/class-assignments' },
    { icon: <FiCalendar />, label: 'Timetable', path: '/admin/timetable' },
    { icon: <FiCalendar />, label: 'Attendance', path: '/admin/attendance' },
    { icon: <FiDollarSign />, label: 'Fees', path: '/admin/fees' },
    { icon: <FiBarChart2 />, label: 'Exams', path: '/admin/exams' }
  ];

  const teacherMenuItems = [
    { icon: <FiClipboard />, label: 'Overview', path: '/teacher?tab=overview' },
    { icon: <FiBook />, label: 'My Classes', path: '/teacher?tab=classes' },
    { icon: <FiCalendar />, label: 'My Timetable', path: '/teacher/timetable' },
    { icon: <FiCalendar />, label: 'Attendance', path: '/teacher?tab=attendance' },
    { icon: <FiFileText />, label: 'Assignments', path: '/teacher?tab=assignments' },
    { icon: <FiBarChart2 />, label: 'Exams', path: '/teacher?tab=exams' }
  ];

  const studentMenuItems = [
    { icon: <FiClipboard />, label: 'Overview', path: '/student?tab=overview' },
    { icon: <FiCalendar />, label: 'Class Timetable', path: '/student/timetable' },
    { icon: <FiCalendar />, label: 'Attendance', path: '/student?tab=attendance' },
    { icon: <FiFileText />, label: 'Assignments', path: '/student?tab=assignments' },
    { icon: <FiBarChart2 />, label: 'Exams', path: '/student?tab=exams' },
    { icon: <FiAward />, label: 'Results', path: '/student?tab=results' },
    { icon: <FiDollarSign />, label: 'Fees', path: '/student?tab=fees' }
  ];

  const parentMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/parent' },
    { icon: <FiCalendar />, label: 'Child Attendance', path: '/parent/attendance' },
    { icon: <FiBarChart2 />, label: 'Results', path: '/parent/results' },
    { icon: <FiDollarSign />, label: 'Fees', path: '/parent/fees' }
  ];

  const accountantMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/accountant' },
    { icon: <FiDollarSign />, label: 'Create Fees', path: '/accountant/fees' },
    { icon: <FiUsers />, label: 'Manage Fees', path: '/accountant/manage-fees' }
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
    <aside className={`${isOpen ? 'block' : 'hidden'} lg:block w-64 bg-gray-800 text-white h-screen overflow-y-auto`}>
      <div className="p-6 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded">
            <span className="text-white font-bold text-base">E</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">School ERP</h2>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Role</p>
          <p className="text-sm text-blue-400 font-semibold capitalize mt-1">{user?.role}</p>
        </div>
      </div>

      <nav className="p-3 space-y-2">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition"
          >
            <span className="text-base">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
