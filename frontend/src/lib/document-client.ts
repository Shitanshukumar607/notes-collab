import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

export const documentClient = {
  list: async () => {
    const response = await api.get("/documents");
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },
  create: async (title?: string) => {
    const response = await api.post("/documents", { title });
    return response.data;
  },
  update: async (id: string, updates: { title?: string; content?: any }) => {
    const response = await api.put(`/documents/${id}`, updates);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
  addCollaborator: async (id: string, email: string, role: string) => {
    const response = await api.post(`/documents/${id}/collaborators`, { email, role });
    return response.data;
  },
};
