// Utility functions for backend

// Generate student ID
export const generateStudentId = () => {
  return `STU-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

// Generate teacher ID
export const generateTeacherId = () => {
  return `TCH-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

// Calculate grade
export const calculateGrade = (marksObtained, totalMarks) => {
  const percentage = (marksObtained / totalMarks) * 100;
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Validate email format
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Calculate attendance percentage
export const getAttendancePercentage = (presentDays, totalDays) => {
  return totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
};

// Calculate fine for overdue books
export const calculateFine = (dueDate, returnDate, finePerDay = 10) => {
  const daysOverdue = Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24));
  return daysOverdue > 0 ? daysOverdue * finePerDay : 0;
};
