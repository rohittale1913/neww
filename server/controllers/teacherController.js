import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import Exam from '../models/Exam.js';
import ClassSubjectTeacher from '../models/ClassSubjectTeacher.js';

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
      .populate('userId', 'name email phone role')
      .lean()
      .sort({ createdAt: -1 });
    
    console.log('\n📚 getAllTeachers - Returning teachers:', teachers.map(t => ({
      name: t.name,
      classes: t.classes,
      classAssignments: t.classAssignments,
      sections: t.sections
    })));
    
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Failed to fetch teachers', error: error.message });
  }
};

// Get teacher by ID
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('userId', 'name email phone role')
      .lean();
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new teacher
export const createTeacher = async (req, res) => {
  try {
    const { userId, qualification, experience, subjects, classes, sections, classAssignments, isClassTeacher, classTeacherOf, employmentType, dateOfBirth, gender, bloodGroup, address } = req.body;

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Fetch user to verify exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validation: If classes are specified, sections must also be specified
    if ((classes && classes.length > 0) && (!sections || sections.length === 0)) {
      return res.status(400).json({ message: 'If classes are assigned, specific sections must also be assigned' });
    }

    // Validation: Sections cannot be assigned without classes
    if ((sections && sections.length > 0) && (!classes || classes.length === 0)) {
      return res.status(400).json({ message: 'Sections cannot be assigned without assigning classes' });
    }

    // Generate unique teacher ID with more entropy
    let teacherId;
    let isDuplicate = true;
    let attempts = 0;
    
    while (isDuplicate && attempts < 5) {
      teacherId = `TCH-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const existingTeacher = await Teacher.findOne({ teacherId });
      isDuplicate = !!existingTeacher;
      attempts++;
    }

    if (isDuplicate) {
      return res.status(500).json({ message: 'Failed to generate unique teacher ID after multiple attempts' });
    }

    // Create teacher with validated data
    const teacher = new Teacher({
      teacherId,
      userId,
      name: user.name,
      subjects: subjects && subjects.length ? subjects : [],
      classes: classes && classes.length ? classes : [],
      sections: sections && sections.length ? sections : [],
      classAssignments: classAssignments && classAssignments.length ? classAssignments : [],
      qualification: qualification || '',
      experience: experience || 0,
      employmentType: employmentType || '',
      isClassTeacher: isClassTeacher || false,
      classTeacherOf: classTeacherOf || '',
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      bloodGroup: bloodGroup || null,
      address: address || null
    });

    await teacher.save();

    // ===== NEW: SYNC WITH CLASS DOCUMENT =====
    // If this teacher is being assigned as class teacher, update the Class document
    if (isClassTeacher && classTeacherOf) {
      console.log('🔍 createTeacher - Syncing classTeacher:', {
        isClassTeacher,
        classTeacherOf,
        teacherId: teacher._id
      });

      // Parse classTeacherOf to extract className and section (format: "10-A")
      const parts = classTeacherOf.split('-');
      console.log('📝 classTeacherOf parts:', parts);

      if (parts.length === 2) {
        const className = parts[0];
        const section = parts[1];
        
        console.log(`🔍 Searching for Class: className="${className}", section="${section}"`);
        
        // Find and update the corresponding Class document
        const classDoc = await Class.findOneAndUpdate(
          { className, section },
          { classTeacher: teacher._id },
          { new: true }
        );

        console.log('✅ Class update result:', {
          found: !!classDoc,
          className: classDoc?.className,
          section: classDoc?.section,
          classTeacher: classDoc?.classTeacher
        });

        if (!classDoc) {
          console.warn(`⚠️ Class not found: ${className}-${section}`);
        }
      } else {
        console.warn(`⚠️ Invalid classTeacherOf format: "${classTeacherOf}" (expected "className-section")`);
      }
    }

    res.status(201).json({
      message: 'Teacher profile created successfully',
      teacher
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `A teacher with this ${field} already exists` });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message || 'Failed to create teacher profile' });
  }
};

// Update teacher
export const updateTeacher = async (req, res) => {
  try {
    const { name, email, phone, qualification, experience, subjects, classes, sections, classAssignments, isClassTeacher, classTeacherOf, employmentType, gender, dateOfBirth, bloodGroup, address, joiningDate } = req.body;

    console.log('\n📝 updateTeacher called with:', {
      classAssignments,
      classes,
      sections
    });

    console.log('📝 Full request body:', JSON.stringify(req.body, null, 2));

    // Find the teacher record
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Validation: If classes are being updated, sections must be provided if teacher is subject teacher
    const newClasses = classes !== undefined ? classes : teacher.classes;
    const newSections = sections !== undefined ? sections : teacher.sections;
    const newIsClassTeacher = isClassTeacher !== undefined ? isClassTeacher : teacher.isClassTeacher;
    const newClassTeacherOf = classTeacherOf !== undefined ? classTeacherOf : teacher.classTeacherOf;

    // Only validate sections if teacher is NOT a class teacher
    if (!newIsClassTeacher && (newClasses && newClasses.length > 0) && (!newSections || newSections.length === 0)) {
      return res.status(400).json({ message: 'If classes are assigned to a subject teacher, specific sections must also be assigned' });
    }

    // Sections cannot be assigned without classes
    if ((newSections && newSections.length > 0) && (!newClasses || newClasses.length === 0)) {
      return res.status(400).json({ message: 'Sections cannot be assigned without assigning classes' });
    }

    // ===== CLEAN UP: Remove teacher from OLD classes that are no longer assigned =====
    const oldClasses = teacher.classes || [];
    const oldSections = teacher.sections || [];
    
    if ((classes !== undefined && classes.length < oldClasses.length) || 
        (sections !== undefined && sections.length < oldSections.length)) {
      
      console.log('🧹 Cleaning up old class assignments...');
      console.log(`Old assignments: Classes=${oldClasses}, Sections=${oldSections}`);
      console.log(`New assignments: Classes=${newClasses}, Sections=${newSections}`);
      
      // Find classes where teacher is assigned but should no longer be
      const classesToClean = await Class.find({
        $or: [
          { className: { $in: oldClasses }, section: { $in: oldSections } }
        ]
      });
      
      for (const classDoc of classesToClean) {
        const isStillAssigned = 
          newClasses.includes(classDoc.className) && 
          newSections.includes(classDoc.section);
        
        if (!isStillAssigned) {
          console.log(`🗑️ Removing teacher from ${classDoc.className}-${classDoc.section}`);
          
          // If this teacher was the class teacher, clear that too
          if (classDoc.classTeacher?.toString() === teacher._id.toString()) {
            await Class.findByIdAndUpdate(
              classDoc._id,
              { classTeacher: null },
              { new: true }
            );
            console.log(`   ✅ Removed as class teacher`);
          }
        }
      }
    }

    // ===== NEW: HANDLE CLASS TEACHER SYNC =====
    // If classTeacher status or classTeacherOf is changing, sync with Class documents
    if (newIsClassTeacher !== teacher.isClassTeacher || newClassTeacherOf !== teacher.classTeacherOf) {
      console.log('🔍 updateTeacher - Syncing classTeacher changes:', {
        oldIsClassTeacher: teacher.isClassTeacher,
        newIsClassTeacher,
        oldClassTeacherOf: teacher.classTeacherOf,
        newClassTeacherOf
      });

      // If teacher was previously a class teacher, remove from old class
      if (teacher.isClassTeacher && teacher.classTeacherOf) {
        const oldParts = teacher.classTeacherOf.split('-');
        if (oldParts.length === 2) {
          const oldClassName = oldParts[0];
          const oldSection = oldParts[1];
          
          console.log(`🗑️ Removing classTeacher from old class: ${oldClassName}-${oldSection}`);
          
          const removedClass = await Class.findOneAndUpdate(
            { className: oldClassName, section: oldSection, classTeacher: teacher._id },
            { classTeacher: null },
            { new: true }
          );

          console.log('✅ Old class update:', { found: !!removedClass });
        }
      }

      // If teacher is becoming a class teacher, assign to new class
      if (newIsClassTeacher && newClassTeacherOf) {
        const newParts = newClassTeacherOf.split('-');
        if (newParts.length === 2) {
          const newClassName = newParts[0];
          const newSection = newParts[1];
          
          console.log(`✍️ Assigning classTeacher to new class: ${newClassName}-${newSection}`);
          
          const updatedClass = await Class.findOneAndUpdate(
            { className: newClassName, section: newSection },
            { classTeacher: teacher._id },
            { new: true }
          );

          console.log('✅ New class update:', {
            found: !!updatedClass,
            className: updatedClass?.className,
            section: updatedClass?.section,
            classTeacher: updatedClass?.classTeacher
          });

          if (!updatedClass) {
            console.warn(`⚠️ Class not found: ${newClassName}-${newSection}`);
          }
        } else {
          console.warn(`⚠️ Invalid classTeacherOf format: "${newClassTeacherOf}"`);
        }
      }
    }

    // Update the User record (name, email, phone)
    if (teacher.userId) {
      await User.findByIdAndUpdate(
        teacher.userId,
        { 
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          updatedAt: Date.now()
        },
        { new: true }
      );
    }

    // Update the Teacher record
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || teacher.name,
        qualification: qualification !== undefined ? qualification : teacher.qualification,
        experience: experience !== undefined ? experience : teacher.experience,
        subjects: subjects !== undefined ? subjects : teacher.subjects,
        classes: newClasses,
        sections: newSections,
        classAssignments: classAssignments !== undefined ? classAssignments : teacher.classAssignments,
        isClassTeacher: newIsClassTeacher,
        classTeacherOf: newClassTeacherOf,
        employmentType: employmentType !== undefined ? employmentType : teacher.employmentType,
        gender: gender !== undefined ? gender : teacher.gender,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : teacher.dateOfBirth,
        bloodGroup: bloodGroup !== undefined ? bloodGroup : teacher.bloodGroup,
        address: address !== undefined ? address : teacher.address,
        joiningDate: joiningDate !== undefined ? joiningDate : teacher.joiningDate,
        updatedAt: Date.now()
      },
      { new: true }
    )
    .populate('userId', 'name email phone role')
    .lean();

    // Enrich with user data
    const enrichedTeacher = {
      ...updatedTeacher,
      email: updatedTeacher?.email || email || '-',
      phone: updatedTeacher?.phone || phone || '-'
    };

    res.json({ message: 'Teacher updated successfully', teacher: enrichedTeacher });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Remove all class assignments tied to this teacher so they no longer appear in student/teacher views.
    const deletedAssignments = await ClassSubjectTeacher.deleteMany({ teacherId: teacher._id });

    // Clear any direct class references to the deleted teacher.
    await Class.updateMany(
      { classTeacher: teacher._id },
      { $set: { classTeacher: null, updatedAt: Date.now() } }
    );

    await Teacher.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Teacher deleted successfully',
      teacher,
      deletedAssignments: deletedAssignments.deletedCount || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my profile (teacher-specific endpoint)
export const getMyProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const teacher = await Teacher.findOne({ userId: teacherId })
      .populate('userId', 'name email phone role')
      .lean();

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).json({ message: 'Failed to fetch teacher profile', error: error.message });
  }
};

// Get my classes
export const getMyClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id }).lean();
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    console.log('\n=== 🎓 GET MY CLASSES ===');
    console.log('Teacher profile:', {
      name: teacher.name,
      _id: teacher._id,
      classes: teacher.classes,
      sections: teacher.sections,
      classAssignments: teacher.classAssignments,
      isClassTeacher: teacher.isClassTeacher,
      classTeacherOf: teacher.classTeacherOf
    });

    // Fetch teacher's class assignments from ClassSubjectTeacher
    const classAssignments = await ClassSubjectTeacher.find({
      teacherId: teacher._id,
      isActive: true
    }).lean();

    console.log('📚 ClassSubjectTeacher assignments found:', classAssignments.length);
    classAssignments.forEach(ca => {
      console.log(`  - ${ca.className}-${ca.section}: subjects=${ca.subjects.join(', ')}, type=${ca.assignmentType}`);
    });

    // Build query to find classes where:
    // 1. Teacher is the class teacher (classTeacher field matches teacher._id)
    // 2. Teacher teaches the class AND the specific section (using ClassSubjectTeacher assignments)
    let query;
    
    if (classAssignments && classAssignments.length > 0) {
      // Use explicit ClassSubjectTeacher assignments for accurate matching
      console.log('🎯 Using ClassSubjectTeacher assignments for query');
      const orConditions = [{ classTeacher: teacher._id }];
      
      for (const assignment of classAssignments) {
        orConditions.push({
          $and: [
            { className: assignment.className },
            { section: assignment.section }
          ]
        });
      }
      
      query = { $or: orConditions };
    } else if (teacher.classAssignments && teacher.classAssignments.length > 0) {
      // Use explicit classAssignments for accurate matching
      console.log('🎯 Using legacy classAssignments for query');
      const orConditions = [{ classTeacher: teacher._id }];
      
      for (const assignment of teacher.classAssignments) {
        orConditions.push({
          $and: [
            { className: assignment.className },
            { section: { $in: assignment.sections || [] } }
          ]
        });
      }
      
      query = { $or: orConditions };
    } else {
      // Fallback to old logic for backward compatibility
      console.log('🔄 Using legacy classes/sections arrays');
      query = {
        $or: [
          { classTeacher: teacher._id }, // Teacher is class teacher
          {
            // Teacher teaches this class in specific sections
            $and: [
              { className: { $in: teacher.classes || [] } },
              { section: { $in: teacher.sections || [] } }
            ]
          }
        ]
      };
    }

    console.log('Query:', JSON.stringify(query, null, 2));

    const classes = await Class.find(query)
      .populate('classTeacher', 'name email')
      .populate('students', 'name rollNumber studentId')
      .populate('subjects', 'name code')
      .lean();

    console.log(`Found ${classes.length} classes`);
    classes.forEach(cls => {
      console.log(`  - ${cls.className}-${cls.section}: classTeacher=${cls.classTeacher?._id?.toString()}, isMyClass=${cls.classTeacher?._id?.toString() === teacher._id.toString()}`);
    });

    // Enhance class data with teacher's role information and assigned subjects
    const enhancedClasses = classes.map(cls => {
      const isClassTeacher = cls.classTeacher?._id?.toString() === teacher._id.toString();
      
      // Get assigned subjects from ClassSubjectTeacher
      let assignedSubjects = [];
      let teachesSubject = false;
      
      if (classAssignments && classAssignments.length > 0) {
        const assignment = classAssignments.find(a => a.className === cls.className && a.section === cls.section);
        if (assignment) {
          assignedSubjects = assignment.subjects || [];
          teachesSubject = assignedSubjects.length > 0;
        }
      } else if (teacher.classAssignments && teacher.classAssignments.length > 0) {
        const assignment = teacher.classAssignments.find(a => a.className === cls.className);
        teachesSubject = assignment && assignment.sections && assignment.sections.includes(cls.section);
      } else {
        // Fallback to old logic
        teachesSubject = teacher.classes && teacher.classes.includes(cls.className) && teacher.sections && teacher.sections.includes(cls.section);
      }
      
      return {
        ...cls,
        isClassTeacher,
        teachesSubject,
        assignedSubjects: assignedSubjects, // Include assigned subjects from ClassSubjectTeacher
        teacherRole: isClassTeacher ? 'Class Teacher' : (teachesSubject ? 'Subject Teacher' : 'Other')
      };
    });

    // Sort classes - class teachers first, then subject teachers, then others
    const sortedClasses = enhancedClasses.sort((a, b) => {
      if (a.isClassTeacher !== b.isClassTeacher) {
        return a.isClassTeacher ? -1 : 1;
      }
      if (a.teachesSubject !== b.teachesSubject) {
        return a.teachesSubject ? -1 : 1;
      }
      return `${a.className}${a.section}`.localeCompare(`${b.className}${b.section}`);
    });

    console.log('Final classes with roles:');
    sortedClasses.forEach(cls => {
      console.log(`  - ${cls.className}-${cls.section}: role=${cls.teacherRole}`);
    });
    console.log('=== END ===\n');

    res.json({
      classes: sortedClasses,
      totalClasses: sortedClasses.length,
      classTeacherClasses: sortedClasses.filter(c => c.isClassTeacher).length,
      subjectTeacherClasses: sortedClasses.filter(c => !c.isClassTeacher && c.teachesSubject).length,
      teacher: {
        name: teacher.name,
        qualification: teacher.qualification,
        experience: teacher.experience,
        subjects: teacher.subjects,
        classes: teacher.classes,
        sections: teacher.sections,
        isClassTeacher: teacher.isClassTeacher,
        classTeacherOf: teacher.classTeacherOf
      }
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Failed to fetch classes', error: error.message });
  }
};

// Get students in a specific class
export const getClassStudents = async (req, res) => {
  try {
    const { className } = req.params;
    
    // Try to find by className and section combination
    let classData = await Class.findOne({ className })
      .populate({
        path: 'students',
        select: 'name rollNumber gender class section studentId email contact'
      })
      .lean();

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({
      className: classData.className,
      section: classData.section,
      students: classData.students || [],
      totalStudents: classData.students?.length || 0,
      room: classData.room,
      capacity: classData.capacity
    });
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ message: 'Failed to fetch class students', error: error.message });
  }
};

// Mark attendance for a class
export const markAttendance = async (req, res) => {
  try {
    const { className, section, date, attendanceRecords } = req.body;

    if (!className || !date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Get current teacher
    const teacher = await Teacher.findOne({ userId: req.user.id }).lean();
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const classRecord = await Class.findOne({ className, section }).lean();

    const attendanceIds = [];

    for (const record of attendanceRecords) {
      const { studentId, status, remarks } = record;

      if (!studentId || !status) {
        return res.status(400).json({ message: 'StudentId and status are required for each record' });
      }

      const student = await Student.findById(studentId).lean();
      if (!student) {
        return res.status(404).json({ message: `Student with ID ${studentId} not found` });
      }

      const existingAttendance = await Attendance.findOne({
        studentId,
        date: new Date(date),
        className: className
      });

      let attendance;
      if (existingAttendance) {
        attendance = await Attendance.findByIdAndUpdate(
          existingAttendance._id,
          { 
            status, 
            remarks: remarks || '', 
            markedBy: req.user.id,
            className,
            section,
            classId: classRecord?._id || existingAttendance.classId || null,
            teacherId: teacher._id
          },
          { new: true }
        );
      } else {
        attendance = new Attendance({
          studentId,
          date: new Date(date),
          className,
          section,
          classId: classRecord?._id || null,
          status,
          remarks: remarks || '',
          markedBy: req.user.id,
          teacherId: teacher._id
        });
        await attendance.save();
      }

      attendanceIds.push(attendance._id);
    }

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendanceRecords: attendanceIds,
      totalRecords: attendanceIds.length
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
  }
};

// Get attendance records for a class
export const getAttendance = async (req, res) => {
  try {
    const { className, month, year } = req.query;

    if (!className) {
      return res.status(400).json({ message: 'className is required' });
    }

    const query = { className: className };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name rollNumber studentId class section')
      .lean()
      .sort({ date: -1 });

    // Calculate summary stats
    const summary = {
      totalRecords: attendance.length,
      presentDays: attendance.filter(a => a.status === 'present').length,
      absentDays: attendance.filter(a => a.status === 'absent').length,
      leaveDays: attendance.filter(a => a.status === 'leave').length,
      lateDays: attendance.filter(a => a.status === 'late').length
    };

    res.json({ attendance, summary });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

// Get my assignments (for teacher's classes)
export const getMyAssignments = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id }).lean();
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const assignments = await Assignment.find({ class: { $in: teacher.classes } })
      .populate('createdBy', 'name email')
      .lean()
      .sort({ dueDate: -1 });

    // Add calculated fields
    const enrichedAssignments = assignments.map(a => ({
      ...a,
      submissionCount: a.submissions?.length || 0,
      gradedCount: a.submissions?.filter(s => s.marksObtained !== undefined).length || 0,
      daysUntilDue: Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24)),
      isOverdue: new Date(a.dueDate) < new Date(),
      submissionStatus: a.submissions?.map(s => ({ studentId: s.studentId, status: s.marksObtained ? 'graded' : 'pending' })) || []
    }));

    res.json({
      assignments: enrichedAssignments,
      totalAssignments: enrichedAssignments.length,
      pendingGrading: enrichedAssignments.reduce((acc, a) => acc + (a.submissionCount - a.gradedCount), 0)
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Failed to fetch assignments', error: error.message });
  }
};

// Get assignment detail
export const getAssignmentDetail = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email')
      .populate('submissions.studentId', 'name rollNumber studentId')
      .lean();

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Failed to fetch assignment', error: error.message });
  }
};

// Grade assignment
export const gradeAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId, marksObtained, feedback } = req.body;

    if (!assignmentId || !studentId || marksObtained === undefined) {
      return res.status(400).json({ message: 'assignmentId, studentId, and marksObtained are required' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submissionIndex = assignment.submissions.findIndex(
      s => s.studentId.toString() === studentId
    );

    if (submissionIndex === -1) {
      return res.status(404).json({ message: 'Student submission not found' });
    }

    assignment.submissions[submissionIndex].marksObtained = marksObtained;
    assignment.submissions[submissionIndex].feedback = feedback || '';
    assignment.submissions[submissionIndex].gradedDate = new Date();
    assignment.submissions[submissionIndex].gradedBy = req.user.id;

    await assignment.save();

    res.json({
      message: 'Assignment graded successfully',
      submission: assignment.submissions[submissionIndex]
    });
  } catch (error) {
    console.error('Error grading assignment:', error);
    res.status(500).json({ message: 'Failed to grade assignment', error: error.message });
  }
};

// Get my exams (for teacher's classes)
export const getMyExams = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id }).lean();
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const exams = await Exam.find({ class: { $in: teacher.classes } })
      .populate('createdBy', 'name email')
      .lean()
      .sort({ startDate: -1 });

    // Add calculated fields
    const enrichedExams = exams.map(e => {
      const now = new Date();
      const startDate = new Date(e.startDate);
      const endDate = new Date(e.endDate);

      let status = 'upcoming';
      if (now >= startDate && now <= endDate) {
        status = 'ongoing';
      } else if (now > endDate) {
        status = 'completed';
      }

      return {
        ...e,
        status,
        daysUntilExam: Math.ceil((startDate - now) / (1000 * 60 * 60 * 24)),
        duration: Math.ceil((endDate - startDate) / (1000 * 60))
      };
    });

    // Summary stats
    const summary = {
      upcoming: enrichedExams.filter(e => e.status === 'upcoming').length,
      ongoing: enrichedExams.filter(e => e.status === 'ongoing').length,
      completed: enrichedExams.filter(e => e.status === 'completed').length
    };

    res.json({
      exams: enrichedExams,
      totalExams: enrichedExams.length,
      summary
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Failed to fetch exams', error: error.message });
  }
};

// Get exam detail
export const getExamDetail = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId)
      .populate('createdBy', 'name email')
      .lean();

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ message: 'Failed to fetch exam', error: error.message });
  }
};

export default { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher, getMyProfile, getMyClasses, getClassStudents, markAttendance, getAttendance, getMyAssignments, getAssignmentDetail, gradeAssignment, getMyExams, getExamDetail };
