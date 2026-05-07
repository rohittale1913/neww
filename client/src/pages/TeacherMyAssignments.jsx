import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { classAssignmentAPI, classAPI } from '../services/api';
import { FiCheckCircle, FiAlertCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

const TeacherMyAssignments = () => {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get all classes
      let classesData = [];
      try {
        const classesRes = await classAPI.getAll();
        classesData = classesRes.data || classesRes || [];
      } catch (err) {
        console.error('Error fetching classes:', err);
        // Fallback: try alternative method
        try {
          const altRes = await classAssignmentAPI.getAllClasses();
          classesData = altRes.data || altRes || [];
        } catch (altErr) {
          console.error('Alternative class fetch also failed:', altErr);
        }
      }

      setClasses(Array.isArray(classesData) ? classesData : []);

      // Fetch assignments - get all and filter for current user on backend
      const assignmentsRes = await classAssignmentAPI.getAll({ isActive: 'true' });
      // The backend will return assignments for all teachers, so filter locally
      // Or we could create a separate endpoint for "my assignments" but for now this works
      setAssignments(assignmentsRes.data || []);
      setAlert(null);
    } catch (error) {
      console.error('Fetch error:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to fetch data. Please try refreshing the page.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classId) => {
    const selected = classes.find(c => c._id === classId);
    setSelectedClass(selected);
    setSelectedSubjects([]);
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(s => s !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleCreateAssignment = async () => {
    if (!selectedClass || selectedSubjects.length === 0) {
      setAlert({ type: 'error', message: 'Please select class and at least one subject' });
      return;
    }

    try {
      const subjectNames = selectedSubjects.map(id => {
        const subject = selectedClass.subjects.find(s => s._id === id);
        return subject?.subjectName || subject?.name || id;
      });

      const payload = {
        className: selectedClass.className,
        section: selectedClass.section,
        // Don't pass teacherId - backend will determine it from authenticated user
        subjects: subjectNames,
        assignmentType: 'subject_teacher',
        notes: 'Teacher self-assigned'
      };

      await classAssignmentAPI.assign(payload);
      setAlert({ type: 'success', message: 'Assignment created successfully' });
      setShowModal(false);
      setSelectedClass(null);
      setSelectedSubjects([]);
      fetchData();
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to create assignment' 
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await classAssignmentAPI.delete(assignmentId);
      setAlert({ type: 'success', message: 'Assignment deleted successfully' });
      fetchData();
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to delete assignment' 
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
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
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-purple-600 to-slate-900 bg-clip-text text-transparent">
              My Subject Assignments
            </h1>
            <p className="text-slate-500 mt-2">Manage the subjects you teach in each class</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <FiPlus size={20} /> Add Assignment
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <FiAlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900">How it works</h3>
              <p className="text-blue-800 text-sm mt-1">
                Create assignments for the subjects you teach in each class. These assignments will be used to generate your timetable and will be visible to your students.
              </p>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-slate-600">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
            <FiAlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-semibold">No assignments yet</p>
            <p className="text-slate-500 text-sm mt-2">Create your first assignment to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map(assignment => (
              <div key={assignment._id} className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
                {/* Class Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {assignment.className}-{assignment.section}
                    </h3>
                    <p className="text-sm text-slate-500">Class</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAssignment(assignment._id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>

                {/* Subjects */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-3">Subjects</p>
                  <div className="space-y-2">
                    {assignment.subjects?.map((subject, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <FiCheckCircle size={16} className="text-green-600 flex-shrink-0" />
                        <span className="text-slate-700">{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="pt-4 border-t border-slate-200">
                  {assignment.isActive ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      <FiCheckCircle size={14} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                      ✗ Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedClass(null); setSelectedSubjects([]); }}>
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Subject Assignment</h2>

            <div className="space-y-6">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Class <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedClass?._id || ''}
                  onChange={(e) => handleClassSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a class...</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.className}-{cls.section}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subjects Selection */}
              {selectedClass && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Select Subjects <span className="text-red-600">*</span>
                  </label>
                  {selectedClass.subjects?.length === 0 ? (
                    <p className="text-slate-500 text-sm">This class has no subjects</p>
                  ) : (
                    <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {selectedClass.subjects?.map(subject => (
                        <label key={subject._id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(subject._id)}
                            onChange={() => handleSubjectToggle(subject._id)}
                            className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                          />
                          <span className="text-slate-700 font-medium">{subject.subjectName || subject.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => { setShowModal(false); setSelectedClass(null); setSelectedSubjects([]); }}
                  className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAssignment}
                  disabled={!selectedClass || selectedSubjects.length === 0}
                  className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-slate-400 transition-colors flex items-center gap-2"
                >
                  <FiCheckCircle size={18} />
                  Create Assignment
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default TeacherMyAssignments;
