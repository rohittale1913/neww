import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

// Test user credentials - replace with actual test user
const testLogin = async () => {
  try {
    console.log('🔐 Attempting login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com', // Change this to a valid admin email
      password: 'admin123'        // Change this to correct password
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

const testClassesAPI = async (token) => {
  try {
    console.log('\n📚 Fetching classes...');
    const classesRes = await axios.get(`${API_URL}/classes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Classes fetched:', classesRes.data.length, 'classes');
    
    if (classesRes.data.length > 0) {
      const firstClass = classesRes.data[0];
      console.log('\n📋 First class details:');
      console.log('  - Name:', firstClass.className);
      console.log('  - Section:', firstClass.section);
      console.log('  - Subjects count:', firstClass.subjects?.length || 0);
      console.log('  - Subjects:', firstClass.subjects);
      
      if (firstClass.subjects && firstClass.subjects.length > 0) {
        console.log('\n🔍 First subject:');
        console.log('  ', firstClass.subjects[0]);
      }
    }
    
    return classesRes.data;
  } catch (error) {
    console.error('❌ Failed to fetch classes:', error.response?.data || error.message);
    process.exit(1);
  }
};

const testSubjectsAPI = async (token) => {
  try {
    console.log('\n📖 Fetching subjects...');
    const subjectsRes = await axios.get(`${API_URL}/classes/subjects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Subjects fetched:', subjectsRes.data.length, 'subjects');
    
    if (subjectsRes.data.length > 0) {
      console.log('\n📋 First 3 subjects:');
      subjectsRes.data.slice(0, 3).forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.name} (${s.code}) - ID: ${s._id}`);
      });
    }
    
    return subjectsRes.data;
  } catch (error) {
    console.error('❌ Failed to fetch subjects:', error.response?.data || error.message);
    process.exit(1);
  }
};

const runTests = async () => {
  try {
    console.log('🚀 Starting API tests...\n');
    const token = await testLogin();
    const classes = await testClassesAPI(token);
    const subjects = await testSubjectsAPI(token);
    
    console.log('\n✨ Tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

runTests();
