import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { FiBookOpen, FiCalendar, FiUsers, FiMail, FiPhone, FiUser } from 'react-icons/fi';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [studentProfile, setStudentProfile] = useState(null);
  const [classTeacher, setClassTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await studentAPI.getProfileWithTeacherCurrent();
        setStudentProfile(response.data);
        setClassTeacher(response.data.classTeacher || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const stats = [
    {
      label: 'Class',
      value: studentProfile ? `${studentProfile.class}-${studentProfile.section}` : 'N/A',
      bg: 'from-blue-50 to-indigo-50',
      icon: FiBookOpen
    },
    {
      label: 'Roll Number',
      value: studentProfile?.rollNumber ?? 'N/A',
      bg: 'from-cyan-50 to-sky-50',
      icon: FiUsers
    },
    {
      label: 'Gender',
      value: studentProfile?.gender || 'N/A',
      bg: 'from-rose-50 to-pink-50',
      icon: FiUser
    },
    {
      label: 'Category',
      value: studentProfile?.category || 'N/A',
      bg: 'from-violet-50 to-purple-50',
      icon: FiCalendar
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-600 font-medium">Loading your student profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
            Welcome, {studentProfile?.name || user?.name || 'Student'}! 
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Track your academic progress and view your class teacher information
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Student Details</h2>
            {studentProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem label="Student ID" value={studentProfile.studentId} />
                <DetailItem label="Full Name" value={studentProfile.name} />
                <DetailItem label="Class" value={`${studentProfile.class}-${studentProfile.section}`} />
                <DetailItem label="Roll Number" value={studentProfile.rollNumber} />
                <DetailItem label="Date of Birth" value={studentProfile.dateOfBirth ? new Date(studentProfile.dateOfBirth).toLocaleDateString() : 'N/A'} />
                <DetailItem label="Blood Group" value={studentProfile.bloodGroup || 'N/A'} />
                <DetailItem label="Parent Name" value={studentProfile.parentName} />
                <DetailItem label="Parent Contact" value={studentProfile.parentContact} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Student details are not available.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Class Teacher</h2>
            {classTeacher ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-md">
                    {classTeacher.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{classTeacher.name}</h3>
                    <p className="text-sm text-slate-500">Class Teacher of {classTeacher.classTeacherOf}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem label="Email" value={classTeacher.email || classTeacher.userId?.email || 'N/A'} icon={FiMail} />
                  <DetailItem label="Phone" value={classTeacher.phone || classTeacher.userId?.phone || 'N/A'} icon={FiPhone} />
                  <DetailItem label="Qualification" value={classTeacher.qualification || 'N/A'} />
                  <DetailItem label="Experience" value={classTeacher.experience ? `${classTeacher.experience} Years` : 'N/A'} />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {(classTeacher.subjects || []).length > 0 ? (
                      classTeacher.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {subject}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No subjects assigned</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                No class teacher is assigned for your class yet.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Upcoming Classes</h2>
            <div className="space-y-3">
              {['Math - 9:00 AM', 'English - 10:30 AM', 'Physics - 1:00 PM'].map((cls, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border-l-4 border-primary text-slate-800">
                  {cls}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Announcements</h2>
            <div className="space-y-3">
              {['Final exams schedule released', 'Holiday notice', 'Fee submission deadline'].map((ann, idx) => (
                <div key={idx} className="p-4 bg-indigo-50 rounded-lg text-indigo-900 text-sm border border-indigo-100">
                  {ann}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
    <div className="flex items-center justify-between gap-3 mb-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {Icon ? <Icon className="text-slate-400" /> : null}
    </div>
    <p className="text-sm font-bold text-slate-900 break-words">{value || 'N/A'}</p>
  </div>
);

export default StudentDashboard;
