import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, accountantAPI, librarianAPI, transportManagerAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';

const AdminStaffRegister = () => {
  const [staffData, setStaffData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'accountant',
    qualification: '',
    specialization: '',
    experience: '',
    bankAccount: '',
    ifscCode: '',
    licenseNumber: '',
    licenseExpiry: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodGroup: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const staffRoles = ['accountant', 'librarian', 'transport_manager'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (staffData.password !== staffData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Register user
      const response = await authAPI.register({
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        password: staffData.password,
        role: staffData.role
      });

      const userId = response.data.user.id;

      // Create staff profile based on role
      if (staffData.role === 'accountant') {
        await accountantAPI.create({
          userId: userId,
          qualification: staffData.qualification,
          experience: parseInt(staffData.experience) || 0,
          bankAccount: staffData.bankAccount,
          ifscCode: staffData.ifscCode
        });
      } else if (staffData.role === 'librarian') {
        await librarianAPI.create({
          userId: userId,
          qualification: staffData.qualification,
          experience: parseInt(staffData.experience) || 0,
          specialization: staffData.specialization
        });
      } else if (staffData.role === 'transport_manager') {
        await transportManagerAPI.create({
          userId: userId,
          qualification: staffData.qualification,
          experience: parseInt(staffData.experience) || 0,
          licenseNumber: staffData.licenseNumber,
          licenseExpiry: staffData.licenseExpiry
        });
      }

      setSuccess('Staff member registered successfully!');
      
      setTimeout(() => {
        navigate('/admin/staff-view');
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
          <h1 className="text-3xl font-bold text-slate-900">Register New Staff Member</h1>
          <p className="text-slate-600 mt-2">Add a new staff member (Accountant, Librarian, Transport Manager) to the system</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Account Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Staff Role <span className="text-red-500">*</span></label>
                  <select
                    name="role"
                    value={staffData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Role</option>
                    {staffRoles.map(role => (
                      <option key={role} value={role}>
                        {role.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={staffData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={staffData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="staff@school.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={staffData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    name="password"
                    value={staffData.password}
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
                    value={staffData.confirmPassword}
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={staffData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender <span className="text-red-500">*</span></label>
                  <select
                    name="gender"
                    value={staffData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={staffData.bloodGroup}
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={staffData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Full address"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Professional Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification <span className="text-red-500">*</span></label>
                  <select
                    name="qualification"
                    value={staffData.qualification}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Qualification</option>
                    <option value="D.El.Ed">D.El.Ed (Diploma in Elementary Education)</option>
                    <option value="B.A">B.A (Bachelor of Arts)</option>
                    <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                    <option value="B.Com">B.Com (Bachelor of Commerce)</option>
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="B.P.Ed">B.P.Ed (Bachelor of Physical Education)</option>
                    <option value="B.Ed">B.Ed (Bachelor of Education)</option>
                    <option value="M.A">M.A (Master of Arts)</option>
                    <option value="M.Sc">M.Sc (Master of Science)</option>
                    <option value="M.Com">M.Com (Master of Commerce)</option>
                    <option value="M.Tech">M.Tech (Master of Technology)</option>
                    <option value="M.Ed">M.Ed (Master of Education)</option>
                    <option value="M.B.A">M.B.A (Master of Business Administration)</option>
                    <option value="Ph.D">Ph.D (Doctor of Philosophy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={staffData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Finance, Library Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="experience"
                    value={staffData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">License Number (if applicable)</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={staffData.licenseNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="License number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">License Expiry Date</label>
                  <input
                    type="date"
                    name="licenseExpiry"
                    value={staffData.licenseExpiry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Bank Information (for Accountants) */}
            {staffData.role === 'accountant' && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Bank Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Account Number</label>
                    <input
                      type="text"
                      name="bankAccount"
                      value={staffData.bankAccount}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="1234567890123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={staffData.ifscCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="SBIN0001234"
                    />
                  </div>
                </div>
              </div>
            )}

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
                {loading ? 'Registering...' : 'Register Staff'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminStaffRegister;
