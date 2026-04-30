import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { authAPI, studentAPI, teacherAPI, accountantAPI, librarianAPI, transportManagerAPI } from '../services/api';
import DataTable from '../components/DataTable';

const AdminUserManagement = () => {
  const [userType, setUserType] = useState('student');
  const [staffRole, setStaffRole] = useState('accountant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // Student fields
    class: '',
    section: '',
    rollNumber: '',
    dateOfBirth: '',
    parentContact: '',
    address: '',
    bloodGroup: '',
    // Teacher fields
    qualification: '',
    subjects: '',
    classes: '',
    sections: '',
    experience: '',
    employmentType: 'full-time',
    isClassTeacher: false,
    classTeacherOf: '',
    // Staff fields
    bankAccount: '',
    ifscCode: '',
    specialization: '',
    licenseNumber: '',
    licenseExpiry: ''
  });

  useEffect(() => {
    // Get current user ID from localStorage (stored during login)
    const userId = localStorage.getItem('userId');
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required');
      return;
    }

    setLoading(true);

    try {
      // Register user
      const finalRole = userType === 'staff' ? staffRole : userType;
      
      const userPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: finalRole
      };

      const response = await authAPI.register(userPayload);
      const userId = response.data.user.id;

      // Create profile based on user type
      if (userType === 'student') {
        await studentAPI.create({
          class: formData.class,
          section: formData.section,
          rollNumber: parseInt(formData.rollNumber),
          dateOfBirth: formData.dateOfBirth,
          parentContact: formData.parentContact,
          address: formData.address,
          bloodGroup: formData.bloodGroup,
          userId
        });
      } else if (userType === 'teacher') {
        const classesArray = formData.classes.split(',').map(c => c.trim()).filter(c => c);
        const sectionsArray = formData.sections.split(',').map(s => s.trim()).filter(s => s);
        
        // Build classAssignments array: each class paired with all sections
        const classAssignments = classesArray.map(className => ({
          className,
          sections: sectionsArray
        }));

        await teacherAPI.create({
          qualification: formData.qualification,
          subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
          classes: classesArray,
          sections: sectionsArray,
          classAssignments: classAssignments,
          experience: parseInt(formData.experience) || 0,
          employmentType: formData.employmentType,
          isClassTeacher: formData.isClassTeacher,
          classTeacherOf: formData.classTeacherOf,
          userId
        });
      } else if (userType === 'staff') {
        if (staffRole === 'accountant') {
          await accountantAPI.create({
            qualification: formData.qualification,
            experience: parseInt(formData.experience) || 0,
            bankAccount: formData.bankAccount,
            ifscCode: formData.ifscCode,
            userId
          });
        } else if (staffRole === 'librarian') {
          await librarianAPI.create({
            qualification: formData.qualification,
            experience: parseInt(formData.experience) || 0,
            specialization: formData.specialization,
            userId
          });
        } else if (staffRole === 'transport_manager') {
          await transportManagerAPI.create({
            qualification: formData.qualification,
            experience: parseInt(formData.experience) || 0,
            licenseNumber: formData.licenseNumber,
            licenseExpiry: formData.licenseExpiry,
            userId
          });
        }
      }

      setSuccess(`${finalRole.charAt(0).toUpperCase() + finalRole.slice(1).replace('_', ' ')} registered successfully!`);
      setFormData({
        name: '', email: '', password: '', phone: '',
        class: '', section: '', rollNumber: '', dateOfBirth: '',
        parentContact: '', address: '', bloodGroup: '',
        qualification: '', subjects: '', classes: '', sections: '', experience: '',
        employmentType: 'full-time', isClassTeacher: false, classTeacherOf: '',
        bankAccount: '', ifscCode: '', specialization: '', licenseNumber: '', licenseExpiry: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">User Registration</h1>
          <p className="text-slate-600 text-sm mt-2">Register and manage students, teachers, and staff members in the system</p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4">User Type</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['student', 'teacher', 'staff'].map(type => (
                      <label
                        key={type}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                          userType === type
                            ? 'border-primary bg-indigo-50'
                            : 'border-slate-300 hover:border-primary'
                        }`}
                      >
                        <input
                          type="radio"
                          name="userType"
                          value={type}
                          checked={userType === type}
                          onChange={(e) => setUserType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="font-semibold capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Staff Role Selection */}
                {userType === 'staff' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-4">Staff Role</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['accountant', 'librarian', 'transport_manager'].map(role => (
                        <label
                          key={role}
                          className={`p-3 border-2 rounded-xl cursor-pointer transition text-sm ${
                            staffRole === role
                              ? 'border-secondary bg-cyan-50'
                              : 'border-slate-300 hover:border-secondary'
                          }`}
                        >
                          <input
                            type="radio"
                            name="staffRole"
                            value={role}
                            checked={staffRole === role}
                            onChange={(e) => setStaffRole(e.target.value)}
                            className="mr-2"
                          />
                          <span className="font-semibold capitalize">{role.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="john@school.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                {/* Student Fields */}
                {userType === 'student' && (
                  <div className="space-y-6 pt-6 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-800 text-lg">Admission Details</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Class *</label>
                        <input
                          type="text"
                          name="class"
                          value={formData.class}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="10-A"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Section *</label>
                        <select
                          name="section"
                          value={formData.section}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Roll Number *</label>
                        <input
                          type="number"
                          name="rollNumber"
                          value={formData.rollNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="1"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Parent Contact</label>
                        <input
                          type="tel"
                          name="parentContact"
                          value={formData.parentContact}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="9876543210"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select</option>
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
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Full address"
                        rows="2"
                      />
                    </div>
                  </div>
                )}

                {/* Teacher Fields */}
                {userType === 'teacher' && (
                  <div className="space-y-6 pt-6 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-800 text-lg">Professional Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification *</label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="B.A., M.Sc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (years)</label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="5"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Subjects (comma separated) *</label>
                        <input
                          type="text"
                          name="subjects"
                          value={formData.subjects}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Math, Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Classes (comma separated) *</label>
                        <input
                          type="text"
                          name="classes"
                          value={formData.classes}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="9, 10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Sections (comma separated) *</label>
                        <input
                          type="text"
                          name="sections"
                          value={formData.sections}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="A, B"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Type</label>
                        <select
                          name="employmentType"
                          value={formData.employmentType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="full-time">Full-Time</option>
                          <option value="part-time">Part-Time</option>
                          <option value="contractual">Contractual</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isClassTeacher"
                            checked={formData.isClassTeacher}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary border-slate-300 rounded"
                          />
                          <span className="ml-2 text-sm font-semibold text-slate-700">Class Teacher</span>
                        </label>
                      </div>
                    </div>
                    {formData.isClassTeacher && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Class Teacher Of (Format: "ClassName-Section") *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="classTeacherOf"
                            value={formData.classTeacherOf}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="10-A"
                          />
                          <span className="flex items-center text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                            e.g. "10-A"
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Example: "9-A", "10-B", "11-C"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Accountant Fields */}
                {userType === 'staff' && staffRole === 'accountant' && (
                  <div className="space-y-6 pt-6 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-800 text-lg">Accountant Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification</label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="B.Com., M.Com."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (years)</label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="5"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Account</label>
                        <input
                          type="text"
                          name="bankAccount"
                          value={formData.bankAccount || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Account Number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">IFSC Code</label>
                        <input
                          type="text"
                          name="ifscCode"
                          value={formData.ifscCode || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="IFSC Code"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Librarian Fields */}
                {userType === 'staff' && staffRole === 'librarian' && (
                  <div className="space-y-6 pt-6 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-800 text-lg">Librarian Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification</label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="B.L.Sc., M.L.Sc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (years)</label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="5"
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Research, Reference"
                      />
                    </div>
                  </div>
                )}

                {/* Transport Manager Fields */}
                {userType === 'staff' && staffRole === 'transport_manager' && (
                  <div className="space-y-6 pt-6 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-800 text-lg">Transport Manager Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification</label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="B.E., Diploma"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (years)</label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="5"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">License Number</label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="License Number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">License Expiry Date</label>
                        <input
                          type="date"
                          name="licenseExpiry"
                          value={formData.licenseExpiry || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {error && <div className="text-rose-600 text-sm bg-rose-50 p-3 rounded-lg border border-rose-200">{error}</div>}
                {success && <div className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-200">{success}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register User'}
                </button>
              </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUserManagement;
