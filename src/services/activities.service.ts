import api, { cleanParams } from './api';

export enum ActivityType {
  TASK = 'TASK',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  LLAMADA = 'LLAMADA',
  REUNION_COMERCIAL = 'REUNION_COMERCIAL',
  REUNION_SEGUIMIENTO = 'REUNION_SEGUIMIENTO',
  COTIZACION = 'COTIZACION',
  SEGUIMIENTO = 'SEGUIMIENTO'
}

export enum ActivityResult {
  CALL_BACK = 'CALL_BACK',
  INTERESTED = 'INTERESTED',
  NO_ANSWER = 'NO_ANSWER',
  SUCCESSFUL = 'SUCCESSFUL',
  UNSUCCESSFUL = 'UNSUCCESSFUL',
  NO_TARGET = 'NO_TARGET'
}

export const ACTIVITY_RESULT_OPTIONS: { label: string; value: ActivityResult }[] = [
  { label: 'No contesta', value: ActivityResult.NO_ANSWER },
  { label: 'Llamar otro día', value: ActivityResult.CALL_BACK },
  { label: 'Interesado', value: ActivityResult.INTERESTED },
  { label: 'Reunión agendada', value: ActivityResult.SUCCESSFUL },
  { label: 'No interesado', value: ActivityResult.UNSUCCESSFUL },
  { label: 'No target', value: ActivityResult.NO_TARGET },
];

export const ACTIVITY_RESULT_LABELS: Record<ActivityResult, string> = {
  [ActivityResult.NO_ANSWER]: 'No contesta',
  [ActivityResult.CALL_BACK]: 'Llamar otro día',
  [ActivityResult.INTERESTED]: 'Interesado',
  [ActivityResult.SUCCESSFUL]: 'Reunión agendada',
  [ActivityResult.UNSUCCESSFUL]: 'No interesado',
  [ActivityResult.NO_TARGET]: 'No target',
};

export enum ActivityStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Activity {
  id: string;
  subject: string;
  notes: string | null;
  activityType: ActivityType;
  result: ActivityResult | null;
  status: ActivityStatus;
  plannedDate: string | null;
  completedAt: string | null;
  accountId: string;
  userId: string | null;
  contactId: string | null;
  dealId: string | null;
  parentActivityId: string | null;
  createdAt: string;
  updatedAt: string;
  account?: { id?: string; name: string; phone?: string | null; email?: string | null; cif?: string | null };
  user?: { name: string, email: string };
  contact?: { id?: string; name: string, email?: string | null, phone?: string | null, position?: string | null };
  deal?: { name: string, stage?: string, businessLineId?: string };
  parentActivity?: { subject: string, id: string };
}

export const activitiesService = {
  getAll: async (params?: { search?: string; subject?: string; notes?: string; accountId?: string; userId?: string; activityType?: string; result?: string; contactId?: string; dealId?: string; parentActivityId?: string; startDate?: string; endDate?: string; completedAtFrom?: string; completedAtTo?: string; stage?: string; businessLineId?: string; }): Promise<Activity[]> => {
    const response = await api.get('/activities', { params: cleanParams(params) });
    return response.data;
  },

  getById: async (id: string): Promise<Activity> => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  create: async (data: Partial<Activity>): Promise<Activity> => {
    const response = await api.post('/activities', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },

  bulkUpdate: async (activityIds: string[], updates: any): Promise<{ count: number }> => {
    const response = await api.patch('/activities/bulk-update', { activityIds, updates });
    return response.data;
  },

  bulkDelete: async (activityIds: string[]): Promise<{ count: number }> => {
    const response = await api.post('/activities/bulk-delete', { activityIds });
    return response.data;
  }
};
