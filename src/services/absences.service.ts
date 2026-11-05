import api from './api';
import { User } from './auth.service';

export type AbsenceType = 'VACACIONES' | 'ENFERMEDAD' | 'MATRIMONIO' | 'MUDANZA' | 'HOSPITALIZACION' | 'CITA_MEDICA' | 'ASUNTOS_PROPIOS' | 'OTROS';
export type AbsenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AbsenceSupervisor {
  id: string;
  name: string;
  email: string;
  role?: { name: string };
  department?: { name: string };
}

export interface Absence {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    roleId?: string;
    role?: { name: string };
    department?: { name: string };
    supervisors?: {
      supervisor: {
        id: string;
        name: string;
        email: string;
      };
    }[];
  };
  type: AbsenceType;
  startDate: string;
  endDate: string;
  status: AbsenceStatus;
  comments?: string;
  attachmentUrl?: string;
  approvedById?: string;
  approvedBy?: {
    id: string;
    name: string;
    email?: string;
  };
  approvedAt?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAbsenceDTO {
  type: string;
  startDate: string;
  endDate: string;
  comments?: string;
  attachmentUrl?: string;
}

export const absencesService = {
  getAll: async (params?: { scope?: 'mine' | 'all'; status?: string }): Promise<Absence[]> => {
    const response = await api.get('/absences', { params });
    return response.data;
  },

  getUserAbsences: async (userId: string): Promise<Absence[]> => {
    const response = await api.get(`/absences/user/${userId}`);
    return response.data;
  },

  getMySupervisors: async (): Promise<AbsenceSupervisor[]> => {
    const response = await api.get('/absences/my-supervisors');
    return response.data;
  },

  getMySupervisees: async (): Promise<any[]> => {
    const response = await api.get('/absences/my-supervisees');
    return response.data;
  },

  getTeamCalendar: async (params?: { scope?: 'mine' | 'all' }): Promise<Absence[]> => {
    const response = await api.get('/absences/team-calendar', { params });
    return response.data;
  },

  create: async (data: CreateAbsenceDTO): Promise<Absence> => {
    const response = await api.post('/absences', data);
    return response.data;
  },

  updateStatus: async (id: string, status: AbsenceStatus, resolutionNote?: string): Promise<Absence> => {
    const response = await api.patch(`/absences/${id}/status`, { status, resolutionNote });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/absences/${id}`);
  }
};

