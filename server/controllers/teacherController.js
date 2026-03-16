import Teacher from '../models/Teacher.js';
import User from '../models/User.js';

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
      .populate('userId', 'name email phone role')
      .lean()
      .sort({ createdAt: -1 });
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
    const { userId, qualification, experience, subjects, classes, isClassTeacher, classTeacherOf, employmentType, dateOfBirth, gender, bloodGroup, address } = req.body;

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Fetch user to verify exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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

    // Create teacher
    const teacher = new Teacher({
      teacherId,
      userId,
      name: user.name,
      subjects: subjects && subjects.length ? subjects : [],
      classes: classes && classes.length ? classes : [],
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
    const { name, email, phone, qualification, experience, subjects, classes, isClassTeacher, classTeacherOf, employmentType, gender, dateOfBirth, bloodGroup, address, joiningDate } = req.body;

    // Find the teacher record
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
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
        classes: classes !== undefined ? classes : teacher.classes,
        isClassTeacher: isClassTeacher !== undefined ? isClassTeacher : teacher.isClassTeacher,
        classTeacherOf: classTeacherOf !== undefined ? classTeacherOf : teacher.classTeacherOf,
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
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Teacher deleted successfully', teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher };
