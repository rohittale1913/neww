import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { teacherAPI } from '../services/api';

const EditTeacherModal = ({ teacher, onClose, onSave }) => {
  const [formData, setFormData] = useState(teacher || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [classAssignments, setClassAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);

  useEffect(() => {
    if (teacher) {
      setFormData(teacher);
      setSubjects(teacher.subjects || []);
      
      // First check if teacher.classAssignments exists (new format)
      if (teacher.classAssignments && teacher.classAssignments.length > 0) {
        console.log('✅ Loading from classAssignments:', teacher.classAssignments);
        setClassAssignments(teacher.classAssignments);
      } else {
        // Fallback to converting from old classes/sections arrays (backward compatibility)
        const classes = teacher.classes || [];
        const sections = teacher.sections || [];
        
        if (classes.length > 0) {
          console.log('⚠️ Converting from old format - classes:', classes, 'sections:', sections);
          // Create assignments where each class has all sections
          const assignments = classes.map(cls => ({
            className: cls,
            sections: sections.length > 0 ? sections : []
          }));
          setClassAssignments(assignments);
        } else {
          setClassAssignments([]);
        }
      }
    }
  }, [teacher]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
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

  const handleAddClassAssignment = () => {
    if (selectedClass && selectedSections.length > 0) {
      setClassAssignments([
        ...classAssignments,
        { className: selectedClass, sections: selectedSections }
      ]);
      setSelectedClass('');
      setSelectedSections([]);
    }
  };

  const handleRemoveClassAssignment = (classToRemove) => {
    setClassAssignments(classAssignments.filter(ca => ca.className !== classToRemove));
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
    try {
      setLoading(true);
      setError('');

      // Find the actual teacher ID by looking up the profile
      let teacherId = teacher._id;
      
      // If this looks like a User ID, try to find the actual Teacher record
      if (teacher.userId && !teacher.qualification) {
        const response = await teacherAPI.getAll?.() || { data: [] };
        const profiles = response.data || [];
        const actualProfile = profiles.find(p => 
          p.userId === teacher._id || p.userId?.id === teacher._id || p.userId?._id === teacher._id
        );
        if (actualProfile) {
          teacherId = actualProfile._id;
        }
      }

      console.log('📋 Sending to backend:', {
        classAssignments,
        classes: [...new Set(classAssignments.map(ca => ca.className))],
        sections: [...new Set(classAssignments.flatMap(ca => ca.sections))]
      });

      console.log('📋 Sending to backend:', {
        classAssignments,
        classes: [...new Set(classAssignments.map(ca => ca.className))],
        sections: [...new Set(classAssignments.flatMap(ca => ca.sections))]
      });

      const response = await teacherAPI.update(teacherId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        qualification: formData.qualification,
        experience: formData.experience,
        subjects: subjects,
        classes: [...new Set(classAssignments.map(ca => ca.className))],
        sections: [...new Set(classAssignments.flatMap(ca => ca.sections))],
        classAssignments: classAssignments,
        employmentType: formData.employmentType,
        isClassTeacher: formData.isClassTeacher,
        classTeacherOf: formData.classTeacherOf,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        joiningDate: formData.joiningDate
      });

      onSave(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update teacher');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return null;

  const subjectsList = ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi', 'Physics', 'Chemistry', 'Biology'];
  const classOptions = ['9', '10', '11', '12'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-slate-900">Edit Teacher Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Gender <span className="text-red-500">*</span></label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Professional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification <span className="text-red-500">*</span></label>
                <select
                  name="qualification"
                  value={formData.qualification || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (Years) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Type</option>
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate ? formData.joiningDate.split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Subjects <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border border-slate-300 rounded-lg bg-slate-50">
              {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science', 'Physical Education', 'Art', 'Music', 'Social Science', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Business Studies', 'Hindi', 'Sanskrit'].map(subject => (
                <label key={subject} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subjects.includes(subject)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSubjects([...subjects, subject]);
                      } else {
                        setSubjects(subjects.filter(s => s !== subject));
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Classes and Sections */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Class & Section Assignment <span className="text-red-500">*</span>
            </h3>
            
            {/* Step 1: Select Class */}
            <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
              <p className="text-sm font-semibold text-slate-700 mb-2">Step 1: Select a Class</p>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Select Class --</option>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
                  .filter(cls => !classAssignments.some(ca => ca.className === cls))
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
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Add Class {selectedClass} with Section{selectedSections.length > 1 ? 's' : ''} {selectedSections.join(', ')}
                  </button>
                )}
              </div>
            )}

            {/* Display Added Class Assignments */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Added Class Assignments:</p>
              {classAssignments.length > 0 ? (
                classAssignments.map((assignment, idx) => (
                  <div key={idx} className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-emerald-900">Class {assignment.className}</p>
                      <p className="text-sm text-emerald-700">Sections: {assignment.sections.join(', ')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveClassAssignment(assignment.className)}
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

          {/* Class Teacher Assignment */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Class Teacher Assignment
            </h3>
            {classAssignments.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Select from assigned classes and sections:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
                  {classAssignments.map((assignment) => (
                    assignment.sections.map(section => {
                      const classTeacherValue = `${assignment.className}-${section}`; // Format: "10-A"
                      return (
                        <label key={classTeacherValue} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="classTeacherOf"
                            value={classTeacherValue}
                            checked={formData.classTeacherOf === classTeacherValue}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-slate-700">Class {assignment.className} - Section {section}</span>
                        </label>
                      );
                    })
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-300">
                    <input
                      type="radio"
                      name="classTeacherOf"
                      value=""
                      checked={formData.classTeacherOf === ''}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-600 italic">Not a class teacher</span>
                  </label>
                </div>
                {formData.classTeacherOf && (
                  <p className="text-xs text-emerald-600">Selected as Class Teacher for: {formData.classTeacherOf}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Please add classes and sections above first</p>
            )}
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Address
            </h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeacherModal;
