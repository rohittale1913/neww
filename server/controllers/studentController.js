import Student from '../models/Student.js';
import User from '../models/User.js';

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

export default { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent };
