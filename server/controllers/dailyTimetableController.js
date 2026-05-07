import Timetable from '../models/Timetable.js';
import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';
import ClassSubjectTeacher from '../models/ClassSubjectTeacher.js';
import PDFDocument from 'pdfkit';

// Generate timetable for a class intelligently using teacher-subject assignments
export const generateTimetableForClass = async (req, res) => {
  try {
    const { classId, academicYear, startTime = '09:00', endTime = '16:00', slotDuration = 60 } = req.body;

    if (!classId || !academicYear) {
      return res.status(400).json({ 
        success: false, 
        message: 'classId and academicYear are required' 
      });
    }

    console.log(`\n📋 TIMETABLE GENERATION STARTED`);
    console.log(`🔍 Class ID: ${classId}, Academic Year: ${academicYear}`);

    // Get class details
    const classDetails = await Class.findById(classId).populate('subjects');
    if (!classDetails) {
      console.log(`❌ Class not found: ${classId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    console.log(`✓ Class Found: ${classDetails.className}-${classDetails.section}`);

    // Extract className and section for looking up teacher assignments
    const className = classDetails.className;
    const section = classDetails.section;

    // Get class subjects
    const classSubjects = classDetails.subjects || [];
    console.log(`📚 Class has ${classSubjects.length} subjects:`, classSubjects.map(s => s.name).join(', '));

    // Get teacher-subject assignments for this class from ClassSubjectTeacher model
    console.log(`\n🔍 Looking for teacher assignments for: ${className}-${section}...`);
    const teacherAssignments = await ClassSubjectTeacher.find({
      className,
      section,
      assignmentType: 'subject_teacher',
      isActive: true
    }).populate('teacherId', '_id firstName lastName');

    console.log(`✓ Found ${teacherAssignments.length} teacher assignments`);

    if (teacherAssignments.length === 0) {
      console.log(`❌ No teacher-subject assignments found`);
      return res.status(400).json({ 
        success: false, 
        message: `❌ No teacher-subject assignments found for class ${className}-${section}.\n\nSteps to fix:\n1. Go to: Teacher → My Assignments\n2. Click "Add Assignment"\n3. Select class ${className}-${section}\n4. Check subjects they teach\n5. Click "Create Assignment"\n6. Repeat for all teachers\n7. Then return here and generate timetable` 
      });
    }

    // Create a mapping of subjects to teachers
    const subjectToTeacherMap = {};
    console.log(`\n📊 Building subject-to-teacher mapping...`);
    
    for (const assignment of teacherAssignments) {
      const teacherName = assignment.teacherId ? `${assignment.teacherId.firstName || assignment.teacherId.name || 'Unknown'} ${assignment.teacherId.lastName || ''}`.trim() : 'Unknown';
      console.log(`  👨‍🏫 ${teacherName} teaches: ${assignment.subjects.join(', ')}`);

      for (const subject of assignment.subjects) {
        subjectToTeacherMap[subject] = assignment.teacherId;
      }
    }

    console.log(`✓ Subject-to-teacher map created with ${Object.keys(subjectToTeacherMap).length} mappings`);

    // Verify all class subjects have teachers assigned
    const unmappedSubjects = classSubjects.filter(
      s => !subjectToTeacherMap[s.name]
    );
    
    if (unmappedSubjects.length > 0) {
      console.log(`❌ Unmapped subjects found:`, unmappedSubjects.map(s => s.name).join(', '));
      return res.status(400).json({ 
        success: false, 
        message: `❌ The following subjects don't have teachers assigned:\n\n${unmappedSubjects.map(s => `• ${s.name}`).join('\n')}\n\nPlease ask these teachers to create their subject assignments.` 
      });
    }

    // Delete existing timetable for this class
    await Timetable.deleteMany({ classId, academicYear });
    console.log(`🗑️  Cleared previous timetable data`);

    // Working days (Monday to Saturday)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const generatedEntries = [];
    const subjects = classSubjects;

    if (subjects.length === 0) {
      console.log(`❌ No subjects in class`);
      return res.status(400).json({ 
        success: false, 
        message: 'No subjects assigned to this class' 
      });
    }

    // Time slots within working hours
    const timeSlots = generateTimeSlots(startTime, endTime, slotDuration);
    console.log(`⏰ Generated ${timeSlots.length} time slots from ${startTime} to ${endTime}`);

    // Distribute subjects across week
    let subjectIndex = 0;
    let skippedCount = 0;
    let conflictCount = 0;

    console.log(`\n⏳ Scheduling classes...`);

    for (const day of days) {
      for (const timeSlot of timeSlots) {
        if (subjects.length === 0) break;

        const subject = subjects[subjectIndex % subjects.length];
        const subjectName = subject.name;
        
        // Get the teacher assigned to this subject
        const assignedTeacher = subjectToTeacherMap[subjectName];
        
        if (!assignedTeacher) {
          skippedCount++;
          subjectIndex++;
          continue;
        }

        // Check for teacher availability (conflict detection)
        const teacherConflict = await Timetable.findOne({
          teacherId: assignedTeacher._id,
          day,
          academicYear,
          $or: [
            { startTime: { $lt: timeSlot.endTime }, endTime: { $gt: timeSlot.startTime } }
          ]
        });

        if (teacherConflict) {
          conflictCount++;
          subjectIndex++;
          continue;
        }

        const timetableEntry = new Timetable({
          classId,
          subject: subject._id,
          teacherId: assignedTeacher._id,
          day,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          room: `${classDetails.className}-${classDetails.section}`,
          academicYear
        });

        await timetableEntry.save();
        generatedEntries.push(timetableEntry);

        console.log(`  ✓ ${day} ${timeSlot.startTime}-${timeSlot.endTime}: ${subjectName}`);

        subjectIndex++;
      }
    }

    console.log(`\n📈 GENERATION COMPLETE`);
    console.log(`✓ Scheduled entries: ${generatedEntries.length}`);
    console.log(`⚠️  Skipped (no teacher): ${skippedCount}`);
    console.log(`🚫 Conflicts avoided: ${conflictCount}`);

    if (generatedEntries.length === 0) {
      console.log(`❌ Failed - No classes could be scheduled`);
      return res.status(400).json({ 
        success: false, 
        message: `❌ Could not generate timetable - all time slots had teacher conflicts.\n\nTroubleshooting:\n• Try different time slots\n• Reduce slot duration\n• Check if teachers are available\n• Verify teacher assignments` 
      });
    }

    const response = {
      success: true,
      message: `✓ Timetable generated with ${generatedEntries.length} entries`,
      data: {
        classId,
        academicYear,
        className: `${className}-${section}`,
        totalEntries: generatedEntries.length,
        daysScheduled: days.length,
        subjectsScheduled: subjects.length,
        teacherAssignmentsUsed: teacherAssignments.length,
        generationStats: {
          scheduled: generatedEntries.length,
          skipped: skippedCount,
          conflicts: conflictCount
        }
      }
    };

    console.log(`✅ Response sent`);
    res.status(201).json(response);
  } catch (error) {
    console.error(`\n❌ ERROR during timetable generation:`, error);
    res.status(500).json({ 
      success: false, 
      message: `Server error: ${error.message}` 
    });
  }
};

