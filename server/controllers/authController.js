import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Accountant from '../models/Accountant.js';
import Librarian from '../models/Librarian.js';
import TransportManager from '../models/TransportManager.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'Name, email, password, and role are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    const validRoles = ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian', 'transport_manager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save middleware
      role,
      phone: phone ? phone.trim() : ''
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is inactive' });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout User
export const logout = (req, res) => {
  // In a JWT-based system, logout is handled on the client side (token removal)
  // Server can optionally maintain a blacklist if needed
  res.json({ message: 'Logged out successfully' });
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, profileImage, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('=== DELETE USER DEBUG ===');
    console.log('Admin ID:', req.user.id);
    console.log('User to delete ID:', userId);
    console.log('Are they same?', req.user.id.toString() === userId.toString());

    // Prevent admin from deleting themselves
    if (req.user.id.toString() === userId.toString()) {
      console.log('Error: Admin tried to delete themselves');
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Verify user exists first
    const userToDelete = await User.findById(userId);
    console.log('User found:', !!userToDelete);
    
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related Student record if exists
    await Student.deleteOne({ userId });

    // Delete related Teacher record if exists
    await Teacher.deleteOne({ userId });

    // Delete related Accountant record if exists
    await Accountant.deleteOne({ userId });

    // Delete related Librarian record if exists
    await Librarian.deleteOne({ userId });

    // Delete related TransportManager record if exists
    await TransportManager.deleteOne({ userId });

    console.log('Deleting User:', userId);
    const user = await User.findByIdAndDelete(userId);
    console.log('User deletion result:', !!user);
    console.log('=== END DELETE USER DEBUG ===');

    res.json({ message: 'User deleted successfully', userId });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reset Password - For admin password recovery
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password - will be hashed by pre-save middleware
    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { register, login, logout, getCurrentUser, updateProfile, getAllUsers, deleteUser, resetPassword };
