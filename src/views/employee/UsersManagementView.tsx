import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, Plus, Search, RefreshCw, AlertCircle, CheckCircle, Shield, Briefcase, Mail, X, Edit2, Trash2, Calendar as CalendarIcon, FileText, ToggleRight, DollarSign, Clock, Loader2, Users } from 'lucide-react';
import { usersService } from '../../services/users.service';
import { UserResponse, CreateUserPayload } from '../../services/types';

const AVAILABLE_PERMISSIONS = [
  { id: 'rrhh', name: 'RRHH', desc: 'Fichajes y Ausencias' },
  { id: 'documentos', name: 'Documentos', desc: 'Acceso a repositorio' },
  { id: 'proyectos', name: 'Proyectos', desc: 'Proyectos e Informes' },
  { id: 'admin', name: 'Administración', desc: 'Facturación y Finanzas' },
  { id: 'crm', name: 'CRM', desc: 'Gestión comercial' },
  { id: 'almacen', name: 'Almacén', desc: 'Retirar materiales y consultar stock' },
  { id: 'almacen_admin', name: 'Gestor de Almacén', desc: 'Aprobar retiros y gestionar catálogo' },
  { id: 'partes_diarios', name: 'Partes Diarios', desc: 'Parte diario de proyectos' },
];

export default function UsersManagementView() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'datos' | 'contrato' | 'permisos' | 'trabajadores'>('datos');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const getInitialFormData = () => ({
    name: '',
    email: '',
    password: '',
    roleName: 'Empleado',
    departmentName: 'Técnico',
    status: 'ACTIVO',
    contract: {
      contractType: 'Indefinido',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      salary: '',
      workingHours: 40
    },
    customPermissions: ['rrhh', 'documentos']
  });

  const [formData, setFormData] = useState<any>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Workers State for Contractors
  const [workers, setWorkers] = useState<UserResponse[]>([]);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [editingWorkerName, setEditingWorkerName] = useState('');

  const loadWorkers = async () => {
    if (!editingUserId) return;
    setIsLoadingWorkers(true);
    try {
      const response = await usersService.getContractorWorkers(editingUserId);
      if (response.success && response.data) {
        setWorkers(response.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingWorkers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'trabajadores' && editingUserId) {
      loadWorkers();
    }
  }, [activeTab, editingUserId]);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !editingUserId) return;
    try {
      const response = await usersService.addContractorWorker(editingUserId, newWorkerName);
      if (response.success && response.data) {
        setWorkers([...workers, response.data]);
        setNewWorkerName('');
        setSuccess('Obrero añadido con éxito');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al añadir obrero');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveWorker = async (workerId: string) => {
    if (!editingUserId) return;
    try {
      const response = await usersService.deleteContractorWorker(editingUserId, workerId);
      if (response.success) {
        setWorkers(workers.filter(w => w.id !== workerId));
        setSuccess('Obrero eliminado');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al eliminar obrero');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateWorker = async (workerId: string) => {
    if (!editingUserId || !editingWorkerName.trim()) return;
    try {
      const response = await usersService.updateContractorWorker(editingUserId, workerId, editingWorkerName);
      if (response.success && response.data) {
        setWorkers(workers.map(w => w.id === workerId ? { ...w, name: response.data.name } : w));
        setEditingWorkerId(null);
        setEditingWorkerName('');
        setSuccess('Obrero actualizado con éxito');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al actualizar obrero');
      setTimeout(() => setError(''), 3000);
    }
  };


  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await usersService.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Error al obtener usuarios');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      contract: {
        ...formData.contract,
        [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value
      }
    });
  };

  const handleTogglePermission = (permId: string) => {
    setFormData((prev: any) => {
      const current = prev.customPermissions || [];
      if (current.includes(permId)) {
        return { ...prev, customPermissions: current.filter((id: string) => id !== permId) };
      } else {
        return { ...prev, customPermissions: [...current, permId] };
      }
    });
  };

  const handleEditClick = async (userId: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await usersService.getUserById(userId);
      if (response.success && response.data) {
        const user = response.data;
        const roleName = typeof user.role === 'object' && user.role !== null ? (user.role as any).name : (user.role || 'Empleado');
        const deptName = typeof user.department === 'object' && user.department !== null ? (user.department as any).name : (user.department || 'Técnico');
        
        // Ensure valid date formatting for inputs (YYYY-MM-DD)
        const formatForInput = (dateStr?: any) => {
          if (!dateStr) return '';
          if (typeof dateStr === 'string') return dateStr.split('T')[0];
          if (dateStr instanceof Date) return dateStr.toISOString().split('T')[0];
          return String(dateStr).split('T')[0];
        };

        setFormData({
          name: user.name,
          email: user.email,
          password: '', 
          roleName: roleName,
          departmentName: deptName,
          status: (user as any).status || 'ACTIVO',
          contract: user.contract ? {
            ...user.contract,
            startDate: formatForInput(user.contract.startDate),
            endDate: formatForInput(user.contract.endDate),
            salary: user.contract.salary || '',
            workingHours: user.contract.workingHours || 40
          } : getInitialFormData().contract,
          customPermissions: user.customPermissions || []
        });
        setEditingUserId(user.id);
        setActiveTab('datos');
        setShowForm(true);
      } else {
        console.error("API response unsuccessful:", response);
        setError(response.message || 'Error al obtener usuario');
      }
    } catch (err: any) {
      console.error("Error in handleEditClick:", err);
      setError(err.response?.data?.message || err.message || 'Error de conexión al obtener usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = { ...formData };
      if (editingUserId && !payload.password) {
        delete payload.password;
      }

      // Convert salary to number if provided, handle empty end date
      if (payload.contract) {
        payload.contract.salary = payload.contract.salary ? Number(payload.contract.salary) : undefined;
        payload.contract.workingHours = Number(payload.contract.workingHours);
        if (!payload.contract.endDate) {
          delete payload.contract.endDate;
        }
      }

      let response;
      if (editingUserId) {
        response = await usersService.updateUser(editingUserId, payload);
      } else {
        response = await usersService.createUser(payload);
      }

      if (response.success) {
        setSuccess(editingUserId ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito');
        
        if (editingUserId) {
           setUsers(users.map(u => u.id === editingUserId ? { ...u, ...response.data } : u));
        } else {
           fetchUsers();
        }

        setShowForm(false);
        setEditingUserId(null);
        setFormData(getInitialFormData());
        
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.message || 'Error en la operación');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión. Revisa los datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUserId) return;
    setIsDeleting(true);
    setError('');
    
    try {
      const response = await usersService.deleteUser(deletingUserId);
      if (response.success) {
        setSuccess('Usuario eliminado con éxito');
        setUsers(users.filter(u => u.id !== deletingUserId));
        setDeletingUserId(null);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.message || 'Error al eliminar usuario');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión al eliminar usuario');
    } finally {
      setIsDeleting(false);
      setDeletingUserId(null);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName?.toUpperCase()) {
      case 'SUPERADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'SUPERVISOR': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TÉCNICO':
      case 'TECNICO': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto min-h-full relative">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-[#001c3a] uppercase tracking-tight flex items-center gap-3">
            <div className="bg-[#001c3a] p-2 rounded-xl text-white shadow-lg">
              <User size={28} />
            </div>
            Directorio Activo
          </h1>
          <p className="text-slate-500 font-sans mt-2 ml-1">
            Gestión centralizada del personal y control de accesos.
          </p>
        </div>
        
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingUserId(null);
              setFormData(getInitialFormData());
            } else {
              setShowForm(true);
              setActiveTab('datos');
            }
            setError('');
            setSuccess('');
          }}
          className={`px-6 py-3 rounded-xl flex items-center gap-2 font-sans font-bold text-sm uppercase tracking-wider transition-all shadow-lg active:scale-95 border-2 ${
            showForm 
              ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' 
              : 'bg-secondary text-white border-secondary hover:bg-secondary-container hover:shadow-secondary/30'
          }`}
        >
          {showForm ? (
            <><X size={18} /> Cancelar</>
          ) : (
            <><Plus size={18} /> Alta de Empleado</>
          )}
        </button>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.9 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.9 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
              <AlertCircle size={20} className="shrink-0" /> 
              <span className="font-medium text-sm">{error}</span>
            </div>
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.9 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.9 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-emerald-50/80 backdrop-blur-md border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 shadow-sm">
              <CheckCircle size={20} className="shrink-0" /> 
              <span className="font-medium text-sm">{success}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-[9999] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => {
                setShowForm(false);
                setEditingUserId(null);
                setFormData(getInitialFormData());
              }}
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0, transition: { duration: 0.2 } }}
              className="bg-white/95 backdrop-blur-xl border-l border-slate-200/60 shadow-2xl w-full max-w-2xl h-full relative flex flex-col z-10"
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${editingUserId ? 'from-[#001c3a] to-blue-500' : 'from-secondary to-[#001c3a]'}`}></div>
              
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUserId(null);
                  setFormData(getInitialFormData());
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20"
              >
                <X size={20} />
              </button>
              
              <div className="p-6 md:p-8 pb-0 shrink-0">
                <h2 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                  {editingUserId ? 'Editar Ficha de Empleado' : 'Nuevo Empleado'}
                </h2>
              
              {/* TABS */}
              <div className="flex border-b border-slate-200 gap-6 mb-6">
                <button 
                  onClick={() => setActiveTab('datos')}
                  className={`pb-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'datos' ? 'border-[#001c3a] text-[#001c3a]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  1. Datos Personales
                </button>
                <button 
                  onClick={() => setActiveTab('contrato')}
                  className={`pb-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'contrato' ? 'border-[#001c3a] text-[#001c3a]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  2. Contrato
                </button>
                <button 
                  onClick={() => setActiveTab('permisos')}
                  type="button"
                  className={`pb-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'permisos' ? 'border-[#001c3a] text-[#001c3a]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  3. Permisos y Accesos
                </button>
                {(formData.roleName === 'CONTRATISTA' || formData.roleName === 'Proveedor') && editingUserId && (
                  <button 
                    onClick={() => setActiveTab('trabajadores')}
                    type="button"
                    className={`pb-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'trabajadores' ? 'border-[#001c3a] text-[#001c3a]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    4. Trabajadores
                  </button>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-0 pb-8">
              
              {/* TAB CONTENT: DATOS */}
              {activeTab === 'datos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <User size={14} /> Nombre Completo
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Mail size={14} /> Correo Corporativo
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Shield size={14} /> {editingUserId ? 'Nueva Contraseña' : 'Contraseña Inicial'}
                    </label>
                    <input
                      required={!editingUserId}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                      placeholder={editingUserId ? "Dejar en blanco para no cambiar" : "••••••••"}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Shield size={14} /> Rol Principal
                    </label>
                    <select
                      name="roleName"
                      value={formData.roleName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                    >
                      <option value="Superadmin">Superadmin</option>
                      <option value="Admin">Admin</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Empleado">Empleado</option>
                      <option value="Empleado (Base)">Empleado (Base)</option>
                      <option value="Cliente">Cliente</option>
                      <option value="Técnico">Técnico</option>
                      <option value="Peón">Peón</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Coordinador">Coordinador</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Contable">Contable</option>
                      <option value="Auditor">Auditor</option>
                      <option value="Proveedor">Proveedor</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Briefcase size={14} /> Departamento
                    </label>
                    <select
                      name="departmentName"
                      value={formData.departmentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                    >
                      <option value="General">General</option>
                      <option value="Dirección">Dirección</option>
                      <option value="Administración">Administración</option>
                      <option value="Ventas">Ventas</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Técnico">Técnico</option>
                      <option value="Operaciones">Operaciones</option>
                      <option value="RRHH">RRHH</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Logística">Logística</option>
                      <option value="Atención al Cliente">Atención al Cliente</option>
                      <option value="Calidad">Calidad</option>
                      <option value="Marketing">Marketing</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>

                  {editingUserId && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                        <Shield size={14} /> Estado
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                      >
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: CONTRATO */}
              {activeTab === 'contrato' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <FileText size={14} /> Tipo de Contrato
                    </label>
                    <select
                      name="contractType"
                      value={formData.contract.contractType}
                      onChange={handleContractChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                    >
                      <option value="Indefinido">Indefinido</option>
                      <option value="Temporal">Temporal</option>
                      <option value="Fijo Discontinuo">Fijo Discontinuo</option>
                      <option value="Prácticas">Prácticas</option>
                      <option value="Autónomo">Autónomo (Trade)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <CalendarIcon size={14} /> Fecha de Alta
                    </label>
                    <input
                      required
                      type="date"
                      name="startDate"
                      value={formData.contract.startDate}
                      onChange={handleContractChange}
                      className="w-full px-4 py-2.5 bg-white/50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <CalendarIcon size={14} /> Fecha Fin (Opcional)
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.contract.endDate || ''}
                      onChange={handleContractChange}
                      className="w-full px-4 py-2.5 bg-white/50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock size={14} /> Jornada (Horas semanales)
                    </label>
                    <input
                      required
                      type="number"
                      name="workingHours"
                      min="1"
                      max="40"
                      value={formData.contract.workingHours}
                      onChange={handleContractChange}
                      className="w-full px-4 py-2.5 bg-white/50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <DollarSign size={14} /> Salario Bruto Anual (€)
                    </label>
                    <input
                      type="number"
                      name="salary"
                      min="0"
                      step="0.01"
                      value={formData.contract.salary || ''}
                      onChange={handleContractChange}
                      placeholder="Ej. 24000"
                      className="w-full px-4 py-2.5 bg-white/50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* TAB CONTENT: PERMISOS */}
              {activeTab === 'permisos' && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                    <Shield className="text-[#001c3a] shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-600">
                      Independientemente del Rol seleccionado, activa los módulos a los que este empleado debe tener acceso forzado.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_PERMISSIONS.map(perm => {
                      const isActive = formData.customPermissions?.includes(perm.id);
                      return (
                        <div key={perm.id} className="flex items-center justify-between p-4 border rounded-xl bg-white transition-colors border-slate-200 shadow-sm hover:border-slate-300">
                          <div>
                            <h4 className="font-bold text-slate-800">{perm.name}</h4>
                            <p className="text-xs text-slate-500">{perm.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(perm.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isActive ? 'bg-[#001c3a]' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: TRABAJADORES */}
              {activeTab === 'trabajadores' && (formData.roleName === 'CONTRATISTA' || formData.roleName === 'Proveedor') && editingUserId && (
                <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col h-full">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                    <Users className="text-[#001c3a] shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-600">
                      Añade los nombres de los obreros de este contratista. El sistema generará automáticamente un identificador ficticio con el que luego podrán elegir su identidad.
                    </p>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newWorkerName}
                      onChange={(e) => setNewWorkerName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddWorker(e);
                        }
                      }}
                      placeholder="Nombre completo del obrero..."
                      className="flex-1 px-4 py-2 bg-white/50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 focus:border-[#001c3a] transition-all"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddWorker}
                      disabled={!newWorkerName.trim() || isSubmitting}
                      className="bg-secondary text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-secondary-container transition-all shadow-sm active:scale-95"
                    >
                      Añadir
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg max-h-64 custom-scrollbar">
                    {isLoadingWorkers ? (
                      <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : workers.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">Aún no hay obreros asignados a este contratista.</div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="p-3 text-xs uppercase text-slate-500 font-bold">Nombre</th>
                            <th className="p-3 text-xs uppercase text-slate-500 font-bold">Identificador</th>
                            <th className="p-3 text-xs uppercase text-slate-500 font-bold text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {workers.map(w => (
                            <tr key={w.id} className="hover:bg-slate-50">
                              <td className="p-3 text-sm font-semibold text-slate-700">
                                {editingWorkerId === w.id ? (
                                  <input 
                                    type="text" 
                                    value={editingWorkerName} 
                                    onChange={(e) => setEditingWorkerName(e.target.value)} 
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateWorker(w.id); else if (e.key === 'Escape') setEditingWorkerId(null); }}
                                    className="px-2 py-1 border border-slate-300 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                                    autoFocus
                                  />
                                ) : (
                                  w.name
                                )}
                              </td>
                              <td className="p-3 text-xs font-mono"><span className="bg-slate-100 text-slate-600 rounded px-2 py-0.5">{w.email}</span></td>
                              <td className="p-3 text-right">
                                {editingWorkerId === w.id ? (
                                  <>
                                    <button type="button" onClick={() => handleUpdateWorker(w.id)} className="text-green-600 hover:text-green-800 p-1 mr-2 transition-colors">
                                      <CheckCircle size={16} />
                                    </button>
                                    <button type="button" onClick={() => setEditingWorkerId(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-colors">
                                      <X size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button type="button" onClick={() => { setEditingWorkerId(w.id); setEditingWorkerName(w.name); }} className="text-slate-400 hover:text-blue-600 p-1 mr-2 transition-colors">
                                      <Edit2 size={16} />
                                    </button>
                                    <button type="button" onClick={() => handleRemoveWorker(w.id)} className="text-slate-400 hover:text-red-600 p-1 transition-colors">
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
              
              </div>
              <div className="p-6 md:p-8 pt-4 border-t border-slate-200 bg-slate-50/50 shrink-0 flex justify-end rounded-b-2xl">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`text-white px-8 py-3 rounded-xl font-sans font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-all shadow-lg active:scale-95 flex items-center gap-2 bg-[#001c3a] hover:bg-slate-800`}
                >
                  {isSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Procesando...</>
                  ) : (
                    editingUserId ? 'Guardar Cambios' : 'Confirmar y Crear'
                  )}
                </button>
              </div>
            </form>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative z-10"
      >
        <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/30 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={fetchUsers} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isLoading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:text-[#001c3a] hover:border-[#001c3a]/30 hover:bg-slate-50 shadow-sm active:scale-95'
            }`}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {isLoading && users.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw size={32} className="animate-spin mb-4 text-[#001c3a]/50" />
            <p className="font-medium text-sm">Sincronizando directorio...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-5 border-b border-slate-200">Empleado</th>
                  <th className="p-5 border-b border-slate-200">Contacto</th>
                  <th className="p-5 border-b border-slate-200">Nivel / Rol</th>
                  <th className="p-5 border-b border-slate-200">Departamento</th>
                  <th className="p-5 border-b border-slate-200 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {users.filter(u => 
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    u.email.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length > 0 ? (
                    users.filter(u => 
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((user, idx) => {
                      const roleName = typeof user.role === 'object' ? (user.role as any).name : user.role;
                      const deptName = typeof user.department === 'object' ? (user.department as any).name : user.department;
                      
                      return (
                        <motion.tr 
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#001c3a] text-white flex items-center justify-center font-bold shadow-md">
                                {user.name.charAt(0)}
                              </div>
                              <span className="text-slate-800 font-semibold">{user.name}</span>
                            </div>
                          </td>
                          <td className="p-5 text-slate-500 text-sm">{user.email}</td>
                          <td className="p-5">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getRoleBadgeColor(roleName)}`}>
                              {roleName}
                            </span>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                              <Briefcase size={14} className="text-slate-400" />
                              {deptName}
                            </div>
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-2 transition-all">
                              <button 
                                onClick={() => handleEditClick(user.id)}
                                className="p-2 text-slate-400 hover:text-secondary bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow active:scale-95 transition-all"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => setDeletingUserId(user.id)}
                                className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-red-200 hover:bg-red-50 active:scale-95 transition-all"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-slate-400 font-medium text-sm">
                        No hay usuarios registrados en la base de datos.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {deletingUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isDeleting && setDeletingUserId(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm relative z-10 border border-slate-200"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-display font-bold text-center text-slate-800 mb-2">
                ¿Eliminar empleado?
              </h3>
              <p className="text-sm text-center text-slate-500 mb-6 leading-relaxed">
                Esta acción es permanente y no se puede deshacer. Se borrarán los accesos de este usuario.
              </p>
              
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => setDeletingUserId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isDeleting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> ...</>
                  ) : (
                    'Sí, eliminar'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
