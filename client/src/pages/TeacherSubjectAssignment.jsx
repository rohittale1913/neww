import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { classAssignmentAPI, teacherAPI, classAPI } from '../services/api';
import { FiTrash2, FiEdit2, FiPlus, FiCheckCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

const TeacherSubjectAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Filter state
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    teacherId: '',
    subjects: [],
    notes: ''
  });

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignRes, classRes, teacherRes] = await Promise.all([
        classAssignmentAPI.getAll({ isActive: 'true' }),
        classAPI.getAll(),
        teacherAPI.getAll()
      ]);

      setAssignments(assignRes.data || []);
      setClasses(classRes.data || []);
      setTeachers(teacherRes.data || []);
      setAlert(null);
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to fetch data' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const selectedClass = classes.find(c => c._id === e.target.value);
    if (selectedClass) {
      setFormData(prev => ({
        ...prev,
        className: selectedClass.className,
        section: selectedClass.section,
        subjects: []
      }));
      setClassSubjects(selectedClass.subjects || []);
    }
  };

  const handleTeacherChange = (e) => {
    const teacher = teachers.find(t => t._id === e.target.value);
    if (teacher) {
      setSelectedTeacher(teacher);
      setFormData(prev => ({ ...prev, teacherId: teacher._id }));
    }
  };

  const handleSubjectToggle = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(s => s !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.className || !formData.section || !formData.teacherId || formData.subjects.length === 0) {
      setAlert({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    try {
      const payload = {
        className: formData.className,
        section: formData.section,
        teacherId: formData.teacherId,
        subjects: formData.subjects.map(s => {
          const subject = classSubjects.find(cs => cs._id === s);
          return subject?.subjectName || subject?.name || s;
        }),
        assignmentType: 'subject_teacher',
        notes: formData.notes
      };

      if (editingId) {
        await classAssignmentAPI.update(editingId, payload);
        setAlert({ type: 'success', message: 'Assignment updated successfully' });
      } else {
        await classAssignmentAPI.assign(payload);
        setAlert({ type: 'success', message: 'Assignment created successfully' });
      }

      resetForm();
      setShowModal(false);
      fetchData();
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to save assignment' 
      });
    }
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment._id);
    setFormData({
      className: assignment.className,
      section: assignment.section,
      teacherId: assignment.teacherId._id,
      subjects: assignment.subjects || [],
      notes: assignment.notes || ''
    });
    setSelectedTeacher(assignment.teacherId);
    
    // Find class and set subjects
    const classData = classes.find(c => c.className === assignment.className && c.section === assignment.section);
    setClassSubjects(classData?.subjects || []);
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await classAssignmentAPI.delete(id);
        setAlert({ type: 'success', message: 'Assignment deleted successfully' });
        fetchData();
      } catch (error) {
        setAlert({ 
          type: 'error', 
          message: error.response?.data?.message || 'Failed to delete assignment' 
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      className: '',
      section: '',
      teacherId: '',
      subjects: [],
      notes: ''
    });
    setSelectedTeacher(null);
    setClassSubjects([]);
    setEditingId(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredAssignments = assignments.filter(a => {
    if (filterClass && a.className !== filterClass) return false;
    if (filterSection && a.section !== filterSection) return false;
    return true;
  });

  const classOptions = classes.map(c => ({
    value: c._id,
    label: `${c.className}-${c.section}`
  }));

  const uniqueClasses = [...new Set(classes.map(c => c.className))];
  const uniqueSections = [...new Set(classes.map(c => c.section))];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent">
              Teacher-Subject Assignment
            </h1>
            <p className="text-slate-500 mt-2">Assign teachers to specific subjects for each class</p>
          </div>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <FiPlus size={20} /> New Assignment
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-slate-100 rounded-lg p-4 mb-6 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Sections</option>
              {uniqueSections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignments Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
            <FiAlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-semibold">No assignments found</p>
            <p className="text-slate-500 text-sm mt-2">Create a new assignment to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            <table className="w-full">
              <thead className="bg-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Teacher</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Subjects</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Notes</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment, idx) => (
                  <tr key={assignment._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {assignment.className}-{assignment.section}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {assignment.teacherId?.firstName} {assignment.teacherId?.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="flex flex-wrap gap-2">
                        {assignment.subjects?.map((subject, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {assignment.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {assignment.isActive ? (
                        <span className="flex items-center justify-center gap-1 text-green-600 font-semibold">
                          <FiCheckCircle size={18} /> Active
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Add/Edit */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }}>
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {editingId ? 'Edit Assignment' : 'Create New Assignment'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Class <span className="text-red-600">*</span>
                </label>
                <select
                  value={classes.find(c => c.className === formData.className && c.section === formData.section)?._id || ''}
                  onChange={handleClassChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a class...</option>
                  {classOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Teacher Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Teacher <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.teacherId}
                  onChange={handleTeacherChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a teacher...</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Select Subjects <span className="text-red-600">*</span>
                </label>
                {classSubjects.length === 0 ? (
                  <p className="text-slate-500 text-sm">Please select a class first to see available subjects</p>
                ) : (
                  <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {classSubjects.map(subject => (
                      <label key={subject._id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject._id)}
                          onChange={() => handleSubjectToggle(subject._id)}
                          className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                        />
                        <span className="text-slate-700 font-medium">{subject.subjectName || subject.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes (optional)"
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FiCheckCircle size={18} />
                  {editingId ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default TeacherSubjectAssignment;
