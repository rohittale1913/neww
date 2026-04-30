import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { FiCalendar, FiBook, FiClock, FiCheckCircle, FiPlay, FiAlertCircle } from 'react-icons/fi';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedExam, setExpandedExam] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentAPI.getMyExams();
      setExams(response.data.exams);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const getExamTypeLabel = (examType) => {
    const types = {
      unit_test: 'Unit Test',
      midterm: 'Midterm',
      final: 'Final Exam',
      quiz: 'Quiz',
      practical: 'Practical'
    };
    return types[examType] || examType;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ongoing':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return <FiClock className="w-4 h-4" />;
      case 'ongoing':
        return <FiPlay className="w-4 h-4" />;
      case 'completed':
        return <FiCheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading exams...</p>
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

      {/* Exam Stats */}
      {exams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase">Upcoming Exams</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {exams.filter(e => e.status === 'upcoming').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase">Ongoing Exams</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {exams.filter(e => e.status === 'ongoing').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase">Completed Exams</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {exams.filter(e => e.status === 'completed').length}
            </p>
          </div>
        </div>
      )}

      {/* Exams List */}
      {exams.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <FiBook className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">No exams scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                onClick={() => setExpandedExam(expandedExam === exam._id ? null : exam._id)}
                className="cursor-pointer p-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{exam.examName}</h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(exam.status)}`}>
                        {getStatusIcon(exam.status)}
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {getExamTypeLabel(exam.examType)}
                    </p>
                  </div>
                  {exam.daysUntilExam && exam.status === 'upcoming' && (
                    <div className="rounded-lg bg-blue-50 px-4 py-2">
                      <p className="text-xs text-slate-600 font-semibold">Days Until Exam</p>
                      <p className="text-lg font-bold text-blue-600 mt-1">{exam.daysUntilExam}</p>
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FiCalendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      {new Date(exam.startDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiBook className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      {exam.subjects?.length || 0} Subject{exam.subjects?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">
                      Total Marks: <span className="font-bold">{exam.totalMarks || 'N/A'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">
                      Passing: <span className="font-bold">{exam.passingMarks || 'N/A'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedExam === exam._id && (
                <div className="border-t border-slate-200 bg-slate-50 p-6">
                  <div className="space-y-4">
                    {exam.description && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                        <p className="text-slate-600 text-sm">{exam.description}</p>
                      </div>
                    )}

                    {exam.subjects && exam.subjects.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Subjects</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {exam.subjects.map((subject, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              {subject.name} {subject.code && `(${subject.code})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-600 font-semibold mb-1">Start Date</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(exam.startDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-semibold mb-1">End Date</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(exam.endDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {exam.status === 'completed' && (
                      <div className="pt-4 border-t border-slate-200">
                        <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          View Results
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExams;
