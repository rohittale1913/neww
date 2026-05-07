import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { dailyTimetableAPI } from '../services/api';
import { FiClock, FiMapPin, FiUser, FiBook, FiDownload } from 'react-icons/fi';
import Alert from '../components/Alert';

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchTimetable();
  }, [academicYear]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await dailyTimetableAPI.getStudentTimetable({ academicYear });
      setTimetable(response.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to fetch timetable' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      setDownloading(true);
      // Get classId from timetable
      if (!timetable?.classDetails?._id) {
        setAlert({ type: 'error', message: 'Unable to download timetable' });
        return;
      }

      const response = await dailyTimetableAPI.downloadTimetable(
        timetable.classDetails._id,
        format,
        { academicYear }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timetable.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
      window.URL.revokeObjectURL(url);

      setAlert({ type: 'success', message: `Timetable downloaded as ${format.toUpperCase()}` });
    } catch (error) {
      setAlert({ type: 'error', message: `Failed to download ${format}` });
    } finally {
      setDownloading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading your timetable...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 bg-clip-text text-transparent">
              My Timetable
            </h1>
            <p className="text-slate-500 mt-2">View your daily class schedule</p>
          </div>
          {timetable?.classDetails?._id && (
            <div className="flex gap-3">
              <button
                onClick={() => handleDownload('csv')}
                disabled={downloading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <FiDownload size={16} /> CSV
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <FiDownload size={16} /> PDF
              </button>
            </div>
          )}
        </div>

        {/* Class Info Card */}
        {timetable?.classDetails && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 text-sm font-semibold">CLASS</p>
                <h2 className="text-4xl font-bold mt-1">
                  {timetable.classDetails.className} - {timetable.classDetails.section}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm font-semibold">ACADEMIC YEAR</p>
                <p className="text-2xl font-bold mt-1">{academicYear}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timetable Grid */}
        {timetable?.schedule && Object.values(timetable.schedule).some(day => day.length > 0) ? (
          <>
            {/* Teacher Assignments Section */}
            {timetable.teacherAssignments && timetable.teacherAssignments.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Teachers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timetable.teacherAssignments.map((assignment, idx) => (
                    <div key={idx} className="bg-white rounded-lg border border-purple-200 p-4 hover:shadow-md transition">
                      <h3 className="font-bold text-slate-900 mb-2">
                        {assignment.teacherId?.firstName} {assignment.teacherId?.lastName}
                      </h3>
                      <div className="space-y-1">
                        {assignment.subjects?.map((subject, i) => (
                          <p key={i} className="text-sm text-purple-700 bg-purple-100 px-2 py-1 rounded inline-block mr-2 mb-1">
                            {subject}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {days.map(day => (
              <div key={day} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Day Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4">
                  <h3 className="text-lg font-bold">{day}</h3>
                </div>

                {/* Classes for this day */}
                <div className="p-6 space-y-4">
                  {timetable.schedule[day] && timetable.schedule[day].length > 0 ? (
                    timetable.schedule[day].map((slot, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-slate-900 text-lg">
                            {slot.subject?.subjectName || 'Subject'}
                          </h4>
                          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {slot.subject?.code || 'N/A'}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-slate-700">
                          <div className="flex items-center gap-3">
                            <FiClock className="text-blue-600" />
                            <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <FiUser className="text-blue-600" />
                            <span>{slot.teacherId?.firstName} {slot.teacherId?.lastName}</span>
                          </div>

                          {slot.room && (
                            <div className="flex items-center gap-3">
                              <FiMapPin className="text-blue-600" />
                              <span>{slot.room}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-4">No classes scheduled</p>
                  )}
                </div>
              </div>
            ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
            <div className="text-center">
              <FiBook className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No timetable available for {academicYear}</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">How to read the timetable</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <FiClock className="text-blue-600" />
              <span className="text-slate-700">Shows class timing and duration</span>
            </div>
            <div className="flex items-center gap-3">
              <FiUser className="text-blue-600" />
              <span className="text-slate-700">Shows teacher name</span>
            </div>
            <div className="flex items-center gap-3">
              <FiMapPin className="text-blue-600" />
              <span className="text-slate-700">Shows classroom location</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentTimetable;
