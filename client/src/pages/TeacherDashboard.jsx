import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { teacherAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import TeacherMyClasses from '../components/TeacherMyClasses';
import TeacherAttendance from '../components/TeacherAttendance';
import TeacherAssignments from '../components/TeacherAssignments';
import TeacherExams from '../components/TeacherExams';
import { FiClipboard, FiBook, FiCalendar, FiFileText, FiBarChart2, FiUsers, FiMail, FiPhone } from 'react-icons/fi';

const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Get tab from URL query parameter
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await teacherAPI.getMyProfile();
        setTeacher(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load teacher profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiClipboard },
    { id: 'classes', label: 'My Classes', icon: FiBook },
    { id: 'attendance', label: 'Attendance', icon: FiCalendar },
    { id: 'assignments', label: 'Assignments', icon: FiFileText },
    { id: 'exams', label: 'Exams', icon: FiBarChart2 }
  ];

  const stats = [
    {
      label: 'Classes',
      value: teacher?.classes?.length || 0,
      bg: 'from-blue-50 to-indigo-50',
      icon: FiBook
    },
    {
      label: 'Subjects',
      value: teacher?.subjects?.length || 0,
      bg: 'from-cyan-50 to-sky-50',
      icon: FiFileText
    },
    {
      label: 'Experience',
      value: teacher?.experience ? `${teacher.experience} yrs` : 'N/A',
      bg: 'from-rose-50 to-pink-50',
      icon: FiCalendar
    },
    {
      label: 'Qualification',
      value: teacher?.qualification || 'N/A',
      bg: 'from-violet-50 to-purple-50',
      icon: FiUsers
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-600 font-medium">Loading your teacher profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
            Welcome, {teacher?.name || user?.name || 'Teacher'} !
          </h1>
          {/* <p className="text-slate-500 text-sm mt-2">
            Manage your classes, track attendance, grade assignments, and view exams
          </p> */}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 border-b border-slate-200 pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/teacher?tab=${tab.id}`)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${stat.bg} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                      </div>
                      <div className="text-slate-700 text-3xl">
                        <stat.icon />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Teacher Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Information */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold text-slate-900">Teacher Information</h2>
                  {teacher ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">{teacher.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                          <div className="flex items-center gap-2 mt-1">
                            <FiMail className="text-slate-400" />
                            <p className="text-sm text-slate-700">{user?.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                          <div className="flex items-center gap-2 mt-1">
                            <FiPhone className="text-slate-400" />
                            <p className="text-sm text-slate-700">{user?.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Qualification</p>
                          <p className="text-sm text-slate-700 mt-1">{teacher.qualification || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Experience</p>
                          <p className="text-sm text-slate-700 mt-1">{teacher.experience ? `${teacher.experience} Years` : 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employment Type</p>
                        <p className="text-sm text-slate-700 mt-1 capitalize">{teacher.employmentType || 'N/A'}</p>
                      </div>
                      {teacher.isClassTeacher && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Class Teacher Of</p>
                          <p className="text-sm font-semibold text-blue-900">{teacher.classTeacherOf}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Teacher information not available.</p>
                  )}
                </div>

                {/* Subjects & Classes */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold text-slate-900">Assigned Details</h2>
                  {teacher ? (
                    <div className="space-y-4">
                      {/* Subjects */}
                      {teacher.subjects && teacher.subjects.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Subjects</p>
                          <div className="flex flex-wrap gap-2">
                            {teacher.subjects.map((subject, idx) => (
                              <span
                                key={idx}
                                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Classes */}
                      {teacher.classes && teacher.classes.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Classes</p>
                          <div className="flex flex-wrap gap-2">
                            {teacher.classes.map((cls, idx) => (
                              <span
                                key={idx}
                                className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                              >
                                {cls}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sections */}
                      {teacher.sections && teacher.sections.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Sections</p>
                          <div className="flex flex-wrap gap-2">
                            {teacher.sections.map((section, idx) => (
                              <span
                                key={idx}
                                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700"
                              >
                                {section}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No assigned details available.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* My Classes Tab */}
          {activeTab === 'classes' && <TeacherMyClasses />}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && <TeacherAttendance />}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && <TeacherAssignments />}

          {/* Exams Tab */}
          {activeTab === 'exams' && <TeacherExams />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
