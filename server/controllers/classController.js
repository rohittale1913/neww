import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Timetable from '../models/Timetable.js';

// Get all classes
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher', 'name email')
      .populate('subjects', 'name code')
      .populate('students', 'name rollNumber');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create class
export const createClass = async (req, res) => {
  try {
    const { className, section, classTeacher, subjects, capacity, room, academicYear } = req.body;

    const classObj = new Class({
      className,
      section,
      classTeacher,
      subjects: subjects || [],
      capacity,
      room,
      academicYear,
      students: []
    });

    await classObj.save();

    res.status(201).json({
      message: 'Class created successfully',
      class: classObj
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subjects
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create subject
export const createSubject = async (req, res) => {
  try {
    const { name, code, description, classes, credits } = req.body;

    const subject = new Subject({
      name,
      code,
      description,
      classes: classes || [],
      credits
    });

    await subject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get timetable for class
export const getClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const timetable = await Timetable.find({ classId })
      .populate('subject', 'name')
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

    res.status(201).json({
      message: 'Timetable entry created successfully',
      timetable
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAllClasses, createClass, getAllSubjects, createSubject, getClassTimetable, createTimetableEntry };
