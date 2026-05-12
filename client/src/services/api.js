import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // For FormData requests, remove the JSON content-type header
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    console.log('📋 FormData request detected - Content-Type header removed for proper multipart handling');
  }
  
  return config;
});

// Add retry logic for rate-limited requests (429 errors)
let retryCount = {};
const MAX_RETRIES = 5;
const MAX_RETRY_DELAY = 10000; // 10 seconds max

api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;

    // Handle 429 (Too Many Requests) with exponential backoff
    if (error.response?.status === 429) {
      const url = config.url;
      retryCount[url] = (retryCount[url] || 0) + 1;

      if (retryCount[url] <= MAX_RETRIES) {
        // Exponential backoff with max limit: 1s, 2s, 4s, 8s, 10s, 10s
        const delay = Math.min(Math.pow(2, retryCount[url] - 1) * 1000, MAX_RETRY_DELAY);
        console.warn(`Rate limited (429). Attempt ${retryCount[url]}/${MAX_RETRIES}. Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(config);
      } else {
        console.error(`Max retries (${MAX_RETRIES}) exceeded for rate-limited request: ${url}`);
        delete retryCount[url];
        return Promise.reject(new Error(`Rate limit exceeded after ${MAX_RETRIES} retries`));
      }
    }

    // Reset retry count on success or other errors
    if (error.config?.url) {
      delete retryCount[error.config.url];
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getAll: () => api.get('/auth/users'),
  delete: (userId) => api.delete(`/auth/users/${userId}`)
};

// Student APIs
export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  getCurrentProfile: () => api.get('/students/profile/current'),
  getProfileWithTeacher: (userId) => api.get(`/students/profile/with-teacher/${userId}`),
  getProfileWithTeacherCurrent: () => api.get('/students/profile/with-teacher'),
  getByClass: (classId) => api.get(`/students/class/${classId}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  
  // Student Module Endpoints
  getMyAttendance: (params) => api.get('/students/my-attendance', { params }),
  getMyAssignments: (filter) => api.get('/students/my-assignments', { params: { filter } }),
  getAssignmentDetail: (assignmentId) => api.get(`/students/my-assignments/${assignmentId}`),
  submitAssignment: (assignmentId, data) => api.post(`/students/my-assignments/${assignmentId}/submit`, data),
  
  // Submit assignment with file uploads
  submitAssignmentWithFiles: async (assignmentId, files, onProgress) => {
    const formData = new FormData();
    
    // Append files
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    console.log('📦 FormData prepared:');
    console.log('  - Files:', files.length);
    files.forEach((f, idx) => {
      console.log(`    [${idx}] ${f.name} (${(f.size/1024).toFixed(2)}KB, ${f.type})`);
    });
    
    return api.post(`/assignments/submit/${assignmentId}`, formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) onProgress(percent);
        }
      }
    });
  },

  getMyExams: () => api.get('/students/my-exams'),
  getExamDetail: (examId) => api.get(`/students/my-exams/${examId}`),
  getMyResults: (params) => api.get('/students/my-results', { params }),
  getMyFees: (params) => api.get('/students/my-fees', { params }),
  getMySubjects: () => api.get('/students/my-subjects')
};

// Teacher APIs
export const teacherAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
  createAssignment: (data) => api.post('/assignments', data),
  // Teacher-specific endpoints
  getMyProfile: () => api.get('/teachers/my-profile'),
  getMyClasses: () => api.get('/teachers/my-classes'),
  getClassStudents: (className) => api.get(`/teachers/class/${className}/students`),
  markAttendance: (data) => api.post('/teachers/attendance/mark', data),
  getAttendance: (params) => api.get('/teachers/attendance', { params }),
  getMyAssignments: (filter) => api.get('/teachers/my-assignments', { params: { filter } }),
  getAssignmentDetail: (assignmentId) => api.get(`/teachers/my-assignments/${assignmentId}`),
  gradeAssignment: (assignmentId, data) => api.post(`/teachers/my-assignments/${assignmentId}/grade`, data),
  getMyExams: () => api.get('/teachers/my-exams'),
  getExamDetail: (examId) => api.get(`/teachers/my-exams/${examId}`)
};

// Accountant APIs
export const accountantAPI = {
  getAll: () => api.get('/accountants'),
  getById: (id) => api.get(`/accountants/${id}`),
  create: (data) => api.post('/accountants', data),
  update: (id, data) => api.put(`/accountants/${id}`, data),
  delete: (id) => api.delete(`/accountants/${id}`)
};

// Librarian APIs
export const librarianAPI = {
  getAll: () => api.get('/librarians'),
  getById: (id) => api.get(`/librarians/${id}`),
  create: (data) => api.post('/librarians', data),
  update: (id, data) => api.put(`/librarians/${id}`, data),
  delete: (id) => api.delete(`/librarians/${id}`)
};

// Transport Manager APIs
export const transportManagerAPI = {
  getAll: () => api.get('/transport-managers'),
  getById: (id) => api.get(`/transport-managers/${id}`),
  create: (data) => api.post('/transport-managers', data),
  update: (id, data) => api.put(`/transport-managers/${id}`, data),
  delete: (id) => api.delete(`/transport-managers/${id}`)
};

