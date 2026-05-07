import ClassSubjectTeacher from '../models/ClassSubjectTeacher.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';

// Assign teacher to class with specific subjects
export const assignTeacherToClass = async (req, res) => {
  try {
    let { className, section, teacherId, subjects, assignmentType, notes } = req.body;
    const adminId = req.user.id;
    const userRole = req.user.role;

    // If teacher is assigning to themselves, get their teacher ID automatically
    if (userRole === 'teacher' && !teacherId) {
      const currentTeacher = await Teacher.findOne({ userId: req.user.id });
      if (!currentTeacher) {
        return res.status(404).json({ 
          message: 'Teacher profile not found for current user' 
        });
      }
      teacherId = currentTeacher._id;
    }

    // Validate required fields
    if (!className || !section || !teacherId || !subjects || !assignmentType) {
      return res.status(400).json({ 
        message: 'className, section, teacherId, subjects, and assignmentType are required' 
      });
    }

    // Validate assignment type
    if (!['class_teacher', 'subject_teacher'].includes(assignmentType)) {
      return res.status(400).json({ 
        message: 'assignmentType must be either "class_teacher" or "subject_teacher"' 
      });
    }

    // Authorization check: Non-admin teachers can only assign to themselves
    if (userRole !== 'admin') {
      if (teacherId.toString() !== (await Teacher.findOne({ userId: req.user.id }))?._id?.toString()) {
        return res.status(403).json({ 
          message: 'Teachers can only create assignments for themselves' 
        });
      }
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // CONSTRAINT: If assignment type is "class_teacher", check if teacher is already 
    // class teacher of another class-section combination
    if (assignmentType === 'class_teacher') {
      const existingClassTeacherAssignment = await ClassSubjectTeacher.findOne({
        teacherId,
        assignmentType: 'class_teacher',
        isActive: true,
        $nor: [
          {
            className: className,
            section: section
          }
        ]
      });

      if (existingClassTeacherAssignment) {
        return res.status(409).json({ 
          message: `Teacher is already assigned as class teacher for class ${existingClassTeacherAssignment.className}-${existingClassTeacherAssignment.section}. A teacher can only be class teacher of ONE class.`,
          conflictingAssignment: existingClassTeacherAssignment
        });
      }
    }

    // Check if assignment already exists for this class-section-teacher
    const existingAssignment = await ClassSubjectTeacher.findOne({
      className,
      section,
      teacherId,
      isActive: true
    });

    if (existingAssignment) {
      // Update existing assignment instead of creating new one
      existingAssignment.subjects = subjects;
      existingAssignment.assignmentType = assignmentType;
      existingAssignment.notes = notes || '';
      existingAssignment.updatedAt = Date.now();
      await existingAssignment.save();

      return res.json({
        message: 'Teacher assignment updated successfully',
        assignment: existingAssignment
      });
    }

    // Find the class document
    const classDoc = await Class.findOne({ className, section });

    // Create new assignment
    const assignment = new ClassSubjectTeacher({
      className,
      section,
      teacherId,
      teacherName: teacher.name,
      subjects: Array.isArray(subjects) ? subjects : [subjects],
      assignmentType,
      classId: classDoc?._id || null,
      assignedByAdminId: adminId,
      notes: notes || ''
    });

    await assignment.save();

    // If this is a class teacher assignment, update Teacher model
    if (assignmentType === 'class_teacher') {
      await Teacher.findByIdAndUpdate(
        teacherId,
        {
          isClassTeacher: true,
          classTeacherOf: `${className}-${section}`,
          $addToSet: {
            classes: className,
            sections: section
          }
        }
      );

      // Update Class model to reference this teacher as class teacher
      if (classDoc) {
        await Class.findByIdAndUpdate(
          classDoc._id,
          { classTeacher: teacherId }
        );
      }
    }

    res.status(201).json({
      message: 'Teacher assigned to class successfully',
      assignment
    });
  } catch (error) {
    console.error('Error assigning teacher:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all class-teacher assignments
export const getAllAssignments = async (req, res) => {
  try {
    const { className, section, teacherId, assignmentType, isActive } = req.query;
    
    // Build filter query
    const filter = {};
    if (className) filter.className = className;
    if (section) filter.section = section;
    if (teacherId) filter.teacherId = teacherId;
    if (assignmentType) filter.assignmentType = assignmentType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const assignments = await ClassSubjectTeacher.find(filter)
      .populate('teacherId', 'name email teacherId')
      .populate('assignedByAdminId', 'name email')
      .sort({ className: 1, section: 1, createdAt: -1 })
      .lean();

    const activeAssignments = assignments.filter((assignment) => assignment.teacherId && assignment.teacherId._id);

    res.json(activeAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get assignment by ID with connected data
export const getAssignmentWithConnections = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await ClassSubjectTeacher.findById(assignmentId)
      .populate('teacherId', 'name email teacherId qualification experience')
      .populate('assignedByAdminId', 'name email')
      .populate('classId', 'className section capacity room')
      .lean();

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Fetch all students of this class
    const students = await Student.find({
      class: assignment.className,
      section: assignment.section,
      isActive: true
    })
      .select('studentId name rollNumber email class section')
      .lean();

    // Fetch teacher details
    const teacher = await Teacher.findById(assignment.teacherId)
      .populate('userId', 'name email phone role')
      .lean();

    // Fetch admin details
    const admin = await User.findById(assignment.assignedByAdminId)
      .select('name email role')
      .lean();

    res.json({
      assignment: {
        ...assignment,
        _id: assignment._id.toString()
      },
      connectedData: {
        students,
        teacher,
        admin,
        totalStudents: students.length,
        className: assignment.className,
        section: assignment.section,
        subjects: assignment.subjects,
        assignmentType: assignment.assignmentType
      }
    });
  } catch (error) {
    console.error('Error fetching assignment with connections:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update assignment
export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { subjects, assignmentType, isActive, notes } = req.body;

    const assignment = await ClassSubjectTeacher.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // If changing to class_teacher, validate constraint
    if (assignmentType === 'class_teacher' && assignment.assignmentType !== 'class_teacher') {
      const existingClassTeacher = await ClassSubjectTeacher.findOne({
        teacherId: assignment.teacherId,
        assignmentType: 'class_teacher',
        isActive: true,
        _id: { $ne: assignmentId }
      });

      if (existingClassTeacher) {
        return res.status(409).json({ 
          message: `Teacher is already assigned as class teacher for class ${existingClassTeacher.className}-${existingClassTeacher.section}`
        });
      }
    }

    // Update fields
    if (subjects) assignment.subjects = subjects;
    if (assignmentType) assignment.assignmentType = assignmentType;
    if (isActive !== undefined) assignment.isActive = isActive;
    if (notes !== undefined) assignment.notes = notes;
    assignment.updatedAt = Date.now();

    await assignment.save();

    // If changing assignment type to class_teacher, update Teacher model
    if (assignmentType === 'class_teacher' && assignment.assignmentType !== 'class_teacher') {
      await Teacher.findByIdAndUpdate(
        assignment.teacherId,
        {
          isClassTeacher: true,
          classTeacherOf: `${assignment.className}-${assignment.section}`,
          $addToSet: {
            classes: assignment.className,
            sections: assignment.section
          }
        }
      );
    }

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await ClassSubjectTeacher.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const wasClassTeacher = assignment.assignmentType === 'class_teacher';

    // Delete the assignment
    await ClassSubjectTeacher.findByIdAndDelete(assignmentId);

    // If this was a class teacher assignment, update Teacher model
    if (wasClassTeacher) {
      const teacher = await Teacher.findById(assignment.teacherId);
      if (teacher && teacher.classTeacherOf === `${assignment.className}-${assignment.section}`) {
        await Teacher.findByIdAndUpdate(
          assignment.teacherId,
          {
            isClassTeacher: false,
            classTeacherOf: ''
          }
        );
      }
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get available teachers for a class (not already assigned as class teacher elsewhere)
export const getAvailableTeachersForClass = async (req, res) => {
  try {
    const { className, section } = req.query;

    // Get all teachers
    const allTeachers = await Teacher.find({ isActive: true })
      .populate('userId', 'name email')
      .select('name email teacherId subjects qualification experience isClassTeacher classTeacherOf')
      .lean();

    // Get existing class teacher assignments for this class
    const classTeacherAssignment = await ClassSubjectTeacher.findOne({
      className,
      section,
      assignmentType: 'class_teacher',
      isActive: true
    }).lean();

    // Get all active class teacher assignments (to check for conflicts)
    const allClassTeacherAssignments = await ClassSubjectTeacher.find({
      assignmentType: 'class_teacher',
      isActive: true
    }).select('teacherId className section').lean();

    const classTeacherTeacherIds = new Set(
      allClassTeacherAssignments.map(a => a.teacherId.toString())
    );

    // Filter teachers
    const availableTeachers = allTeachers.map(teacher => ({
      ...teacher,
      canBeClassTeacher: !classTeacherTeacherIds.has(teacher._id.toString()) || 
                         (classTeacherAssignment?.teacherId?.toString() === teacher._id.toString()),
      isCurrentClassTeacher: classTeacherAssignment?.teacherId?.toString() === teacher._id.toString(),
      isClassTeacherElsewhere: classTeacherTeacherIds.has(teacher._id.toString()) && 
                               (!classTeacherAssignment || 
                                classTeacherAssignment.teacherId.toString() !== teacher._id.toString())
    }));

    res.json(availableTeachers);
  } catch (error) {
    console.error('Error fetching available teachers:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all classes and sections for assignment
export const getAllClassesAndSections = async (req, res) => {
  try {
    const classes = await Class.find()
      .select('className section classTeacher')
      .populate('classTeacher', 'name')
      .sort({ className: 1, section: 1 })
      .lean();

    // Get assignments to show current status
    const assignments = await ClassSubjectTeacher.find({ isActive: true })
      .select('className section teacherId assignmentType')
      .lean();

    const result = classes.map(cls => {
      const classAssignments = assignments.filter(a => 
        a.className === cls.className && a.section === cls.section
      );

      return {
        ...cls,
        assignments: classAssignments
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get students of a specific class
export const getClassStudents = async (req, res) => {
  try {
    const { className, section } = req.query;

    if (!className || !section) {
      return res.status(400).json({ 
        message: 'className and section are required' 
      });
    }

    const students = await Student.find({
      class: className,
      section: section,
      isActive: true
    })
      .select('studentId name rollNumber email parentName parentContact')
      .sort({ rollNumber: 1 })
      .lean();

    res.json(students);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ message: error.message });
  }
};