// Helper: Generate time slots
const generateTimeSlots = (startTime, endTime, duration) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    
    let nextMin = currentMin + duration;
    let nextHour = currentHour;
    if (nextMin >= 60) {
      nextHour += Math.floor(nextMin / 60);
      nextMin = nextMin % 60;
    }

    if (nextHour > endHour || (nextHour === endHour && nextMin > endMin)) {
      nextHour = endHour;
      nextMin = endMin;
    }

    const slotEnd = `${String(nextHour).padStart(2, '0')}:${String(nextMin).padStart(2, '0')}`;

    slots.push({ startTime: slotStart, endTime: slotEnd });

    currentHour = nextHour;
    currentMin = nextMin;

    if (currentHour >= endHour) break;
  }

  return slots;
};

// Get all timetables with pagination and filtering
export const getAllTimetables = async (req, res) => {
  try {
    const { classId, teacherId, academicYear, day, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (classId) filter.classId = classId;
    if (teacherId) filter.teacherId = teacherId;
    if (academicYear) filter.academicYear = academicYear;
    if (day) filter.day = day;

    const skip = (page - 1) * limit;
    
    const timetables = await Timetable.find(filter)
      .populate('classId', 'className section')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email')
      .sort({ day: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Timetable.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: timetables,
      pagination: { page, limit, total, pages }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate if a class can have timetable generated
export const validateGenerationPrerequisites = async (req, res) => {
  try {
    const { classId, academicYear } = req.body;

    if (!classId || !academicYear) {
      return res.status(400).json({ 
        success: false, 
        message: 'classId and academicYear are required' 
      });
    }

    // Minimal checks: class exists, has subjects, and at least one teacher assignment
    const classDetails = await Class.findById(classId).populate('subjects');
    if (!classDetails) {
      return res.status(200).json({ success: false, canGenerate: false, issues: ['Class not found'] });
    }

    if (!classDetails.subjects || classDetails.subjects.length === 0) {
      return res.status(200).json({ success: false, canGenerate: false, issues: ['Class has no subjects assigned'] });
    }

    const teacherAssignments = await ClassSubjectTeacher.find({
      className: classDetails.className,
      section: classDetails.section,
      assignmentType: 'subject_teacher',
      isActive: true
    }).populate('teacherId', '_id firstName lastName');

    if (!teacherAssignments || teacherAssignments.length === 0) {
      return res.status(200).json({ 
        success: false, 
        canGenerate: false, 
        issues: [`No teacher-subject assignments found for class ${classDetails.className}-${classDetails.section}`] 
      });
    }

    // Simple pass: enough to generate
    const result = {
      success: true,
      canGenerate: true,
      message: `✓ Class ${classDetails.className}-${classDetails.section} ready for timetable generation`,
      info: {
        className: `${classDetails.className}-${classDetails.section}`,
        subjectCount: classDetails.subjects.length,
        assignmentCount: teacherAssignments.length,
        teacherAssignments: teacherAssignments.map(a => {
          const teacherName = a.teacherId && a.teacherId._id
            ? `${a.teacherId.firstName || 'Unknown'} ${a.teacherId.lastName || ''}`.trim()
            : 'Unknown';
          return {
            teacher: teacherName,
            subjects: (a.subjects || []).join(', ')
          };
        })
      }
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error(`❌ Validation error:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get timetable for a specific class
export const getClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;

    const timetable = await Timetable.find({ classId, academicYear })
      .populate('classId', 'className section totalStudents')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email department')
      .sort({ day: 1, startTime: 1 });

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    // Format timetable by day
    const formattedTimetable = {
      classDetails: timetable[0]?.classId,
      academicYear,
      schedule: {}
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => {
      formattedTimetable.schedule[day] = timetable.filter(t => t.day === day);
    });

    res.status(200).json({ success: true, data: formattedTimetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student's timetable (based on their class)
export const getStudentTimetable = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { academicYear } = req.query;

    // Get student's class
    const Student = require('../models/Student.js').default;
    const student = await Student.findById(studentId).select('classId');
    if (!student || !student.classId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student or class not found' 
      });
    }

    // Get timetable for student's class
    const timetable = await Timetable.find({ 
      classId: student.classId,
      academicYear: academicYear || new Date().getFullYear().toString()
    })
      .populate('classId', 'className section totalStudents')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email department')
      .sort({ day: 1, startTime: 1 });

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    // Get teacher assignments for this class
    const classData = timetable[0]?.classId;
    const teacherAssignments = await ClassSubjectTeacher.find({
      className: classData.className,
      section: classData.section,
      assignmentType: 'subject_teacher',
      isActive: true
    }).populate('teacherId', 'firstName lastName email');

    // Format timetable by day
    const formattedTimetable = {
      classDetails: classData,
      academicYear: academicYear || new Date().getFullYear().toString(),
      schedule: {},
      teacherAssignments: teacherAssignments
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => {
      formattedTimetable.schedule[day] = timetable.filter(t => t.day === day);
    });

    res.status(200).json({ success: true, data: formattedTimetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get teacher's timetable
export const getTeacherTimetable = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { academicYear } = req.query;

    // Get teacher's timetable
    const timetable = await Timetable.find({ 
      teacherId,
      academicYear: academicYear || new Date().getFullYear().toString()
    })
      .populate('classId', 'className section totalStudents')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email department')
      .sort({ day: 1, startTime: 1 });

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    // Format timetable by day with class grouping
    const formattedTimetable = {
      teacherInfo: timetable[0]?.teacherId,
      academicYear: academicYear || new Date().getFullYear().toString(),
      schedule: {}
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => {
      formattedTimetable.schedule[day] = timetable.filter(t => t.day === day);
    });

    res.status(200).json({ success: true, data: formattedTimetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download timetable as PDF
export const downloadTimetablePDF = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;

    const timetable = await Timetable.find({ classId, academicYear })
      .populate('classId', 'className section totalStudents')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName')
      .sort({ day: 1, startTime: 1 });

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    const className = timetable[0].classId.className;
    const section = timetable[0].classId.section;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="timetable-${className}-${section}.pdf"`);

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.pipe(res);

    // Header
    doc.fontSize(18).text('School Timetable', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).text(`${className} - ${section}    Academic Year: ${academicYear}`, { align: 'center' });
    doc.moveDown(1);

    // Table header
    const startX = doc.x;
    const timeX = startX;
    const subjectX = startX + 100;
    const teacherX = startX + 320;
    const roomX = startX + 460;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const day of days) {
      const dayEntries = timetable.filter(t => t.day === day);

      doc.moveDown(0.5);
      doc.fontSize(13).fillColor('#111827').text(day, { underline: true });
      doc.moveDown(0.2);

      if (!dayEntries || dayEntries.length === 0) {
        doc.fontSize(10).fillColor('#374151').text('No classes scheduled', { indent: 10 });
        continue;
      }

      // Column headings
      doc.fontSize(10).fillColor('#111827');
      doc.text('Time', timeX, doc.y, { width: 90 });
      doc.text('Subject', subjectX, doc.y, { width: 200 });
      doc.text('Teacher', teacherX, doc.y, { width: 130 });
      doc.text('Room', roomX, doc.y, { width: 80 });
      doc.moveDown(0.3);

      // Rows
      for (const entry of dayEntries) {
        const y = doc.y;
        const timeStr = `${entry.startTime} - ${entry.endTime}`;
        const subjectStr = entry.subject?.subjectName || '';
        const teacherStr = entry.teacherId ? `${entry.teacherId.firstName || ''} ${entry.teacherId.lastName || ''}`.trim() : 'Unknown';
        const roomStr = entry.room || '';

        doc.fontSize(10).fillColor('#374151');
        doc.text(timeStr, timeX, y, { width: 90 });
        doc.text(subjectStr, subjectX, y, { width: 200 });
        doc.text(teacherStr, teacherX, y, { width: 130 });
        doc.text(roomStr, roomX, y, { width: 80 });
        doc.moveDown(0.5);

        // Add page break if near bottom
        if (doc.y > doc.page.height - 80) {
          doc.addPage();
        }
      }
    }

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download timetable as CSV
export const downloadTimetableCSV = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;

    const timetable = await Timetable.find({ classId, academicYear })
      .populate('classId', 'className section')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName')
      .sort({ day: 1, startTime: 1 });

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    // Generate CSV
    let csvContent = 'Day,Time,Subject,Teacher,Room,Academic Year\n';
    timetable.forEach(entry => {
      csvContent += `${entry.day},${entry.startTime}-${entry.endTime},${entry.subject.subjectName},"${entry.teacherId.firstName} ${entry.teacherId.lastName}",${entry.room},${academicYear}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="timetable.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create timetable entry manually
export const createTimetable = async (req, res) => {
  try {
    const { classId, subject, teacherId, day, startTime, endTime, room, academicYear } = req.body;

    // Validate required fields
    if (!classId || !subject || !teacherId || !day || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check for time conflicts
    const conflictStudent = await Timetable.findOne({
      classId,
      day,
      academicYear,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictStudent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Time slot conflicts with another class for this timetable' 
      });
    }

    // Check teacher availability
    const conflictTeacher = await Timetable.findOne({
      teacherId,
      day,
      academicYear,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictTeacher) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher is not available at this time' 
      });
    }

    const timetable = new Timetable({
      classId,
      subject,
      teacherId,
      day,
      startTime,
      endTime,
      room,
      academicYear: academicYear || new Date().getFullYear().toString()
    });

    await timetable.save();

    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate('classId', 'className section')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email');

    res.status(201).json({ 
      success: true, 
      message: 'Timetable entry created',
      data: populatedTimetable 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update timetable entry
export const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { classId, subject, teacherId, day, startTime, endTime, room, academicYear } = req.body;

    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    // Check for time conflicts with new times (if changed)
    if (day !== timetable.day || startTime !== timetable.startTime || endTime !== timetable.endTime) {
      const conflictStudent = await Timetable.findOne({
        _id: { $ne: id },
        classId: classId || timetable.classId,
        day: day || timetable.day,
        academicYear: academicYear || timetable.academicYear,
        $or: [
          { startTime: { $lt: endTime || timetable.endTime }, endTime: { $gt: startTime || timetable.startTime } }
        ]
      });

      if (conflictStudent) {
        return res.status(400).json({ 
          success: false, 
          message: 'Time slot conflicts with another class' 
        });
      }

      const conflictTeacher = await Timetable.findOne({
        _id: { $ne: id },
        teacherId: teacherId || timetable.teacherId,
        day: day || timetable.day,
        academicYear: academicYear || timetable.academicYear,
        $or: [
          { startTime: { $lt: endTime || timetable.endTime }, endTime: { $gt: startTime || timetable.startTime } }
        ]
      });

      if (conflictTeacher) {
        return res.status(400).json({ 
          success: false, 
          message: 'Teacher is not available at this time' 
        });
      }
    }

    // Update fields
    timetable.classId = classId || timetable.classId;
    timetable.subject = subject || timetable.subject;
    timetable.teacherId = teacherId || timetable.teacherId;
    timetable.day = day || timetable.day;
    timetable.startTime = startTime || timetable.startTime;
    timetable.endTime = endTime || timetable.endTime;
    timetable.room = room || timetable.room;
    timetable.academicYear = academicYear || timetable.academicYear;
    timetable.updatedAt = new Date();

    await timetable.save();

    const updatedTimetable = await Timetable.findById(id)
      .populate('classId', 'className section')
      .populate('subject', 'subjectName code')
      .populate('teacherId', 'firstName lastName email');

    res.status(200).json({ 
      success: true, 
      message: 'Timetable updated',
      data: updatedTimetable 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete timetable entry
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findByIdAndDelete(id);
    if (!timetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Timetable deleted' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate timetable (check for conflicts)
export const validateTimetable = async (req, res) => {
  try {
    const { classId, academicYear } = req.body;

    if (!classId || !academicYear) {
      return res.status(400).json({ 
        success: false, 
        message: 'classId and academicYear are required' 
      });
    }

    const timetable = await Timetable.find({ classId, academicYear })
      .populate('teacherId', 'firstName lastName');

    const conflicts = [];
    
    // Check for teacher conflicts
    timetable.forEach(entry1 => {
      timetable.forEach(entry2 => {
        if (entry1._id.toString() !== entry2._id.toString() &&
            entry1.teacherId._id.toString() === entry2.teacherId._id.toString() &&
            entry1.day === entry2.day &&
            entry1.startTime === entry2.startTime) {
          conflicts.push({
            type: 'teacher_conflict',
            teacher: `${entry1.teacherId.firstName} ${entry1.teacherId.lastName}`,
            day: entry1.day,
            time: entry1.startTime,
            classes: [entry1.classId, entry2.classId]
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      data: {
        isValid: conflicts.length === 0,
        conflicts,
        totalEntries: timetable.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
