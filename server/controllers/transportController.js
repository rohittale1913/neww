import Transport from '../models/Transport.js';
import Student from '../models/Student.js';

// Get all buses
export const getAllBuses = async (req, res) => {
  try {
    const buses = await Transport.find().populate('students', 'name studentId');
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create bus
export const createBus = async (req, res) => {
  try {
    const { busNumber, route, driverName, driverPhone, conductorName, conductorPhone, capacity, startPoint, endPoint, stops, fare, registrationNumber, insuranceProvider, insuranceExpiry } = req.body;

    const bus = new Transport({
      busNumber,
      route,
      driverName,
      driverPhone,
      conductorName,
      conductorPhone,
      capacity,
      startPoint,
      endPoint,
      stops: stops || [],
      fare,
      registrationNumber,
      insuranceProvider,
      insuranceExpiry
    });

    await bus.save();

    res.status(201).json({
      message: 'Bus created successfully',
      bus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign student to bus
export const assignStudentToBus = async (req, res) => {
  try {
    const { busId, studentId } = req.body;

    const bus = await Transport.findById(busId);

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Remove student from other buses
    await Transport.updateMany(
      { students: studentId },
      { $pull: { students: studentId } }
    );

    // Add to this bus
    if (!bus.students.includes(studentId)) {
      bus.students.push(studentId);
      await bus.save();
    }

    res.json({
      message: 'Student assigned to bus successfully',
      bus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bus details
export const getBusDetails = async (req, res) => {
  try {
    const { busId } = req.params;
    const bus = await Transport.findById(busId).populate('students', 'name rollNumber class');
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json({
      ...bus.toObject(),
      totalStudents: bus.students.length,
      emptySeats: bus.capacity - bus.students.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bus assigned to student
export const getStudentBus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const bus = await Transport.findOne({ students: studentId });
    
    if (!bus) {
      return res.status(404).json({ message: 'Student not assigned to any bus' });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update bus details
export const updateBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const updateData = req.body;

    const bus = await Transport.findByIdAndUpdate(busId, updateData, { new: true });

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json({ message: 'Bus updated successfully', bus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAllBuses, createBus, assignStudentToBus, getBusDetails, getStudentBus, updateBus };
