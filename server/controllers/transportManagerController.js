import TransportManager from '../models/TransportManager.js';
import User from '../models/User.js';

// Get all transport managers
export const getAllTransportManagers = async (req, res) => {
  try {
    const managers = await TransportManager.find()
      .populate('userId', 'name email phone role')
      .lean()
      .sort({ createdAt: -1 });
    
    // Ensure email and phone are populated from userId if not already set
    const enrichedManagers = managers.map(manager => ({
      ...manager,
      email: manager.email || manager.userId?.email || '-',
      phone: manager.phone || manager.userId?.phone || '-'
    }));
    
    res.json(enrichedManagers);
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
    
    // Ensure email and phone are populated from userId if not already set
    const enrichedManager = {
      ...manager,
      email: manager.email || manager.userId?.email || '-',
      phone: manager.phone || manager.userId?.phone || '-'
    };
    
    res.json(enrichedManager);
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
      email: user.email,
      phone: user.phone,
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
    const { name, email, phone, qualification, experience, licenseNumber, licenseExpiry, busesManaged, routesManaged, department } = req.body;

    // Find the transport manager record
    const manager = await TransportManager.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ message: 'Transport manager not found' });
    }

    // Update the User record (name, email, phone)
    if (manager.userId) {
      await User.findByIdAndUpdate(
        manager.userId,
        { 
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          updatedAt: Date.now()
        },
        { new: true }
      );
    }

    // Update the TransportManager record
    const updatedManager = await TransportManager.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || manager.name,
        qualification: qualification !== undefined ? qualification : manager.qualification,
        experience: experience !== undefined ? experience : manager.experience,
        licenseNumber: licenseNumber !== undefined ? licenseNumber : manager.licenseNumber,
        licenseExpiry: licenseExpiry !== undefined ? licenseExpiry : manager.licenseExpiry,
        busesManaged: busesManaged !== undefined ? busesManaged : manager.busesManaged,
        routesManaged: routesManaged !== undefined ? routesManaged : manager.routesManaged,
        department: department !== undefined ? department : manager.department,
        updatedAt: Date.now()
      },
      { new: true }
    )
    .populate('userId', 'name email phone role')
    .lean();

    // Enrich with user data
    const enrichedManager = {
      ...updatedManager,
      email: updatedManager?.email || email || '-',
      phone: updatedManager?.phone || phone || '-'
    };

    res.json({ message: 'Transport manager updated successfully', transportManager: enrichedManager });
  } catch (error) {
    console.error('Error updating transport manager:', error);
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
