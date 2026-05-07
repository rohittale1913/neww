import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { FiUpload, FiDownload, FiClock, FiCheckCircle, FiAlertCircle, FiX, FiFile } from 'react-icons/fi';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      console.log('📤 Submitting assignment:', {
        assignmentId: selectedAssignment._id,
        fileCount: selectedFiles.length,
        fileNames: selectedFiles.map(f => f.name),
        fileSizes: selectedFiles.map(f => `${(f.size / 1024).toFixed(2)}KB`)
      });
      
      await studentAPI.submitAssignmentWithFiles(selectedAssignment._id, selectedFiles, (progress) => {
        setUploadProgress(progress);
      });
      
      console.log('✓ Submission successful');
      setShowSubmitModal(false);
      setSelectedFiles([]);
      setUploadProgress(0);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      console.error('❌ Submission error:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        fullError: err.response?.data
      });
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
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
                  {assignment.submission.attachments && assignment.submission.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-green-700">Submitted Files:</p>
                      {assignment.submission.attachments.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.downloadUrl}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                          download
                        >
                          <FiFile className="w-4 h-4" />
                          {file.originalName} ({(file.size / 1024).toFixed(2)} KB)
                        </a>
                      ))}
                    </div>
                  )}
                  {assignment.submission.marksObtained !== undefined && (
                    <p className="text-sm text-green-600 mt-3">
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
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Submit Assignment: {selectedAssignment.title}
            </h3>

            <div className="space-y-4">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Upload Files (Max 5 files, 10MB each)
                </label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.txt,.zip,.csv"
                    className="hidden"
                    id="file-input"
                    disabled={submitting}
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <FiUpload className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, DOC, XLS, JPG, PNG, ZIP, etc.</p>
                  </label>
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Selected Files ({selectedFiles.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiFile className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                          disabled={submitting}
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {submitting && uploadProgress > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Uploading...</span>
                    <span className="text-sm font-medium text-slate-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedFiles([]);
                    setError('');
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedFiles.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors flex items-center justify-center gap-2"
                >
                  <FiUpload className="w-4 h-4" />
                  {submitting ? 'Uploading...' : 'Submit'}
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
