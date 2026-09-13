import api from './api';
export interface LibraryClause {
  id: string;
  title: string;
  content: string;
  category: string | null;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const clausesService = {
  getAll: async (): Promise<LibraryClause[]> => {
    const response = await api.get('/clauses');
    return response.data;
  },

  getById: async (id: string): Promise<LibraryClause> => {
    const response = await api.get(`/clauses/${id}`);
    return response.data;
  },

  create: async (data: Omit<LibraryClause, 'id' | 'createdAt' | 'updatedAt'>): Promise<LibraryClause> => {
    const response = await api.post('/clauses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<LibraryClause>): Promise<LibraryClause> => {
    const response = await api.put(`/clauses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clauses/${id}`);
  },

  reorder: async (updates: { id: string; sortOrder: number }[]): Promise<void> => {
    await api.post(`/clauses/reorder`, { updates });
  },
};
