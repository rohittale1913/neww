import React, { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import { FiBookOpen, FiUsers, FiUser, FiMail, FiPhone } from 'react-icons/fi';

const StudentSubjects = () => {
  const [subjectsData, setSubjectsData] = useState([]);
  const [classInfo, setClassInfo] = useState({ className: '', section: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await studentAPI.getMySubjects();
        setSubjectsData(response.data.subjects || []);
        setClassInfo({
          className: response.data.className || '',
          section: response.data.section || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-slate-600 font-medium">Loading your subjects...</p>
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

  if (subjectsData.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
        <FiBookOpen className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-4 text-slate-600 font-medium">No subjects assigned yet</p>
        <p className="mt-1 text-sm text-slate-500">Your teacher assignments will appear here once they are created.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Class Subjects</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Class {classInfo.className || 'N/A'} - {classInfo.section || 'N/A'}
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200">
            <FiBookOpen className="text-blue-600" />
            {subjectsData.length} Subjects
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {subjectsData.map((subject, index) => {
          const teachers = subject.teachers || [];
          const teacherNames = subject.teacherNames || teachers.map((teacher) => teacher.teacherName).filter(Boolean);

          return (
            <div key={`${subject.subjectName}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{subject.subjectName}</h3>
                </div>
                <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                  {teachers.length > 0 ? `${teachers.length} Teacher${teachers.length > 1 ? 's' : ''}` : 'No Teacher Yet'}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {teacherNames.length > 0 ? (
                  teacherNames.map((teacherName, teacherIndex) => (
                    <div key={`${teacherName}-${teacherIndex}`} className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold">
                          {(teacherName || 'T').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{teacherName || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{teachers[teacherIndex]?.assignmentType === 'class_teacher' ? 'Class Teacher' : 'Subject Teacher'}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600">
                        {teachers[teacherIndex]?.email && (
                          <div className="flex items-center gap-2">
                            <FiMail className="text-slate-400" />
                            <span>{teachers[teacherIndex].email}</span>
                          </div>
                        )}
                        {teachers[teacherIndex]?.phone && (
                          <div className="flex items-center gap-2">
                            <FiPhone className="text-slate-400" />
                            <span>{teachers[teacherIndex].phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    No teacher assigned for this subject yet.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <FiUsers className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Assignment Summary</h3>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          These are the subjects assigned to your class and the teachers responsible for each one.
        </p>
      </div> */}
    </div>
  );
};

export default StudentSubjects;