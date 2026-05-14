import Timetable from '../models/Timetable.js';
import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

// Get all timetables (with filters)
export const getAllTimetables = async (req, res) => {
  try {
    const { classId, academicYear } = req.query;
    let query = {};

    if (classId) query.classId = classId;
    if (academicYear) query.academicYear = academicYear;

    const timetables = await Timetable.find(query)
      .populate('classId', 'className section')
      .populate('subject', 'name code')
      .populate('teacherId', 'name email employeeId')
      .sort({ day: 1, startTime: 1 });

    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get timetable for a specific class
export const getClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;

    const timetable = await Timetable.find({ classId })
      .populate('subject', 'name code')
      .populate('teacherId', 'name email employeeId')
      .sort({ day: 1, startTime: 1 });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get timetable for a specific teacher
export const getTeacherTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const timetable = await Timetable.find({ teacherId })
      .populate('classId', 'className section')
      .populate('subject', 'name code')
      .sort({ day: 1, startTime: 1 });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get timetable for current logged-in teacher
export const getMyTimetable = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find teacher by user ID
    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const timetable = await Timetable.find({ teacherId: teacher._id })
      .populate('classId', 'className section')
      .populate('subject', 'name code')
      .sort({ day: 1, startTime: 1 });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get timetable for student's class
export const getStudentTimetable = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find student by user ID
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Find class using student's class and section fields
    const classDoc = await Class.findOne({ className: student.class, section: student.section });
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found for student' });
    }

    const timetable = await Timetable.find({ classId: classDoc._id })
      .populate('subject', 'name code')
      .populate('teacherId', 'name email')
      .sort({ day: 1, startTime: 1 });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create timetable entry
export const createTimetableEntry = async (req, res) => {
  try {
    const { classId, subject, teacherId, day, startTime, endTime, room, academicYear } = req.body;

    // Validate required fields
    if (!classId || !subject || !teacherId || !day || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if teacher exists
    const teacherExists = await Teacher.findById(teacherId);
    if (!teacherExists) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check for conflicts - same teacher, same day, overlapping time
    const conflict = await Timetable.findOne({
      teacherId,
      day,
      $or: [
        {
          startTime: { $lt: endTime, $gte: startTime }
        },
        {
          endTime: { $gt: startTime, $lte: endTime }
        }
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: 'Teacher has a scheduling conflict at this time' });
    }

    // Check for room conflicts - same room, same day, overlapping time
    if (room) {
      const roomConflict = await Timetable.findOne({
        room,
        day,
        $or: [
          {
            startTime: { $lt: endTime, $gte: startTime }
          },
          {
            endTime: { $gt: startTime, $lte: endTime }
          }
        ]
      });

      if (roomConflict) {
        return res.status(400).json({ message: 'Room is already booked at this time' });
      }
    }

    const timetable = new Timetable({
      classId,
      subject,
      teacherId,
      day,
      startTime,
      endTime,
      room,
      academicYear
    });

    await timetable.save();
    await timetable.populate('subject', 'name code');
    await timetable.populate('teacherId', 'name email');

    res.status(201).json({
      message: 'Timetable entry created successfully',
      timetable
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update timetable entry
export const updateTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { classId, subject, teacherId, day, startTime, endTime, room, academicYear } = req.body;

    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    // If teacher or time changed, check for conflicts
    if (teacherId !== timetable.teacherId.toString() || 
        day !== timetable.day || 
        startTime !== timetable.startTime || 
        endTime !== timetable.endTime) {
      
      const conflict = await Timetable.findOne({
        _id: { $ne: id },
        teacherId: teacherId || timetable.teacherId,
        day: day || timetable.day,
        $or: [
          {
            startTime: { $lt: endTime || timetable.endTime, $gte: startTime || timetable.startTime }
          },
          {
            endTime: { $gt: startTime || timetable.startTime, $lte: endTime || timetable.endTime }
          }
        ]
      });

      if (conflict) {
        return res.status(400).json({ message: 'Teacher has a scheduling conflict at this time' });
      }
    }

    // If room changed, check for room conflicts
    if (room && room !== timetable.room) {
      const roomConflict = await Timetable.findOne({
        _id: { $ne: id },
        room,
        day: day || timetable.day,
        $or: [
          {
            startTime: { $lt: endTime || timetable.endTime, $gte: startTime || timetable.startTime }
          },
          {
            endTime: { $gt: startTime || timetable.startTime, $lte: endTime || timetable.endTime }
          }
        ]
      });

      if (roomConflict) {
        return res.status(400).json({ message: 'Room is already booked at this time' });
      }
    }

    // Update fields
    if (classId) timetable.classId = classId;
    if (subject) timetable.subject = subject;
    if (teacherId) timetable.teacherId = teacherId;
    if (day) timetable.day = day;
    if (startTime) timetable.startTime = startTime;
    if (endTime) timetable.endTime = endTime;
    if (room) timetable.room = room;
    if (academicYear) timetable.academicYear = academicYear;
    timetable.updatedAt = new Date();

    await timetable.save();
    await timetable.populate('subject', 'name code');
    await timetable.populate('teacherId', 'name email');

    res.json({
      message: 'Timetable entry updated successfully',
      timetable
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete timetable entry
export const deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findByIdAndDelete(id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all timetables for a class
export const deleteClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;

    const result = await Timetable.deleteMany({ classId });

    res.json({
      message: `Deleted ${result.deletedCount} timetable entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAllTimetables,
  getClassTimetable,
  getTeacherTimetable,
  getMyTimetable,
  getStudentTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  deleteClassTimetable
};
