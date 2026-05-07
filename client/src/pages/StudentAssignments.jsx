import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentAPI } from '../services/api';
import { FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight, FiDownload } from 'react-icons/fi';

const StudentAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, [filter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      let filterParam = undefined;
      if (filter !== 'all') {
        filterParam = filter;
      }
      const response = await studentAPI.getMyAssignments(filterParam);
      console.log('🎯 Assignments Response:', response.data);
      console.log('📊 Assignments Count:', response.data.assignments?.length);
      response.data.assignments?.forEach((a, idx) => {
        console.log(`  [${idx}] ${a.title} - teacherId:`, a.teacherId, 'subject:', a.subject);
      });
      setAssignments(response.data.assignments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (assignment) => {
    if (assignment.isOverdue) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <FiAlertCircle className="w-4 h-4" />
          Overdue
        </div>
      );
    }
    if (assignment.submissionStatus === 'submitted') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <FiCheckCircle className="w-4 h-4" />
          Submitted
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        <FiClock className="w-4 h-4" />
        Pending
      </div>
    );
  };

  const getMarksDisplay = (assignment) => {
    if (assignment.submission && assignment.submission.marksObtained !== undefined) {
      const percentage = ((assignment.submission.marksObtained / assignment.totalMarks) * 100).toFixed(2);
      return (
        <div className="text-right">
          <p className="text-sm text-slate-600">Marks Obtained</p>
          <p className="text-xl font-bold text-slate-900">
            {assignment.submission.marksObtained} <span className="text-sm text-slate-600">/ {assignment.totalMarks}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{percentage}%</p>
        </div>
      );
    }
    return (
      <div className="text-right">
        <p className="text-sm text-slate-600">Total Marks</p>
        <p className="text-xl font-bold text-slate-900">{assignment.totalMarks}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading assignments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent">
            My Assignments
          </h1>
          <p className="text-slate-600 mt-2">View and submit your assignments</p>
        </div>

        {/* Error Message */}
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
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <FiDownload className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-500 font-medium">No assignments found</p>
            <p className="text-slate-400 text-sm mt-1">Check back soon for new assignments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                onClick={() => navigate(`/student/assignments/${assignment._id}`)}
                className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Left Content */}
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        by <span className="font-semibold">{assignment.teacherId?.name || 'N/A'}</span>
                      </p>
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">{assignment.description}</p>
                    )}
                    <div>
                      {getStatusBadge(assignment)}
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="md:col-span-1 space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 font-semibold">Subject</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {assignment.subject?.name || assignment.subjectName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-semibold">Due Date</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="md:col-span-1 flex flex-col justify-between">
                    {getMarksDisplay(assignment)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/assignments/${assignment._id}`);
                      }}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition inline-flex items-center justify-center gap-2 text-sm"
                    >
                      View Details
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;
