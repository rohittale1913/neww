import Assignment from '../models/Assignment.js';
import Student from '../models/Student.js';

// Create assignment
export const createAssignment = async (req, res) => {
  try {
    const { title, description, classId, subject, dueDate, totalMarks, attachments } = req.body;

    const assignment = new Assignment({
      title,
      description,
      teacherId: req.user.id,
      classId,
      subject,
      dueDate,
      totalMarks,
      attachments: attachments || []
    });

    await assignment.save();

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all assignments
export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('teacherId', 'name email')
      .populate('classId', 'className')
      .populate('subject', 'name');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignments by class
export const getAssignmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const assignments = await Assignment.find({ classId })
      .populate('teacherId', 'name')
      .populate('subject', 'name');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit assignment
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId, attachments } = req.body;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = {
      studentId,
      submittedAt: Date.now(),
      submittedDate: new Date(),
      attachments: attachments || []
    };

    // Check if already submitted
    const existingIndex = assignment.submissions.findIndex(s => s.studentId.toString() === studentId);

    if (existingIndex >= 0) {
      assignment.submissions[existingIndex] = submission;
    } else {
      assignment.submissions.push(submission);
    }

    await assignment.save();

    res.json({
      message: 'Assignment submitted successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Grade assignment
export const gradeAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId, marksObtained, feedback } = req.body;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submissionIndex = assignment.submissions.findIndex(s => s.studentId.toString() === studentId);

    if (submissionIndex < 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    assignment.submissions[submissionIndex].marksObtained = marksObtained;
    assignment.submissions[submissionIndex].feedback = feedback;

    await assignment.save();

    res.json({
      message: 'Assignment graded successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student submissions
export const getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const assignments = await Assignment.find({ 'submissions.studentId': studentId })
      .populate('teacherId', 'name')
      .populate('subject', 'name');

    const submissions = assignments.map(a => ({
      assignmentId: a._id,
      title: a.title,
      subject: a.subject,
      dueDate: a.dueDate,
      teacherName: a.teacherId.name,
      submission: a.submissions.find(s => s.studentId.toString() === studentId)
    }));

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { createAssignment, getAllAssignments, getAssignmentsByClass, submitAssignment, gradeAssignment, getStudentSubmissions };
