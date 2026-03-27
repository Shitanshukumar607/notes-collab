import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
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
};
