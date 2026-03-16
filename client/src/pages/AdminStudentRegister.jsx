import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, studentAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';

const AdminStudentRegister = () => {
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate passwords match
      if (studentData.password !== studentData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Register user
      const response = await authAPI.register({
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        password: studentData.password,
        role: 'student'
      });

      // Create student profile
      await studentAPI.create({
        class: studentData.class,
        section: studentData.section,
        rollNumber: studentData.rollNumber,
        dateOfBirth: studentData.dateOfBirth,
        gender: studentData.gender,
        parentName: studentData.parentName,
        parentEmail: studentData.parentEmail,
        parentContact: studentData.parentContact,
        emergencyContact: studentData.emergencyContact,
        address: studentData.address,
        bloodGroup: studentData.bloodGroup,
        aadharNumber: studentData.aadharNumber,
        previousSchool: studentData.previousSchool,
        admissionDate: studentData.admissionDate,
        transportRequired: studentData.transportRequired,
        category: studentData.category,
        nationality: studentData.nationality,
        userId: response.data.user.id
      });

      setSuccess('Student registered successfully!');
      
      // Reset form
      setStudentData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
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

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/students-view');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Register New Student</h1>
          <p className="text-slate-600 mt-2">Add a new student to the system</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Account Information */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Account Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={studentData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={studentData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="student@school.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={studentData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={studentData.password}
                    onChange={handleChange}
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
                    value={studentData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={studentData.gender}
                    onChange={handleChange}
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={studentData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={studentData.bloodGroup}
                    onChange={handleChange}
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Aadhar/ID Number</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={studentData.aadharNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter Aadhar or ID number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={studentData.nationality}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Indian"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={studentData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Academic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
                  <input
                    type="text"
                    name="class"
                    value={studentData.class}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Section</label>
                  <select
                    name="section"
                    value={studentData.section}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Roll Number</label>
                  <input
                    type="number"
                    name="rollNumber"
                    value={studentData.rollNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Admission Date</label>
                  <input
                    type="date"
                    name="admissionDate"
                    value={studentData.admissionDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Previous School</label>
                  <input
                    type="text"
                    name="previousSchool"
                    value={studentData.previousSchool}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Name of previous school"
                  />
                </div>

                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    name="transportRequired"
                    id="transportRequired"
                    checked={studentData.transportRequired}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label htmlFor="transportRequired" className="text-sm font-semibold text-slate-700">Transport Required</label>
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Parent/Guardian Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Parent/Guardian Name</label>
                  <input
                    type="text"
                    name="parentName"
                    value={studentData.parentName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Father's or Guardian's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Parent Email</label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={studentData.parentEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="parent@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Parent Contact</label>
                  <input
                    type="tel"
                    name="parentContact"
                    value={studentData.parentContact}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Address</h2>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Address</label>
                <textarea
                  name="address"
                  value={studentData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter complete address"
                  rows="3"
                />
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="text-rose-600 text-sm bg-rose-50 p-4 rounded-lg border border-rose-200">
                {error}
              </div>
            )}

            {success && (
              <div className="text-emerald-600 text-sm bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                {success}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 bg-slate-300 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminStudentRegister;
