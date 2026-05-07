import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { classAssignmentAPI, teacherAPI } from '../services/api';
import { FiTrash2, FiEdit2, FiPlus, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

const AdminTeacherAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [selectedAssignmentDetail, setSelectedAssignmentDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    teacherId: '',
    subjects: '',
    assignmentType: 'subject_teacher',
    notes: ''
  });

  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [teacherConstraintWarning, setTeacherConstraintWarning] = useState('');
  const [selectedTeacherSubjects, setSelectedTeacherSubjects] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    className: '',
    section: '',
    assignmentType: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, classesRes, teachersRes] = await Promise.all([
        classAssignmentAPI.getAll({ isActive: 'true' }),
        classAssignmentAPI.getAllClasses(),
        teacherAPI.getAll()
      ]);

      // Handle both array and object response structures
      const assignmentsArray = Array.isArray(assignmentsRes) ? assignmentsRes : (assignmentsRes.data || []);
      const classesArray = Array.isArray(classesRes) ? classesRes : (classesRes.data || []);
      const teachersArray = Array.isArray(teachersRes) ? teachersRes : (teachersRes.data || []);

      setAssignments(assignmentsArray);
      setClasses(classesArray);
      setTeachers(teachersArray);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSectionChange = async (className, section) => {
    // Clear previous selections when class/section changes
    setFormData(prev => ({ ...prev, className, section, teacherId: '', subjects: '' }));
    setTeacherConstraintWarning('');
    setSelectedTeacherSubjects([]);
    
    // Show all teachers regardless of class/section
    setAvailableTeachers(teachers);
  };

  const handleTeacherChange = (teacherId) => {
    setFormData(prev => ({ ...prev, teacherId, subjects: '' }));
    
    // Get the selected teacher's subjects
    const teacher = availableTeachers.find(t => t._id === teacherId);
    if (teacher && teacher.subjects) {
      setSelectedTeacherSubjects(teacher.subjects);
    } else {
      setSelectedTeacherSubjects([]);
    }
    
    // Check if selected teacher has class teacher constraint
    if (teacher) {
      if (!teacher.canBeClassTeacher && formData.assignmentType === 'class_teacher') {
        setTeacherConstraintWarning(
          `⚠️ ${teacher.name} is already a class teacher for another class. They can only be class teacher of ONE class. You can still assign them as a subject teacher.`
        );
      } else if (teacher.isClassTeacherElsewhere) {
        setTeacherConstraintWarning(
          `⚠️ ${teacher.name} is currently class teacher for another class. If you make them class teacher here, they will be removed as class teacher from the other class.`
        );
      } else {
        setTeacherConstraintWarning('');
      }
    }
  };

  const handleAssignmentTypeChange = (type) => {
    setFormData(prev => ({ ...prev, assignmentType: type }));
    
    // Re-check constraint with new assignment type
    if (type === 'class_teacher') {
      const teacher = availableTeachers.find(t => t._id === formData.teacherId);
      if (teacher && !teacher.canBeClassTeacher) {
        setTeacherConstraintWarning(
          `⚠️ ${teacher.name} is already a class teacher for another class. They can only be class teacher of ONE class.`
        );
      }
    } else {
      setTeacherConstraintWarning('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.className || !formData.section || !formData.teacherId || !formData.subjects) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        className: formData.className,
        section: formData.section,
        teacherId: formData.teacherId,
        subjects: typeof formData.subjects === 'string' 
          ? formData.subjects.split(',').map(s => s.trim()).filter(s => s)
          : formData.subjects,
        assignmentType: formData.assignmentType,
        notes: formData.notes
      };

      if (editingAssignment) {
        await classAssignmentAPI.update(editingAssignment._id, payload);
        setSuccess('Assignment updated successfully');
      } else {
        await classAssignmentAPI.assignTeacher(payload);
        setSuccess('Teacher assigned successfully');
      }

      // Reset form
      setFormData({
        className: '',
        section: '',
        teacherId: '',
        subjects: '',
        assignmentType: 'subject_teacher',
        notes: ''
      });
      setSelectedTeacherSubjects([]);
      setEditingAssignment(null);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      className: assignment.className,
      section: assignment.section,
      teacherId: assignment.teacherId,
      subjects: assignment.subjects.join(', '),
      assignmentType: assignment.assignmentType,
      notes: assignment.notes || ''
    });
    
    // Show all teachers
    setAvailableTeachers(teachers);
    
    // Find the assigned teacher and set their subjects
    const assignedTeacher = teachers.find(t => t._id === assignment.teacherId);
    if (assignedTeacher && assignedTeacher.subjects) {
      setSelectedTeacherSubjects(assignedTeacher.subjects);
    }
    
    setShowModal(true);
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        setLoading(true);
        await classAssignmentAPI.delete(assignmentId);
        setSuccess('Assignment deleted successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete assignment');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = async (assignmentId) => {
    try {
      const res = await classAssignmentAPI.getById(assignmentId);
      setSelectedAssignmentDetail(res.data);
      setShowDetailModal(true);
    } catch (err) {
      setError('Failed to fetch assignment details');
    }
  };

  const openNewAssignmentModal = () => {
    setEditingAssignment(null);
    setFormData({
      className: '',
      section: '',
      teacherId: '',
      subjects: '',
      assignmentType: 'subject_teacher',
      notes: ''
    });
    setAvailableTeachers([]);
    setSelectedTeacherSubjects([]);
    setTeacherConstraintWarning('');
    setShowModal(true);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchClass = !filters.className || assignment.className === filters.className;
    const matchSection = !filters.section || assignment.section === filters.section;
    const matchType = !filters.assignmentType || assignment.assignmentType === filters.assignmentType;
    return matchClass && matchSection && matchType;
  });

  // Get unique classes and sections for filter dropdowns
  const uniqueClasses = [...new Set(classes.map(c => c.className))].sort();
  const uniqueSections = [...new Set(classes.map(c => c.section))].sort();
  
  // Get sections filtered by selected class in form
  const sectionsForSelectedClass = formData.className
    ? [...new Set(classes.filter(c => c.className === formData.className).map(c => c.section))].sort()
    : [...new Set(classes.map(c => c.section))].sort();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent">
              Class-Subject Teacher Assignment
            </h1>
            {/* <p className="text-slate-600 text-sm mt-2">
              Assign teachers to classes with specific subjects. A teacher can only be class teacher of ONE class but can teach multiple subjects.
            </p> */}
          </div>
          <button
            onClick={openNewAssignmentModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition"
          >
            <FiPlus /> New Teacher Assign
          </button>
        </div>

        {/* Alerts */}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
              <select
                value={filters.className}
                onChange={(e) => setFilters(prev => ({ ...prev, className: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Section</label>
              <select
                value={filters.section}
                onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sections</option>
                {uniqueSections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Type</label>
              <select
                value={filters.assignmentType}
                onChange={(e) => setFilters(prev => ({ ...prev, assignmentType: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="class_teacher">Class Teacher</option>
                <option value="subject_teacher">Subject Teacher</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Teacher</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Subjects</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      Loading assignments...
                    </td>
                  </tr>
                ) : filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No assignments found. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map(assignment => (
                    <tr key={assignment._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {assignment.className}-{assignment.section}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{assignment.teacherName}</p>
                          <p className="text-sm text-slate-500">{assignment.teacherId?.teacherId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {assignment.subjects.map(subject => (
                            <span
                              key={subject}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                            assignment.assignmentType === 'class_teacher'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <FiCheckCircle />
                          {assignment.assignmentType === 'class_teacher'
                            ? 'Class Teacher'
                            : 'Subject Teacher'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleViewDetails(assignment._id)}
                            className="text-blue-600 hover:text-blue-800 transition text-sm font-semibold"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleEdit(assignment)}
                            className="text-amber-600 hover:text-amber-800 transition"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(assignment._id)}
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assignment Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingAssignment(null);
            setSelectedTeacherSubjects([]);
            setTeacherConstraintWarning('');
          }}
          title={editingAssignment ? 'Edit Assignment' : 'New Assignment'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class and Section Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Class *
                </label>
                <select
                  value={formData.className}
                  onChange={(e) => handleClassSectionChange(e.target.value, formData.section)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editingAssignment !== null}
                >
                  <option value="">Select Class</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Section *
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => handleClassSectionChange(formData.className, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editingAssignment !== null}
                >
                  <option value="">Select Section</option>
                  {sectionsForSelectedClass.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignment Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Assignment Type *
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-blue-500">
                  <input
                    type="radio"
                    value="class_teacher"
                    checked={formData.assignmentType === 'class_teacher'}
                    onChange={(e) => handleAssignmentTypeChange(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-slate-900">Class Teacher</span>
                  <span className="text-xs text-slate-500 ml-auto">(Primary class instructor)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-blue-500">
                  <input
                    type="radio"
                    value="subject_teacher"
                    checked={formData.assignmentType === 'subject_teacher'}
                    onChange={(e) => handleAssignmentTypeChange(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-slate-900">Subject Teacher</span>
                  <span className="text-xs text-slate-500 ml-auto">(Teach specific subjects)</span>
                </label>
              </div>
            </div>

            {/* Teacher Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Teacher *
              </label>
              <select
                value={formData.teacherId}
                onChange={(e) => handleTeacherChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Teacher</option>
                {availableTeachers.map(teacher => (
                  <option
                    key={teacher._id}
                    value={teacher._id}
                    disabled={formData.assignmentType === 'class_teacher' && !teacher.canBeClassTeacher}
                  >
                    {teacher.name}
                    {teacher.isCurrentClassTeacher && ' (Current Class Teacher)'}
                    {teacher.isClassTeacherElsewhere && ' (Class Teacher Elsewhere)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher Constraint Warning */}
            {teacherConstraintWarning && (
              <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{teacherConstraintWarning}</p>
              </div>
            )}

            {/* Subjects - Multi-select from teacher's subjects */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subjects *
              </label>
              {selectedTeacherSubjects.length > 0 ? (
                <select
                  multiple
                  name="subjects"
                  value={formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, subjects: selected.join(', ') }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size="4"
                >
                  {selectedTeacherSubjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500">
                  Select a teacher first to see their available subjects
                </div>
              )}
              <p className="text-xs text-slate-600 mt-1">Hold Ctrl/Cmd to select multiple subjects</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about this assignment..."
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingAssignment(null);
                }}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400"
              >
                {editingAssignment ? 'Update' : 'Assign'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Details Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Assignment Details"
        >
          {selectedAssignmentDetail && (
            <div className="space-y-6">
              {/* Assignment Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Assignment Information</h3>
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Class</p>
                    <p className="font-semibold">
                      {selectedAssignmentDetail.assignment.className}-{selectedAssignmentDetail.assignment.section}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Type</p>
                    <p className="font-semibold">
                      {selectedAssignmentDetail.assignment.assignmentType === 'class_teacher'
                        ? '👨‍🏫 Class Teacher'
                        : '📚 Subject Teacher'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Subjects</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAssignmentDetail.assignment.subjects.map(s => (
                        <span key={s} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Assigned At</p>
                    <p className="font-semibold">
                      {new Date(selectedAssignmentDetail.assignment.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Teacher Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Teacher Information</h3>
                {selectedAssignmentDetail.connectedData.teacher ? (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <p><span className="text-slate-600">Name:</span> <span className="font-semibold">{selectedAssignmentDetail.connectedData.teacher.name}</span></p>
                    <p><span className="text-slate-600">Email:</span> <span className="font-semibold">{selectedAssignmentDetail.connectedData.teacher.userId?.email}</span></p>
                    <p><span className="text-slate-600">Qualification:</span> <span className="font-semibold">{selectedAssignmentDetail.connectedData.teacher.qualification}</span></p>
                    <p><span className="text-slate-600">Experience:</span> <span className="font-semibold">{selectedAssignmentDetail.connectedData.teacher.experience} years</span></p>
                  </div>
                ) : (
                  <p className="text-slate-500">No teacher information available</p>
                )}
              </div>

              {/* Admin Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Assigned By (Admin)</h3>
                {selectedAssignmentDetail.connectedData.admin ? (
                  <div className="p-4 bg-purple-50 rounded-lg space-y-2">
                    <p><span className="text-slate-600">Name:</span> <span className="font-semibold">{selectedAssignmentDetail.connectedData.admin.name}</span></p>
                    <p><span className="text-slate-600">Email:</span> <span className="font-semibold">{selectedAssignmentDetail.connectedData.admin.email}</span></p>
                  </div>
                ) : (
                  <p className="text-slate-500">No admin information available</p>
                )}
              </div>

              {/* Students List */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                  Students in Class ({selectedAssignmentDetail.connectedData.totalStudents})
                </h3>
                {selectedAssignmentDetail.connectedData.students.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedAssignmentDetail.connectedData.students.map(student => (
                      <div
                        key={student._id}
                        className="p-3 bg-slate-50 rounded-lg flex justify-between items-center hover:bg-slate-100"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{student.name}</p>
                          <p className="text-sm text-slate-500">{student.studentId} | Roll: {student.rollNumber}</p>
                        </div>
                        <span className="text-xs text-slate-600">{student.email}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No students assigned to this class</p>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AdminTeacherAssignment;
