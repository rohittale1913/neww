import React, { useEffect, useState } from 'react';
import { teacherAPI } from '../services/api';
import { FiUsers, FiBook, FiChevronDown } from 'react-icons/fi';

const TeacherMyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await teacherAPI.getMyClasses();
        setClasses(response.data.classes || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading your classes...</p>
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

  if (classes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
        <FiBook className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-4 text-slate-600 font-medium">No classes assigned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Classes</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{classes.length}</p>
            </div>
            <div className="text-slate-400 text-4xl">
              <FiBook />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-cyan-50 to-sky-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Students</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {classes.reduce((acc, cls) => acc + (cls.students?.length || 0), 0)}
              </p>
            </div>
            <div className="text-slate-400 text-4xl">
              <FiUsers />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 to-purple-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Subjects</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {new Set(classes.flatMap(cls => cls.subjects || [])).size}
              </p>
            </div>
            <div className="text-slate-400 text-4xl">
              <FiBook />
            </div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        {classes.map((cls, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
            <button
              onClick={() => setExpandedClass(expandedClass === idx ? null : idx)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold">
                  {cls.className?.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      Class {cls.className} - {cls.section}
                    </h3>
                    {/* Teacher Role Badge */}
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      cls.isClassTeacher 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-blue-100 text-blue-700 border border-blue-300'
                    }`}>
                      {cls.teacherRole}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {cls.students?.length || 0} students • {cls.assignedSubjects?.length || 0} subjects
                  </p>
                </div>
              </div>
              <FiChevronDown
                className={`text-slate-400 transition ${expandedClass === idx ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedClass === idx && (
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 space-y-4">
                {/* Your Assigned Subjects (from ClassSubjectTeacher) */}
                {cls.assignedSubjects && cls.assignedSubjects.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">📌 Your Assigned Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {cls.assignedSubjects.map((subject, sidx) => (
                        <span
                          key={sidx}
                          className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                        >
                          {subject.name || subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Class Subjects */}
                {cls.subjects && cls.subjects.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Class Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {cls.subjects.map((subject, sidx) => (
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

                {/* Students */}
                {cls.students && cls.students.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Students ({cls.students.length})
                    </p>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 border-b border-slate-200 bg-slate-100">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-slate-900">Name</th>
                            <th className="px-4 py-2 text-left font-semibold text-slate-900">Roll No.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cls.students.map((student, sidx) => (
                            <tr key={sidx} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="px-4 py-2 text-slate-700">{student.name || 'N/A'}</td>
                              <td className="px-4 py-2 text-slate-700">{student.rollNumber || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherMyClasses;
