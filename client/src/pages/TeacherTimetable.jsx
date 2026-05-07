import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { dailyTimetableAPI } from '../services/api';
import { FiClock, FiMapPin, FiUsers, FiBook, FiDownload } from 'react-icons/fi';
import Alert from '../components/Alert';

const TeacherTimetable = () => {
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
      const response = await dailyTimetableAPI.getTeacherTimetable({ academicYear });
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
      // Get classId from first timetable entry
      if (!timetable?.schedule) {
        setAlert({ type: 'error', message: 'No timetable available to download' });
        return;
      }

      const classId = Object.values(timetable.schedule)
        .flat()
        .find(slot => slot.classId)?._id;

      if (!classId) {
        setAlert({ type: 'error', message: 'Unable to determine class for download' });
        return;
      }

      const response = await dailyTimetableAPI.downloadTimetable(classId, format, {
        academicYear
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my-timetable.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);

      setAlert({ type: 'success', message: `Schedule downloaded as ${format.toUpperCase()}` });
    } catch (error) {
      setAlert({ type: 'error', message: `Failed to download ${format}` });
    } finally {
      setDownloading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get unique classes for the day
  const getUniqueDayInfo = (daySchedule) => {
    return daySchedule.reduce((acc, slot) => {
      return {
        ...acc,
        totalClasses: (acc.totalClasses || 0) + 1,
        students: (acc.students || 0) + (slot.classId?.totalStudents || 0)
      };
    }, {});
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading your schedule...</p>
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
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-purple-600 to-slate-900 bg-clip-text text-transparent">
              My Teaching Schedule
            </h1>
            <p className="text-slate-500 mt-2">View your daily class assignments</p>
          </div>
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
        </div>

        {/* Summary Cards */}
        {timetable?.schedule && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(() => {
              let totalClasses = 0;
              let totalStudents = 0;
              let hoursPerWeek = 0;
              
              Object.values(timetable.schedule).forEach(daySchedule => {
                daySchedule.forEach(slot => {
                  totalClasses++;
                  const [startHour, startMin] = slot.startTime.split(':').map(Number);
                  const [endHour, endMin] = slot.endTime.split(':').map(Number);
                  const duration = (endHour - startHour) + (endMin - startMin) / 60;
                  hoursPerWeek += duration;
                });
              });

              return (
                <>
                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-4 rounded-2xl text-purple-600 text-2xl">
                        <FiBook />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase">Total Classes</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalClasses}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-2xl text-blue-600 text-2xl">
                        <FiClock />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase">Hours/Week</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{hoursPerWeek.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl text-green-600 text-2xl">
                        <FiUsers />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase">Academic Year</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{academicYear}</p>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Timetable Grid */}
        {timetable?.schedule && Object.values(timetable.schedule).some(day => day.length > 0) ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {days.map(day => (
              <div key={day} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Day Header */}
                <div className="bg-gradient-to-r from-purple-800 to-purple-900 text-white px-6 py-4">
                  <h3 className="text-lg font-bold">{day}</h3>
                  {timetable.schedule[day] && timetable.schedule[day].length > 0 && (
                    <p className="text-purple-100 text-sm mt-1">
                      {timetable.schedule[day].length} class{timetable.schedule[day].length !== 1 ? 'es' : ''}
                    </p>
                  )}
                </div>

                {/* Classes for this day */}
                <div className="p-6 space-y-4">
                  {timetable.schedule[day] && timetable.schedule[day].length > 0 ? (
                    timetable.schedule[day].map((slot, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-purple-600 bg-purple-50 p-4 rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">
                              {slot.classId?.className} - {slot.classId?.section}
                            </h4>
                            <p className="text-slate-600 text-sm mt-1">
                              {slot.subject?.subjectName}
                            </p>
                          </div>
                          <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {slot.subject?.code || 'N/A'}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-slate-700">
                          <div className="flex items-center gap-3">
                            <FiClock className="text-purple-600" />
                            <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <FiUsers className="text-purple-600" />
                            <span>{slot.classId?.totalStudents || 0} students</span>
                          </div>

                          {slot.room && (
                            <div className="flex items-center gap-3">
                              <FiMapPin className="text-purple-600" />
                              <span>Room {slot.room}</span>
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
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
            <div className="text-center">
              <FiBook className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No schedule available for {academicYear}</p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Schedule Tips</h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>All times are in 24-hour format</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Room numbers are shown when available</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Student count helps you prepare resources</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherTimetable;
