import React, { useEffect, useState } from 'react';
import { teacherAPI } from '../services/api';
import { FiUpload, FiCheckCircle, FiClock, FiAlertCircle, FiStar } from 'react-icons/fi';

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [gradingModal, setGradingModal] = useState(null);
  const [gradeData, setGradeData] = useState({ marksObtained: '', feedback: '' });
  const [filter, setFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await teacherAPI.getMyAssignments(filter);
        setAssignments(response.data.assignments || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [filter]);

  const handleGradeSubmit = async () => {
    if (!gradeData.marksObtained && gradeData.marksObtained !== 0) {
      alert('Please enter marks');
      return;
    }

    try {
      setSubmitting(true);
      await teacherAPI.gradeAssignment(gradingModal.assignmentId, {
        studentId: gradingModal.studentId,
        marksObtained: gradeData.marksObtained,
        feedback: gradeData.feedback
      });

      alert('Assignment graded successfully!');
      setGradingModal(null);
      setGradeData({ marksObtained: '', feedback: '' });

      // Refresh assignments
      const response = await teacherAPI.getMyAssignments(filter);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0 overflow-x-auto">
        {['all', 'pending', 'graded'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
              filter === f
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Assignments</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{assignments.length}</p>
            </div>
            <div className="text-slate-400 text-4xl">
              <FiUpload />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Pending Submissions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {assignments.reduce((acc, a) => acc + Math.max(0, a.submissionCount - a.gradedCount), 0)}
              </p>
            </div>
            <div className="text-slate-400 text-4xl">
              <FiClock />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Overdue</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {assignments.filter(a => a.isOverdue).length}
              </p>
            </div>
            <div className="text-slate-400 text-4xl">
              <FiAlertCircle />
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
            <FiUpload className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-slate-600 font-medium">No assignments found</p>
          </div>
        ) : (
          assignments.map((assignment, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
              <div
                onClick={() => setExpandedAssignment(expandedAssignment === idx ? null : idx)}
                className="cursor-pointer px-6 py-4 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{assignment.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {assignment.isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-red-700 bg-red-50">
                          <FiAlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                      {assignment.submissionCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50">
                          <FiCheckCircle className="w-3 h-3" />
                          {assignment.submissionCount} Submitted
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-100">
                        Marks: {assignment.totalMarks}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-600">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {assignment.daysUntilDue >= 0 ? `${assignment.daysUntilDue} days left` : 'Overdue'}
                    </p>
                  </div>
                </div>
              </div>

              {expandedAssignment === idx && (
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 space-y-4">
                  {assignment.submissionStatus && assignment.submissionStatus.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 border-b border-slate-200 bg-white">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-slate-900">Student</th>
                            <th className="px-4 py-2 text-center font-semibold text-slate-900">Status</th>
                            <th className="px-4 py-2 text-center font-semibold text-slate-900">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignment.submissionStatus.map((submission, sidx) => (
                            <tr key={sidx} className="border-b border-slate-200 hover:bg-white">
                              <td className="px-4 py-3 text-slate-700">Student {submission.studentId?.slice(0, 5)}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                  submission.status === 'graded'
                                    ? 'text-green-700 bg-green-50'
                                    : 'text-yellow-700 bg-yellow-50'
                                }`}>
                                  {submission.status === 'graded' ? 'Graded' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => setGradingModal({
                                    assignmentId: assignment._id,
                                    studentId: submission.studentId,
                                    assignmentTitle: assignment.title
                                  })}
                                  className="text-blue-600 hover:text-blue-700 font-semibold transition"
                                >
                                  {submission.status === 'graded' ? 'Edit' : 'Grade'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-600">No submissions yet</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Grading Modal */}
      {gradingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Grade Assignment</h2>
            <p className="text-sm text-slate-600 mb-6">{gradingModal.assignmentTitle}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Marks Obtained</label>
                <input
                  type="number"
                  value={gradeData.marksObtained}
                  onChange={(e) => setGradeData({ ...gradeData, marksObtained: parseFloat(e.target.value) })}
                  placeholder="Enter marks"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Feedback (Optional)</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  placeholder="Enter feedback"
                  rows="4"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setGradingModal(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGradeSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Grade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
