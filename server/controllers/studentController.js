import Student from '../models/Student.js';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Fee from '../models/Fee.js';
import Class from '../models/Class.js';

// Get student by User ID (for logged-in student)
export const getStudentByUserId = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const student = await Student.findOne({ userId })
      .populate('userId', 'name email phone role profileImage')
      .lean();
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching student by userId:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student profile with class teacher information
export const getStudentProfileWithClassTeacher = async (req, res) => {
  try {
    // Can be called with userId param or use authenticated user id
    const userId = req.params.userId || req.user.id;
    
    // Fetch student profile
    const student = await Student.findOne({ userId })
      .populate('userId', 'name email phone role profileImage')
      .lean();
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    // Find class teacher for this student's class
    let classTeacher = null;
    if (student.class) {
      classTeacher = await Teacher.findOne({
        classTeacherOf: student.class,
        isClassTeacher: true,
        isActive: true
      })
      .populate('userId', 'name email phone profileImage')
      .select('teacherId userId name gender email phone experience qualification subjects classTeacherOf')
      .lean();
    }
    
    // Prepare response
    const response = {
      ...student,
      classTeacher: classTeacher || null
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching student profile with class teacher:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .populate('userId', 'name email phone role')
      .lean()
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email phone role')
      .lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new student
export const createStudent = async (req, res) => {
  try {
    const { 
      userId, 
      class: className, 
      section, 
      rollNumber, 
      dateOfBirth, 
      gender,
      parentName,
      parentEmail,
      parentContact, 
      emergencyContact,
      address, 
      bloodGroup,
      category,
      aadharNumber,
      previousSchool
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    if (!className) {
      return res.status(400).json({ message: 'class is required' });
    }
    if (!section) {
      return res.status(400).json({ message: 'section is required' });
    }
    if (!rollNumber) {
      return res.status(400).json({ message: 'rollNumber is required' });
    }
    if (!gender) {
      return res.status(400).json({ message: 'gender is required' });
    }
    if (!parentName) {
      return res.status(400).json({ message: 'parentName is required' });
    }
    if (!parentEmail) {
      return res.status(400).json({ message: 'parentEmail is required' });
    }
    if (!parentContact) {
      return res.status(400).json({ message: 'parentContact is required' });
    }
    if (!emergencyContact) {
      return res.status(400).json({ message: 'emergencyContact is required' });
    }
    if (!address) {
      return res.status(400).json({ message: 'address is required' });
    }
    if (!category) {
      return res.status(400).json({ message: 'category is required' });
    }
    if (!dateOfBirth) {
      return res.status(400).json({ message: 'dateOfBirth is required' });
    }

    // Fetch user to get name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique student ID with more entropy
    let studentId;
    let isDuplicate = true;
    let attempts = 0;
    
    while (isDuplicate && attempts < 5) {
      studentId = `STU-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const existingStudent = await Student.findOne({ studentId });
      isDuplicate = !!existingStudent;
      attempts++;
    }

    if (isDuplicate) {
      return res.status(500).json({ message: 'Failed to generate unique student ID after multiple attempts' });
    }

    // Create student with all required fields
    const student = new Student({
      studentId,
      userId,
      name: user.name,
      class: className,
      section,
      rollNumber: parseInt(rollNumber),
      gender,
      dateOfBirth,
      parentName,
      parentEmail,
      parentContact,
      emergencyContact,
      address,
      bloodGroup: bloodGroup || null,
      category,
      aadharNumber: aadharNumber || null,
      previousSchool: previousSchool || null
    });

    await student.save();

    res.status(201).json({
      message: 'Student profile created successfully',
      student
    });
  } catch (error) {
    console.error('Error creating student:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `A student with this ${field} already exists` });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message || 'Failed to create student profile' });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { name, email, phone, class: className, section, rollNumber, gender, dateOfBirth, bloodGroup, category, nationality, parentName, parentEmail, parentContact, emergencyContact, address, aadharNumber, admissionDate, previousSchool, transportRequired } = req.body;

    // Find the student record
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update the User record (name, email, phone)
    if (student.userId) {
      await User.findByIdAndUpdate(
        student.userId,
        { 
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          updatedAt: Date.now()
        },
        { new: true }
      );
    }

    // Update the Student record
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || student.name,
        class: className !== undefined ? className : student.class,
        section: section !== undefined ? section : student.section,
        rollNumber: rollNumber !== undefined ? rollNumber : student.rollNumber,
        gender: gender !== undefined ? gender : student.gender,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : student.dateOfBirth,
        bloodGroup: bloodGroup !== undefined ? bloodGroup : student.bloodGroup,
        category: category !== undefined ? category : student.category,
        nationality: nationality !== undefined ? nationality : student.nationality,
        parentName: parentName !== undefined ? parentName : student.parentName,
        parentEmail: parentEmail !== undefined ? parentEmail : student.parentEmail,
        parentContact: parentContact !== undefined ? parentContact : student.parentContact,
        emergencyContact: emergencyContact !== undefined ? emergencyContact : student.emergencyContact,
        address: address !== undefined ? address : student.address,
        aadharNumber: aadharNumber !== undefined ? aadharNumber : student.aadharNumber,
        admissionDate: admissionDate !== undefined ? admissionDate : student.admissionDate,
        previousSchool: previousSchool !== undefined ? previousSchool : student.previousSchool,
        transportRequired: transportRequired !== undefined ? transportRequired : student.transportRequired,
        updatedAt: Date.now()
      },
      { new: true }
    )
    .populate('userId', 'name email phone role')
    .lean();

    // Enrich with user data
    const enrichedStudent = {
      ...updatedStudent,
      email: updatedStudent?.email || email || '-',
      phone: updatedStudent?.phone || phone || '-'
    };

    res.json({ message: 'Student updated successfully', student: enrichedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== STUDENT MODULE ENDPOINTS ====================

// Get student's attendance records
export const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    // Get student profile
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    let query = { studentId: student._id };

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('classId', 'className section')
      .sort({ date: -1 })
      .lean();

    // Calculate attendance summary
    const summary = {
      totalDays: attendance.length,
      presentDays: attendance.filter(a => a.status === 'present').length,
      absentDays: attendance.filter(a => a.status === 'absent').length,
      leaveDays: attendance.filter(a => a.status === 'leave').length,
      lateDays: attendance.filter(a => a.status === 'late').length,
      attendancePercentage: attendance.length > 0 
        ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(2)
        : 0
    };

    res.json({ attendance, summary });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student's assignments
export const getMyAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter } = req.query; // 'pending', 'submitted', 'graded', 'all'

    // Get student profile
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get all assignments for student's class
    const assignments = await Assignment.find({ classId: student.classId || null })
      .populate('teacherId', 'name email')
      .populate('subject', 'name')
      .lean();

    // Enhance with submission status
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions?.find(s => s.studentId?.toString() === student._id.toString());
      return {
        ...assignment,
        submissionStatus: submission ? 'submitted' : 'pending',
        submission: submission || null,
        isOverdue: new Date(assignment.dueDate) < new Date() && !submission,
        daysUntilDue: Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
      };
    });

    // Apply filter
    let filtered = assignmentsWithStatus;
    if (filter === 'pending') {
      filtered = assignmentsWithStatus.filter(a => a.submissionStatus === 'pending');
    } else if (filter === 'submitted') {
      filtered = assignmentsWithStatus.filter(a => a.submissionStatus === 'submitted');
    } else if (filter === 'graded') {
      filtered = assignmentsWithStatus.filter(a => a.submission?.marksObtained !== undefined);
    }

    res.json({ assignments: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get assignment details
export const getAssignmentDetail = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const assignment = await Assignment.findById(assignmentId)
      .populate('teacherId', 'name email')
      .populate('subject', 'name')
      .lean();

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions?.find(s => s.studentId?.toString() === student._id.toString());

    const response = {
      ...assignment,
      submission: submission || null,
      submissionStatus: submission ? 'submitted' : 'pending'
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    res.status(500).json({ message: error.message });
  }
};

// Submit assignment
export const submitMyAssignment = async (req, res) => {
  try {
    const { assignmentId, attachments } = req.body;
    const userId = req.user.id;

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: 'Assignment deadline has passed' });
    }

    // Check if already submitted
    const existingIndex = assignment.submissions.findIndex(
      s => s.studentId.toString() === student._id.toString()
    );

    const submission = {
      studentId: student._id,
      submittedAt: new Date(),
      submittedDate: new Date(),
      attachments: attachments || []
    };

    if (existingIndex >= 0) {
      assignment.submissions[existingIndex] = submission;
    } else {
      assignment.submissions.push(submission);
    }

    await assignment.save();

    res.json({ message: 'Assignment submitted successfully', submission });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student's exams
export const getMyExams = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get student profile
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get exams for student's class
    const exams = await Exam.find({ classId: student.classId || null })
      .populate('subjects', 'name code')
      .sort({ startDate: 1 })
      .lean();

    // Add exam status
    const examsWithStatus = exams.map(exam => {
      const now = new Date();
      let status = 'upcoming';
      if (new Date(exam.startDate) <= now && now <= new Date(exam.endDate)) {
        status = 'ongoing';
      } else if (new Date(exam.endDate) < now) {
        status = 'completed';
      }

      return {
        ...exam,
        status,
        daysUntilExam: Math.ceil((new Date(exam.startDate) - now) / (1000 * 60 * 60 * 24))
      };
    });

    res.json({ exams: examsWithStatus, total: examsWithStatus.length });
  } catch (error) {
    console.error('Error fetching student exams:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get exam details
export const getExamDetail = async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user.id;

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const exam = await Exam.findById(examId)
      .populate('subjects', 'name code')
      .lean();

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const now = new Date();
    let status = 'upcoming';
    if (new Date(exam.startDate) <= now && now <= new Date(exam.endDate)) {
      status = 'ongoing';
    } else if (new Date(exam.endDate) < now) {
      status = 'completed';
    }

    const response = {
      ...exam,
      status,
      daysUntilExam: Math.ceil((new Date(exam.startDate) - now) / (1000 * 60 * 60 * 24))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching exam details:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student's results
export const getMyResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const { examId } = req.query;

    // Get student profile
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    let query = { studentId: student._id };
    if (examId) {
      query.examId = examId;
    }

    const results = await Result.find(query)
      .populate('examId', 'examName examType')
      .populate('subject', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate summary
    const summary = {
      totalExams: results.length,
      averagePercentage: results.length > 0 
        ? (results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length).toFixed(2)
        : 0,
      passed: results.filter(r => r.grade && ['A', 'B', 'C', 'D'].includes(r.grade)).length,
      failed: results.filter(r => r.grade === 'F').length
    };

    res.json({ results, summary });
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student's fees
export const getMyFees = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // Get student profile
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    let query = { studentId: student._id };
    if (status) {
      query.status = status;
    }

    const fees = await Fee.find(query)
      .sort({ dueDate: 1 })
      .lean();

    // Calculate summary
    const summary = {
      totalFees: fees.length,
      pending: fees.filter(f => f.status === 'pending').length,
      paid: fees.filter(f => f.status === 'paid').length,
      overdue: fees.filter(f => f.status === 'overdue').length,
      totalAmount: fees.reduce((sum, f) => sum + (f.amount || 0), 0),
      paidAmount: fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0),
      dueAmount: fees.filter(f => ['pending', 'overdue', 'partially_paid'].includes(f.status)).reduce((sum, f) => sum + (f.amount || 0), 0)
    };

    res.json({ fees, summary });
  } catch (error) {
    console.error('Error fetching student fees:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get subject list for student
export const getMySubjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get class with subjects
    const classData = await Class.findById(student.classId)
      .populate('subjects', 'name code credits')
      .lean();

    if (!classData || !classData.subjects) {
      return res.json({ subjects: [] });
    }

    res.json({ subjects: classData.subjects || [] });
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    res.status(500).json({ message: error.message });
  }
};


