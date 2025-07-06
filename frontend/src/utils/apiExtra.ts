// Issue APIs
import api from './api';

export async function getIssues() {
  const res = await api.get('/issues');
  return res.data;
}

export async function getIssue(issueId: string) {
  const res = await api.get(`/issues/${issueId}`);
  return res.data;
}

export async function createIssue(data: any) {
  const res = await api.post('/issues', data);
  return res.data;
}

export async function updateIssue(issueId: string, data: any) {
  const res = await api.put(`/issues/${issueId}`, data);
  return res.data;
}

export async function deleteIssue(issueId: string) {
  const res = await api.delete(`/issues/${issueId}`);
  return res.data;
}

// File APIs
export async function uploadFile(issueId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/files/upload/${issueId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getFile(fileId: string) {
  const res = await api.get(`/files/${fileId}`);
  return res.data;
}

export async function deleteFile(fileId: string) {
  const res = await api.delete(`/files/${fileId}`);
  return res.data;
}

// Stats APIs
export async function getDashboardStats() {
  const res = await api.get('/stats/dashboard');
  return res.data;
}

// Get all users from backend
export async function getUsers() {
  const res = await api.get('/users');
  return res.data;
}
