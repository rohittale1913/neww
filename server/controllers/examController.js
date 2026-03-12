import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Student from '../models/Student.js';

// Get all exams
export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('classId', 'className section')
      .populate('subjects', 'name');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create exam
export const createExam = async (req, res) => {
  try {
    const { examName, examType, classId, subjects, startDate, endDate, totalMarks, passingMarks, academicYear, description } = req.body;

    const exam = new Exam({
      examName,
      examType,
      classId,
      subjects,
      startDate,
      endDate,
      totalMarks,
      passingMarks,
      academicYear,
      description
    });

    await exam.save();

    res.status(201).json({
      message: 'Exam created successfully',
      exam
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add marks
export const addMarks = async (req, res) => {
  try {
    const { studentId, examId, subject, marksObtained, totalMarks } = req.body;

    // Calculate grade
    const percentage = (marksObtained / totalMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    const existingResult = await Result.findOne({ studentId, examId, subject });

    if (existingResult) {
      const updated = await Result.findByIdAndUpdate(
        existingResult._id,
        { marksObtained, totalMarks, percentage, grade, updatedAt: Date.now() },
        { new: true }
      );
      return res.json({ message: 'Marks updated', result: updated });
    }

    const result = new Result({
      studentId,
      examId,
      subject,
      marksObtained,
      totalMarks,
      grade,
      percentage,
      markedBy: req.user.id
    });

    await result.save();

    res.status(201).json({
      message: 'Marks added successfully',
      result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student results
export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await Result.find({ studentId })
      .populate('examId', 'examName examType')
      .populate('subject', 'name');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get exam results
export const getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const results = await Result.find({ examId })
      .populate('studentId', 'name studentId rollNumber')
      .populate('subject', 'name');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate report card
export const generateReportCard = async (req, res) => {
  try {
    const { studentId, academicYear } = req.query;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const results = await Result.find({ studentId })
      .populate('examId', 'examName examType')
      .populate('subject', 'name');

    const groupedByExam = {};
    results.forEach(result => {
      const examId = result.examId._id;
      if (!groupedByExam[examId]) {
        groupedByExam[examId] = {
          examName: result.examId.examName,
          examType: result.examId.examType,
          subjects: []
        };
      }
      groupedByExam[examId].subjects.push({
        name: result.subject.name,
        marks: result.marksObtained,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        grade: result.grade
      });
    });

    res.json({
      student: { name: student.name, studentId: student.studentId, class: student.class },
      academicYear,
      exams: groupedByExam
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAllExams, createExam, addMarks, getStudentResults, getExamResults, generateReportCard };
