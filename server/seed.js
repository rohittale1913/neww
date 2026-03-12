import User from './models/User.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Clearing existing users...');
    await User.deleteMany({});
    
    const users = [
      {
        name: 'Admin User',
        email: 'admin@school.com',
        password: 'password123',
        role: 'admin',
        phone: '1234567890',
        isActive: true
      },
      {
        name: 'John Doe',
        email: 'john@school.com',
        password: 'password123',
        role: 'teacher',
        phone: '9876543210',
        isActive: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@school.com',
        password: 'password123',
        role: 'student',
        phone: '5555555555',
        isActive: true
      },
      {
        name: 'Raj Patel',
        email: 'accountant@school.com',
        password: 'password123',
        role: 'accountant',
        phone: '4444444444',
        isActive: true
      },
      {
        name: 'Sarah Wilson',
        email: 'librarian@school.com',
        password: 'password123',
        role: 'librarian',
        phone: '3333333333',
        isActive: true
      },
      {
        name: 'Mike Johnson',
        email: 'transport@school.com',
        password: 'password123',
        role: 'transport_manager',
        phone: '2222222222',
        isActive: true
      },
      {
        name: 'Parent User',
        email: 'parent@school.com',
        password: 'password123',
        role: 'parent',
        phone: '1111111111',
        isActive: true
      }
    ];

    console.log('Creating users...');
    // Use create() instead of insertMany() to trigger pre-save middleware
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    
    console.log('✓ Database seeded successfully!');
    console.log('\n========================================');
    console.log('        TEST CREDENTIALS');
    console.log('========================================');
    console.log('-------------------');
    users.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
