import api from './axios';

export const documentApi = {
  uploadDocument: (formData) => api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDocuments: (params) => api.get('/documents', { params }),
  getDocumentById: (id) => api.get(`/documents/${id}`),
  updateDocument: (id, data) => api.patch(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  uploadNewVersion: (id, formData) => api.post(`/documents/${id}/versions`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  shareDocument: (id, data) => api.post(`/documents/${id}/share`, data),
  removeShare: (id, userId) => api.delete(`/documents/${id}/share/${userId}`),
  updateDocumentStatus: (id, status) => api.patch(`/documents/${id}/status`, { status }),
  downloadDocument: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  getDocumentTimeline: (id) => api.get(`/documents/${id}/timeline`)
};

export const getDocumentList = async (params) => {
  const response = await api.get('/documents', { params });
  return response.data;
};
