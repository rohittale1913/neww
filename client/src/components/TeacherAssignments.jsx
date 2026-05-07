import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherAPI, assignmentAPI } from '../services/api';
import { FiPlus, FiUpload, FiCheckCircle, FiClock, FiAlertCircle, FiArrowRight, FiTrash2 } from 'react-icons/fi';

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    overdue: 0
  });
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, [filter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await teacherAPI.getMyAssignments(filter !== 'all' ? filter : undefined);
      const assignmentList = response.data.assignments || [];
      setAssignments(assignmentList);
      setStats({
        total: assignmentList.length,
        pending: assignmentList.reduce((acc, a) => acc + (a.submissionCount - a.gradedCount), 0),
        overdue: assignmentList.filter(a => a.isOverdue).length
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Delete this assignment for all students? This cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(assignmentId);
      await assignmentAPI.delete(assignmentId);
      await fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setDeletingId('');
    }
  };

  const StatCard = ({ icon: Icon, label, value, bgColor, iconColor }) => (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl border border-slate-100 hover:border-slate-300 transition p-6 flex items-center gap-4">
      <div className={`text-2xl p-4 rounded-2xl ${bgColor} shadow-md`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex flex-col">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{loading ? '-' : value}</p>
      </div>
    </div>
  );

  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent">
            My Assignments
          </h1>
          <p className="text-slate-600 mt-2">Create and manage assignments for your classes</p>
        </div>
        <button
          onClick={() => navigate('/teacher/assignments/create')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
        >
          <FiPlus className="w-5 h-5" />
          Create Assignment
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={FiUpload} label="Total Assignments" value={stats.total} bgColor="bg-blue-100" iconColor="text-blue-600" />
        <StatCard icon={FiClock} label="Pending Submissions" value={stats.pending} bgColor="bg-green-100" iconColor="text-green-600" />
        <StatCard icon={FiAlertCircle} label="Overdue" value={stats.overdue} bgColor="bg-red-100" iconColor="text-red-600" />
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-0 overflow-x-auto">
        {['all', 'pending', 'graded'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap capitalize ${
              filter === f ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
          <FiUpload className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-slate-600 font-medium">No assignments found</p>
          <p className="text-slate-400 text-sm mt-1">Create your first assignment to get started</p>
          <button
            onClick={() => navigate('/teacher/assignments/create')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Create Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                  <p className="text-sm text-slate-600">{assignment.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {assignment.isOverdue && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-red-700 bg-red-50 border border-red-200">
                        <FiAlertCircle className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                    {assignment.submissionCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200">
                        <FiCheckCircle className="w-3 h-3" />
                        {assignment.submissionCount} Submitted
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-1 space-y-2">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Class - Section</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {assignment.className ? `${assignment.className} - ${assignment.section || ''}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Subject</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {assignment.subject?.name || assignment.subjectName || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-1 space-y-2">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Due Date</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Total Marks</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{assignment.totalMarks}</p>
                  </div>
                </div>

                <div className="md:col-span-1 flex flex-col justify-between h-full">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Submissions</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {assignment.gradedCount} <span className="text-sm text-slate-600">/ {assignment.submissionCount}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{assignment.submissionCount - assignment.gradedCount} pending</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => navigate(`/teacher/assignments/${assignment._id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition inline-flex items-center justify-center gap-2 text-sm w-full"
                    >
                      View Submissions
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment._id)}
                      disabled={deletingId === assignment._id}
                      className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition inline-flex items-center justify-center gap-2 text-sm w-full disabled:opacity-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      {deletingId === assignment._id ? 'Deleting...' : 'Delete Assignment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
