import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, teacherAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';

const AdminTeacherRegister = () => {
  const [teacherData, setTeacherData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    qualification: '',
    subjects: [],
    classAssignments: [], // [{class: '10', sections: ['A', 'B']}, ...]
    experience: '',
    employmentType: 'full-time',
    isClassTeacher: false,
    classTeacherOf: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodGroup: ''
  });
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setTeacherData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // If classTeacherOf is set, automatically set isClassTeacher to true
      if (name === 'classTeacherOf' && value) {
        updated.isClassTeacher = true;
      }
      // If classTeacherOf is cleared, set isClassTeacher to false
      if (name === 'classTeacherOf' && !value) {
        updated.isClassTeacher = false;
      }
      
      return updated;
    });
  };

  const handleSubjectChange = (subject) => {
    setTeacherData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleAddClassAssignment = () => {
    if (selectedClass && selectedSections.length > 0) {
      setTeacherData(prev => ({
        ...prev,
        classAssignments: [
          ...prev.classAssignments,
          { class: selectedClass, sections: selectedSections }
        ]
      }));
      setSelectedClass('');
      setSelectedSections([]);
    }
  };

  const handleRemoveClassAssignment = (classToRemove) => {
    setTeacherData(prev => ({
      ...prev,
      classAssignments: prev.classAssignments.filter(ca => ca.class !== classToRemove)
    }));
  };

  const handleAddSection = (section) => {
    if (!selectedSections.includes(section)) {
      setSelectedSections([...selectedSections, section]);
    }
  };

  const handleRemoveSection = (section) => {
    setSelectedSections(selectedSections.filter(s => s !== section));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (teacherData.password !== teacherData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (teacherData.subjects.length === 0) {
        setError('Please select at least one subject');
        setLoading(false);
        return;
      }

      if (teacherData.classAssignments.length === 0) {
        setError('Please select at least one class with its sections');
        setLoading(false);
        return;
      }

      // Flatten classAssignments to classes and sections arrays
      const allClasses = [...new Set(teacherData.classAssignments.map(ca => ca.class))];
      const allSections = [...new Set(teacherData.classAssignments.flatMap(ca => ca.sections))];

      // Register user
      const response = await authAPI.register({
        name: teacherData.name,
        email: teacherData.email,
        phone: teacherData.phone,
        password: teacherData.password,
        role: 'teacher'
      });

      // Create teacher profile
      await teacherAPI.create({
        qualification: teacherData.qualification,
        subjects: teacherData.subjects,
        classes: allClasses,
        sections: allSections,
        experience: parseInt(teacherData.experience) || 0,
        employmentType: teacherData.employmentType,
        isClassTeacher: teacherData.isClassTeacher,
        classTeacherOf: teacherData.classTeacherOf,
        dateOfBirth: teacherData.dateOfBirth,
        gender: teacherData.gender,
        address: teacherData.address,
        bloodGroup: teacherData.bloodGroup,
        userId: response.data.user.id
      });

      setSuccess('Teacher registered successfully!');
      
      setTimeout(() => {
        navigate('/admin/teachers-view');
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
          <h1 className="text-3xl font-bold text-slate-900">Register New Teacher</h1>
          <p className="text-slate-600 mt-2">Add a new teacher to the system</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Account Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={teacherData.name}
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
                    value={teacherData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="teacher@school.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={teacherData.phone}
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
                    value={teacherData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={teacherData.confirmPassword}
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={teacherData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender <span className="text-red-500">*</span></label>
                  <select
                    name="gender"
                    value={teacherData.gender}
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
                    value={teacherData.bloodGroup}
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={teacherData.address}
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
                    value={teacherData.qualification}
                    onChange={handleChange}
                    required
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Years of Experience  <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="experience"
                    value={teacherData.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="10"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Subjects <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border border-slate-300 rounded-lg bg-slate-50">
                    {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science', 'Physical Education', 'Art', 'Music', 'Social Science', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Business Studies', 'Hindi', 'Sanskrit'].map(subject => (
                      <label key={subject} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={teacherData.subjects.includes(subject)}
                          onChange={() => handleSubjectChange(subject)}
                          className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                  {teacherData.subjects.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">Please select at least one subject</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Class & Section Assignment <span className="text-red-500">*</span></label>
                  
                  {/* Step 1: Select Class */}
                  <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Step 1: Select a Class</p>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Select Class --</option>
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
                        .filter(cls => !teacherData.classAssignments.some(ca => ca.class === cls))
                        .map(cls => (
                          <option key={cls} value={cls}>Class {cls}</option>
                        ))}
                    </select>
                  </div>

                  {/* Step 2: Select Sections for the Class */}
                  {selectedClass && (
                    <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <p className="text-sm font-semibold text-slate-700 mb-3">Step 2: Select Sections for Class {selectedClass}</p>
                      <div className="flex gap-2 flex-wrap mb-3">
                        {['A', 'B', 'C', 'D', 'E'].map(section => (
                          <button
                            key={section}
                            type="button"
                            onClick={() => handleAddSection(section)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                              selectedSections.includes(section)
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            Section {section}
                          </button>
                        ))}
                      </div>
                      
                      {selectedSections.length > 0 && (
                        <button
                          type="button"
                          onClick={handleAddClassAssignment}
                          className="w-full bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition"
                        >
                          Add Class {selectedClass} with Section{selectedSections.length > 1 ? 's' : ''} {selectedSections.join(', ')}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Display Added Class Assignments */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Added Class Assignments:</p>
                    {teacherData.classAssignments.length > 0 ? (
                      teacherData.classAssignments.map((assignment, idx) => (
                        <div key={idx} className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-emerald-900">Class {assignment.class}</p>
                            <p className="text-sm text-emerald-700">Sections: {assignment.sections.join(', ')}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveClassAssignment(assignment.class)}
                            className="text-emerald-600 hover:text-emerald-800 font-bold text-xl"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-red-600">Please add at least one class with sections</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Type</label>
                  <select
                    name="employmentType"
                    value={teacherData.employmentType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Class Teacher Of (Optional)</label>
                  {teacherData.classAssignments.length > 0 ? (
                    <div>
                      <p className="text-xs text-slate-600 mb-2">Select from assigned classes and sections:</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
                        {teacherData.classAssignments.map((assignment) => (
                          assignment.sections.map(section => (
                            <label key={`${assignment.class}-${section}`} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="classTeacherOf"
                                value={assignment.class}
                                checked={teacherData.classTeacherOf === assignment.class}
                                onChange={handleChange}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-slate-700">Class {assignment.class} - Section {section}</span>
                            </label>
                          ))
                        ))}
                      </div>
                      {teacherData.classTeacherOf && (
                        <p className="text-xs text-emerald-600 mt-2">Selected as Class Teacher for: Class {teacherData.classTeacherOf}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Please select classes and sections above first</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isClassTeacher"
                  id="isClassTeacher"
                  checked={teacherData.isClassTeacher}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label htmlFor="isClassTeacher" className="text-sm font-semibold text-slate-700">Is Class Teacher</label>
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
                {loading ? 'Registering...' : 'Register Teacher'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTeacherRegister;
