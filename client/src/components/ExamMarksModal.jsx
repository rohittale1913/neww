import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { examAPI, studentAPI } from '../services/api';

const ExamMarksModal = ({ exam, isOpen, onClose, onSave }) => {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen && exam) {
      fetchStudentsAndMarks();
    }
  }, [isOpen, exam]);

  const fetchStudentsAndMarks = async () => {
    try {
      setLoading(true);
      const [studentsRes, marksRes] = await Promise.all([
        studentAPI.getAll(),
        examAPI.getExamResults(exam._id)
      ]);

      // Filter students by class
      const classStudents = (studentsRes.data || []).filter(s => 
        s.class === exam.classId?.className
      );

      setStudents(classStudents);

      // Initialize marks array
      const marksMap = {};
      (marksRes.data || []).forEach(m => {
        marksMap[m.studentId?._id || m.studentId] = m.marksObtained;
      });

      const initialMarks = classStudents.map(student => ({
        studentId: student._id,
        marks: marksMap[student._id] || ''
      }));

      setMarks(initialMarks);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, value) => {
    setMarks(marks.map(m =>
      m.studentId === studentId
        ? { ...m, marks: value }
        : m
    ));
  };

  const handleSaveMarks = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const validMarks = marks.filter(m => m.marks !== '');

      if (validMarks.length === 0) {
        setError('Please enter marks for at least one student');
        return;
      }

      // Save each mark
      for (const mark of validMarks) {
        await examAPI.addMarks({
          studentId: mark.studentId,
          examId: exam._id,
          subject: exam.subjects?.[0]?._id || 'General',
          marksObtained: parseFloat(mark.marks),
          totalMarks: exam.totalMarks
        });
      }

      setSuccessMessage(`Marks saved for ${validMarks.length} student(s)`);
      setTimeout(() => {
        onClose();
        if (onSave) onSave();
      }, 1500);
    } catch (err) {
      setError('Failed to save marks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto border border-gray-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">Add Exam Marks - {exam.examName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-300 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No students found for this class</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => {
                const studentMark = marks.find(m => m.studentId === student._id);
                return (
                  <div key={student._id} className="flex gap-4 items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.studentId || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={exam.totalMarks}
                        value={studentMark?.marks || ''}
                        onChange={(e) => handleMarksChange(student._id, e.target.value)}
                        placeholder="Marks"
                        className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-600">/ {exam.totalMarks}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end p-6 border-t border-gray-300">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveMarks}
            disabled={loading || students.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition disabled:opacity-50"
          >
            Save Marks
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamMarksModal;
