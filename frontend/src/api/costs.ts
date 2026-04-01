import api from './client';

export const costsApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/costs`).then((r) => r.data),
  summary: (projectId: string) => api.get(`/projects/${projectId}/costs/summary`).then((r) => r.data),
  create: (projectId: string, data: any) => api.post(`/projects/${projectId}/costs`, data).then((r) => r.data),
  update: (projectId: string, costId: string, data: any) => api.put(`/projects/${projectId}/costs/${costId}`, data).then((r) => r.data),
  delete: (projectId: string, costId: string) => api.delete(`/projects/${projectId}/costs/${costId}`),
};
