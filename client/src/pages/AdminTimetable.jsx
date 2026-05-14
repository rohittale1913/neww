import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { classAPI, timetableAPI } from '../services/api';
import { FiEdit2, FiTrash2, FiPlus, FiCalendar } from 'react-icons/fi';
import Alert from '../components/Alert';
import TimetableModal from '../components/TimetableModal';

const AdminTimetable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [academicYear, setAcademicYear] = useState('2024-2025');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classAPI.getAll();
      const classesArray = Array.isArray(response) ? response : response.data || [];
      setClasses(classesArray);
      if (classesArray.length > 0) {
        setSelectedClass(classesArray[0]._id);
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to fetch classes' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    }
  }, [selectedClass, academicYear]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await timetableAPI.getClassTimetable(selectedClass);
      const timetableArray = Array.isArray(response) ? response : response.data || [];
      
      // Filter by academic year if needed
      const filtered = academicYear 
        ? timetableArray.filter(t => t.academicYear === academicYear)
        : timetableArray;
      
      setTimetables(filtered);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to fetch timetable' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowModal(true);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowModal(true);
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await timetableAPI.delete(id);
        setAlert({ type: 'success', message: 'Entry deleted successfully' });
        fetchTimetable();
      } catch (error) {
        setAlert({ type: 'error', message: 'Failed to delete entry' });
      }
    }
  };

  const handleSaveEntry = async (entryData) => {
    try {
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Extract applyToAllDays flag and remove it from the data sent to API
      const { applyToAllDays, ...dataToSave } = entryData;
      
      if (editingEntry) {
        // When editing, don't support applyToAllDays
        await timetableAPI.update(editingEntry._id, dataToSave);
        setAlert({ type: 'success', message: 'Entry updated successfully' });
        setShowModal(false);
        fetchTimetable();
      } else {
        // When creating, check if applyToAllDays is true
        if (applyToAllDays) {
          // Create entries for all days
          let successCount = 0;
          for (const day of daysOfWeek) {
            try {
              const dayEntryData = {
                ...dataToSave,
                day: day
              };
              await timetableAPI.create(dayEntryData);
              successCount++;
            } catch (error) {
              console.error(`Failed to create entry for ${day}:`, error);
            }
          }
          
          if (successCount === 6) {
            setAlert({ type: 'success', message: 'Entry created successfully for all 6 days!' });
          } else {
            setAlert({ type: 'warning', message: `Created for ${successCount}/6 days. Some entries may have failed.` });
          }
        } else {
          // Single day creation
          await timetableAPI.create(dataToSave);
          setAlert({ type: 'success', message: 'Entry created successfully' });
        }
        setShowModal(false);
        fetchTimetable();
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to save entry' });
    }
  };
  };

  const getTimetableForDay = (day) => {
    return timetables
      .filter(t => t.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (loading && classes.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const selectedClassData = classes.find(c => c._id === selectedClass);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-2xl text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
          </div>
          <button
            onClick={handleAddEntry}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FiPlus /> Add Entry
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Class
              </label>
              <select
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Choose a class --</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className} - {cls.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2024-2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Timetable View */}
        {selectedClass && (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedClassData?.className} - {selectedClassData?.section}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Academic Year: {academicYear}</p>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {daysOfWeek.map(day => (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    {day}
                  </h3>

                  {getTimetableForDay(day).length > 0 ? (
                    <div className="space-y-3">
                      {getTimetableForDay(day).map(entry => (
                        <div
                          key={entry._id}
                          className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">
                                {entry.subject.name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {entry.startTime} - {entry.endTime}
                              </p>
                              <p className="text-xs text-gray-600">
                                Teacher: {entry.teacherId.name}
                              </p>
                              {entry.room && (
                                <p className="text-xs text-gray-600">
                                  Room: {entry.room}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2 ml-2">
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry._id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No classes scheduled</p>
                  )}
                </div>
              ))}
            </div>

            {timetables.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-lg">No timetable entries for this class yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TimetableModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEntry}
          editingEntry={editingEntry}
          selectedClassId={selectedClass}
          academicYear={academicYear}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminTimetable;
