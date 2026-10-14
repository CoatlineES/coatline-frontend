import api from './api';

export interface SectorItem {
  name: string;
  count: number;
}

export const sectorsService = {
  getAll: async (): Promise<SectorItem[]> => {
    const res = await api.get('/sectors');
    return res.data.data || [];
  },

  add: async (name: string): Promise<SectorItem[]> => {
    const res = await api.post('/sectors', { name });
    return res.data.data || [];
  },

  delete: async (name: string): Promise<SectorItem[]> => {
    const res = await api.delete(`/sectors/${encodeURIComponent(name)}`);
    return res.data.data || [];
  },

  cleanEmpty: async (): Promise<{ data: SectorItem[]; message: string }> => {
    const res = await api.post('/sectors/clean-empty');
    return res.data;
  }
};
