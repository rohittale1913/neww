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
    const { userId, qualification, experience, subjects, classes, isClassTeacher, classTeacherOf } = req.body;

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
      isClassTeacher: isClassTeacher || false,
      classTeacherOf: classTeacherOf || ''
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
    const { name, phone, email, qualification, experience, salary, subjects, classes } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        phone, 
        email, 
        qualification, 
        experience, 
        salary, 
        subjects, 
        classes,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Teacher updated successfully', teacher });
  } catch (error) {
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
