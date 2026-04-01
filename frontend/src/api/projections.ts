import api from './client';

export const projectionsApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/projections`).then((r) => r.data),
  create: (projectId: string, data: any) => api.post(`/projects/${projectId}/projections`, data).then((r) => r.data),
  update: (projectId: string, projId: string, data: any) => api.put(`/projects/${projectId}/projections/${projId}`, data).then((r) => r.data),
  calculate: (projectId: string, projId: string) => api.post(`/projects/${projectId}/projections/${projId}/calculate`).then((r) => r.data),
  delete: (projectId: string, projId: string) => api.delete(`/projects/${projectId}/projections/${projId}`),
};
