import api from './client';

export const valuationsApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/valuations`).then((r) => r.data),
  create: (projectId: string, data: any) => api.post(`/projects/${projectId}/valuations`, data).then((r) => r.data),
  update: (projectId: string, valId: string, data: any) => api.put(`/projects/${projectId}/valuations/${valId}`, data).then((r) => r.data),
  delete: (projectId: string, valId: string) => api.delete(`/projects/${projectId}/valuations/${valId}`),
};
