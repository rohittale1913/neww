import Timetable from '../models/Timetable.js';
import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

// Get all timetables with pagination and filtering
export const getAllTimetables = async (req, res) => {
  try {
    const { classId, teacherId, academicYear, day, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (classId) filter.classId = classId;
    if (teacherId) filter.teacherId = teacherId;
    if (academicYear) filter.academicYear = academicYear;
    if (day) filter.day = day;

    const skip = (page - 1) * limit;
    
    const timetables = await Timetable.find(filter)
      .populate('classId', 'className section')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email')
      .sort({ day: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Timetable.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: timetables,
      pagination: { page, limit, total, pages }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get timetable for a specific class
export const getClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;

    const timetable = await Timetable.find({ classId, academicYear })
      .populate('classId', 'className section')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email department')
      .sort({ 
        day: 1, 
        startTime: 1 
      });

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    // Format timetable by day
    const formattedTimetable = {
      classDetails: timetable[0]?.classId,
      schedule: {}
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => {
      formattedTimetable.schedule[day] = timetable.filter(t => t.day === day);
    });

    res.status(200).json({ success: true, data: formattedTimetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student's timetable (based on their class)
export const getStudentTimetable = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { academicYear } = req.query;

    // Get student's class
    const student = await Student.findById(studentId).select('classId');
    if (!student || !student.classId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student or class not found' 
      });
    }

    // Get timetable for student's class
    const timetable = await Timetable.find({ 
      classId: student.classId,
      academicYear: academicYear || new Date().getFullYear().toString()
    })
      .populate('classId', 'className section')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email department')
      .sort({ day: 1, startTime: 1 });

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    // Format timetable by day
    const formattedTimetable = {
      classDetails: timetable[0]?.classId,
      schedule: {}
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => {
      formattedTimetable.schedule[day] = timetable.filter(t => t.day === day);
    });

    res.status(200).json({ success: true, data: formattedTimetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get teacher's timetable
export const getTeacherTimetable = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { academicYear } = req.query;

    // Get teacher's timetable
    const timetable = await Timetable.find({ 
      teacherId,
      academicYear: academicYear || new Date().getFullYear().toString()
    })
      .populate('classId', 'className section')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email department')
      .sort({ day: 1, startTime: 1 });

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    // Format timetable by day with class grouping
    const formattedTimetable = {
      schedule: {}
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => {
      formattedTimetable.schedule[day] = timetable.filter(t => t.day === day);
    });

    res.status(200).json({ success: true, data: formattedTimetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create timetable entry
export const createTimetable = async (req, res) => {
  try {
    const { classId, subject, teacherId, day, startTime, endTime, room, academicYear } = req.body;

    // Validate required fields
    if (!classId || !subject || !teacherId || !day || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check for time conflicts
    const conflictStudent = await Timetable.findOne({
      classId,
      day,
      academicYear,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictStudent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Time slot conflicts with another class for this timetable' 
      });
    }

    // Check teacher availability
    const conflictTeacher = await Timetable.findOne({
      teacherId,
      day,
      academicYear,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictTeacher) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher is not available at this time' 
      });
    }

    const timetable = new Timetable({
      classId,
      subject,
      teacherId,
      day,
      startTime,
      endTime,
      room,
      academicYear: academicYear || new Date().getFullYear().toString()
    });

    await timetable.save();

    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate('classId', 'className section')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email');

    res.status(201).json({ 
      success: true, 
      message: 'Timetable entry created',
      data: populatedTimetable 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update timetable entry
export const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { classId, subject, teacherId, day, startTime, endTime, room, academicYear } = req.body;

    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    // Check for time conflicts with new times (if changed)
    if (day !== timetable.day || startTime !== timetable.startTime || endTime !== timetable.endTime) {
      const conflictStudent = await Timetable.findOne({
        _id: { $ne: id },
        classId: classId || timetable.classId,
        day: day || timetable.day,
        academicYear: academicYear || timetable.academicYear,
        $or: [
          { startTime: { $lt: endTime || timetable.endTime }, endTime: { $gt: startTime || timetable.startTime } }
        ]
      });

      if (conflictStudent) {
        return res.status(400).json({ 
          success: false, 
          message: 'Time slot conflicts with another class' 
        });
      }

      const conflictTeacher = await Timetable.findOne({
        _id: { $ne: id },
        teacherId: teacherId || timetable.teacherId,
        day: day || timetable.day,
        academicYear: academicYear || timetable.academicYear,
        $or: [
          { startTime: { $lt: endTime || timetable.endTime }, endTime: { $gt: startTime || timetable.startTime } }
        ]
      });

      if (conflictTeacher) {
        return res.status(400).json({ 
          success: false, 
          message: 'Teacher is not available at this time' 
        });
      }
    }

    // Update fields
    timetable.classId = classId || timetable.classId;
    timetable.subject = subject || timetable.subject;
    timetable.teacherId = teacherId || timetable.teacherId;
    timetable.day = day || timetable.day;
    timetable.startTime = startTime || timetable.startTime;
    timetable.endTime = endTime || timetable.endTime;
    timetable.room = room || timetable.room;
    timetable.academicYear = academicYear || timetable.academicYear;
    timetable.updatedAt = new Date();

    await timetable.save();

    const updatedTimetable = await Timetable.findById(id)
      .populate('classId', 'className section')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email');

    res.status(200).json({ 
      success: true, 
      message: 'Timetable updated',
      data: updatedTimetable 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete timetable entry
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findByIdAndDelete(id);
    if (!timetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Timetable deleted' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk create timetable entries
export const bulkCreateTimetable = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Entries array is required' 
      });
    }

    const createdEntries = await Timetable.insertMany(entries);

    res.status(201).json({ 
      success: true, 
      message: `${createdEntries.length} timetable entries created`,
      data: createdEntries 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
