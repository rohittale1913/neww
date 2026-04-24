// Test file for student login with profile and class teacher
// Run this file with: node student-login-test.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`${colors.cyan}\n═══ ${msg} ═══${colors.reset}`),
  check: (msg) => console.log(`${colors.yellow}» ${msg}${colors.reset}`)
};

async function testStudentLogin() {
  log.section('Testing Student Login with Profile & Class Teacher');

  try {
    // Test 1: Login as student
    log.check('Testing student login...');
    const loginResponse = await client.post('/auth/login', {
      email: 'student1@school.com',
      password: 'password123'
    });

    if (loginResponse.status === 200) {
      const data = loginResponse.data;
      
      log.success('Student login successful');
      log.info(`Token: ${data.token.substring(0, 20)}...`);
      log.info(`User: ${data.user.name} (${data.user.role})`);
      
      // Store token for further requests
      const token = data.token;
      client.defaults.headers.Authorization = `Bearer ${token}`;

      // Check for student profile
      if (data.studentProfile) {
        log.success('Student profile loaded in login response');
        log.info(`Student ID: ${data.studentProfile.studentId}`);
        log.info(`Name: ${data.studentProfile.name}`);
        log.info(`Class: ${data.studentProfile.class}-${data.studentProfile.section}`);
        log.info(`Roll Number: ${data.studentProfile.rollNumber}`);
        log.info(`Parent: ${data.studentProfile.parentName}`);
      } else {
        log.error('Student profile not found in login response');
      }

      // Check for class teacher
      if (data.classTeacher) {
        log.success('Class Teacher loaded in login response');
        log.info(`Teacher ID: ${data.classTeacher.teacherId}`);
        log.info(`Teacher Name: ${data.classTeacher.name}`);
        log.info(`Email: ${data.classTeacher.email}`);
        log.info(`Phone: ${data.classTeacher.phone}`);
        log.info(`Experience: ${data.classTeacher.experience} years`);
        log.info(`Qualification: ${data.classTeacher.qualification}`);
        log.info(`Subjects: ${data.classTeacher.subjects.join(', ')}`);
      } else {\n        log.error('Class Teacher not found in login response');\n      }\n\n      // Test 2: Fetch current student profile\n      log.check('Testing fetch current student profile...');\n      const profileResponse = await client.get('/students/profile/current');\n      if (profileResponse.status === 200) {\n        log.success('Current student profile fetched successfully');\n        log.info(`Class: ${profileResponse.data.class}-${profileResponse.data.section}`);\n      }\n\n      // Test 3: Fetch student profile with class teacher\n      log.check('Testing fetch student profile with class teacher...');\n      const profileWithTeacherResponse = await client.get('/students/profile/with-teacher');\n      if (profileWithTeacherResponse.status === 200) {\n        log.success('Student profile with class teacher fetched successfully');\n        if (profileWithTeacherResponse.data.classTeacher) {\n          log.info(`Class Teacher: ${profileWithTeacherResponse.data.classTeacher.name}`);\n        } else {\n          log.check('No class teacher assigned to this class');\n        }\n      }\n\n      // Test 4: Check data structure\n      log.section('Validating Data Structure');\n      \n      const requiredStudentFields = [\n        'studentId', 'userId', 'name', 'class', 'section', 'rollNumber',\n        'gender', 'dateOfBirth', 'category', 'parentName', 'parentContact',\n        'emergencyContact', 'address'\n      ];\n\n      let missingFields = [];\n      if (data.studentProfile) {\n        requiredStudentFields.forEach(field => {\n          if (!(field in data.studentProfile)) {\n            missingFields.push(field);\n          }\n        });\n      }\n\n      if (missingFields.length === 0) {\n        log.success('All required student fields present');\n      } else {\n        log.error(`Missing student fields: ${missingFields.join(', ')}`);\n      }\n\n      if (data.classTeacher) {\n        const requiredTeacherFields = [\n          'teacherId', 'userId', 'name', 'qualification', 'experience'\n        ];\n        \n        missingFields = [];\n        requiredTeacherFields.forEach(field => {\n          if (!(field in data.classTeacher)) {\n            missingFields.push(field);\n          }\n        });\n\n        if (missingFields.length === 0) {\n          log.success('All required class teacher fields present');\n        } else {\n          log.error(`Missing class teacher fields: ${missingFields.join(', ')}`);\n        }\n      }\n\n      // Test 5: Test with different student\n      log.section('Testing Multiple Students');\n      \n      let testPassed = 0;\n      let testFailed = 0;\n\n      const testStudents = [\n        { email: 'student1@school.com', password: 'password123', name: 'Student 1' },\n        { email: 'student2@school.com', password: 'password123', name: 'Student 2' }\n      ];\n\n      for (const student of testStudents) {\n        try {\n          const response = await client.post('/auth/login', {\n            email: student.email,\n            password: student.password\n          });\n\n          if (response.data.studentProfile && response.data.classTeacher) {\n            log.success(`${student.name} - Full data loaded (Profile + Teacher)`);\n            testPassed++;\n          } else if (response.data.studentProfile) {\n            log.check(`${student.name} - Profile loaded but no teacher assigned`);\n            testPassed++;\n          } else {\n            log.error(`${student.name} - No profile found`);\n            testFailed++;\n          }\n        } catch (error) {\n          if (error.response?.status === 401) {\n            log.check(`${student.name} - Invalid credentials (expected)`);\n          } else {\n            log.error(`${student.name} - ${error.message}`);\n            testFailed++;\n          }\n        }\n      }\n\n      log.section('Test Summary');\n      log.success(`Passed: ${testPassed}`);\n      if (testFailed > 0) {\n        log.error(`Failed: ${testFailed}`);\n      }\n\n    } else {\n      log.error(`Unexpected response status: ${loginResponse.status}`);\n    }\n\n  } catch (error) {\n    if (error.response) {\n      log.error(`API Error: ${error.response.status} - ${error.response.data.message}`);\n    } else if (error.code === 'ECONNREFUSED') {\n      log.error('Connection refused - make sure backend server is running on port 5000');\n    } else {\n      log.error(`Error: ${error.message}`);\n    }\n  }\n\n  log.section('Test Complete');\n}\n\n// Run tests\ntestStudentLogin();\n