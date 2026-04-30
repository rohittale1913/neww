import React, { useEffect, useState } from 'react';
import { teacherAPI } from '../services/api';
import { FiCalendar, FiClock, FiCheckCircle, FiPlay, FiAlertCircle } from 'react-icons/fi';

const TeacherExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedExam, setExpandedExam] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await teacherAPI.getMyExams();
        setExams(response.data.exams || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exams');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-700 bg-blue-50';
      case 'ongoing':
        return 'text-orange-700 bg-orange-50';
      case 'completed':
        return 'text-green-700 bg-green-50';
      default:
        return 'text-slate-700 bg-slate-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return <FiClock />;
      case 'ongoing':
        return <FiPlay />;
      case 'completed':
        return <FiCheckCircle />;
      default:
        return <FiCalendar />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading exams...</p>
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

  const filteredExams = filter === 'all' 
    ? exams 
    : exams.filter(exam => exam.status === filter);

  const getExamTypeColor = (type) => {
    const colors = {
      'unit_test': 'bg-purple-100 text-purple-800',
      'midterm': 'bg-blue-100 text-blue-800',
      'final': 'bg-red-100 text-red-800',
      'quiz': 'bg-green-100 text-green-800',
      'practical': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0 overflow-x-auto">
        {['all', 'upcoming', 'ongoing', 'completed'].map(f => (
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Upcoming</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {exams.filter(e => e.status === 'upcoming').length}
              </p>
            </div>
            <div className="text-slate-400 text-4xl">
              <FiClock />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Ongoing</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {exams.filter(e => e.status === 'ongoing').length}
              </p>
            </div>
            <div className="text-slate-400 text-4xl">
              <FiPlay />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Completed</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {exams.filter(e => e.status === 'completed').length}
              </p>
            </div>
            <div className="text-slate-400 text-4xl">
              <FiCheckCircle />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{exams.length}</p>
            </div>
            <div className="text-slate-400 text-4xl">
              <FiCalendar />
            </div>
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        {filteredExams.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
            <FiCalendar className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-slate-600 font-medium">No exams found</p>
          </div>
        ) : (
          filteredExams.map((exam, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
              <button
                onClick={() => setExpandedExam(expandedExam === idx ? null : idx)}
                className="w-full px-6 py-4 text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{exam.name}</h3>
                      {exam.type && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getExamTypeColor(exam.type)}`}>
                          {exam.type.charAt(0).toUpperCase() + exam.type.slice(1).replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{exam.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(exam.status)}`}>
                        {getStatusIcon(exam.status)}
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </span>
                      {exam.totalMarks && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-100">
                          Total Marks: {exam.totalMarks}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-600">
                      Start: {new Date(exam.startDate).toLocaleDateString()}
                    </p>
                    {exam.daysUntilExam !== undefined && exam.status === 'upcoming' && (
                      <p className="text-xs text-slate-500 mt-1">
                        {exam.daysUntilExam > 0 ? `${exam.daysUntilExam} days left` : 'Today'}
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {expandedExam === idx && (
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Start Date & Time</p>
                      <p className="text-slate-900">
                        {new Date(exam.startDate).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">End Date & Time</p>
                      <p className="text-slate-900">
                        {new Date(exam.endDate).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Duration</p>
                      <p className="text-slate-900">{exam.duration || 'N/A'} minutes</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Passing Marks</p>
                      <p className="text-slate-900">{exam.passingMarks || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Class</p>
                      <p className="text-slate-900">{exam.class || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Exam Type</p>
                      <p className="text-slate-900">
                        {exam.type ? exam.type.charAt(0).toUpperCase() + exam.type.slice(1).replace('_', ' ') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Subjects */}
                  {exam.subjects && exam.subjects.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {exam.subjects.map((subject, sidx) => (
                          <span
                            key={sidx}
                            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          >
                            {subject.name || subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {exam.instructions && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Instructions</p>
                      <p className="text-sm text-slate-600 bg-white rounded-lg p-3 border border-slate-200">
                        {exam.instructions}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherExams;
