import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { FiTrendingUp, FiAward, FiPieChart } from 'react-icons/fi';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentAPI.getMyResults();
      setResults(response.data.results);
      setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'D':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'F':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getGradeLabel = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading results...</p>
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

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Total Exams</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{summary.totalExams}</p>
              </div>
              <FiPieChart className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Average %</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{summary.averagePercentage}%</p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Passed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{summary.passed}</p>
              </div>
              <FiAward className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-red-50 to-rose-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Failed</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{summary.failed}</p>
              </div>
              <div className="w-8 h-8 text-red-600 opacity-50">!</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Exam Results</h3>
        </div>

        {results.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FiPieChart className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-500">No results available yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Exam Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Subject</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-700">Marks</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-700">Percentage</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-700">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.map((result, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {result.examId?.examName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {result.subject?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-slate-900">
                      {result.marksObtained}/{result.totalMarks}
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-semibold">
                      <span className={`${result.percentage >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {result.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Chart (Simple Text Version) */}
      {results.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Subject-wise Performance</h3>
          <div className="space-y-3">
            {results.map((result, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700">{result.subject?.name || 'Unknown'}</span>
                  <span className="text-sm font-bold text-slate-900">{result.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      result.percentage >= 80 ? 'bg-green-600' : 
                      result.percentage >= 60 ? 'bg-yellow-600' : 
                      'bg-red-600'
                    }`}
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResults;
