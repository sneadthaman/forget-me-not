import axios from 'axios';

const API_BASE = 'http://localhost:3000'; // Update if backend runs elsewhere

export const api = axios.create({
  baseURL: API_BASE,
});

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