// Attendance APIs
export const attendanceAPI = {
  get: (params) => api.get('/attendance', { params }),
  getAllAttendance: (params) => api.get('/attendance/all', { params }),
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  mark: (data) => api.post('/attendance', data),
  bulkMark: (data) => api.post('/attendance/bulk', data),
  getReport: (params) => api.get('/attendance/report', { params })
};

// Fee APIs
export const feeAPI = {
  getAll: (params) => api.get('/fees', { params }),
  getByStudent: (studentId, params) => api.get(`/fees/student/${studentId}`, { params }),
  getSummary: (studentId, params) => api.get(`/fees/summary/${studentId}`, { params }),
  getPending: (params) => api.get('/fees/pending', { params }),
  getPaymentHistory: (feeId) => api.get(`/fees/payment-history/${feeId}`),
  add: (data) => api.post('/fees', data),
  update: (feeId, data) => api.put(`/fees/${feeId}`, data),
  bulkAdd: (data) => api.post('/fees/bulk', data),
  recordPayment: (data) => api.post('/fees/pay', data),
  getStatistics: (params) => api.get('/fees/statistics', { params }),
  
  // Template APIs
  getTemplates: (params) => api.get('/fees/templates/list', { params }),
  createTemplate: (data) => api.post('/fees/templates', data),
  updateTemplate: (templateId, data) => api.put(`/fees/templates/${templateId}`, data),
  deleteTemplate: (templateId) => api.delete(`/fees/templates/${templateId}`)
};

// Exam APIs
export const examAPI = {
  getAll: () => api.get('/exams'),
  create: (data) => api.post('/exams', data),
  update: (examId, data) => api.put(`/exams/${examId}`, data),
  delete: (examId) => api.delete(`/exams/${examId}`),
  addMarks: (data) => api.post('/exams/marks', data),
  getStudentResults: (studentId) => api.get(`/exams/student/${studentId}`),
  getExamResults: (examId) => api.get(`/exams/exam/${examId}`),
  generateReportCard: (params) => api.get('/exams/report-card', { params })
};

// Assignment APIs
export const assignmentAPI = {
  create: (data) => api.post('/assignments', data),
  getAll: () => api.get('/assignments'),
  getByClass: (classId) => api.get(`/assignments/class/${classId}`),
  submit: (data) => api.post('/assignments/submit', data),
  grade: (data) => api.post('/assignments/grade', data),
  delete: (assignmentId) => api.delete(`/assignments/${assignmentId}`),
  getStudentSubmissions: (studentId) => api.get(`/assignments/student/${studentId}`)
};

// Notification APIs
export const notificationAPI = {
  create: (data) => api.post('/notifications', data),
  getAll: () => api.get('/notifications'),
  getUserNotifications: () => api.get('/notifications/user/notifications'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`)
};

// Library APIs
export const libraryAPI = {
  getAll: () => api.get('/library'),
  search: (query) => api.get('/library/search', { params: { query } }),
  addBook: (data) => api.post('/library', data),
  issue: (data) => api.post('/library/issue', data),
  return: (data) => api.post('/library/return', data),
  getStudentBooks: (studentId) => api.get(`/library/student/${studentId}`)
};

// Transport APIs
export const transportAPI = {
  getAll: () => api.get('/transport'),
  create: (data) => api.post('/transport', data),
  update: (busId, data) => api.put(`/transport/${busId}`, data),
  assign: (data) => api.post('/transport/assign', data),
  getBusDetails: (busId) => api.get(`/transport/${busId}`),
  getStudentBus: (studentId) => api.get(`/transport/student/${studentId}`)
};

// Class APIs
export const classAPI = {
  getAll: () => api.get('/classes'),
  create: (data) => api.post('/classes', data),
  getAllSubjects: () => api.get('/classes/subjects'),
  createSubject: (data) => api.post('/classes/subjects', data),
  getTimetable: (classId) => api.get(`/classes/timetable/${classId}`),
  createTimetableEntry: (data) => api.post('/classes/timetable', data)
};

// Subject APIs
export const subjectAPI = {
  getAll: () => api.get('/classes/subjects'),
  create: (data) => api.post('/classes/subjects', data)
};

// Class Assignment APIs (for assigning teachers to classes with subjects)
export const classAssignmentAPI = {
  assignTeacher: (data) => api.post('/class-assignments/assign', data),
  getAll: (filters = {}) => api.get('/class-assignments/all', { params: filters }),
  getById: (assignmentId) => api.get(`/class-assignments/${assignmentId}`),
  update: (assignmentId, data) => api.put(`/class-assignments/${assignmentId}`, data),
  delete: (assignmentId) => api.delete(`/class-assignments/${assignmentId}`),
  getAvailableTeachers: (className, section) => api.get('/class-assignments/available-teachers', { 
    params: { className, section } 
  }),
  getAllClasses: () => api.get('/class-assignments/classes-sections'),
  getClassStudents: (className, section) => api.get('/class-assignments/class-students', {
    params: { className, section }
  })
};

export default api;
