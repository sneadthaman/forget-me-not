import axios from 'axios';

const API_BASE = 'http://localhost:3000'; // Update if backend runs elsewhere
const TOKEN_KEY = 'fmnauth';

export const api = axios.create({
  baseURL: API_BASE,
});

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

export function loadStoredToken() {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) {
    api.defaults.headers.common.Authorization = `Bearer ${t}`;
  }
  return t;
}

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });

// Card jobs
export const getCardJobs = () => api.get('/card-jobs');
export const getCardJob = (id) => api.get(`/card-jobs/${id}`);
export const triggerCardJobAction = (id, action) => api.post(`/card-jobs/${id}/actions/${action}`);
export const updateCardJob = (id, updates) => api.patch(`/card-jobs/${id}`, updates);

// Users
export const getUsers = () => api.get('/users');
export const createUser = (user) => api.post('/users', user);
export const updateUser = (id, updates) => api.patch(`/users/${id}`, updates);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Contacts
export const getContacts = () => api.get('/contacts');
export const createContact = (contact) => api.post('/contacts', contact);
export const updateContact = (id, updates) => api.patch(`/contacts/${id}`, updates);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);

// Occasions
export const getOccasions = () => api.get('/occasions');
export const createOccasion = (occasion) => api.post('/occasions', occasion);
export const updateOccasion = (id, updates) => api.patch(`/occasions/${id}`, updates);
export const deleteOccasion = (id) => api.delete(`/occasions/${id}`);
