import React, { useEffect, useState } from 'react';
import { teacherAPI } from '../services/api';
import { FiCalendar, FiCheck, FiX, FiClock, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import { exportToCSV } from '../utils/csvExport';

const TeacherAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [markedDate, setMarkedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentRecords, setStudentRecords] = useState({});
  const [students, setStudents] = useState([]);
  const [marking, setMarking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await teacherAPI.getMyClasses();
        console.log('Classes response:', response.data);
        const classesData = response.data.classes || [];
        setClasses(classesData);
        if (classesData.length > 0) {
          // Use a unique identifier combining className and section
          const firstClassId = `${classesData[0].className}-${classesData[0].section}`;
          setSelectedClass(firstClassId);
        } else {
          setError('No classes assigned to you');
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError(err.response?.data?.message || 'Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, month, year]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClass) return;

      try {
        setLoading(true);
        setError('');
        // Extract className from the combined identifier (e.g., "10-A" -> "10")
        const className = selectedClass.split('-')[0];
        const response = await teacherAPI.getAttendance({ className, month, year });
        setAttendance(response.data.attendance || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedClass, month, year]);

  const getStudentsForClass = async () => {
    if (!selectedClass) {
      console.log('No selected class');
      return;
    }

    try {
      // Extract className from the combined identifier (e.g., "10-A" -> "10")
      const className = selectedClass.split('-')[0];
      console.log('Fetching students for class:', className);
      const response = await teacherAPI.getClassStudents(className);
      console.log('Students response:', response.data);
      
      setStudents(response.data.students || []);
      
      const records = {};
      response.data.students?.forEach(student => {
        records[student._id] = 'present';
      });
      
      if (Object.keys(records).length === 0) {
        setError('No students found in this class');
      } else {
        setError('');
      }
      setStudentRecords(records);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to load students');
    }
  };

  useEffect(() => {
    getStudentsForClass();
  }, [selectedClass]);

  const handleStatusChange = (studentId, status) => {
    setStudentRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAttendance = async () => {
    if (!selectedClass || Object.keys(studentRecords).length === 0) {
      setError('Please select a class and mark attendance for students');
      return;
    }

    try {
      setMarking(true);
      // Extract className and section from the combined identifier (e.g., "10-A" -> className="10", section="A")
      const [className, section] = selectedClass.split('-');
      const attendanceRecords = Object.entries(studentRecords).map(([studentId, status]) => ({
        studentId,
        status,
        remarks: ''
      }));

      await teacherAPI.markAttendance({
        className,
        section,
        date: markedDate,
        attendanceRecords
      });

      setError('');
      alert('Attendance marked successfully!');
      setStudentRecords({});
      await getStudentsForClass();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50';
      case 'absent':
        return 'text-red-600 bg-red-50';
      case 'leave':
        return 'text-yellow-600 bg-yellow-50';
      case 'late':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <FiCheck />;
      case 'absent':
        return <FiX />;
      case 'leave':
        return <FiAlertTriangle />;
      case 'late':
        return <FiClock />;
      default:
        return null;
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedAttendance = attendance.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(attendance.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleExportAttendanceCSV = () => {
    const dataToExport = attendance.map(record => ({
      'Date': new Date(record.date).toLocaleDateString(),
      'Student': record.studentId?.name || 'N/A',
      'Status': record.status?.charAt(0).toUpperCase() + record.status?.slice(1) || 'N/A'
    }));
    exportToCSV(dataToExport, 'teacher-attendance');
  };

  if (loading && attendance.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Mark Attendance Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Mark Attendance</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls, idx) => {
                const classId = `${cls.className}-${cls.section}`;
                return (
                  <option key={idx} value={classId}>
                    Class {cls.className} - {cls.section} {cls.isClassTeacher ? '(Class Teacher)' : '(Subject Teacher)'}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={markedDate}
              onChange={(e) => setMarkedDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleMarkAttendance}
              disabled={marking || Object.keys(studentRecords).length === 0}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition"
            >
              {marking ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        </div>

        {Object.keys(studentRecords).length > 0 && (
          <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-slate-200 bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Student Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Roll No.</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const status = studentRecords[student._id] || 'present';
                  
                  return (
                    <tr key={student._id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700 font-medium">{student.name}</td>
                      <td className="px-4 py-3 text-slate-700">{student.rollNumber || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          {['present', 'absent', 'leave', 'late'].map(s => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(student._id, s)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                status === s
                                  ? getStatusColor(s)
                                  : 'text-slate-600 bg-slate-200 hover:bg-slate-300'
                              }`}
                              title={s.charAt(0).toUpperCase() + s.slice(1)}
                            >
                              {s.charAt(0).toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Attendance Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Attendance History</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(2024, m - 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExportAttendanceCSV}
              disabled={attendance.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload /> Export CSV
            </button>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
            <FiCalendar className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-slate-600 font-medium">No attendance records found</p>
          </div>
        ) : (
           <div className="rounded-lg border border-slate-200">
             <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-slate-200 bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Student</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAttendance.map((record, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {record.studentId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             </div>

             {/* Pagination Controls */}
             {totalPages > 1 && (
               <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                 <div className="text-sm text-slate-600">
                   Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, attendance.length)} of {attendance.length} records
                 </div>
                 <div className="flex gap-2">
                   <button
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                   >
                     Previous
                   </button>
                   {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                     const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                     return pageNum <= totalPages ? (
                       <button
                         key={pageNum}
                         onClick={() => handlePageChange(pageNum)}
                         className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                           currentPage === pageNum
                             ? 'bg-blue-600 text-white'
                             : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                         }`}
                       >
                         {pageNum}
                       </button>
                     ) : null;
                   })}
                   <button
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                   >
                     Next
                   </button>
                 </div>
               </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
