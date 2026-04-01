import api from './client';

export const templatesApi = {
  list: () => api.get('/templates').then((r) => r.data),
  get: (id: string) => api.get(`/templates/${id}`).then((r) => r.data),
};
