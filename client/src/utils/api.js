import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://lively-2fvy.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['auth-token'] = token;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/user/log-in', { email, password }),
  register: (username, email, password) => api.post('/user/sign-in', { username, email, password }),
};

// Tasks API
export const tasksAPI = {
  getTasks: () => api.get('/tasks/get-tasks'),
  getTask: (id) => api.get(`/tasks/get-task/${id}`),
  createTask: (task) => api.post('/tasks/add-tasks', task),
  updateTask: (id, task) => api.put(`/tasks/update-task/${id}`, task),
  deleteTask: (id) => api.delete(`/tasks/delete-task/${id}`),
  completeTask: (id) => api.put(`/tasks/complete/${id}`),
  rescheduleTask: (id) => api.post(`/tasks/reschedule-task/${id}`),
  getTodayTasks: () => api.get('/tasks/today'),
  getUpcomingTasks: () => api.get('/tasks/upcoming'),
  searchTasks: (query) => api.get(`/tasks/search?q=${query}`),
  filterTasks: (category, priority) => api.get(`/tasks/filter?category=${category}&priority=${priority}`),
  bulkDelete: (taskIds) => api.delete('/tasks/bulk', { data: { taskIds } }),
};

// User Data API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateSleepSchedule: (sleepStart, sleepEnd) => api.put('/user/sleep-schedule', { sleepStart, sleepEnd }),
  addEnergyMood: (energyLevel, mood) => api.post('/user/energy-mood', { energyLevel, mood }),
  updateTheme: (theme) => api.put('/user/theme', { theme }),
};

// Progress API
export const progressAPI = {
  getStats: () => api.get('/progress/stats'),
  getWeekly: () => api.get('/progress/weekly'),
  getMonthly: () => api.get('/progress/monthly'),
  getCategoryAnalytics: () => api.get('/progress/category-analytics'),
  getProductivityInsights: () => api.get('/progress/productivity-insights'),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications/all'),
  getRecent: () => api.get('/notifications/recent'),
  clear: () => api.delete('/notifications/clear'),
};

// AI API
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  getInsights: () => api.get('/ai/insights'),
  scheduleTask: (taskData) => api.post('/ai/schedule-task', taskData),
  getTips: () => api.get('/ai/tips'),
  getHistory: () => api.get('/ai/history'),
  clearHistory: () => api.delete('/ai/history'),
};

// Task Reminders API
export const remindersAPI = {
  getAll: () => api.get('/reminders/all'),
  getUpcoming: () => api.get('/reminders/upcoming'),
  create: (reminder) => api.post('/reminders/add', reminder),
  update: (id, reminder) => api.put(`/reminders/${id}`, reminder),
  delete: (id) => api.delete(`/reminders/${id}`),
  getById: (id) => api.get(`/reminders/${id}`),
};

// Timetable API
export const timetableAPI = {
  uploadTimetable: (formData) => api.post('/timetable/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  saveTasks: (data) => api.post('/timetable/save-tasks', data)
};

export default api;