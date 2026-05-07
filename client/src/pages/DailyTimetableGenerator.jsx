import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { classAPI, dailyTimetableAPI } from '../services/api';
import { FiZap, FiDownload, FiCheckCircle, FiAlertCircle, FiInfo, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

const DailyTimetableGenerator = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [alert, setAlert] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [prerequisiteResult, setPrerequisiteResult] = useState(null);

  const [formData, setFormData] = useState({
    classId: '',
    academicYear: new Date().getFullYear().toString(),
    startTime: '09:00',
    endTime: '16:00',
    slotDuration: '60'
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to fetch classes' });
    }
  };

  const handleCheckPrerequisites = async () => {
    if (!formData.classId) {
      setAlert({ type: 'error', message: 'Please select a class first' });
      return;
    }

    try {
      setChecking(true);
      const response = await dailyTimetableAPI.checkPrerequisites({
        classId: formData.classId,
        academicYear: formData.academicYear
      });
      setPrerequisiteResult(response.data);
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to check prerequisites' 
      });
    } finally {
      setChecking(false);
    }
  };

  const handleGenerateTimetable = async (e) => {
    e.preventDefault();
    
    // Check prerequisites before generating
    if (!prerequisiteResult?.canGenerate) {
      setAlert({ 
        type: 'error', 
        message: 'Please check prerequisites first and ensure all checks pass' 
      });
      return;
    }

    try {
      setGenerating(true);
      const response = await dailyTimetableAPI.generateTimetable({
        classId: formData.classId,
        academicYear: formData.academicYear,
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotDuration: parseInt(formData.slotDuration)
      });

      setAlert({ 
        type: 'success', 
        message: `✓ Timetable generated successfully! ${response.data.data.totalEntries} classes scheduled` 
      });
      
      // Fetch and display the generated timetable
      fetchGeneratedTimetable();
      setValidationResult(null);
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to generate timetable' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const fetchGeneratedTimetable = async () => {
    try {
      const response = await dailyTimetableAPI.getClassTimetable(formData.classId, {
        academicYear: formData.academicYear
      });
      setTimetable(response.data);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    }
  };

  const handleValidate = async () => {
    try {
      const response = await dailyTimetableAPI.validateTimetable({
        classId: formData.classId,
        academicYear: formData.academicYear
      });
      setValidationResult(response.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to validate timetable' });
    }
  };

  const handleDownload = async (format) => {
    try {
      const response = await dailyTimetableAPI.downloadTimetable(formData.classId, format, {
        academicYear: formData.academicYear
      });
      
      // Create download link
      const element = document.createElement('a');
      element.href = window.URL.createObjectURL(new Blob([response.data]));
      element.download = `timetable.${format}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      setAlert({ type: 'error', message: `Failed to download ${format.toUpperCase()}` });
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-emerald-600 to-slate-900 bg-clip-text text-transparent">
            Daily Timetable Generator
          </h1>
          <p className="text-slate-500 mt-2">Generate and manage daily class timetables with intelligent conflict detection</p>
        </div>

        {/* Setup Steps Info */}
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <FiInfo size={24} className="text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Required</h3>
              <p className="text-blue-800 mb-4">Before generating a timetable, please follow these steps:</p>
              <ol className="space-y-2 text-blue-800">
                <li className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <span>Assign subjects to your class (if not already done)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <span>Teachers create their subject assignments in: Teacher → My Assignments</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <span>Use the "Check Prerequisites" button below to verify everything is ready</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                  <span>Generate timetable once all checks pass</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Generate Timetable</h2>
          
          <form onSubmit={handleGenerateTimetable} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Slot Duration (mins)</label>
                <select
                  value={formData.slotDuration}
                  onChange={(e) => setFormData({ ...formData, slotDuration: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 flex-wrap">
              <button
                type="button"
                onClick={handleCheckPrerequisites}
                disabled={checking || !formData.classId}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <FiCheckCircle /> {checking ? 'Checking...' : 'Check Prerequisites'}
              </button>

              <button
                type="submit"
                disabled={generating || !formData.classId || !prerequisiteResult?.canGenerate}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <FiZap /> {generating ? 'Generating...' : 'Generate Timetable'}
              </button>
              
              {timetable && (
                <button
                  type="button"
                  onClick={handleValidate}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <FiCheckCircle /> Validate
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Prerequisites Check Results */}
        {prerequisiteResult && (
          <div className={`rounded-2xl shadow-lg border-2 p-6 ${
            prerequisiteResult.canGenerate 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {prerequisiteResult.canGenerate ? (
                  <>
                    <FiCheckCircle className="text-green-600 text-2xl flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-green-900 text-lg">✓ All Prerequisites Met</h3>
                      <p className="text-green-800 mt-1">Ready to generate timetable</p>
                    </div>
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-900 text-lg">⚠ Issues Found</h3>
                      <p className="text-red-800 mt-1">Please fix the issues before generating:</p>
                    </div>
                  </>
                )}
              </div>

              {/* Issues */}
              {prerequisiteResult.issues && prerequisiteResult.issues.length > 0 && (
                <div className="ml-10 space-y-2">
                  {prerequisiteResult.issues.map((issue, idx) => (
                    <p key={idx} className={prerequisiteResult.canGenerate ? 'text-green-800' : 'text-red-800 font-medium'}>
                      {issue}
                    </p>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {prerequisiteResult.warnings && prerequisiteResult.warnings.length > 0 && (
                <div className="ml-10 space-y-2 border-t pt-2 border-yellow-300">
                  <p className="font-medium text-yellow-900">⚠ Warnings:</p>
                  {prerequisiteResult.warnings.map((warning, idx) => (
                    <p key={idx} className="text-yellow-800">
                      {warning}
                    </p>
                  ))}
                </div>
              )}

              {/* Info - Teacher Assignments */}
              {prerequisiteResult.info?.teacherAssignments && prerequisiteResult.info.teacherAssignments.length > 0 && (
                <div className="ml-10 space-y-2 border-t pt-2 border-green-300">
                  <p className="font-medium text-green-900">📚 Teacher Assignments:</p>
                  {prerequisiteResult.info.teacherAssignments.map((assignment, idx) => (
                    <p key={idx} className="text-green-800 text-sm">
                      👨‍🏫 <span className="font-semibold">{assignment.teacher}</span> teaches: {assignment.subjects}
                    </p>
                  ))}
                </div>
              )}

              {/* Generation Stats */}
              {prerequisiteResult.success && (
                <div className="ml-10 space-y-1 border-t pt-2 border-green-300 text-sm text-green-800">
                  <p>📊 Class: <span className="font-semibold">{prerequisiteResult.info.className}</span></p>
                  <p>📚 Subjects: <span className="font-semibold">{prerequisiteResult.info.subjectCount}</span></p>
                  <p>👨‍🏫 Teachers Assigned: <span className="font-semibold">{prerequisiteResult.info.assignmentCount}</span></p>
                </div>
              )}
            </div>
          </div>
        )}
        {validationResult && (
          <div className={`rounded-2xl shadow-lg border-2 p-6 ${
            validationResult.data.isValid 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3">
              {validationResult.data.isValid ? (
                <>
                  <FiCheckCircle className="text-green-600 text-2xl flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-green-900 text-lg">✓ Timetable is Valid</h3>
                    <p className="text-green-800 mt-1">
                      Total entries: {validationResult.data.totalEntries}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-900 text-lg">⚠ Conflicts Detected</h3>
                    <div className="text-red-800 mt-2 space-y-1">
                      {validationResult.data.conflicts.map((conflict, idx) => (
                        <p key={idx}>
                          • {conflict.teacher} has conflict on {conflict.day} at {conflict.time}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Generated Timetable Display */}
        {timetable && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Generated Timetable - {timetable.classDetails?.className} {timetable.classDetails?.section}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload('csv')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <FiDownload size={16} /> CSV
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <FiDownload size={16} /> PDF
                </button>
              </div>
            </div>

            {/* Timetable Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {days.map(day => (
                <div key={day} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white px-6 py-4">
                    <h3 className="text-lg font-bold">{day}</h3>
                    {timetable.schedule[day] && (
                      <p className="text-emerald-100 text-sm mt-1">
                        {timetable.schedule[day].length} class{timetable.schedule[day].length !== 1 ? 'es' : ''}
                      </p>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    {timetable.schedule[day] && timetable.schedule[day].length > 0 ? (
                      timetable.schedule[day].map((slot, index) => (
                        <div key={index} className="border-l-4 border-emerald-600 bg-emerald-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-900">
                                {slot.subject?.subjectName}
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                {slot.startTime} - {slot.endTime}
                              </p>
                              <p className="text-sm text-slate-700 font-medium mt-1">
                                {slot.teacherId?.firstName} {slot.teacherId?.lastName}
                              </p>
                              {slot.room && (
                                <p className="text-xs text-slate-600 mt-1">Room: {slot.room}</p>
                              )}
                            </div>
                            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">
                              {slot.subject?.code}
                            </span>
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DailyTimetableGenerator;
