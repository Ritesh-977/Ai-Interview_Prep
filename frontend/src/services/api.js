import axios from 'axios';

// Get the backend URL from environment variables
// VITE_API_URL is for Vite, REACT_APP_API_URL is for Create React App
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
});

// --- Auth Endpoints --- [cite: 19]
export const signupUser = (userData) => {
  // userData will be { email, password }
  return apiClient.post('/auth/signup', userData); 
};

export const loginUser = (userData) => {
  // userData will be { email, password }
  return apiClient.post('/auth/login', userData);
};

export const listDocuments = () => {
  return apiClient.get('/documents/list');
};

// Uploads a new document
// data is FormData, onUploadProgress is a callback for the progress bar
export const uploadDocument = (data, onUploadProgress) => {
  return apiClient.post('/documents/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress, // Pass the callback to axios
  });
};

// Deletes a specific document by its ID
export const deleteDocument = (id) => {
  return apiClient.delete(`/documents/${id}`);
};


export default apiClient;