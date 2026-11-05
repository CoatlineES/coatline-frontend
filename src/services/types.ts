import { User, UserRole, Contract } from '../contexts/AuthContext';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  roleName: string;
  departmentName: string;
  managerId?: string;
  supervisorIds?: string[];
  contract?: Omit<Contract, 'id'> | null;
  customPermissions?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  roleName?: string;
  departmentName?: string;
  managerId?: string | null;
  supervisorIds?: string[];
  status?: string;
  contract?: Omit<Contract, 'id'> | null;
  customPermissions?: string[];
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
  };
  department?: {
    name: string;
  } | string;
  status?: string;
  manager?: {
    id: string;
    name: string;
  };
  contract?: Contract | null;
  customPermissions?: string[];
  supervisors?: {
    supervisor: {
      id: string;
      name: string;
      email: string;
      role?: { name: string };
    };
  }[];
  supervisees?: {
    user: {
      id: string;
      name: string;
      email: string;
      role?: { name: string };
    };
  }[];
}

export type ProjectStatus = 'AWARDED' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED' | 'CLOSED' | 'CANCELLED';
export type ProjectOrigin = 'QUOTATION' | 'DEMO' | 'STANDALONE';

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID';
export type DocumentCategory = 'PLANS' | 'SAFETY_ACTS' | 'ADDITIONAL_DOCS' | 'GENERATED';

export interface ProjectDocument {
  id: string;
  projectId: string;
  category: DocumentCategory;
  name: string;
  url: string;
  size?: number | null;
  mimetype?: string | null;
  createdAt: string;
}

export interface ProjectWorker {
  id: string;
  projectId: string;
  userId: string;
  role?: string | null;
  user?: UserResponse;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  alias?: string | null;
  status: ProjectStatus;
  address?: string | null;
  city?: string | null;
  projectOrigin: ProjectOrigin;
  plannedStart?: string | null;
  plannedEnd?: string | null;
  hasPlanning: boolean;
  responsibleId?: string | null;
  businessLineId: string;
  dealId?: string | null;
  createdAt: string;
  updatedAt: string;
  contractNumber?: string | null;
  surfaceTotalM2?: number | null;
  divisionName?: string | null;
  accountId: string;
  salespersonId?: string | null;
  quotedAmount?: number | null;
  certifiedAmount?: number | null;
  invoicedAmount?: number | null;
  paymentStatus?: PaymentStatus | null;
  holidayCalendarId?: string | null;
  workSaturdays?: boolean;
  customWorkingDays?: string[];
  customNonWorkingDays?: string[];

  // Relaciones devueltas por la API
  account?: Account;
  businessLine?: BusinessLine;
  responsible?: UserResponse;
  salesperson?: UserResponse;
  deal?: Deal;
  documents?: ProjectDocument[];
  workers?: ProjectWorker[];
}
