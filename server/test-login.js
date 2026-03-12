import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await api.post('/auth/login', {
      email: 'admin@school.com',
      password: 'password123'
    });
    
    console.log('✓ Login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testLogin();
