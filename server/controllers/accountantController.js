import Accountant from '../models/Accountant.js';
import User from '../models/User.js';

// Get all accountants
export const getAllAccountants = async (req, res) => {
  try {
    const accountants = await Accountant.find()
      .populate('userId', 'name email phone role')
      .lean()
      .sort({ createdAt: -1 });
    res.json(accountants);
  } catch (error) {
    console.error('Error fetching accountants:', error);
    res.status(500).json({ message: 'Failed to fetch accountants', error: error.message });
  }
};

// Get accountant by ID
export const getAccountantById = async (req, res) => {
  try {
    const accountant = await Accountant.findById(req.params.id)
      .populate('userId', 'name email phone role')
      .lean();
    if (!accountant) {
      return res.status(404).json({ message: 'Accountant not found' });
    }
    res.json(accountant);
  } catch (error) {
    console.error('Error fetching accountant:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new accountant
export const createAccountant = async (req, res) => {
  try {
    const { userId, qualification, experience, bankAccount, ifscCode } = req.body;

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Fetch user to verify exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique accountant ID with more entropy
    let accountantId;
    let isDuplicate = true;
    let attempts = 0;
    
    while (isDuplicate && attempts < 5) {
      accountantId = `ACC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const existingAccountant = await Accountant.findOne({ accountantId });
      isDuplicate = !!existingAccountant;
      attempts++;
    }

    if (isDuplicate) {
      return res.status(500).json({ message: 'Failed to generate unique accountant ID after multiple attempts' });
    }

    // Create accountant
    const accountant = new Accountant({
      accountantId,
      userId,
      name: user.name,
      qualification: qualification || '',
      experience: experience || 0,
      bankAccount: bankAccount || '',
      ifscCode: ifscCode || ''
    });

    await accountant.save();

    res.status(201).json({
      message: 'Accountant profile created successfully',
      accountant
    });
  } catch (error) {
    console.error('Error creating accountant:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `An accountant with this ${field} already exists` });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message || 'Failed to create accountant profile' });
  }
};

// Update accountant
export const updateAccountant = async (req, res) => {
  try {
    const { qualification, experience, bankAccount, ifscCode } = req.body;

    const accountant = await Accountant.findByIdAndUpdate(
      req.params.id,
      { 
        qualification, 
        experience, 
        bankAccount,
        ifscCode,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!accountant) {
      return res.status(404).json({ message: 'Accountant not found' });
    }

    res.json({ message: 'Accountant updated successfully', accountant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete accountant
export const deleteAccountant = async (req, res) => {
  try {
    const accountant = await Accountant.findByIdAndDelete(req.params.id);

    if (!accountant) {
      return res.status(404).json({ message: 'Accountant not found' });
    }

    res.json({ message: 'Accountant deleted successfully', accountant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAllAccountants, getAccountantById, createAccountant, updateAccountant, deleteAccountant };
