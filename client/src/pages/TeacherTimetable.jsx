import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { timetableAPI } from '../services/api';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import Alert from '../components/Alert';

const TeacherTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await timetableAPI.getMyTimetable();
      const timetableArray = Array.isArray(response) ? response : response.data || [];
      setTimetable(timetableArray);

      // Set first day with classes as selected day
      const firstDayWithClasses = daysOfWeek.find(day =>
        timetableArray.some(t => t.day === day)
      );
      setSelectedDay(firstDayWithClasses || daysOfWeek[0]);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
      setAlert({ type: 'error', message: 'Failed to load your timetable' });
    } finally {
      setLoading(false);
    }
  };

  const getTimetableForDay = (day) => {
    return timetable
      .filter(t => t.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getTodaysTimetable = () => {
    const today = new Date();
    const dayIndex = today.getDay();
    // Convert JS day (0-6) to our format (Monday-Sunday)
    let dayName;
    if (dayIndex === 0) dayName = 'Sunday';
    else if (dayIndex === 6) dayName = 'Saturday';
    else dayName = daysOfWeek[dayIndex - 1];

    return getTimetableForDay(dayName);
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500 text-lg">Loading your timetable...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="flex items-center gap-3 mb-8">
          <FiCalendar className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
        </div>

        {timetable.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No classes assigned yet</p>
            <p className="text-gray-400">Your timetable will appear here once classes are assigned to you</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Today's Schedule Summary */}
            {getTodaysTimetable().length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Classes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTodaysTimetable().map((entry, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                      <p className="font-bold text-gray-900">{entry.subject.name}</p>
                      <div className="flex items-center gap-2 text-gray-600 mt-2 text-sm">
                        <FiClock size={16} />
                        <span>{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Class: {entry.classId.className} - {entry.classId.section}
                      </div>
                      {entry.room && (
                        <div className="flex items-center gap-2 text-gray-600 mt-2 text-sm">
                          <FiMapPin size={16} />
                          <span>Room {entry.room}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly View */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Schedule</h2>

              {/* Day Selector */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {daysOfWeek.map(day => {
                  const dayClasses = getTimetableForDay(day);
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-3 rounded-lg whitespace-nowrap font-medium transition ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : dayClasses.length > 0
                          ? 'bg-white text-gray-900 border-2 border-blue-200 hover:border-blue-400'
                          : 'bg-gray-100 text-gray-500 cursor-default'
                      }`}
                      disabled={dayClasses.length === 0 && !isSelected}
                    >
                      <div>{day}</div>
                      <div className="text-xs mt-1">
                        {dayClasses.length} class{dayClasses.length !== 1 ? 'es' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Classes */}
              {selectedDay && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedDay}</h3>

                  {getTimetableForDay(selectedDay).length > 0 ? (
                    <div className="space-y-4">
                      {getTimetableForDay(selectedDay).map((entry, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">
                                {entry.subject.name}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <FiClock className="text-blue-600" />
                                  <span>
                                    {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                  </span>
                                </div>
                                <div className="text-gray-600">
                                  Class: <span className="font-medium">{entry.classId.className} - {entry.classId.section}</span>
                                </div>
                              </div>
                              {entry.room && (
                                <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                                  <FiMapPin className="text-blue-600" />
                                  <span>Room {entry.room}</span>
                                </div>
                              )}
                            </div>
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              {entry.subject.code}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">No classes scheduled for {selectedDay}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500 text-sm mb-2">Total Classes Per Week</p>
                <p className="text-3xl font-bold text-blue-600">{timetable.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500 text-sm mb-2">Busiest Day</p>
                <p className="text-xl font-bold text-gray-900">
                  {daysOfWeek.reduce((max, day) => {
                    const count = getTimetableForDay(day).length;
                    return count > getTimetableForDay(max).length ? day : max;
                  })}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500 text-sm mb-2">Classes Assigned</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Set(timetable.map(t => t.classId._id)).size}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherTimetable;
