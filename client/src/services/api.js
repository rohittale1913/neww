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
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`)
};

// Teacher APIs
export const teacherAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`)
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
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  mark: (data) => api.post('/attendance', data),
  bulkMark: (data) => api.post('/attendance/bulk', data),
  getReport: (params) => api.get('/attendance/report', { params })
};

// Fee APIs
export const feeAPI = {
  getAll: () => api.get('/fees'),
  getByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  getPending: () => api.get('/fees/pending'),
  add: (data) => api.post('/fees', data),
  pay: (data) => api.post('/fees/pay', data),
  getStatistics: () => api.get('/fees/statistics')
};

// Exam APIs
export const examAPI = {
  getAll: () => api.get('/exams'),
  create: (data) => api.post('/exams', data),
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

export default api;
