import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// Get attendance by date
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date, classId } = req.query;
    
    const query = {};
    if (date) query.date = new Date(date);
    if (classId) query.classId = classId;

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name rollNumber')
      .populate('classId', 'className');
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by student
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const attendance = await Attendance.find({ studentId }).populate('classId', 'className');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark attendance
export const markAttendance = async (req, res) => {
  try {
    const { studentId, classId, date, status, remarks } = req.body;

    // Check if already marked
    const existingAttendance = await Attendance.findOne({ 
      studentId, 
      classId,
      date: new Date(date)
    });

    if (existingAttendance) {
      const updated = await Attendance.findByIdAndUpdate(
        existingAttendance._id,
        { status, remarks, updatedAt: Date.now() },
        { new: true }
      );
      return res.json({ message: 'Attendance updated', attendance: updated });
    }

    const attendance = new Attendance({
      studentId,
      classId,
      date: new Date(date),
      status,
      remarks,
      markedBy: req.user.id
    });

    await attendance.save();

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk mark attendance
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { records } = req.body; // Array of attendance records

    const attendanceRecords = await Promise.all(
      records.map(async (record) => {
        const existing = await Attendance.findOne({
          studentId: record.studentId,
          classId: record.classId,
          date: new Date(record.date)
        });

        if (existing) {
          return Attendance.findByIdAndUpdate(existing._id, record, { new: true });
        }

        const att = new Attendance({
          ...record,
          date: new Date(record.date),
          markedBy: req.user.id
        });
        return att.save();
      })
    );

    res.status(201).json({
      message: 'Bulk attendance marked successfully',
      count: attendanceRecords.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance report
export const getAttendanceReport = async (req, res) => {
  try {
    const { studentId, month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
      studentId,
      date: { $gte: startDate, $lte: endDate }
    });

    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const leave = attendance.filter(a => a.status === 'leave').length;
    const late = attendance.filter(a => a.status === 'late').length;

    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.json({
      studentId,
      month,
      year,
      total,
      present,
      absent,
      leave,
      late,
      percentage,
      records: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAttendanceByDate, getStudentAttendance, markAttendance, bulkMarkAttendance, getAttendanceReport };
