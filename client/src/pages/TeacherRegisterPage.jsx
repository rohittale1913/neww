import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, teacherAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const TeacherRegisterPage = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [teacherData, setTeacherData] = useState({
    qualification: '',
    subjects: '',
    classes: '',
    experience: '',
    employmentType: 'full-time',
    isClassTeacher: false,
    classTeacherOf: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeacherChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTeacherData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');

    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register({
        ...userData,
        role: 'teacher',
        confirmPassword: undefined
      });

      setToken(response.data.token);
      setUser(response.data.user);

      // Create teacher profile
      await teacherAPI.create({
        ...teacherData,
        subjects: teacherData.subjects.split(',').map(s => s.trim()),
        classes: teacherData.classes.split(',').map(c => c.trim()),
        experience: parseInt(teacherData.experience) || 0,
        userId: response.data.user.id
      });

      navigate('/teacher');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-primary p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Teacher Registration</h1>
        <p className="text-center text-gray-600 text-sm mb-6">
          Step {step} of 2
        </p>

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Prof. Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="teacher@school.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleUserChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="1234567890"
              />
            </div>

            {error && <div className="text-danger text-sm bg-red-50 p-3 rounded">{error}</div>}

            <button
              type="submit"
              className="w-full bg-secondary text-white py-2 rounded-lg font-medium hover:bg-green-600 transition"
            >
              Next: Professional Details
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={teacherData.qualification}
                onChange={handleTeacherChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="e.g., B.A., M.Sc., B.Ed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects (comma separated)</label>
              <input
                type="text"
                name="subjects"
                value={teacherData.subjects}
                onChange={handleTeacherChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Mathematics, Science, English"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Classes Teaching (comma separated)</label>
              <input
                type="text"
                name="classes"
                value={teacherData.classes}
                onChange={handleTeacherChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="10-A, 10-B, 11-A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={teacherData.experience}
                onChange={handleTeacherChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="5"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
              <select
                name="employmentType"
                value={teacherData.employmentType}
                onChange={handleTeacherChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contractual">Contractual</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isClassTeacher"
                checked={teacherData.isClassTeacher}
                onChange={handleTeacherChange}
                className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                Class Teacher
              </label>
            </div>

            {teacherData.isClassTeacher && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Teacher Of</label>
                <input
                  type="text"
                  name="classTeacherOf"
                  value={teacherData.classTeacherOf}
                  onChange={handleTeacherChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="e.g., 10-A"
                />
              </div>
            )}

            {error && <div className="text-danger text-sm bg-red-50 p-3 rounded">{error}</div>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-secondary text-white py-2 rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-600 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TeacherRegisterPage;
