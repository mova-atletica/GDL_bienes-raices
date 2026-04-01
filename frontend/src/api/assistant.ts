import api from './client';

export const assistantApi = {
  chat: (projectId: string, data: { message: string; context: string; language: string }) =>
    api.post(`/projects/${projectId}/assistant/chat`, data).then((r) => r.data),
  history: (projectId: string, context: string) =>
    api.get(`/projects/${projectId}/assistant/history`, { params: { context } }).then((r) => r.data),
};
