import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { timetableAPI } from '../services/api';
import { classAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

const AdminTimetableManagement = () => {
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());

  const [formData, setFormData] = useState({
    classId: '',
    subject: '',
    teacherId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    academicYear: academicYear
  });

  useEffect(() => {
    fetchData();
  }, [academicYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timetablesRes, classesRes] = await Promise.all([
        timetableAPI.getAll({ academicYear }),
        classAPI.getAll()
      ]);
      setTimetables(timetablesRes.data?.data || []);
      setClasses(classesRes.data || []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTimetable) {
        await timetableAPI.update(selectedTimetable._id, formData);
        setAlert({ type: 'success', message: 'Timetable updated successfully' });
      } else {
        await timetableAPI.create(formData);
        setAlert({ type: 'success', message: 'Timetable created successfully' });
      }
      setShowModal(false);
      setFormData({
        classId: '',
        subject: '',
        teacherId: '',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        room: '',
        academicYear: academicYear
      });
      fetchData();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to save timetable' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await timetableAPI.delete(id);
        setAlert({ type: 'success', message: 'Timetable deleted' });
        fetchData();
      } catch (error) {
        setAlert({ type: 'error', message: 'Failed to delete timetable' });
      }
    }
  };

  const openEditModal = (timetable) => {
    setSelectedTimetable(timetable);
    setFormData({
      classId: timetable.classId._id,
      subject: timetable.subject._id,
      teacherId: timetable.teacherId._id,
      day: timetable.day,
      startTime: timetable.startTime,
      endTime: timetable.endTime,
      room: timetable.room || '',
      academicYear: timetable.academicYear
    });
    setShowModal(true);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading timetables...</p>
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
              Timetable Management
            </h1>
            <p className="text-slate-500 mt-2">Create and manage class timetables</p>
          </div>
          <button
            onClick={() => {
              setSelectedTimetable(null);
              setFormData({
                classId: '',
                subject: '',
                teacherId: '',
                day: 'Monday',
                startTime: '09:00',
                endTime: '10:00',
                room: '',
                academicYear: academicYear
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <FiPlus /> Add Timetable Entry
          </button>
        </div>

        {/* Academic Year Filter */}
        <div className="flex gap-4">
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Academic Year"
          />
        </div>

        {/* Timetable Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Teacher</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Day</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Room</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {timetables.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No timetable entries found
                  </td>
                </tr>
              ) : (
                timetables.map((timetable) => (
                  <tr key={timetable._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">
                        {timetable.classId?.className} - {timetable.classId?.section}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{timetable.subject?.subjectName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">
                        {timetable.teacherId?.firstName} {timetable.teacherId?.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-medium">{timetable.day}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FiClock size={16} />
                        <span>{timetable.startTime} - {timetable.endTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{timetable.room || '-'}</span>
                    </td>
                    <td className="px-6 py-4 space-x-2 flex">
                      <button
                        onClick={() => openEditModal(timetable)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(timetable._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedTimetable ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className} - {cls.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Day</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Room (Optional)</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Room number or name"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                {selectedTimetable ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AdminTimetableManagement;
