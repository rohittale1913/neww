import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { FiUpload, FiDownload, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, [filter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentAPI.getMyAssignments(filter !== 'all' ? filter : undefined);
      setAssignments(response.data.assignments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    try {
      setSubmitting(true);
      setError('');
      await studentAPI.submitAssignment(selectedAssignment._id, {
        attachments
      });
      setShowSubmitModal(false);
      setAttachments([]);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignment) => {
    if (assignment.isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
          <FiAlertCircle className="w-4 h-4" />
          Overdue
        </span>
      );
    }
    if (assignment.submissionStatus === 'submitted') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
          <FiCheckCircle className="w-4 h-4" />
          Submitted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
        <FiClock className="w-4 h-4" />
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'submitted', 'graded'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <FiDownload className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">No assignments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    by <span className="font-medium">{assignment.teacherId?.name}</span>
                  </p>
                </div>
                {getStatusBadge(assignment)}
              </div>

              <p className="text-slate-600 text-sm mb-4">{assignment.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-600 font-semibold">Due Date</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-600 font-semibold">Total Marks</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{assignment.totalMarks || 'N/A'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-600 font-semibold">Subject</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{assignment.subject?.name || 'N/A'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-600 font-semibold">Days Until Due</p>
                  <p className={`text-sm font-bold mt-1 ${assignment.daysUntilDue < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(assignment.daysUntilDue)} day{Math.abs(assignment.daysUntilDue) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {assignment.submission && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
                  <p className="text-sm font-medium text-green-700">
                    Submitted on {new Date(assignment.submission.submittedDate).toLocaleDateString('en-IN')}
                  </p>
                  {assignment.submission.marksObtained !== undefined && (
                    <p className="text-sm text-green-600 mt-1">
                      Marks: <span className="font-bold">{assignment.submission.marksObtained}/{assignment.totalMarks}</span>
                    </p>
                  )}
                  {assignment.submission.feedback && (
                    <p className="text-sm text-green-600 mt-2">
                      Feedback: <span>{assignment.submission.feedback}</span>
                    </p>
                  )}
                </div>
              )}

              {assignment.submissionStatus === 'pending' && !assignment.isOverdue && (
                <button
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowSubmitModal(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <FiUpload className="w-4 h-4" />
                  Submit Assignment
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Submit Assignment: {selectedAssignment.title}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Attachments (URLs)
                </label>
                <textarea
                  value={attachments.join('\n')}
                  onChange={(e) => setAttachments(e.target.value.split('\n').filter(url => url.trim()))}
                  placeholder="Enter file URLs (one per line)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setAttachments([]);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
