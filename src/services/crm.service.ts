import api, { cleanParams } from './api';

export interface Account {
  id: string;
  name: string;
  cif?: string;
  sector?: string;
  email?: string;
  phone?: string;
  city?: string;
  notes?: string;
  contacts?: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  position?: string | null;
  notes?: string;
  accountId: string;
  account?: Account;
  createdAt: string;
  updatedAt: string;
}

export interface MergeStats {
  contactsMoved?: number;
  activitiesMoved?: number;
  dealsMoved?: number;
  quotationsMoved?: number;
  projectsMoved?: number;
  resourcesMoved?: number;
}

export interface MergeResponse<T> {
  success: boolean;
  message: string;
  data: T;
  stats: MergeStats;
}

export const accountsService = {
  getAll: async (params?: { search?: string, name?: string, cif?: string, sector?: string, sectors?: string | string[], city?: string, email?: string, phone?: string, startDate?: string, endDate?: string }) => (await api.get('/accounts', { params: cleanParams(params) })).data.data,
  getById: async (id: string) => (await api.get(`/accounts/${id}`)).data.data,
  get360: async (id: string) => (await api.get(`/accounts/${id}/360`)).data.data,
  create: async (data: Partial<Account>) => (await api.post('/accounts', data)).data.data,
  bulkCreate: async (data: any[]) => (await api.post('/accounts/bulk', data)).data,
  update: async (id: string, data: Partial<Account>) => (await api.put(`/accounts/${id}`, data)).data.data,
  delete: async (id: string) => (await api.delete(`/accounts/${id}`)).data.data,
  merge: async (primaryId: string, secondaryId: string, resolvedFields?: Partial<Account>): Promise<MergeResponse<Account>> => 
    (await api.post('/accounts/merge', { primaryId, secondaryId, resolvedFields })).data,
};

export const contactsService = {
  getAll: async (params?: { search?: string, name?: string, email?: string, phone?: string, accountId?: string, sector?: string, sectors?: string | string[], position?: string, startDate?: string, endDate?: string }) => (await api.get('/contacts', { params: cleanParams(params) })).data.data,
  getById: async (id: string) => (await api.get(`/contacts/${id}`)).data.data,
  create: async (data: { accountId: string; name?: string; email?: string; phone?: string; position?: string; notes?: string }) => (await api.post('/contacts', data)).data.data,
  bulkCreate: async (data: any[]) => (await api.post('/contacts/bulk', data)).data,
  update: async (id: string, data: { accountId?: string; name?: string; email?: string; phone?: string; position?: string; notes?: string }) => (await api.put(`/contacts/${id}`, data)).data.data,
  delete: async (id: string) => (await api.delete(`/contacts/${id}`)).data.data,
  merge: async (primaryId: string, secondaryId: string, resolvedFields?: Partial<Contact>): Promise<MergeResponse<Contact>> => 
    (await api.post('/contacts/merge', { primaryId, secondaryId, resolvedFields })).data,
};

