import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { teacherAPI, assignmentAPI } from '../services/api';
import { FiArrowLeft, FiDownload, FiStar, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import Modal from '../components/Modal';

const TeacherAssignmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradingModal, setGradingModal] = useState(null);
  const [gradeData, setGradeData] = useState({ marksObtained: '', feedback: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignmentDetail();
  }, [assignmentId]);

  const fetchAssignmentDetail = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getAssignmentDetail(assignmentId);
      setAssignment(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignment');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async () => {
    if (gradeData.marksObtained === '' || gradeData.marksObtained === null) {
      alert('Please enter marks');
      return;
    }

    const marks = parseInt(gradeData.marksObtained);
    if (marks < 0 || marks > assignment.totalMarks) {
      alert(`Marks must be between 0 and ${assignment.totalMarks}`);
      return;
    }

    try {
      setSubmitting(true);
      // Ensure we send a string ID for studentId (handle populated student objects)
      const studentIdToSend = gradingModal?.studentId?._id || gradingModal?.studentId;

      const payload = {
        studentId: studentIdToSend,
        marksObtained: marks,
        feedback: gradeData.feedback
      };

      console.log('Grading payload ->', payload);

      const resp = await teacherAPI.gradeAssignment(assignmentId, payload);

      console.log('Grade response ->', resp);

      alert('Assignment graded successfully!');
      setGradingModal(null);
      setGradeData({ marksObtained: '', feedback: '' });
      fetchAssignmentDetail();
    } catch (err) {
      console.error('Grade error ->', err);
      alert(err.response?.data?.message || err.message || 'Failed to grade assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!window.confirm('Delete this assignment for all students? This cannot be undone.')) {
      return;
    }

    try {
      setSubmitting(true);
      await assignmentAPI.delete(assignmentId);
      alert('Assignment deleted successfully');
      navigate('/teacher/assignments');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading assignment...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !assignment) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
            <p className="text-red-700 font-medium">{error || 'Assignment not found'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const submissions = assignment.submissions || [];
  const submittedCount = submissions.length;
  const gradedCount = submissions.filter(s => s.marksObtained !== undefined).length;
  const pendingCount = submittedCount - gradedCount;
  
  // Check if assignment deadline has passed
  const isPostDeadline = new Date(assignment.dueDate) < new Date();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{assignment.title}</h1>
            <p className="text-slate-600 mt-1">View and grade student submissions</p>
          </div>
          {isPostDeadline && (
            <button
              onClick={handleDeleteAssignment}
              disabled={submitting}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition disabled:opacity-50"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete Assignment
            </button>
          )}
        </div>

        {/* Assignment Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs text-slate-600 font-semibold uppercase">Class - Section</p>
            <p className="text-lg font-bold text-slate-900 mt-2">
              {assignment.className ? `${assignment.className} - ${assignment.section || ''}` : 'N/A'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs text-slate-600 font-semibold uppercase">Subject</p>
            <p className="text-lg font-bold text-slate-900 mt-2">
              {assignment.subject?.name || assignment.subjectName || 'N/A'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs text-slate-600 font-semibold uppercase">Due Date</p>
            <p className="text-lg font-bold text-slate-900 mt-2">
              {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs text-slate-600 font-semibold uppercase">Total Marks</p>
            <p className="text-lg font-bold text-slate-900 mt-2">
              {assignment.totalMarks}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6">
            <p className="text-sm font-semibold text-blue-900">Total Submissions</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{submittedCount}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6">
            <p className="text-sm font-semibold text-green-900">Graded</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{gradedCount}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 p-6">
            <p className="text-sm font-semibold text-yellow-900">Pending Grading</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
          </div>
        </div>

        {/* Description and Instructions */}
        {(assignment.description || assignment.instructions) && (
          <div className="space-y-4">
            {assignment.description && (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{assignment.description}</p>
              </div>
            )}
            {assignment.instructions && (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Instructions</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{assignment.instructions}</p>
              </div>
            )}
          </div>
        )}

        {/* Submissions Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
            <h2 className="text-lg font-bold">Student Submissions</h2>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-600 font-medium">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Student Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Roll No.</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Submitted On</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Attachments</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Marks</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {submission.studentName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {submission.studentRollNumber || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {submission.submittedDate
                          ? new Date(submission.submittedDate).toLocaleDateString('en-IN')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {submission.attachments && submission.attachments.length > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            {submission.attachments.map((attach, aidx) => (
                              <a
                                key={aidx}
                                href={attach}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                                title={attach}
                              >
                                <FiDownload className="w-4 h-4" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold">
                        {submission.marksObtained !== undefined ? (
                          <div>
                            <div className="text-slate-900">
                              {submission.marksObtained} / {assignment.totalMarks}
                            </div>
                            <div className="text-xs text-slate-600">
                              {((submission.marksObtained / assignment.totalMarks) * 100).toFixed(2)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-yellow-600 font-semibold">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setGradingModal(submission);
                            setGradeData({
                              marksObtained: submission.marksObtained || '',
                              feedback: submission.feedback || ''
                            });
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition text-sm inline-flex items-center gap-1"
                        >
                          <FiStar className="w-4 h-4" />
                          Grade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      {gradingModal && (
        <Modal
          title="Grade Assignment"
          onClose={() => {
            setGradingModal(null);
            setGradeData({ marksObtained: '', feedback: '' });
          }}
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Student: {gradingModal.studentName}</p>
              <p className="text-xs text-slate-600">Roll No: {gradingModal.studentRollNumber}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Marks Obtained <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={assignment.totalMarks}
                  value={gradeData.marksObtained}
                  onChange={(e) => setGradeData(prev => ({ ...prev, marksObtained: e.target.value }))}
                  placeholder="Enter marks"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-600 font-medium">/ {assignment.totalMarks}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Feedback
              </label>
              <textarea
                value={gradeData.feedback}
                onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Provide feedback to the student"
                rows="4"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setGradingModal(null);
                  setGradeData({ marksObtained: '', feedback: '' });
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGradeSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4" />
                {submitting ? 'Saving...' : 'Save Grade'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default TeacherAssignmentDetail;
