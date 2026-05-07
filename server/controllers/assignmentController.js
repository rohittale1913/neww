import Assignment from '../models/Assignment.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Create assignment
export const createAssignment = async (req, res) => {
  try {
    const { title, description, className, section, subject, dueDate, totalMarks, attachments, instructions } = req.body;
    
    // Get teacher info
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(403).json({ message: 'Teacher not found' });
    }

    // Validate class is assigned to teacher
    if (!teacher.classes.includes(className)) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }

    // Accept subject id primarily; if name/code is provided, try to resolve to Subject.
    // If no Subject document exists, preserve the provided value in subjectName.
    let subjectId;
    let subjectName = '';

    if (typeof subject === 'string' && subject.trim()) {
      const probe = subject.trim();
      const isObjectId = /^[a-f\d]{24}$/i.test(probe);

      if (isObjectId) {
        const foundById = await Subject.findById(probe).lean();
        if (foundById?._id) {
          subjectId = foundById._id;
          subjectName = foundById.name || '';
        } else {
          // Keep value as plain name if stale/invalid id is sent.
          subjectName = probe;
        }
      } else {
        const escaped = probe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const foundSubject = await Subject.findOne({
          $or: [
            { name: new RegExp(`^${escaped}$`, 'i') },
            { code: new RegExp(`^${escaped}$`, 'i') }
          ]
        }).lean();

        if (foundSubject?._id) {
          subjectId = foundSubject._id;
          subjectName = foundSubject.name || probe;
        } else {
          subjectName = probe;
        }
      }
    }

    const assignment = new Assignment({
      title,
      description,
      instructions: instructions || '',
      teacherId: teacher._id,
      className,
      section,
      subject: subjectId,
      subjectName,
      dueDate,
      totalMarks: totalMarks || 100,
      attachments: attachments || [],
      createdBy: req.user.id
    });

    await assignment.save();
    await assignment.populate('teacherId', 'name email');
    await assignment.populate('subject', 'name');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
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

// Submit assignment with file uploads
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    console.log('📝 Submission request:');
    console.log('  - Assignment ID:', assignmentId);
    console.log('  - req.files type:', typeof req.files);
    console.log('  - req.files exists:', !!req.files);
    console.log('  - req.files length:', req.files?.length);
    console.log('  - req.files is array:', Array.isArray(req.files));
    if (req.files) {
      console.log('  - Files received:', req.files.length);
      req.files.forEach((f, i) => {
        console.log(`    [${i}] ${f.originalname || f.filename} - ${(f.size/1024).toFixed(2)}KB`);
      });
    } else {
      console.log('  - Files received: 0 (req.files is null/undefined)');
    }
    console.log('  - User ID:', req.user?.id);
    
    // Get student info from JWT
    const student = await Student.findOne({ userId: req.user.id });
    
    if (!student) {
      console.log('  ✗ Student not found for user:', req.user.id);
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    console.log('  ✓ Student found:', student.name);

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      console.log('  ✗ Assignment not found:', assignmentId);
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    console.log('  ✓ Assignment found:', assignment.title);

    // Convert uploaded files to attachment objects
    const attachments = (req.files || []).map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      filepath: `/uploads/assignments/${file.filename}`,
      downloadUrl: `/api/assignments/download/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date()
    }));

    console.log('  ✓ Attachments created:', attachments.length);

    if (attachments.length === 0) {
      console.log('  ✗ No files uploaded');
      return res.status(400).json({ message: 'Please upload at least one file' });
    }

    const submission = {
      studentId: student._id,
      studentName: student.name,
      studentRollNumber: student.rollNumber,
      submittedAt: Date.now(),
      submittedDate: new Date(),
      attachments: attachments,
      isLate: new Date() > new Date(assignment.dueDate)
    };

    // Check if already submitted and replace
    const existingIndex = assignment.submissions.findIndex(s => s.studentId.toString() === student._id.toString());

    if (existingIndex >= 0) {
      assignment.submissions[existingIndex] = submission;
      console.log('  ✓ Updated existing submission');
    } else {
      assignment.submissions.push(submission);
      console.log('  ✓ Created new submission');
    }

    await assignment.save();
    
    console.log('  ✓ Submission saved successfully');

    res.json({
      message: 'Assignment submitted successfully',
      submission: submission
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
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

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.role !== 'admin') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher || assignment.teacherId.toString() !== teacher._id.toString()) {
        return res.status(403).json({ message: 'You are not allowed to delete this assignment' });
      }
    }

    await Assignment.findByIdAndDelete(assignmentId);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
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

// Download submitted file
export const downloadSubmissionFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const fs = require('fs');

    // Security: prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }

    // Get absolute path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filepath = path.join(__dirname, '../uploads/assignments', filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.error('File not found:', filepath);
      return res.status(404).json({ message: 'File not found' });
    }

    console.log('📂 Serving file:', {
      filename,
      filepath,
      exists: fs.existsSync(filepath),
      size: fs.statSync(filepath).size
    });

    // Serve file inline for viewing in browser
    res.sendFile(filepath, (err) => {
      if (err) {
        console.error('Error serving file:', err);
      }
    });
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: error.message });
  }
};

export default { createAssignment, getAllAssignments, getAssignmentsByClass, submitAssignment, gradeAssignment, deleteAssignment, getStudentSubmissions, downloadSubmissionFile };
