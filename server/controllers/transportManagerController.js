import TransportManager from '../models/TransportManager.js';
import User from '../models/User.js';

// Get all transport managers
export const getAllTransportManagers = async (req, res) => {
  try {
    const managers = await TransportManager.find()
      .populate('userId', 'name email phone role')
      .lean()
      .sort({ createdAt: -1 });
    res.json(managers);
  } catch (error) {
    console.error('Error fetching transport managers:', error);
    res.status(500).json({ message: 'Failed to fetch transport managers', error: error.message });
  }
};

// Get transport manager by ID
export const getTransportManagerById = async (req, res) => {
  try {
    const manager = await TransportManager.findById(req.params.id)
      .populate('userId', 'name email phone role')
      .lean();
    if (!manager) {
      return res.status(404).json({ message: 'Transport manager not found' });
    }
    res.json(manager);
  } catch (error) {
    console.error('Error fetching transport manager:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new transport manager
export const createTransportManager = async (req, res) => {
  try {
    const { userId, qualification, experience, licenseNumber, licenseExpiry } = req.body;

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Fetch user to verify exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique transport manager ID with more entropy
    let transportManagerId;
    let isDuplicate = true;
    let attempts = 0;
    
    while (isDuplicate && attempts < 5) {
      transportManagerId = `TRM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const existingManager = await TransportManager.findOne({ transportManagerId });
      isDuplicate = !!existingManager;
      attempts++;
    }

    if (isDuplicate) {
      return res.status(500).json({ message: 'Failed to generate unique transport manager ID after multiple attempts' });
    }

    // Create transport manager
    const manager = new TransportManager({
      transportManagerId,
      userId,
      name: user.name,
      qualification: qualification || '',
      experience: experience || 0,
      licenseNumber: licenseNumber || '',
      licenseExpiry: licenseExpiry || null
    });

    await manager.save();

    res.status(201).json({
      message: 'Transport manager profile created successfully',
      manager
    });
  } catch (error) {
    console.error('Error creating transport manager:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `A transport manager with this ${field} already exists` });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message || 'Failed to create transport manager profile' });
  }
};

// Update transport manager
export const updateTransportManager = async (req, res) => {
  try {
    const { qualification, experience, licenseNumber, licenseExpiry, busesManaged, routesManaged } = req.body;

    const manager = await TransportManager.findByIdAndUpdate(
      req.params.id,
      { 
        qualification, 
        experience, 
        licenseNumber,
        licenseExpiry,
        busesManaged,
        routesManaged,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!manager) {
      return res.status(404).json({ message: 'Transport manager not found' });
    }

    res.json({ message: 'Transport manager updated successfully', manager });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete transport manager
export const deleteTransportManager = async (req, res) => {
  try {
    const manager = await TransportManager.findByIdAndDelete(req.params.id);

    if (!manager) {
      return res.status(404).json({ message: 'Transport manager not found' });
    }

    res.json({ message: 'Transport manager deleted successfully', manager });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAllTransportManagers, getTransportManagerById, createTransportManager, updateTransportManager, deleteTransportManager };
