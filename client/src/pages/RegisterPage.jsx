import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, studentAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const StudentRegisterPage = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [studentData, setStudentData] = useState({
    class: '',
    section: '',
    rollNumber: '',
    dateOfBirth: '',
    gender: '',
    parentName: '',
    parentEmail: '',
    parentContact: '',
    emergencyContact: '',
    address: '',
    bloodGroup: '',
    aadharNumber: '',
    previousSchool: '',
    admissionDate: new Date().toISOString().split('T')[0],
    transportRequired: false,
    category: '',
    nationality: 'Indian'
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

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: value
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

    // Validate required fields
    if (!studentData.class) {
      setError('Class is required');
      setLoading(false);
      return;
    }
    if (!studentData.section) {
      setError('Section is required');
      setLoading(false);
      return;
    }
    if (!studentData.gender) {
      setError('Gender is required');
      setLoading(false);
      return;
    }
    if (!studentData.category) {
      setError('Category is required');
      setLoading(false);
      return;
    }
    if (!studentData.parentName) {
      setError('Parent/Guardian name is required');
      setLoading(false);
      return;
    }
    if (!studentData.parentEmail) {
      setError('Parent/Guardian email is required');
      setLoading(false);
      return;
    }
    if (!studentData.emergencyContact) {
      setError('Emergency contact is required');
      setLoading(false);
      return;
    }
    if (!studentData.dateOfBirth) {
      setError('Date of birth is required');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        ...userData,
        role: 'student',
        confirmPassword: undefined
      });

      setToken(response.data.token);
      setUser(response.data.user);

      // Create student profile with all required fields
      await studentAPI.create({
        ...studentData,
        userId: response.data.user.id
      });

      navigate('/student');
    } catch (err) {
      let errorMsg = err.response?.data?.message || 'Registration failed';
      
      // Better error messages for common issues
      if (errorMsg.includes('already exists')) {
        errorMsg = 'This email is already registered. Please login or use a different email.';
      }
      
      setError(errorMsg);
      // Don't reset to step 1 - keep user on current form
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500 to-blue-500 opacity-10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-10 w-full max-w-md border border-white/20">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent mb-2">Student Registration</h1>
          <div className="flex justify-center items-center gap-2 text-sm text-slate-600 mb-4">
            <div className={`h-2 w-8 rounded-full transition ${step === 1 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
            <span className="text-slate-500">|</span>
            <div className={`h-2 w-8 rounded-full transition ${step === 2 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
            <span className="text-xs font-semibold text-slate-600 ml-2">Step {step} of 2: {step === 1 ? 'Account' : 'Admission'}</span>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-slate-50 hover:bg-slate-100 text-slate-900 placeholder-slate-400 font-medium"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-slate-50 hover:bg-slate-100 text-slate-900 placeholder-slate-400 font-medium"
                placeholder="student@school.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleUserChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="1234567890"
              />
            </div>

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-300 text-red-700 text-sm p-4 rounded-lg font-medium shadow-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition duration-300 uppercase tracking-wide"
            >
              Next: Admission Details
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
              <select
                name="gender"
                value={studentData.gender}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select
                name="category"
                value={studentData.category}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={studentData.dateOfBirth}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Class <span className="text-red-500">*</span></label>
              <select
                name="class"
                value={studentData.class}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Class</option>
                <option value="1">Class 1</option>
                <option value="2">Class 2</option>
                <option value="3">Class 3</option>
                <option value="4">Class 4</option>
                <option value="5">Class 5</option>
                <option value="6">Class 6</option>
                <option value="7">Class 7</option>
                <option value="8">Class 8</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Section <span className="text-red-500">*</span></label>
              <select
                name="section"
                value={studentData.section}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Roll Number</label>
              <input
                type="number"
                name="rollNumber"
                value={studentData.rollNumber}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parent/Guardian Name</label>
              <input
                type="text"
                name="parentName"
                value={studentData.parentName}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Parent/Guardian name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parent/Guardian Email</label>
              <input
                type="email"
                name="parentEmail"
                value={studentData.parentEmail}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="parent@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parent/Guardian Contact</label>
              <input
                type="tel"
                name="parentContact"
                value={studentData.parentContact}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Contact</label>
              <input
                type="tel"
                name="emergencyContact"
                value={studentData.emergencyContact}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Emergency contact number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
              <textarea
                name="address"
                value={studentData.address}
                onChange={handleStudentChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter full address"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Group</label>
              <select
                name="bloodGroup"
                value={studentData.bloodGroup}
                onChange={handleStudentChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Aadhar Number (optional)</label>
              <input
                type="text"
                name="aadharNumber"
                value={studentData.aadharNumber}
                onChange={handleStudentChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Aadhar number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Previous School (optional)</label>
              <input
                type="text"
                name="previousSchool"
                value={studentData.previousSchool}
                onChange={handleStudentChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Previous school name"
              />
            </div>

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-300 text-red-700 text-sm p-4 rounded-lg font-medium shadow-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-200 text-slate-900 py-3 rounded-lg font-bold hover:bg-slate-300 transition uppercase tracking-wide"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition duration-300 disabled:opacity-50 uppercase tracking-wide"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-slate-600 text-sm mt-8 border-t border-slate-200 pt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentRegisterPage;
