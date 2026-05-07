import User from './models/User.js';
import Student from './models/Student.js';
import Teacher from './models/Teacher.js';
import Accountant from './models/Accountant.js';
import Librarian from './models/Librarian.js';
import TransportManager from './models/TransportManager.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Clearing existing data...');
    // Drop collections completely to reset all indexes
    try {
      await User.collection.deleteMany({});
      await User.collection.drop();
    } catch (e) {
      console.log('User collection already empty or dropped');
    }
    
    try {
      await Student.collection.deleteMany({});
      await Student.collection.drop();
    } catch (e) {
      console.log('Student collection already empty or dropped');
    }
    
    try {
      await Teacher.collection.deleteMany({});
      await Teacher.collection.drop();
    } catch (e) {
      console.log('Teacher collection already empty or dropped');
    }
    
    try {
      await Accountant.collection.deleteMany({});
      await Accountant.collection.drop();
    } catch (e) {
      console.log('Accountant collection already empty or dropped');
    }
    
    try {
      await Librarian.collection.deleteMany({});
      await Librarian.collection.drop();
    } catch (e) {
      console.log('Librarian collection already empty or dropped');
    }
    
    try {
      await TransportManager.collection.deleteMany({});
      await TransportManager.collection.drop();
    } catch (e) {
      console.log('TransportManager collection already empty or dropped');
    }
    
    // ==================== CREATE USERS ====================
    console.log('Creating users...');
    
    const adminUser = await new User({
      name: 'Admin User',
      email: 'admin@school.com',
      password: 'password123',
      role: 'admin',
      phone: '1234567890',
      isActive: true
    }).save();

    // ==================== STUDENTS ====================
    console.log('Creating students...');
    
    const studentsData = [
      {
        name: 'Aarav Singh',
        email: 'aarav.singh@school.com',
        password: 'password123',
        phone: '9876543210',
        role: 'student',
        isActive: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@school.com',
        password: 'password123',
        phone: '9876543211',
        role: 'student',
        isActive: true
      },
      {
        name: 'Rohan Verma',
        email: 'rohan.verma@school.com',
        password: 'password123',
        phone: '9876543212',
        role: 'student',
        isActive: true
      },
      {
        name: 'Anjali Patel',
        email: 'anjali.patel@school.com',
        password: 'password123',
        phone: '9876543213',
        role: 'student',
        isActive: true
      },
      {
        name: 'Arjun Kumar',
        email: 'arjun.kumar@school.com',
        password: 'password123',
        phone: '9876543214',
        role: 'student',
        isActive: true
      }
    ];

    const studentUsers = [];
    for (const userData of studentsData) {
      const user = await new User(userData).save();
      studentUsers.push(user);
    }

    // Create student profiles
    const studentProfiles = [
      {
        studentId: `STU001`,
        userId: studentUsers[0]._id,
        name: 'Aarav Singh',
        class: '10',
        section: 'A',
        rollNumber: 1,
        gender: 'Male',
        dateOfBirth: '2010-05-15',
        parentName: 'Rajesh Singh',
        parentEmail: 'rajesh.singh@email.com',
        parentContact: '9898989898',
        emergencyContact: '9797979797',
        address: '123 Main Street, City Center, State 123456',
        bloodGroup: 'O+',
        aadharNumber: '123456789012',
        category: 'General',
        nationality: 'Indian',
        previousSchool: 'Viking Public School',
        admissionDate: '2024-06-01',
        transportRequired: true
      },
      {
        studentId: `STU002`,
        userId: studentUsers[1]._id,
        name: 'Priya Sharma',
        class: '10',
        section: 'A',
        rollNumber: 2,
        gender: 'Female',
        dateOfBirth: '2010-08-22',
        parentName: 'Vikram Sharma',
        parentEmail: 'vikram.sharma@email.com',
        parentContact: '9898989899',
        emergencyContact: '9797979798',
        address: '456 Oak Avenue, Park District, State 654321',
        bloodGroup: 'A+',
        aadharNumber: '234567890123',
        category: 'General',
        nationality: 'Indian',
        previousSchool: 'Delhi Public School',
        admissionDate: '2024-06-01',
        transportRequired: false
      },
      {
        studentId: `STU003`,
        userId: studentUsers[2]._id,
        name: 'Rohan Verma',
        class: '10',
        section: 'B',
        rollNumber: 3,
        gender: 'Male',
        dateOfBirth: '2010-03-10',
        parentName: 'Suresh Verma',
        parentEmail: 'suresh.verma@email.com',
        parentContact: '9898989900',
        emergencyContact: '9797979799',
        address: '789 Elm Road, Garden Area, State 789012',
        bloodGroup: 'B+',
        aadharNumber: '345678901234',
        category: 'OBC',
        nationality: 'Indian',
        previousSchool: 'St. Paul School',
        admissionDate: '2024-06-01',
        transportRequired: true
      },
      {
        studentId: `STU004`,
        userId: studentUsers[3]._id,
        name: 'Anjali Patel',
        class: '10',
        section: 'B',
        rollNumber: 4,
        gender: 'Female',
        dateOfBirth: '2010-11-30',
        parentName: 'Hardik Patel',
        parentEmail: 'hardik.patel@email.com',
        parentContact: '9898989901',
        emergencyContact: '9797979800',
        address: '321 Pine Street, Valley District, State 345678',
        bloodGroup: 'AB+',
        aadharNumber: '456789012345',
        category: 'General',
        nationality: 'Indian',
        previousSchool: 'Greenwood Academy',
        admissionDate: '2024-06-01',
        transportRequired: false
      },
      {
        studentId: `STU005`,
        userId: studentUsers[4]._id,
        name: 'Arjun Kumar',
        class: '9',
        section: 'A',
        rollNumber: 5,
        gender: 'Male',
        dateOfBirth: '2011-01-18',
        parentName: 'Amit Kumar',
        parentEmail: 'amit.kumar@email.com',
        parentContact: '9898989902',
        emergencyContact: '9797979801',
        address: '654 Maple Drive, Mountain View, State 987654',
        bloodGroup: 'O-',
        aadharNumber: '567890123456',
        category: 'SC',
        nationality: 'Indian',
        previousSchool: 'Central School',
        admissionDate: '2024-06-01',
        transportRequired: true
      }
    ];

    for (const profile of studentProfiles) {
      await new Student(profile).save();
    }

    // ==================== TEACHERS ====================
    console.log('Creating teachers...');
    
    const teachersData = [
      {
        name: 'John David',
        email: 'john.david@school.com',
        password: 'password123',
        phone: '8765432100',
        role: 'teacher',
        isActive: true
      },
      {
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@school.com',
        password: 'password123',
        phone: '8765432101',
        role: 'teacher',
        isActive: true
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@school.com',
        password: 'password123',
        phone: '8765432102',
        role: 'teacher',
        isActive: true
      }
    ];

    const teacherUsers = [];
    for (const userData of teachersData) {
      const user = await new User(userData).save();
      teacherUsers.push(user);
    }

    // Create teacher profiles
    const teacherProfiles = [
      {
        teacherId: `TCH001`,
        userId: teacherUsers[0]._id,
        name: 'John David',
        email: 'john.david@school.com',
        phone: 8765432100,
        qualification: 'B.Sc, B.Ed',
        subjects: ['Mathematics', 'Physics'],
        classes: ['10'],
        sections: ['A', 'B'],
        experience: 8,
        employmentType: 'full-time',
        isClassTeacher: true,
        classTeacherOf: '10'
      },
      {
        teacherId: `TCH002`,
        userId: teacherUsers[1]._id,
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@school.com',
        phone: 8765432101,
        qualification: 'B.A, M.A, B.Ed',
        subjects: ['English', 'History'],
        classes: ['9', '10'],
        sections: ['A', 'B'],
        experience: 12,
        employmentType: 'full-time',
        isClassTeacher: true,
        classTeacherOf: '9'
      },
      {
        teacherId: `TCH003`,
        userId: teacherUsers[2]._id,
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@school.com',
        phone: 8765432102,
        qualification: 'B.Sc, B.Ed',
        subjects: ['Chemistry', 'Biology'],
        classes: ['9', '10'],
        sections: ['B'],
        experience: 5,
        employmentType: 'full-time',
        isClassTeacher: false,
        classTeacherOf: ''
      }
    ];

    for (const profile of teacherProfiles) {
      await new Teacher(profile).save();
    }

    // ==================== STAFF ====================
    console.log('Creating staff members...');
    
    // Accountant
    const accountantUser = await new User({
      name: 'Priya Desai',
      email: 'accountant@school.com',
      password: 'password123',
      phone: '7654321000',
      role: 'accountant',
      isActive: true
    }).save();

    await new Accountant({
      accountantId: `ACC001`,
      userId: accountantUser._id,
      name: 'Priya Desai',
      qualification: 'B.Com, M.Com',
      experience: 10,
      bankAccount: '9876543210123456',
      ifscCode: 'SBIN0001234',
      department: 'Finance',
      phone: 7654321000,
      email: 'accountant@school.com',
      gender: 'Female',
      dateOfBirth: '1990-03-15'
    }).save();

    // Librarian
    const librarianUser = await new User({
      name: 'Alok Gupta',
      email: 'librarian@school.com',
      password: 'password123',
      phone: '7654321001',
      role: 'librarian',
      isActive: true
    }).save();

    await new Librarian({
      librarianId: 'LIB001',
      userId: librarianUser._id,
      name: 'Alok Gupta',
      qualification: 'B.Lib, M.Lib',
      experience: 7,
      phone: '7654321001',
      email: 'librarian@school.com',
      specialization: 'Research',
      department: 'Library'
    }).save();

    // Transport Manager
    const transportUser = await new User({
      name: 'David Brown',
      email: 'transport@school.com',
      password: 'password123',
      phone: '7654321002',
      role: 'transport_manager',
      isActive: true
    }).save();

    await new TransportManager({
      transportManagerId: 'TMP001',
      userId: transportUser._id,
      name: 'David Brown',
      qualification: 'Diploma in Transport Management',
      experience: 6,
      phone: '7654321002',
      email: 'transport@school.com',
      licenseNumber: 'TM/54321',
      licenseExpiry: '2025-12-31',
      department: 'Transport'
    }).save();

    // ==================== PARENT ====================
    console.log('Creating parent...');
    
    await new User({
      name: 'Parent User',
      email: 'parent@school.com',
      password: 'password123',
      phone: '9000000000',
      role: 'parent',
      isActive: true
    }).save();

    console.log('\n✓ Database seeded successfully!');
    console.log('\n========================================');
    console.log('        TEST CREDENTIALS');
    console.log('========================================');
    console.log('\n🔐 ADMIN:');
    console.log('   Email: admin@school.com');
    console.log('   Password: password123');
    
    console.log('\n👨‍🎓 STUDENTS (5):');
    studentsData.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.email} / password123`);
    });

    console.log('\n👨‍🏫 TEACHERS (3):');
    teachersData.forEach((teacher, index) => {
      console.log(`   ${index + 1}. ${teacher.email} / password123`);
    });

    console.log('\n👔 STAFF:');
    console.log('   Accountant: accountant@school.com / password123');
    console.log('   Librarian: librarian@school.com / password123');
    console.log('   Transport Manager: transport@school.com / password123');

    console.log('\n👨‍👩‍👧 PARENT:');
    console.log('   Email: parent@school.com / password123');
    
    console.log('\n========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();
