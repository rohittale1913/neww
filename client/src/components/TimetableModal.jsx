import React, { useEffect, useState } from 'react';
import { classAPI, classAssignmentAPI } from '../services/api';
import { FiX } from 'react-icons/fi';

const TimetableModal = ({ isOpen, onClose, onSave, editingEntry, selectedClassId, academicYear }) => {
  const [formData, setFormData] = useState({
    classId: selectedClassId || '',
    subject: '',
    teacherId: '',
    day: 'Monday',
    startTime: '08:00',
    endTime: '09:00',
    room: '',
    academicYear: academicYear || '2024-2025',
    applyToAllDays: false // New flag for applying to all days
  });

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // For debugging

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const selectedSubject = subjects.find(subject => (subject._id || subject.name) === formData.subject);
  const displayedTeachers = selectedSubject
    ? [{ _id: selectedSubject.teacherId, name: selectedSubject.teacherName || 'Assigned Teacher' }]
    : teachers;

  // Fetch class details and teachers
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { isOpen, selectedClassId });
    if (isOpen && selectedClassId) {
      console.log('✅ Calling fetchClassDetailsAndTeachers');
      fetchClassDetailsAndTeachers();
    } else {
      console.warn('⚠️ useEffect condition not met:', { isOpen, selectedClassId });
    }
  }, [isOpen, selectedClassId]);

  // Handle form data when editing or new entry
  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setFormData({
          classId: editingEntry.classId._id || editingEntry.classId,
          subject: editingEntry.subject._id || editingEntry.subject,
          teacherId: editingEntry.teacherId._id || editingEntry.teacherId,
          day: editingEntry.day,
          startTime: editingEntry.startTime,
          endTime: editingEntry.endTime,
          room: editingEntry.room || '',
          academicYear: editingEntry.academicYear || academicYear,
          applyToAllDays: false // Always false when editing
        });
      } else {
        setFormData(prev => ({
          ...prev,
          classId: selectedClassId,
          academicYear: academicYear,
          applyToAllDays: false // Always false for new entries
        }));
      }
    }
  }, [isOpen, editingEntry, selectedClassId, academicYear]);

  useEffect(() => {
    if (formData.subject && subjects.length > 0) {
      const selectedSubject = subjects.find(subject => (subject._id || subject.name) === formData.subject);
      if (selectedSubject && selectedSubject.teacherId && String(selectedSubject.teacherId) !== String(formData.teacherId)) {
        setFormData(prev => ({
          ...prev,
          teacherId: selectedSubject.teacherId
        }));
      }
    }
  }, [formData.subject, subjects]);

  const fetchClassDetailsAndTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all classes to find the selected one
      const classesRes = await classAPI.getAll();
      const classesArray = Array.isArray(classesRes) ? classesRes : classesRes.data || [];
      const classObj = classesArray.find(c => c._id === selectedClassId);
      
      console.log('📚 Class found:', classObj);
      setSelectedClass(classObj || null);

      // Get subjects from teacher assignments for this class (not from class.subjects)
      let classSubjects = [];
      
      if (selectedClassId) {
        try {
          console.log('📖 Fetching subjects from class assignments for class:', selectedClassId);
          const assignmentRes = await classAssignmentAPI.getSubjectsForClass(selectedClassId);
          const assignmentData = assignmentRes?.data || assignmentRes;
          
          console.log('📊 Class assignment API response:', assignmentRes);
          console.log('📊 Class assignment API data:', assignmentData);
          console.log('📚 Subjects from assignments:', assignmentData?.subjects);
          console.log('📊 Subjects count:', assignmentData?.subjectsCount);
          
          if (assignmentData?.subjects && Array.isArray(assignmentData.subjects)) {
            classSubjects = assignmentData.subjects;
            console.log('✅ Subjects loaded from teacher assignments:', classSubjects);
            setDebugInfo(`Class: ${classObj?.className} - ${classObj?.section}, Subjects from assignments: ${classSubjects.length}`);
          } else {
            console.warn('⚠️ No subjects array in assignment response', assignmentData);
            setDebugInfo(`Class: ${classObj?.className} - ${classObj?.section}, No subjects assigned (admin must assign teachers)`);
          }
        } catch (assignmentErr) {
          console.warn('⚠️ Failed to fetch from class assignments:', assignmentErr.message);
          setDebugInfo(`Class: ${classObj?.className} - ${classObj?.section}, Error fetching subjects: ${assignmentErr.message}`);
          classSubjects = [];
        }
      }
      
      console.log('🎯 Final classSubjects for display:', classSubjects);

      // Derive teacher list from subjects so only subject-linked teachers are shown
      const uniqueTeachers = [];
      const teacherIds = new Set();
      classSubjects.forEach(subject => {
        if (subject.teacherId && !teacherIds.has(subject.teacherId.toString())) {
          teacherIds.add(subject.teacherId.toString());
          uniqueTeachers.push({
            _id: subject.teacherId,
            name: subject.teacherName || 'Assigned Teacher'
          });
        }
      });

      console.log('📊 Derived teachers from class subjects:', uniqueTeachers);
      setSubjects(classSubjects);
      setTeachers(uniqueTeachers);
      
      console.log('✨ State updated - subjects and associated teachers should now render');
    } catch (err) {
      setError('Failed to load class details, subjects, and teachers');
      console.error('❌ Error fetching class details:', err);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    // When applying to all days, day field is not required
    const requiredFields = formData.applyToAllDays 
      ? [formData.classId, formData.subject, formData.teacherId, formData.startTime, formData.endTime]
      : [formData.classId, formData.subject, formData.teacherId, formData.day, formData.startTime, formData.endTime];
    
    if (requiredFields.some(field => !field)) {
      setError('All fields are required');
      return false;
    }

    // Check if end time is after start time
    if (formData.endTime <= formData.startTime) {
      setError('End time must be after start time');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Pass the form data with applyToAllDays flag to parent
    // Parent will handle batch creation if needed
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Debug Info - Only show in development */}
          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs">
              <p className="font-semibold">🔍 Debug Info:</p>
              <p>{debugInfo}</p>
              <p className="mt-1 text-blue-600">Subjects found: {subjects.length}</p>
            </div>
          )}

          {/* Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={selectedClass ? `${selectedClass.className} - ${selectedClass.section}` : 'Loading...'}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed font-medium text-gray-900"
            />
          </div>

          {/* Subject - Shows only subjects assigned to the selected class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            {subjects.length === 0 ? (
              <div className="w-full px-4 py-2 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-800">
                No subjects assigned to this class. Please assign subjects in class management first.
              </div>
            ) : (
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || subjects.length === 0}
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(subject => {
                  // Handle both populated and ID-only subject objects
                  const subjectId = subject._id || subject;
                  const subjectName = subject.name || 'Unknown Subject';
                  const subjectCode = subject.code || '';
                  
                  return (
                    <option key={subjectId} value={subjectId}>
                      {subjectName} {subjectCode ? `(${subjectCode})` : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Teacher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher <span className="text-red-500">*</span>
            </label>
            <select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">-- Select Teacher --</option>
              {displayedTeachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}{teacher.employeeId ? ` (${teacher.employeeId})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day <span className="text-red-500">*</span>
            </label>
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              disabled={formData.applyToAllDays}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {daysOfWeek.map(day => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Apply to All Days Checkbox */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="applyToAllDays"
                checked={formData.applyToAllDays}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    applyToAllDays: e.target.checked
                  }));
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-900">
                Apply to All Days (Monday - Saturday)
              </span>
            </label>
            {formData.applyToAllDays && (
              <p className="text-xs text-blue-700 mt-2 ml-7">
                ✓ This entry will be created for all 6 days of the week automatically.
              </p>
            )}
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Number (Optional)
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              placeholder="e.g., A101"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <input
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              placeholder="e.g., 2024-2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {editingEntry ? 'Update' : formData.applyToAllDays ? 'Create for All Days' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimetableModal;
