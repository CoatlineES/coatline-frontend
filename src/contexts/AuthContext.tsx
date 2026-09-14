import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'SUPERVISOR' | 'EMPLEADO' | 'TECNICO' | 'PEON' | 'CLIENT' | 'CONTRATISTA' | 'OBRERO' | null;

export interface Contract {
  contractType: string;
  startDate: string;
  endDate?: string;
  salary?: number;
  workingHours: number;
}


export interface Subsidiary {
  id: string;
  name: string;
  countryCode: string;
  currency: string;
  taxRate: number;
  timezone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  subsidiaryId?: string;
  subsidiary?: Subsidiary;
  contract?: Contract | null;
  customPermissions?: string[] | null;
  requirePasswordChange?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeSubsidiary: Subsidiary | null;
  setActiveSubsidiaryId: (id: string) => void;
  availableSubsidiaries: Subsidiary[];
  login: (userData: User, jwtToken: string) => void;
  logout: () => void;
  completePasswordChange: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeSubsidiaryId, setActiveSubsidiaryIdState] = useState<string | null>(() => localStorage.getItem('coastline_subsidiary_id') || null);
  const [availableSubsidiaries, setAvailableSubsidiaries] = useState<Subsidiary[]>([]);
  const [token, setToken] = useState<string | null>(null);

  // Persistence on load
  useEffect(() => {
    const storedUser = localStorage.getItem('coastline_user');
    const storedToken = localStorage.getItem('coastline_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  
  useEffect(() => {
    if (user?.role === 'Director Global' && token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/settings/subsidiaries`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvailableSubsidiaries(data.data);
        }
      })
      .catch(console.error);
    }
  }, [user, token]);

  
  const setActiveSubsidiaryId = (id: string) => {
    setActiveSubsidiaryIdState(id);
    if (id) {
      localStorage.setItem('coastline_subsidiary_id', id);
    } else {
      localStorage.removeItem('coastline_subsidiary_id');
    }
  };

  const login = (userData: User, jwtToken: string) => {
    // Forçamos cambio de contraseña solo en simulación o si el backend lo indicara. 
    // Lo mantendremos en false a menos que el backend nos diga otra cosa.
    const userToSave = { ...userData, requirePasswordChange: userData.requirePasswordChange ?? false };
    
    // Limpiar cualquier sub-usuario de contratista anterior al iniciar sesión
    localStorage.removeItem('contractor_worker_id');
    localStorage.removeItem('contractor_worker_name');

    setUser(userToSave);
    setToken(jwtToken);
    localStorage.setItem('coastline_user', JSON.stringify(userToSave));
    localStorage.setItem('coastline_token', jwtToken);
    if (userData.subsidiaryId) {
      setActiveSubsidiaryId(userData.subsidiaryId);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('coastline_user');
    localStorage.removeItem('coastline_token');
    localStorage.removeItem('contractor_worker_id');
    localStorage.removeItem('contractor_worker_name');
    setActiveSubsidiaryIdState(null);
    localStorage.removeItem('coastline_subsidiary_id');
  };

  const completePasswordChange = () => {
    if (user) {
      const updatedUser = { ...user, requirePasswordChange: false };
      setUser(updatedUser);
      localStorage.setItem('coastline_user', JSON.stringify(updatedUser));
    }
  };

  
  const activeSubsidiary = React.useMemo(() => {
    if (availableSubsidiaries.length > 0 && activeSubsidiaryId) {
      return availableSubsidiaries.find(s => s.id === activeSubsidiaryId) || user?.subsidiary || null;
    }
    return user?.subsidiary || null;
  }, [activeSubsidiaryId, availableSubsidiaries, user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, completePasswordChange, activeSubsidiary, setActiveSubsidiaryId, availableSubsidiaries }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
