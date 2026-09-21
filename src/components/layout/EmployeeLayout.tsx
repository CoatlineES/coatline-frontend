import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, Clock, FileText, CalendarOff, 
  Briefcase, Wrench, Calendar, Box, 
  PieChart, Users, Receipt, Building, LogOut, Settings,
  History, PackagePlus, BarChart2, ChevronDown, ChevronRight, Calculator, CheckSquare, FolderOpen, Bell, Search, UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import logoUrl from '../../assets/logo.png';
import WorkerSelectionScreen from '../../views/employee/WorkerSelectionScreen';
import { NotificationsDropdown } from './NotificationsDropdown';
import { getUnreadCount, getNotifications } from '../../services/notifications.service';
import toast from 'react-hot-toast';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export default function EmployeeLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['rrhh', 'proyectos']); // Abiertos por defecto
  const [activeWorkerId, setActiveWorkerId] = useState<string | null>(localStorage.getItem('contractor_worker_id'));
  const [activeWorkerName, setActiveWorkerName] = useState<string | null>(localStorage.getItem('contractor_worker_name'));
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout, activeSubsidiary, setActiveSubsidiaryId, availableSubsidiaries } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 60000); // Poll every 60s
      return () => clearInterval(interval);
    }
  }, [user, isNotificationsOpen]); // Re-fetch when dropdown closes to sync read state

  // Show a popup with unread notifications on initial load
  React.useEffect(() => {
    if (user) {
      getNotifications(5).then(notifs => {
        const unread = notifs.filter(n => !n.isRead);
        if (unread.length > 0) {
          const first = unread[0];
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-lg rounded-xl border border-slate-100 pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      Tienes notificaciones sin leer
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {first.title}: {first.message}
                    </p>
                    {first.referenceId && (
                      <button
                        onClick={() => {
                          toast.dismiss(t.id);
                          if (first.type === 'DEAL') {
                            navigate(`/app/empleado/crm?tab=dashboard&dealId=${first.referenceId}`);
                          } else if (first.type === 'ACTIVITY') {
                            navigate(`/app/empleado/crm?tab=dashboard&activityId=${first.referenceId}`);
                          } else {
                            navigate(`/app/empleado/crm`);
                          }
                        }}
                        className="mt-3 bg-[#001c3a] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#002D5A] transition-colors"
                      >
                        Ver Notificación
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-100">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-slate-500 focus:outline-none"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ), { duration: 6000, position: 'top-right' });
        }
      }).catch(err => console.error(err));
    }
  }, [user]); // Runs once when user is set

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSelectWorker = (workerId: string, workerName: string) => {
    localStorage.setItem('contractor_worker_id', workerId);
    localStorage.setItem('contractor_worker_name', workerName);
    setActiveWorkerId(workerId);
    setActiveWorkerName(workerName);
  };

  const handleClearWorker = () => {
    localStorage.removeItem('contractor_worker_id');
    localStorage.removeItem('contractor_worker_name');
    setActiveWorkerId(null);
    setActiveWorkerName(null);
  };

  const roleName = typeof user?.role === 'object' ? (user.role as any).name : user?.role;
  const deptName = typeof user?.department === 'object' ? (user.department as any).name : user?.department;

  const showEjecutivo = roleName === 'SUPERADMIN' || (roleName === 'ADMIN' && (deptName === 'ADMINISTRACION' || deptName === 'DIRECCION'));
  const isContratista = roleName === 'CONTRATISTA';
  const isObrero = roleName === 'OBRERO';
  const showClockIn = !isContratista && !isObrero;

  const getFilteredNavGroups = (): NavGroup[] => {
    const isSuperadmin = roleName === 'SUPERADMIN';
    const isAdmin = roleName === 'ADMIN';
    const isSupervisor = roleName === 'SUPERVISOR';
    const isRRHH = roleName === 'RRHH';
    
    const isComercial = deptName === 'COMERCIAL';
    const isAdministracion = deptName === 'ADMINISTRACION' || deptName === 'DIRECCION';
    
    const perms = user?.customPermissions || [];
    const hasPerm = (perm: string) => perms.includes(perm) || isSuperadmin;

    const groups: NavGroup[] = [];

    // RRHH
    if (hasPerm('rrhh') || hasPerm('documentos')) {
      const rrhhItems = [];
      if (hasPerm('rrhh')) {
        if (!isContratista && !isObrero) {
          rrhhItems.push({ name: "Fichajes", path: "/app/empleado/fichaje", icon: <Clock size={20} /> });
        }
        rrhhItems.push(
          { name: "Parte diario", path: "/app/empleado/partes", icon: <FileText size={20} /> },
          { name: "Ausencias", path: "/app/empleado/ausencias", icon: <CalendarOff size={20} /> }
        );
        
        if (isAdmin || isSuperadmin || isSupervisor || isRRHH) {
          rrhhItems.push({ name: "Gestión Ausencias", path: "/app/empleado/gestion-ausencias", icon: <CalendarOff size={20} /> });
        }
      }
      if (hasPerm('documentos')) {
        rrhhItems.push({ name: "Mis Documentos", path: "/app/empleado/documentos", icon: <FolderOpen size={20} /> });
      }
      
      if (hasPerm('rrhh') || isAdmin || isSuperadmin || isSupervisor || isRRHH) {
        rrhhItems.push({ name: "Admin Documentos", path: "/app/empleado/documentos-admin", icon: <FolderOpen size={20} /> });
      }
      // Siempre añadir estos básicos a la carpeta RRHH para no perderlos si tienen acceso
      rrhhItems.push(
        { name: "Solicitar material", path: "/app/empleado/material", icon: <PackagePlus size={20} /> },
        { name: "Mi historial", path: "/app/empleado/historial", icon: <History size={20} /> }
      );
      
      groups.push({ id: 'rrhh', title: 'RRHH', items: rrhhItems });
    }

    // PROYECTOS (Supervisor, Admin, Superadmin o Permisos: proyectos, partes_diarios, almacen)
    const canViewProyectos = isSuperadmin || isAdmin || isSupervisor || hasPerm('proyectos') || hasPerm('partes_diarios') || hasPerm('almacen') || hasPerm('almacen_admin');
    if (canViewProyectos) {
      const projItems = [];
      
      if (isAdmin || isSupervisor || hasPerm('partes_diarios')) {
        projItems.push({ name: "Todos los partes", path: "/app/empleado/todos-partes", icon: <CheckSquare size={20} /> });
      }
      if (isAdmin || isSupervisor || hasPerm('proyectos')) {
        projItems.push(
          { name: "Proyectos", path: "/app/empleado/proyectos", icon: <Briefcase size={20} /> },
          { name: "Planificación Global", path: "/app/empleado/planificacion-global", icon: <Calendar size={20} /> }
        );
      }
      if (isAdmin || hasPerm('proyectos')) {
        projItems.push({ name: "Costes laborales", path: "/app/empleado/costes", icon: <Calculator size={20} /> });
      }
      if (isAdmin || isSupervisor || hasPerm('almacen') || hasPerm('movimientos_stock')) {
        projItems.push({ name: "Almacén", path: "/app/empleado/almacen", icon: <Box size={20} /> });
      }
      if (isAdmin || isSuperadmin || hasPerm('almacen_admin')) {
        projItems.push({ name: "Admin Almacén", path: "/app/empleado/almacen-admin", icon: <Settings size={20} /> });
      }

      groups.push({ id: 'proyectos', title: 'Proyectos y Operaciones', items: projItems });
    }

    // GESTION (Admin Comercial/Admin, Superadmin o Permisos: admin, crm)
    if (isSuperadmin || (isAdmin && (isComercial || isAdministracion)) || hasPerm('crm') || hasPerm('admin')) {
      const gestionItems = [];
      if (isSuperadmin || isComercial || hasPerm('crm')) {
        gestionItems.push({ name: "CRM", path: "/app/empleado/crm", icon: <Users size={20} /> });
      }
      if (isSuperadmin || isAdministracion || hasPerm('admin')) {
        gestionItems.push({ name: "Facturación", path: "/app/empleado/facturacion", icon: <Receipt size={20} /> });
      }
      groups.push({ id: 'gestion', title: 'Gestión Comercial', items: gestionItems });
    }

    // SISTEMA (Superadmin, Admin)
    if (isSuperadmin || isAdmin) {
      groups.push({
        id: 'sistema',
        title: 'Sistema',
        items: [
          { name: "Usuarios", path: "/app/empleado/usuarios", icon: <Settings size={20} /> },
          { name: "Calendarios Festivos", path: "/app/empleado/calendarios-festivos", icon: <Settings size={20} /> }
        ]
      });
    }

    return groups;
  };

  const navGroups = getFilteredNavGroups();

  // Si es contratista y no tiene obrero activo, forzar selección
  if (isContratista && !activeWorkerId) {
    return <WorkerSelectionScreen onSelectWorker={handleSelectWorker} />;
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#001c3a] text-white">
      {/* Cabecera Sidebar */}
      <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0">
        <img src={logoUrl} alt="Coatline" className="h-8 filter invert brightness-0" />
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/70 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {/* Top Links */}
        <div className="px-4 mb-4">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/app/empleado"
                end
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-sans text-sm ${
                    isActive 
                      ? 'bg-white/10 backdrop-blur-md text-white shadow-inner border border-white/5' 
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Home size={20} />
                <span className="font-medium">Centro de trabajo</span>
              </NavLink>
            </li>
            
            {showEjecutivo && (
              <li>
                <NavLink
                  to="/app/empleado/ejecutivo"
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-sans text-sm ${
                      isActive 
                        ? 'bg-white/10 backdrop-blur-md text-white shadow-inner border border-white/5' 
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <BarChart2 size={20} />
                  <span className="font-medium">Panel Ejecutivo</span>
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        {/* Quick Action Button */}
        {showClockIn && (
          <div className="px-4 mb-8">
            <button 
              onClick={() => { navigate('/app/empleado/fichaje'); setIsSidebarOpen(false); }}
              className="w-full bg-secondary hover:bg-secondary-container text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-secondary/20 transition-all active:scale-95 border border-red-500/30"
            >
              <Clock size={18} />
              <span>Fichar Ahora</span>
            </button>
          </div>
        )}

        {/* Accordions */}
        <div className="px-3">
          {navGroups.map((group) => {
            const isOpen = openGroups.includes(group.id);
            // Check if any item in this group is active to keep it open implicitly or highlight
            const hasActiveItem = group.items.some(item => location.pathname === item.path);

            return (
              <div key={group.id} className="mb-2">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                    isOpen || hasActiveItem ? 'text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span>{group.title}</span>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-1 mt-1 pl-1">
                        {group.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <NavLink
                              to={item.path}
                              end={item.path === "/app/empleado"}
                              onClick={() => setIsSidebarOpen(false)}
                              className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-sans text-sm ${
                                  isActive 
                                    ? 'bg-white/10 backdrop-blur-md text-white shadow-inner border border-white/5 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-2/3 before:w-1 before:bg-secondary before:rounded-r-full' 
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`
                              }
                            >
                              {item.icon}
                              <span>{item.name}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pie del Sidebar: Perfil */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-red-800 rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-white">{user?.name}</p>
            <p className="text-xs text-secondary-container truncate">{roleName}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen print:h-auto bg-slate-50 overflow-hidden print:overflow-visible font-sans">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#001c3a] z-50 md:hidden shadow-2xl"
            >
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 print:hidden border-r border-slate-200 z-10 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">
        {renderSidebarContent()}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full print:h-auto overflow-hidden print:overflow-visible relative bg-[#f8fafc]">
        
        {/* Cabecera Principal (Topbar) - Visible en Desktop y Mobile */}
        <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm z-20 shrink-0 h-16 print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 hover:text-primary md:hidden">
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center relative w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar clientes, proyectos, facturas..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
                  Ctrl K
                </kbd>
              </div>
            </div>
            <img src={logoUrl} alt="Coatline" className="h-6 md:hidden" />
          </div>
          
                      <div className="flex items-center gap-4">
              {availableSubsidiaries.length > 0 && activeSubsidiary && (
                <div className="hidden md:flex items-center gap-2">
                  <select 
                    value={activeSubsidiary.id}
                    onChange={(e) => setActiveSubsidiaryId(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {availableSubsidiaries.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.country} ({sub.currency})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {isContratista && activeWorkerName && (
              <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <UserCircle size={18} className="text-secondary" />
                <span className="text-sm font-semibold text-slate-700">{activeWorkerName}</span>
                <button 
                  onClick={handleClearWorker}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  (Cambiar)
                </button>
              </div>
            )}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative text-slate-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-slate-50"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-secondary text-[10px] font-bold text-white flex items-center justify-center rounded-full ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  ></div>
                  <NotificationsDropdown onClose={() => setIsNotificationsOpen(false)} />
                </>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
              <UserCircle size={24} className="text-slate-400" />
            </div>
          </div>
        </header>

        {isContratista && activeWorkerName && (
          <div className="md:hidden flex items-center justify-between bg-slate-100 px-4 py-2 border-b border-slate-200 shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <UserCircle size={16} className="text-secondary" />
              <span className="font-semibold">{activeWorkerName}</span>
            </div>
            <button 
              onClick={handleClearWorker}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium px-2 py-1"
            >
              Cambiar Obrero
            </button>
          </div>
        )}

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto print:overflow-visible relative pb-20 md:pb-0 p-4 md:p-6 print:p-0 custom-scrollbar">
          <Outlet />
        </div>
        
        {/* Mobile Bottom Navigation (Quick Actions) */}
        <nav className="md:hidden print:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
          <NavLink to="/app/empleado" end className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#001c3a]' : 'text-slate-400'}`}>
            <Home size={22} />
            <span className="text-[10px] font-bold">Inicio</span>
          </NavLink>
          <NavLink to="/app/empleado/partes" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#001c3a]' : 'text-slate-400'}`}>
            <FileText size={22} />
            <span className="text-[10px] font-bold">Partes</span>
          </NavLink>
          {/* Action Button Floating */}
          {showClockIn && (
            <div className="relative -top-5">
              <NavLink to="/app/empleado/fichaje" className="flex items-center justify-center w-14 h-14 bg-secondary text-white rounded-full shadow-lg shadow-secondary/30 border-4 border-[#f8fafc] hover:scale-105 transition-transform">
                <Clock size={24} />
              </NavLink>
            </div>
          )}
          <NavLink to="/app/empleado/historial" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#001c3a]' : 'text-slate-400'}`}>
            <History size={22} />
            <span className="text-[10px] font-bold">Historial</span>
          </NavLink>
          <NavLink to="/app/empleado/ausencias" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#001c3a]' : 'text-slate-400'}`}>
            <CalendarOff size={22} />
            <span className="text-[10px] font-bold">Ausencias</span>
          </NavLink>
        </nav>
      </main>

    </div>
  );
}
