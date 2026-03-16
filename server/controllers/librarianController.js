import Librarian from '../models/Librarian.js';
import User from '../models/User.js';

// Get all librarians
export const getAllLibrarians = async (req, res) => {
  try {
    const librarians = await Librarian.find()
      .populate('userId', 'name email phone role')
      .lean()
      .sort({ createdAt: -1 });
    
    // Ensure email and phone are populated from userId if not already set
    const enrichedLibrarians = librarians.map(librarian => ({
      ...librarian,
      email: librarian.email || librarian.userId?.email || '-',
      phone: librarian.phone || librarian.userId?.phone || '-'
    }));
    
    res.json(enrichedLibrarians);
  } catch (error) {
    console.error('Error fetching librarians:', error);
    res.status(500).json({ message: 'Failed to fetch librarians', error: error.message });
  }
};

// Get librarian by ID
export const getLibrarianById = async (req, res) => {
  try {
    const librarian = await Librarian.findById(req.params.id)
      .populate('userId', 'name email phone role')
      .lean();
    if (!librarian) {
      return res.status(404).json({ message: 'Librarian not found' });
    }
    
    // Ensure email and phone are populated from userId if not already set
    const enrichedLibrarian = {
      ...librarian,
      email: librarian.email || librarian.userId?.email || '-',
      phone: librarian.phone || librarian.userId?.phone || '-'
    };
    
    res.json(enrichedLibrarian);
  } catch (error) {
    console.error('Error fetching librarian:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new librarian
export const createLibrarian = async (req, res) => {
  try {
    const { userId, qualification, experience, specialization } = req.body;

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Fetch user to verify exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique librarian ID with more entropy
    let librarianId;
    let isDuplicate = true;
    let attempts = 0;
    
    while (isDuplicate && attempts < 5) {
      librarianId = `LIB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const existingLibrarian = await Librarian.findOne({ librarianId });
      isDuplicate = !!existingLibrarian;
      attempts++;
    }

    if (isDuplicate) {
      return res.status(500).json({ message: 'Failed to generate unique librarian ID after multiple attempts' });
    }

    // Create librarian
    const librarian = new Librarian({
      librarianId,
      userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      qualification: qualification || '',
      experience: experience || 0,
      specialization: specialization || ''
    });

    await librarian.save();

    res.status(201).json({
      message: 'Librarian profile created successfully',
      librarian
    });
  } catch (error) {
    console.error('Error creating librarian:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `A librarian with this ${field} already exists` });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message || 'Failed to create librarian profile' });
  }
};

// Update librarian
export const updateLibrarian = async (req, res) => {
  try {
    const { name, email, phone, qualification, experience, specialization, booksManaged, libraryArea, department } = req.body;

    // Find the librarian record
    const librarian = await Librarian.findById(req.params.id);
    if (!librarian) {
      return res.status(404).json({ message: 'Librarian not found' });
    }

    // Update the User record (name, email, phone)
    if (librarian.userId) {
      await User.findByIdAndUpdate(
        librarian.userId,
        { 
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          updatedAt: Date.now()
        },
        { new: true }
      );
    }

    // Update the Librarian record
    const updatedLibrarian = await Librarian.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || librarian.name,
        qualification: qualification !== undefined ? qualification : librarian.qualification,
        experience: experience !== undefined ? experience : librarian.experience,
        specialization: specialization !== undefined ? specialization : librarian.specialization,
        booksManaged: booksManaged !== undefined ? booksManaged : librarian.booksManaged,
        libraryArea: libraryArea !== undefined ? libraryArea : librarian.libraryArea,
        department: department !== undefined ? department : librarian.department,
        updatedAt: Date.now()
      },
      { new: true }
    )
    .populate('userId', 'name email phone role')
    .lean();

    // Enrich with user data
    const enrichedLibrarian = {
      ...updatedLibrarian,
      email: updatedLibrarian?.email || email || '-',
      phone: updatedLibrarian?.phone || phone || '-'
    };

    res.json({ message: 'Librarian updated successfully', librarian: enrichedLibrarian });
  } catch (error) {
    console.error('Error updating librarian:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete librarian
export const deleteLibrarian = async (req, res) => {
  try {
    const librarian = await Librarian.findByIdAndDelete(req.params.id);

    if (!librarian) {
      return res.status(404).json({ message: 'Librarian not found' });
    }

    res.json({ message: 'Librarian deleted successfully', librarian });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAllLibrarians, getLibrarianById, createLibrarian, updateLibrarian, deleteLibrarian };
