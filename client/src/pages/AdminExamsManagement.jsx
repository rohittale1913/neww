import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { examAPI, classAPI } from '../services/api';
import { FiFileText, FiCalendar, FiUsers, FiAward, FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiX } from 'react-icons/fi';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import ExamMarksModal from '../components/ExamMarksModal';

const AdminExamsManagement = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, ongoing: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedExamForMarks, setSelectedExamForMarks] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    examName: '',
    examType: 'unit_test',
    classId: '',
    subjects: [],
    startDate: '',
    endDate: '',
    totalMarks: '',
    passingMarks: '',
    academicYear: new Date().getFullYear().toString(),
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examsRes, classesRes, subjectsRes] = await Promise.all([
          examAPI.getAll(),
          classAPI.getAll(),
          classAPI.getAllSubjects()
        ]);

        const examsData = examsRes.data || [];
        setExams(examsData);
        setClasses(classesRes.data || []);
        setSubjects(subjectsRes.data || []);

        // Calculate statistics
        const now = new Date();
        const upcoming = examsData.filter(e => new Date(e.startDate) > now).length;
        const completed = examsData.filter(e => new Date(e.endDate) < now).length;
        const ongoing = examsData.filter(e => {
          const start = new Date(e.startDate);
          const end = new Date(e.endDate);
          return start <= now && now <= end;
        }).length;

        setStats({
          total: examsData.length,
          upcoming,
          completed,
          ongoing
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setAlert({ type: 'error', message: 'Failed to fetch exams data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.startDate);
    const end = new Date(exam.endDate);

    if (now < start) {
      return 'Upcoming';
    } else if (now > end) {
      return 'Completed';
    } else {
      return 'Ongoing';
    }
  };

  const getStatusColor = (exam) => {
    const status = getStatus(exam);
    switch (status) {
      case 'Upcoming':
        return 'text-yellow-600 bg-yellow-50';
      case 'Completed':
        return 'text-green-600 bg-green-50';
      case 'Ongoing':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const handleOpenModal = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        examName: exam.examName,
        examType: exam.examType,
        classId: exam.classId._id || exam.classId,
        subjects: exam.subjects ? exam.subjects.map(s => s._id || s) : [],
        startDate: exam.startDate ? new Date(exam.startDate).toISOString().split('T')[0] : '',
        endDate: exam.endDate ? new Date(exam.endDate).toISOString().split('T')[0] : '',
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        academicYear: exam.academicYear,
        description: exam.description
      });
    } else {
      setEditingExam(null);
      setFormData({
        examName: '',
        examType: 'unit_test',
        classId: '',
        subjects: [],
        startDate: '',
        endDate: '',
        totalMarks: '',
        passingMarks: '',
        academicYear: new Date().getFullYear().toString(),
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExam(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      subjects: selected
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.examName || !formData.classId || !formData.startDate || !formData.endDate) {
        setAlert({ type: 'error', message: 'Please fill in all required fields' });
        return;
      }

      if (editingExam) {
        const response = await examAPI.update(editingExam._id, formData);
        setAlert({ type: 'success', message: 'Exam updated successfully' });
        setExams(exams.map(e => e._id === editingExam._id ? response.data.exam : e));
      } else {
        const response = await examAPI.create(formData);
        setAlert({ type: 'success', message: 'Exam created successfully' });
        setExams([...exams, response.data.exam]);
      }
      handleCloseModal();
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to save exam' });
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await examAPI.delete(examId);
      setAlert({ type: 'success', message: 'Exam deleted successfully' });
      setExams(exams.filter(e => e._id !== examId));
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to delete exam' });
    }
  };

  const StatCard = ({ icon: Icon, label, value, bgColor, iconColor }) => (
    <div className="bg-white rounded border border-gray-300 p-6 flex items-center gap-4">
      <div className={`text-2xl p-3 rounded ${bgColor}`}>
        <Icon className={`${iconColor} text-base`} />
      </div>
      <div className="flex flex-col">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{loading ? '-' : value}</p>
      </div>
    </div>
  );

  const getFilteredExams = () => {
    if (filter === 'all') return exams;
    return exams.filter(exam => getStatus(exam).toLowerCase() === filter.toLowerCase());
  };

  const filteredExams = getFilteredExams();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent">Exams Management</h1>
            {/* <p className="text-gray-600 mt-2"></p> */}
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition"
          >
            <FiPlus size={16} />
            Create Exam
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={FiFileText}
            label="Total Exams"
            value={stats.total}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={FiCalendar}
            label="Upcoming"
            value={stats.upcoming}
            bgColor="bg-indigo-100"
            iconColor="text-indigo-600"
          />
          <StatCard
            icon={FiAward}
            label="Ongoing"
            value={stats.ongoing}
            bgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={FiCheckCircle}
            label="Completed"
            value={stats.completed}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
        </div>

        {/* Filter and Table */}
        <div className="bg-white rounded border border-gray-300 overflow-hidden">
          <div className="p-6 border-b border-gray-300 bg-gray-50">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded font-semibold transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-6 py-2 rounded font-semibold transition ${
                  filter === 'upcoming'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('ongoing')}
                className={`px-6 py-2 rounded font-semibold transition ${
                  filter === 'ongoing'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-2 rounded font-semibold transition ${
                  filter === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Exam Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Subjects</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total Marks</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <tr key={exam._id} className="border-b border-gray-300">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{exam.examName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">{exam.examType?.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {exam.classId?.className ? `${exam.classId.className} ${exam.classId.section}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {exam.subjects?.length > 0 
                          ? exam.subjects.map(s => s.name || s).join(', ')
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(exam.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{exam.totalMarks || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-4 py-2 rounded text-xs font-bold ${getStatusColor(exam)}`}>
                          {getStatus(exam)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedExamForMarks(exam);
                            setShowMarksModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 p-2 rounded transition"
                          title="Add Marks"
                        >
                          <FiAward size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(exam)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded transition"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(exam._id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded transition"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-600 text-sm font-medium">
                      No exams found in this category
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Exam Modal */}
        <Modal isOpen={showModal} onClose={handleCloseModal} title={editingExam ? 'Edit Exam' : 'Create New Exam'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Name *</label>
                <input
                  type="text"
                  name="examName"
                  value={formData.examName}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics Mid-term"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Type *</label>
                <select
                  name="examType"
                  value={formData.examType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unit_test">Unit Test</option>
                  <option value="midterm">Mid-term</option>
                  <option value="final">Final</option>
                  <option value="quiz">Quiz</option>
                  <option value="practical">Practical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.className} {cls.section}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects</label>
                <select
                  name="subjects"
                  multiple
                  value={formData.subjects}
                  onChange={handleSubjectsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size="3"
                >
                  {subjects.map(subj => (
                    <option key={subj._id} value={subj._id}>{subj.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks</label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Marks</label>
                <input
                  type="number"
                  name="passingMarks"
                  value={formData.passingMarks}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="40"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year</label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2024"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Additional exam details..."
                rows="3"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition"
              >
                {editingExam ? 'Update Exam' : 'Create Exam'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Exam Marks Modal */}
        {selectedExamForMarks && (
          <ExamMarksModal
            exam={selectedExamForMarks}
            isOpen={showMarksModal}
            onClose={() => {
              setShowMarksModal(false);
              setSelectedExamForMarks(null);
            }}
            onSave={() => window.location.reload()}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminExamsManagement;
