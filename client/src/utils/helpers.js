// Utility functions for frontend
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculatePercentage = (obtained, total) => {
  return total > 0 ? ((obtained / total) * 100).toFixed(2) : 0;
};

export const getGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

export const truncateText = (text, length = 50) => {
  return text?.length > length ? text.substring(0, length) + '...' : text;
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9);
};
