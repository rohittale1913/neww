import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import ClassSubjectTeacher from '../models/ClassSubjectTeacher.js';
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
    
    // Find class teacher for this student's class/section from active assignments
    let classTeacher = null;
    if (student.class) {
      // Look for active class teacher assignment in ClassSubjectTeacher
      const classTeacherAssignment = await ClassSubjectTeacher.findOne({
        className: student.class,
        section: student.section,
        assignmentType: 'class_teacher',
        isActive: true
      })
        .populate({
          path: 'teacherId',
          populate: {
            path: 'userId',
            select: 'name email phone profileImage'
          }
        })
        .select('teacherId')
        .lean();

      if (classTeacherAssignment && classTeacherAssignment.teacherId) {
        classTeacher = {
          ...classTeacherAssignment.teacherId,
          email: classTeacherAssignment.teacherId.userId?.email || classTeacherAssignment.teacherId.email,
          phone: classTeacherAssignment.teacherId.userId?.phone || classTeacherAssignment.teacherId.phone
        };
      }
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

// Get logged-in student's assigned subjects
export const getMySubjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await Student.findOne({ userId })
      .select('class section')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const assignments = await ClassSubjectTeacher.find({
      className: student.class,
      section: student.section,
      assignmentType: 'subject_teacher',
      isActive: true
    })
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'name email phone profileImage'
        }
      })
      .lean();

    const groupedSubjects = new Map();

    assignments.forEach((assignment) => {
      const teacherName = assignment.teacherName || assignment.teacherId?.name || 'N/A';
      const email = assignment.teacherId?.userId?.email || '';
      const phone = assignment.teacherId?.userId?.phone || '';

      (assignment.subjects || []).forEach((subjectName) => {
        if (!groupedSubjects.has(subjectName)) {
          groupedSubjects.set(subjectName, {
            subjectName,
            teachers: [],
            teacherNames: []
          });
        }

        const subjectEntry = groupedSubjects.get(subjectName);
        subjectEntry.teachers.push({
          teacherName,
          email,
          phone,
          assignmentType: assignment.assignmentType
        });
        subjectEntry.teacherNames.push(teacherName);
      });
    });

    res.json({
      className: student.class,
      section: student.section,
      subjects: Array.from(groupedSubjects.values())
    });
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in student's attendance summary and records
export const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const student = await Student.findOne({ userId })
      .select('_id class section')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month, 10) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      studentId: student._id,
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('classId', 'className section')
      .populate('teacherId', 'name teacherId')
      .lean()
      .sort({ date: -1 });

    const summary = {
      totalDays: attendance.length,
      presentDays: attendance.filter((record) => record.status === 'present').length,
      absentDays: attendance.filter((record) => record.status === 'absent').length,
      leaveDays: attendance.filter((record) => record.status === 'leave').length,
      lateDays: attendance.filter((record) => record.status === 'late').length,
      attendancePercentage: attendance.length > 0
        ? (((attendance.filter((record) => record.status === 'present' || record.status === 'late').length) / attendance.length) * 100).toFixed(2)
        : '0.00'
    };

    res.json({
      attendance,
      summary,
      className: student.class,
      section: student.section,
      month: targetMonth,
      year: targetYear
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in student's assignments
export const getMyAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter } = req.query;

    const student = await Student.findOne({ userId })
      .select('_id class section')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const now = new Date();
    console.log('\n=== STUDENT ASSIGNMENTS DEBUG ===');
    console.log('Current Time:', now);
    console.log('Student Class:', student.class, 'Section:', student.section);
    
    // Check all assignments for this class first (before deadline filter)
    const allAssignmentsForClass = await Assignment.find({
      className: student.class,
      section: student.section
    }).lean();
    console.log('Total assignments for class:', allAssignmentsForClass.length);
    allAssignmentsForClass.forEach(a => {
      console.log(`  - ${a.title}: dueDate=${new Date(a.dueDate).toISOString()} (${new Date(a.dueDate) > now ? 'FUTURE' : 'PAST'})`);
    });
    
    const assignments = await Assignment.find({
      className: student.class,
      section: student.section,
      dueDate: { $gt: now }  // Only show assignments with future due dates
    })
      .populate('teacherId', 'name email')
      .populate('subject', 'name code')
      .lean()
      .sort({ dueDate: -1 });

    console.log('Assignments after deadline filter:', assignments.length);
    assignments.forEach(a => {
      console.log(`  - ${a.title}: dueDate=${new Date(a.dueDate).toISOString()}`);
    });
    console.log('=== END DEBUG ===\n');

    const mappedAssignments = assignments.map((assignment) => {
      const submission = (assignment.submissions || []).find(
        (entry) => entry.studentId?.toString() === student._id.toString()
      );

      const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - now) / (1000 * 60 * 60 * 24));
      const isOverdue = !submission && new Date(assignment.dueDate) < now;
      const submissionStatus = submission
        ? submission.marksObtained !== undefined
          ? 'graded'
          : 'submitted'
        : 'pending';

      return {
        ...assignment,
        daysUntilDue,
        isOverdue,
        submissionStatus,
        submission: submission || null
      };
    }).filter((assignment) => {
      if (!filter || filter === 'all') return true;
      if (filter === 'pending') return assignment.submissionStatus === 'pending';
      if (filter === 'submitted') return assignment.submissionStatus === 'submitted';
      if (filter === 'graded') return assignment.submissionStatus === 'graded';
      return true;
    });

    res.json({ assignments: mappedAssignments });
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single assignment for the logged-in student
export const getMyAssignmentDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId } = req.params;

    const student = await Student.findOne({ userId })
      .select('_id class section')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      className: student.class,
      section: student.section
    })
      .populate('teacherId', 'name email')
      .populate('subject', 'name code')
      .lean();

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = (assignment.submissions || []).find(
      (entry) => entry.studentId?.toString() === student._id.toString()
    );

    const now = new Date();
    const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - now) / (1000 * 60 * 60 * 24));
    const isOverdue = !submission && new Date(assignment.dueDate) < now;
    const submissionStatus = submission
      ? submission.marksObtained !== undefined
        ? 'graded'
        : 'submitted'
      : 'pending';

    res.json({
      ...assignment,
      daysUntilDue,
      isOverdue,
      submissionStatus,
      submission: submission || null
    });
  } catch (error) {
    console.error('Error fetching student assignment detail:', error);
    res.status(500).json({ message: error.message });
  }
};

