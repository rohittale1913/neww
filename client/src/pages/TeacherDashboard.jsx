import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { teacherAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import DataTable from '../components/DataTable';

const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await teacherAPI.getAll();
        const currentTeacher = response.data.find(t => t.userId === user.id) || response.data[0];
        setTeacher(currentTeacher);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  if (loading) {
    return <DashboardLayout>
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-600">Loading...</p>
      </div>
    </DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}!</p>
        </div>

        {teacher && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium">Subjects</h3>
              <p className="text-2xl font-bold text-primary mt-2">
                {teacher.subjects?.length || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium">Classes</h3>
              <p className="text-2xl font-bold text-secondary mt-2">
                {teacher.classes?.length || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium">Experience</h3>
              <p className="text-2xl font-bold text-warning mt-2">
                {teacher.experience || 0} years
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium">Status</h3>
              <p className="mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {teacher.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Information</h2>
          {teacher && (
            <div className="space-y-2">
              <p><strong>Name:</strong> {teacher.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Qualification:</strong> {teacher.qualification || 'N/A'}</p>
              <p><strong>Employment Type:</strong> {teacher.employmentType || 'N/A'}</p>
              <p><strong>Class Teacher:</strong> {teacher.isClassTeacher ? teacher.classTeacherOf : 'No'}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Assigned Classes & Subjects</h2>
          {teacher && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Classes</h3>
                <ul className="space-y-1">
                  {teacher.classes?.map((cls, idx) => (
                    <li key={idx} className="text-gray-600">• {cls}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Subjects</h3>
                <ul className="space-y-1">
                  {teacher.subjects?.map((subject, idx) => (
                    <li key={idx} className="text-gray-600">• {subject}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
