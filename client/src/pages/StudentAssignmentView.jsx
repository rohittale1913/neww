import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentAPI } from '../services/api';
import { FiArrowLeft, FiCalendar, FiUser, FiBook, FiDownload, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';

const StudentAssignmentView = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAssignmentDetail(assignmentId);
      setAssignment(response.data);
      
      // Check if already submitted
      if (response.data.submissionStatus === 'submitted') {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttachment = () => {
    if (attachmentUrl.trim()) {
      setAttachments([...attachments, attachmentUrl]);
      setAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (attachments.length === 0) {
      alert('Please add at least one attachment');
      return;
    }

    try {
      setSubmitting(true);
      await studentAPI.submitAssignment(assignmentId, {
        attachments
      });
      setSubmitted(true);
      setAttachments([]);
      fetchAssignment();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = assignment && new Date(assignment.dueDate) < new Date() && !submitted;
  const daysUntilDue = assignment ? Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

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
            onClick={() => navigate('/student/assignments')}
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/assignments')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{assignment.title}</h1>
            <p className="text-slate-600 mt-1">Assignment Details</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex gap-3 flex-wrap">
          {isOverdue && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 border border-red-300">
              <FiAlertCircle className="w-5 h-5" />
              <span className="font-semibold">Overdue</span>
            </div>
          )}
          {submitted && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 border border-green-300">
              <FiCheck className="w-5 h-5" />
              <span className="font-semibold">Submitted</span>
            </div>
          )}
          {!submitted && !isOverdue && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
              <FiCalendar className="w-5 h-5" />
              <span className="font-semibold">{daysUntilDue} days remaining</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {assignment.description || 'No description provided'}
              </p>
            </div>

            {/* Instructions Card */}
            {assignment.instructions && (
              <div className="rounded-xl border border-slate-200 bg-white p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Instructions</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {assignment.instructions}
                </p>
              </div>
            )}

            {/* Attachments Card */}
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Resources</h2>
                <div className="space-y-3">
                  {assignment.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                    >
                      <FiDownload className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-blue-600 font-medium truncate">{attachment}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Card */}
            {submitted && assignment.submission && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-8">
                <h2 className="text-2xl font-bold text-green-900 mb-4">Your Submission</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-green-700 font-semibold">Submitted On</p>
                    <p className="text-lg font-bold text-green-900 mt-1">
                      {new Date(assignment.submission.submittedDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {assignment.submission.attachments && assignment.submission.attachments.length > 0 && (
                    <div>
                      <p className="text-sm text-green-700 font-semibold mb-2">Your Attachments</p>
                      <div className="space-y-2">
                        {assignment.submission.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium truncate"
                          >
                            <FiDownload className="w-4 h-4" />
                            {attachment}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {assignment.submission.marksObtained !== undefined && (
                    <div className="pt-4 border-t border-green-200">
                      <p className="text-sm text-green-700 font-semibold">Marks Obtained</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">
                        {assignment.submission.marksObtained} <span className="text-lg text-green-700">/ {assignment.totalMarks}</span>
                      </p>
                    </div>
                  )}

                  {assignment.submission.feedback && (
                    <div className="pt-4 border-t border-green-200">
                      <p className="text-sm text-green-700 font-semibold">Teacher's Feedback</p>
                      <p className="text-slate-700 mt-2 bg-white p-4 rounded-lg border border-green-200">
                        {assignment.submission.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Teacher</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-blue-600" />
                  {assignment.teacherId?.name || 'N/A'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Subject</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <FiBook className="w-5 h-5 text-purple-600" />
                  {assignment.subject?.name || assignment.subjectName || 'N/A'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Due Date</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-red-600" />
                  {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Total Marks</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {assignment.totalMarks}
                </p>
              </div>

              {submitted && assignment.submission?.marksObtained !== undefined && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Percentage</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {((assignment.submission.marksObtained / assignment.totalMarks) * 100).toFixed(2)}%
                  </p>
                </div>
              )}
            </div>

            {/* Submission Form */}
            {!submitted && !isOverdue && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-900">Submit Assignment</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    Add Attachment
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="Paste document link"
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      disabled={!attachmentUrl.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-2">Added Attachments ({attachments.length})</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-blue-200">
                          <span className="text-xs text-blue-700 truncate">{attachment}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || attachments.length === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiUpload className="w-5 h-5" />
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignmentView;
