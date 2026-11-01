import api from './api';

export interface SectorItem {
  name: string;
  count: number;
}

export interface NormalizeSectorsResult {
  data: SectorItem[];
  message: string;
  fixedCount: number;
  duplicatesMerged: Array<{ from: string; to: string; count: number }>;
}

export interface MergeSectorsResult {
  data: SectorItem[];
  message: string;
  updatedAccounts: number;
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
  },

  merge: async (sourceSector: string, targetSector: string): Promise<MergeSectorsResult> => {
    const res = await api.post('/sectors/merge', { sourceSector, targetSector });
    return res.data;
  },

  rename: async (oldName: string, newName: string): Promise<{ data: SectorItem[]; message: string }> => {
    const res = await api.put('/sectors/rename', { oldName, newName });
    return res.data;
  },

  normalize: async (): Promise<NormalizeSectorsResult> => {
    const res = await api.post('/sectors/normalize');
    return res.data;
  }
};