// Submit assignment from the legacy student assignment detail page
export const submitMyAssignment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId } = req.params;
    const { attachments = [] } = req.body;

    const student = await Student.findOne({ userId })
      .select('_id name rollNumber class section')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      className: student.class,
      section: student.section
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const normalizedAttachments = (Array.isArray(attachments) ? attachments : [attachments])
      .filter(Boolean)
      .map((item) => {
        const attachmentUrl = String(item);
        const fileName = attachmentUrl.split('/').pop()?.split('?')[0] || 'attachment';

        return {
          filename: fileName,
          originalName: fileName,
          filepath: attachmentUrl,
          downloadUrl: attachmentUrl,
          size: 0,
          mimeType: 'text/plain',
          uploadedAt: new Date()
        };
      });

    if (normalizedAttachments.length === 0) {
      return res.status(400).json({ message: 'Please add at least one attachment' });
    }

    const submission = {
      studentId: student._id,
      studentName: student.name,
      studentRollNumber: student.rollNumber,
      submittedAt: Date.now(),
      submittedDate: new Date(),
      attachments: normalizedAttachments,
      isLate: new Date() > new Date(assignment.dueDate)
    };

    const existingIndex = assignment.submissions.findIndex(
      (entry) => entry.studentId.toString() === student._id.toString()
    );

    if (existingIndex >= 0) {
      assignment.submissions[existingIndex] = submission;
    } else {
      assignment.submissions.push(submission);
    }

    await assignment.save();

    res.json({
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Error submitting student assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in student's exams
export const getMyExams = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await Student.findOne({ userId })
      .select('class section')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const classDoc = await Class.findOne({ className: student.class, section: student.section })
      .select('_id')
      .lean();

    const exams = await Exam.find({ classId: classDoc?._id })
      .populate('classId', 'className section')
      .populate('subjects', 'name code')
      .lean()
      .sort({ startDate: -1 });

    const now = new Date();
    const mappedExams = exams.map((exam) => {
      let status = 'upcoming';
      if (now >= new Date(exam.startDate) && now <= new Date(exam.endDate)) {
        status = 'ongoing';
      } else if (now > new Date(exam.endDate)) {
        status = 'completed';
      }

      const daysUntilExam = Math.ceil((new Date(exam.startDate) - now) / (1000 * 60 * 60 * 24));

      return {
        ...exam,
        status,
        daysUntilExam: status === 'upcoming' ? Math.max(daysUntilExam, 0) : 0
      };
    });

    res.json({ exams: mappedExams });
  } catch (error) {
    console.error('Error fetching student exams:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in student's results
export const getMyResults = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await Student.findOne({ userId })
      .select('_id')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const results = await Result.find({ studentId: student._id })
      .populate('examId', 'examName examType')
      .populate('subject', 'name code')
      .lean()
      .sort({ createdAt: -1 });

    const totalExams = results.length;
    const averagePercentage = totalExams > 0
      ? (results.reduce((sum, result) => sum + (result.percentage || 0), 0) / totalExams).toFixed(2)
      : '0.00';
    const passed = results.filter((result) => (result.percentage || 0) >= 60).length;
    const failed = totalExams - passed;

    res.json({
      results,
      summary: {
        totalExams,
        averagePercentage,
        passed,
        failed
      }
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in student's fees
export const getMyFees = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const student = await Student.findOne({ userId })
      .select('_id')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const feeQuery = { studentId: student._id };
    if (status && status !== 'all') {
      feeQuery.status = status;
    }

    const fees = await Fee.find(feeQuery)
      .lean()
      .sort({ dueDate: -1 });

    const totalAmount = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const paidAmount = fees.filter((fee) => fee.status === 'paid').reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const dueAmount = totalAmount - paidAmount;

    res.json({
      fees,
      summary: {
        totalAmount,
        paidAmount,
        dueAmount
      }
    });
  } catch (error) {
    console.error('Error fetching student fees:', error);
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

export default { 
  getAllStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  getStudentByUserId,
  getStudentProfileWithClassTeacher,
  getMySubjects,
  getMyAttendance,
  getMyAssignments,
  getMyAssignmentDetail,
  submitMyAssignment,
  getMyExams,
  getMyResults,
  getMyFees
};
