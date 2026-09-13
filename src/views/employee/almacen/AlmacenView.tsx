import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, ArrowDownRight, ArrowUpRight, AlertTriangle, 
  Search, Filter, Plus, Box, MapPin, RefreshCw,
  MoreVertical, FileText, Layers, CheckCircle, Move, ArrowLeft, ArrowRight
} from 'lucide-react';
import { inventoryService, InventoryItem, InventoryRequest } from '../../../services/inventory.service';
import { projectsService } from '../../../services/projects.service';
import { useAuth } from '../../../contexts/AuthContext';

export default function AlmacenView() {
  const { user } = useAuth();
  
  // States
  const [activeTab, setActiveTab] = useState<'inventario' | 'estante' | 'solicitudes'>('inventario');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  
  const [shelfAction, setShelfAction] = useState<'retirar' | 'mover' | 'devolver'>('retirar');
  const [movingItem, setMovingItem] = useState<InventoryItem | null>(null);
  
  const [selectedBinAction, setSelectedBinAction] = useState<{binCode?: string, item?: InventoryItem, action: 'retirar' | 'devolver', maxReturn?: number} | null>(null);
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [inventoryView, setInventoryView] = useState<'stock' | 'asignaciones'>('stock');

  const [requestForm, setRequestForm] = useState({
    quantity: 1,
    projectId: '',
    destination: '',
    notes: '',
    isFinalReturn: true
  });

  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedItems, fetchedReqs, fetchedProjects, fetchedAssignments, fetchedMovements] = await Promise.all([
        inventoryService.getItems(),
        inventoryService.getRequests(),
        projectsService.getAll(),
        inventoryService.getActiveAssignments(),
        inventoryService.getMovements()
      ]);

      // Temporary assignment of machines to sections for testing
      const sections = ['EST_I_3', 'EST_I_2', 'EST_I_1', 'EST_C_4', 'EST_C_3', 'EST_C_2', 'EST_C_1', 'EST_D_4', 'EST_D_3', 'EST_D_2', 'EST_D_1'];
      let sectionIndex = 0;
      const assignedItems = fetchedItems.map(item => {
        if (!item.location && sectionIndex < sections.length) {
          // Only assign mock location to items temporarily so user can test dragging and viewing
          return { ...item, location: sections[sectionIndex++] };
        }
        return item;
      });

      setItems(assignedItems);
      setRequests(fetchedReqs);
      setProjects(fetchedProjects || []);
      setAssignments(fetchedAssignments || []);
      setMovements(fetchedMovements || []);
    } catch (err) {
      console.error('Error fetching inventory data', err);
      showNotification('Error al cargar datos del almacén', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success'|'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRequestItem = async () => {
    if (!selectedBinAction?.item) return;
    try {
      let finalDestination = requestForm.destination;
      if (requestForm.projectId && !finalDestination) {
        const selectedProject = projects.find(p => p.id === requestForm.projectId);
        if (selectedProject) {
          finalDestination = selectedProject.address 
            ? `${selectedProject.address}${selectedProject.city ? `, ${selectedProject.city}` : ''}` 
            : selectedProject.name;
        }
      }

      const newRequest = await inventoryService.createRequest({
        projectId: requestForm.projectId || undefined,
        destination: finalDestination || undefined,
        requestType: selectedBinAction.action === 'devolver' ? (requestForm.isFinalReturn ? 'return_final' : 'return') : 'withdrawal',
        notes: requestForm.notes,
        items: [{
          itemId: selectedBinAction.item.id,
          quantity: requestForm.quantity,
          notes: requestForm.notes
        }]
      });

      // Auto-aprobar siempre ya que el usuario es quien retira el material
      await inventoryService.updateRequestStatus(newRequest.id, {
        status: 'APPROVED',
        approvalReason: 'Auto-aprobado automáticamente (Usuario retira material)'
      });

      showNotification('Solicitud enviada correctamente', 'success');
      setSelectedBinAction(null);
      fetchData();
    } catch (err) {
      showNotification('Error al crear solicitud', 'error');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await inventoryService.updateRequestStatus(requestId, {
        status: 'APPROVED',
        approvalReason: 'Aprobado manualmente'
      });
      showNotification('Solicitud aprobada', 'success');
      fetchData();
    } catch (err) {
      showNotification('Error al aprobar solicitud', 'error');
    }
  };
  
  const handleRejectRequest = async (requestId: string) => {
    try {
      await inventoryService.updateRequestStatus(requestId, {
        status: 'REJECTED',
        approvalReason: 'Rechazado manualmente'
      });
      showNotification('Solicitud rechazada', 'success');
      fetchData();
    } catch (err) {
      showNotification('Error al rechazar solicitud', 'error');
    }
  };

  const handleMoveToBin = async (locationId: string) => {
    if (!movingItem) return;
    try {
      await inventoryService.updateItem(movingItem.id, { location: locationId });
      showNotification(`Movido a ${locationId}`, 'success');
      setMovingItem(null);
      fetchData();
    } catch (err) {
      showNotification('Error al mover artículo', 'error');
    }
  };

  const categories = ['Todos', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];

  const filteredItems = items.filter(item => {
    if (activeCategory !== 'Todos' && item.category !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.sku?.toLowerCase().includes(search.toLowerCase())) return false;
    if (!showOutOfStock && item.stock <= 0) return false;
    return true;
  });

  const getCalculatedStatus = (item: InventoryItem) => {
    if (item.stock <= item.minStock) return 'critical';
    if (item.stock <= item.minStock * 2 && item.minStock > 0) return 'warning';
    return 'optimal';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'optimal': return 'ÓPTIMO';
      case 'warning': return 'BAJO';
      case 'critical': return 'CRÍTICO';
      default: return 'DESCONOCIDO';
    }
  };

  // -------------------------------------------------------------
  // ESTANTE VISUAL COMPONENTS
  // -------------------------------------------------------------
  
  const renderItemPill = (item: InventoryItem) => {
    const status = getCalculatedStatus(item);
    const isMovingThis = movingItem?.id === item.id;
    return (
      <div 
        key={item.id}
        onClick={(e) => {
          e.stopPropagation();
          if (shelfAction === 'mover') {
            setMovingItem(item);
          } else {
            if (item.stock <= 0 && shelfAction !== 'devolver') {
              showNotification('Este artículo está agotado (Stock 0).', 'error');
              return;
            }
            // Default action: Open withdraw/return modal
            setSelectedBinAction({ item, action: shelfAction === 'devolver' ? 'devolver' : 'retirar' });
            setRequestForm({ quantity: 1, projectId: '', destination: '', notes: '', isFinalReturn: true });
          }
        }}
        className={`relative group cursor-pointer text-xs font-bold px-2 py-1.5 rounded flex items-center justify-between gap-2 shadow-sm border ${
          isMovingThis 
            ? 'bg-blue-500 text-white border-blue-600 animate-pulse' 
            : status === 'critical' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' 
            : status === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
            : 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
        } transition-all w-full`}
      >
        <span className="truncate w-full text-left" title={item.name}>{item.name}</span>
        <span className="shrink-0 bg-white/50 px-1.5 rounded text-[10px]">{item.stock}</span>
      </div>
    );
  };

  const ShelfBinMap = ({ id, label, className }: { id: string, label: string, className: string }) => {
    const binItems = items.filter(i => i.location === id && i.stock > 0);
    const isTarget = shelfAction === 'mover' && movingItem && movingItem.id;
    const isReturnTarget = shelfAction === 'devolver';
    
    return (
      <div 
        onClick={() => {
          if (isTarget) handleMoveToBin(id);
          else if (isReturnTarget) {
            setSelectedBinAction({ binCode: id, action: 'devolver' });
            setRequestForm({ quantity: 1, projectId: '', destination: '', notes: '', isFinalReturn: true });
          }
        }}
        className={`absolute ${className} flex flex-col p-1 border-b-[4px] border-[#d97746]/80 ${
          isTarget ? 'bg-blue-500/30 hover:bg-blue-500/50 cursor-pointer border-blue-400 border-dashed z-20' : 
          isReturnTarget ? 'hover:bg-emerald-500/30 cursor-pointer z-20' : 'hover:bg-slate-900/10'
        } transition-all rounded group z-10 hover:z-50`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 p-1 overflow-hidden rounded">
          <div className="bg-slate-900/70 backdrop-blur-[2px] px-2 py-1 rounded text-center shadow-lg border border-white/10 group-hover:bg-slate-900/90 transition-colors">
            <span className="block text-[10px] text-blue-300 font-black leading-tight">{id}</span>
            <span className="block text-[9px] text-white font-semibold leading-tight">{label}</span>
          </div>
        </div>
        
        {/* Floating Popup for items */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 max-h-[250px] overflow-y-auto bg-slate-900/95 backdrop-blur-md shadow-2xl rounded-xl p-2 z-50 flex flex-col gap-1 border border-slate-700/50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all scale-95 group-hover:scale-100 scrollbar-hide">
          <div className="text-center pb-2 mb-2 border-b border-slate-700/50 sticky top-0 bg-slate-900/95 z-10">
            <span className="block text-xs text-blue-400 font-bold">{id}</span>
            <span className="block text-[10px] text-slate-300 uppercase tracking-wider">{label} - {binItems.length} art.</span>
          </div>
          {binItems.map(item => {
            const status = getCalculatedStatus(item);
            const isMovingThis = movingItem?.id === item.id;
            return (
              <div 
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (shelfAction === 'mover') {
                    setMovingItem(item);
                  } else {
                    if (item.stock <= 0 && shelfAction !== 'devolver') {
                      showNotification('Este artículo está agotado (Stock 0).', 'error');
                      return;
                    }
                    // Default action: Open withdraw/return modal
                    setSelectedBinAction({ item, action: shelfAction === 'devolver' ? 'devolver' : 'retirar' });
                    setRequestForm({ quantity: 1, projectId: '', destination: '', notes: '', isFinalReturn: true });
                  }
                }}
                className={`cursor-pointer text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center justify-between gap-1 shadow-sm border ${
                  isMovingThis 
                    ? 'bg-blue-500 text-white border-blue-600 animate-pulse' 
                    : status === 'critical' ? 'bg-red-100/90 text-red-800 border-red-200' 
                    : status === 'warning' ? 'bg-amber-100/90 text-amber-800 border-amber-200'
                    : 'bg-emerald-100/90 text-emerald-800 border-emerald-200'
                } hover:opacity-100 transition-all w-full`}
              >
                <span className="truncate w-full text-left">{item.name}</span>
                <span className="shrink-0 bg-white/70 px-1 rounded text-[9px]">{item.stock}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ExternalZone = ({ id, label, icon }: { id: string, label: string, icon: any }) => {
    const zoneItems = items.filter(i => i.location === id && i.stock > 0);
    const isTarget = shelfAction === 'mover' && movingItem && movingItem.id;
    const isReturnTarget = shelfAction === 'devolver';
    
    return (
      <div 
        onClick={() => { 
          if (isTarget) handleMoveToBin(id); 
          else if (isReturnTarget) {
            setSelectedBinAction({ binCode: id, action: 'devolver' });
            setRequestForm({ quantity: 1, projectId: '', destination: '', notes: '', isFinalReturn: true });
          }
        }}
        className={`flex-1 min-w-[200px] border-2 border-dashed rounded-xl p-3 flex flex-col transition-all ${
          isTarget ? 'border-blue-400 bg-blue-50 hover:bg-blue-100 cursor-pointer' : 
          isReturnTarget ? 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100 cursor-pointer' : 'border-slate-300 bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2 mb-3 text-slate-500 font-bold text-sm">{icon} <span>{label}</span></div>
        <div className="flex flex-col gap-1.5 flex-1 max-h-[150px] overflow-y-auto scrollbar-hide">
          {zoneItems.map(renderItemPill)}
          {zoneItems.length === 0 && <span className="text-xs text-slate-400 italic">Vacío</span>}
        </div>
      </div>
    );
  };

  const totalItems = items.length;
  const totalByUnit = items.reduce((acc, curr) => {
    const u = curr.unit || 'Uds';
    acc[u] = (acc[u] || 0) + curr.stock;
    return acc;
  }, {} as Record<string, number>);

  const totalStockDisplayEntries = Object.entries(totalByUnit).filter(([_, val]) => val > 0);
  const criticalItems = items.filter(i => getCalculatedStatus(i) === 'critical').length;
  const returnables = items.filter(i => i.isReturnable).length;
  const consumables = items.filter(i => !i.isReturnable).length;
  const totalAssigned = assignments.reduce((acc, a) => acc + (a.quantity || 0), 0);

  return (
    <div className="p-2 md:p-4 w-full max-w-[1800px] mx-auto min-h-full font-sans bg-[#f8fafc] flex flex-col">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span className="font-semibold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-[#001c3a] uppercase tracking-tight flex items-center gap-3">
            <Box size={32} className="text-[#001c3a]" />
            Almacén
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Gestión inteligente de inventario y logística.</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
      >
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Package size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Artículos Únicos</p>
            <p className="text-2xl font-black text-[#001c3a]">{totalItems}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><Box size={24} /></div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Desglose de Stock</p>
            <div className="flex flex-wrap gap-1">
              {totalStockDisplayEntries.length > 0 ? totalStockDisplayEntries.map(([u, val]) => (
                <span key={u} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded border border-slate-200">
                  {val} {u}
                </span>
              )) : (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded border border-slate-200">0</span>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl"><MapPin size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asignados</p>
            <p className="text-2xl font-black text-[#001c3a]">{totalAssigned}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl"><Layers size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Por Tipo</p>
            <p className="text-sm font-bold text-slate-700">{returnables} Retornables</p>
            <p className="text-sm font-bold text-slate-700">{consumables} Consumibles</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="bg-red-50 text-red-600 p-3 rounded-xl"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Crítico</p>
            <p className="text-2xl font-black text-red-600">{criticalItems}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Panel */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl">
            <button onClick={() => setActiveTab('inventario')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'inventario' ? 'bg-white text-[#001c3a] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Inventario</button>
            <button onClick={() => setActiveTab('estante')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'estante' ? 'bg-[#001c3a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Layers size={14} /> Estante Visual</button>
            <button onClick={() => setActiveTab('solicitudes')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'solicitudes' ? 'bg-white text-[#001c3a] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Solicitudes</button>
            <button onClick={() => setActiveTab('historial')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'historial' ? 'bg-white text-[#001c3a] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Historial</button>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800 transition-colors mr-2">
              <input 
                type="checkbox" 
                checked={showOutOfStock} 
                onChange={(e) => setShowOutOfStock(e.target.checked)} 
                className="rounded border-slate-300 text-[#001c3a] focus:ring-[#001c3a]" 
              />
              Mostrar sin stock
            </label>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Buscar SKU, producto..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] transition-all shadow-sm" />
            </div>
          </div>
        </div>

        {activeTab === 'inventario' && (
          <div className="px-6 py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat as string)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-[#001c3a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {cat || 'Sin Categoría'}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setInventoryView('stock')} className={`px-4 py-1 text-xs font-bold rounded-md transition-colors ${inventoryView === 'stock' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Stock General</button>
              <button onClick={() => setInventoryView('asignaciones')} className={`px-4 py-1 text-xs font-bold rounded-md transition-colors ${inventoryView === 'asignaciones' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Asignaciones Activas</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <RefreshCw size={32} className="animate-spin text-[#001c3a]" />
            </div>
          )}

          {activeTab === 'inventario' && inventoryView === 'stock' && (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200/80">
                <tr className="text-slate-500 font-medium">
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const status = getCalculatedStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-normal min-w-[250px] max-w-[400px]">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{item.name}</span>
                            {!item.isReturnable && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">Consumible</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.sku || 'N/A'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-xs text-slate-500">{item.category || 'Sin Cat'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="text-sm font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">{item.location || 'Sin Asignar'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{item.stock} <span className="text-slate-500 font-normal">{item.unit}</span></span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${status === 'critical' ? 'bg-red-500' : status === 'warning' ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, item.minStock > 0 ? (item.stock / (item.minStock * 3)) * 100 : 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStockStatusColor(status)}`}>{getStockStatusLabel(status)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSelectedBinAction({ item, action: 'devolver' }); setRequestForm({ quantity: 1, projectId: '', destination: '', notes: '', isFinalReturn: true }); }} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-colors">Devolver</button>
                          {item.stock > 0 ? (
                            <button onClick={() => { setSelectedBinAction({ item, action: 'retirar' }); setRequestForm({ quantity: 1, projectId: '', destination: '', notes: '', isFinalReturn: true }); }} className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-[#001c3a] hover:text-white transition-colors">Solicitar</button>
                          ) : (
                            <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-1 rounded">Agotado</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'inventario' && inventoryView === 'asignaciones' && (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200/80">
                <tr className="text-slate-500 font-medium">
                  <th className="px-6 py-4">Artículo</th>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Destino / Proyecto</th>
                  <th className="px-6 py-4">Fecha Salida</th>
                  <th className="px-6 py-4">Enviado / Pendiente</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((assignment, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-normal min-w-[250px] max-w-[400px]">
                      <span className="font-semibold text-slate-800">{assignment.item.name}</span>
                      <p className="text-xs text-slate-400 uppercase">{assignment.item.sku}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {assignment.user?.name || 'Desconocido'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex flex-col items-start gap-1">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">
                          <MapPin size={12} className="text-slate-400" />
                          {assignment.project?.name || assignment.destination || 'Ubicación General'}
                        </span>
                        {assignment.project?.address && (
                          <span className="text-[10px] text-slate-500 pl-1">
                            {assignment.project.address}{assignment.project.city ? `, ${assignment.project.city}` : ''}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(assignment.dateAssigned).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-600">
                      {assignment.quantity} {assignment.item.unit}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { 
                          setSelectedBinAction({ item: assignment.item, action: 'devolver', maxReturn: assignment.quantity }); 
                          setRequestForm({ quantity: assignment.quantity, projectId: assignment.project?.id || '', destination: assignment.destination || '', notes: '', isFinalReturn: true }); 
                        }} 
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        Devolver esto
                      </button>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No hay artículos actualmente asignados o en terreno.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'historial' && (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200/80">
                <tr className="text-slate-500 font-medium">
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Artículo</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Cantidad</th>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Destino / Proyecto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(mov.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{mov.item?.name || 'Desconocido'}</span>
                      <p className="text-xs text-slate-400 uppercase">{mov.item?.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      {mov.type === 'SALIDA' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
                          <ArrowRight size={12} /> RETIRO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs">
                          <ArrowLeft size={12} /> DEVOLUCIÓN
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {mov.quantity} {mov.item?.unit}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {mov.user?.name || 'Desconocido'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex flex-col items-start gap-1">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs" title={mov.project?.address ? `${mov.project.address}, ${mov.project.city || ''}` : ''}>
                          <MapPin size={12} className="text-slate-400" />
                          {mov.project?.name || mov.destination || 'Almacén'}
                        </span>
                        {mov.project?.address && (
                          <span className="text-[10px] text-slate-500 pl-1">
                            {mov.project.address}{mov.project.city ? `, ${mov.project.city}` : ''}
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No hay historial de movimientos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'estante' ? (
            <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[#001c3a] flex items-center gap-2"><Layers size={20} /> Mapa Visual de Instalaciones</h2>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => { setShelfAction('retirar'); setMovingItem(null); }} className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${shelfAction === 'retirar' ? 'bg-red-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}><ArrowUpRight size={16} /> Retirar</button>
                  <button onClick={() => { setShelfAction('devolver'); setMovingItem(null); }} className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${shelfAction === 'devolver' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}><ArrowDownRight size={16} /> Devolver</button>
                  <button onClick={() => setShelfAction('mover')} className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${shelfAction === 'mover' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}><Move size={16} /> Mover</button>
                </div>
              </div>

              {shelfAction === 'mover' && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl mb-6 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2"><Move size={18} /><span className="font-semibold text-sm">{movingItem ? `Selecciona el destino para: ${movingItem.name}` : 'Selecciona un artículo de cualquier ubicación para moverlo.'}</span></div>
                  {movingItem && (<button onClick={() => setMovingItem(null)} className="text-xs bg-white text-blue-700 px-3 py-1 rounded font-bold hover:bg-blue-100">Cancelar Movimiento</button>)}
                </div>
              )}

              {/* Main Shelf Map Container */}
              <div className="flex flex-col xl:flex-row gap-4 xl:gap-8 items-center xl:items-stretch justify-center relative mt-2 w-full">
                
                {/* Left External Zone */}
                <div className="flex flex-col justify-center w-full xl:w-40 flex-shrink-0">
                  <ExternalZone id="EXT_IZQ" label="Izquierda" icon={<ArrowDownRight size={16} />} />
                </div>

                {/* REALISTIC SHELF VISUALIZER (IMAGE-BASED) */}
                <div className="relative shadow-2xl rounded-lg overflow-hidden border-4 border-slate-800 w-full flex-1 max-w-[1400px] aspect-[4/3] flex-shrink">
                  <img 
                    src="/warehouse_real.jpg" 
                    alt="Estante Real" 
                    className="absolute inset-0 w-full h-full object-cover" 
                    style={{ filter: 'brightness(1.2) contrast(1.15) saturate(1.1)' }}
                  />
                  <div className="absolute inset-0 bg-slate-900/10 pointer-events-none"></div>

                  {/* LEFT COLUMN (3 levels based on image) */}
                  <ShelfBinMap id="EST_I_3" label="IZQ-ARRIBA" className="left-[4%] top-[42%] w-[29%] h-[15%]" />
                  <ShelfBinMap id="EST_I_2" label="IZQ-MEDIO" className="left-[4%] top-[59%] w-[29%] h-[14.5%]" />
                  <ShelfBinMap id="EST_I_1" label="IZQ-SUELO" className="left-[4%] top-[77%] w-[29%] h-[13%]" />

                  {/* MIDDLE COLUMN (4 levels based on image) */}
                  <ShelfBinMap id="EST_C_4" label="CENTRO-TECHO" className="left-[34.5%] top-[25%] w-[29%] h-[14.5%]" />
                  <ShelfBinMap id="EST_C_3" label="CENTRO-ALTO" className="left-[34.5%] top-[42%] w-[29%] h-[15%]" />
                  <ShelfBinMap id="EST_C_2" label="CENTRO-BAJO" className="left-[34.5%] top-[59%] w-[29%] h-[14.5%]" />
                  <ShelfBinMap id="EST_C_1" label="CENTRO-SUELO" className="left-[34.5%] top-[77%] w-[29%] h-[13%]" />

                  {/* RIGHT COLUMN (4 levels based on image) */}
                  <ShelfBinMap id="EST_D_4" label="DER-TECHO" className="left-[65.5%] top-[25%] w-[29%] h-[14.5%]" />
                  <ShelfBinMap id="EST_D_3" label="DER-ALTO" className="left-[65.5%] top-[42%] w-[29%] h-[15%]" />
                  <ShelfBinMap id="EST_D_2" label="DER-BAJO" className="left-[65.5%] top-[59%] w-[29%] h-[14.5%]" />
                  <ShelfBinMap id="EST_D_1" label="DER-SUELO" className="left-[65.5%] top-[77%] w-[29%] h-[13%]" />
                </div>

                {/* Right External Zone */}
                <div className="flex flex-col justify-center w-full xl:w-40 flex-shrink-0">
                  <ExternalZone id="EXT_DER" label="Derecha" icon={<ArrowDownRight size={16} className="rotate-[-90deg]" />} />
                </div>
              </div>

              {/* Bottom External Zones */}
              <div className="flex flex-col md:flex-row gap-6 mt-8 justify-center items-center">
                <div className="w-full md:w-96 flex-shrink-0">
                  <ExternalZone id="EXT_FRENTE" label="Frente al Estante (Pasillo)" icon={<Box size={16} />} />
                </div>
                <div className="w-full md:w-96 flex-shrink-0">
                  <ExternalZone id="EXT_EDIFICIO" label="Debajo de la escalera" icon={<MapPin size={16} />} />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-lg font-bold text-[#001c3a] mb-4">Solicitudes Recientes</h2>
              <div className="flex flex-col gap-4">
                {requests.map(req => (
                  <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {req.movementCode || req.id.substring(0,8)}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {req.status === 'PENDING' ? 'PENDIENTE' : req.status === 'APPROVED' ? 'APROBADO' : 'RECHAZADO'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          req.requestType === 'return' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {req.requestType === 'return' ? 'DEVOLUCIÓN' : 'RETIRO'}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800">
                        {req.items?.map(i => `${i.quantity}x ${i.item?.name}`).join(', ')}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Solicitado por: {req.requestedBy?.name || 'Usuario'} | {new Date(req.dateRequested).toLocaleDateString()}
                      </p>
                      {req.project && (
                        <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin size={12} /> Proyecto: {req.project.name}
                        </p>
                      )}
                    </div>
                    
                    {req.status === 'PENDING' && (() => {
                      const roleName = typeof user?.role === 'object' ? (user.role as any).name : user?.role;
                      const perms = user?.customPermissions || [];
                      const canApprove = perms.includes('almacen_admin');
                      return canApprove;
                    })() && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApproveRequest(req.id)} className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-sm transition-colors">Aprobar</button>
                        <button onClick={() => handleRejectRequest(req.id)} className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-lg text-sm transition-colors">Rechazar</button>
                      </div>
                    )}
                  </div>
                ))}
                {requests.length === 0 && (
                   <p className="text-slate-500">No hay solicitudes registradas.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {selectedBinAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xl font-bold text-[#001c3a]">
                  {selectedBinAction.action === 'retirar' ? 'Solicitud de Retiro' : 'Devolución de Material'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">Ubicación actual: {selectedBinAction.item?.location || selectedBinAction.binCode || 'Sin asignar'}</p>
              </div>
              
              <div className="p-6 flex flex-col gap-4">
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  {!selectedBinAction.item ? (
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Selecciona el artículo a devolver</label>
                      <select 
                        onChange={(e) => {
                          const item = items.find(i => i.id === e.target.value);
                          if (item) setSelectedBinAction({ ...selectedBinAction, item });
                        }}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all"
                      >
                        <option value="">-- Buscar artículo --</option>
                        {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku || 'N/A'})</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{selectedBinAction.item.sku}</p>
                      <p className="font-semibold text-slate-800">{selectedBinAction.item.name}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {selectedBinAction.action === 'retirar' ? (
                          <>Stock disponible: <span className="font-bold text-slate-700">{selectedBinAction.item.stock} {selectedBinAction.item.unit}</span></>
                        ) : selectedBinAction.maxReturn ? (
                          <>Límite de devolución: <span className="font-bold text-slate-700">{selectedBinAction.maxReturn} {selectedBinAction.item.unit}</span></>
                        ) : (
                          <>Stock actual en almacén: <span className="font-bold text-slate-700">{selectedBinAction.item.stock} {selectedBinAction.item.unit}</span></>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    {selectedBinAction.action === 'retirar' ? 'Cantidad a solicitar' : 'Cantidad a devolver'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="1"
                      value={requestForm.quantity}
                      onChange={(e) => setRequestForm({...requestForm, quantity: Number(e.target.value)})}
                      max={selectedBinAction.action === 'retirar' && selectedBinAction.item ? selectedBinAction.item.stock : selectedBinAction.maxReturn}
                      disabled={!selectedBinAction.item}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all disabled:opacity-50"
                    />
                    <span className="text-slate-500 font-medium">{selectedBinAction.item?.unit || 'Uds'}</span>
                  </div>
                  
                  {selectedBinAction.action === 'devolver' && selectedBinAction.maxReturn !== undefined && selectedBinAction.item && !selectedBinAction.item.isReturnable && (
                    <div className="mt-4 flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <input 
                        type="checkbox" 
                        id="isFinalReturn"
                        checked={requestForm.isFinalReturn}
                        onChange={(e) => setRequestForm({...requestForm, isFinalReturn: e.target.checked})}
                        className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="isFinalReturn" className="cursor-pointer">
                        <span className="block text-sm font-semibold text-slate-700">Devolución final (Cerrar asignación)</span>
                        <span className="block text-xs text-slate-500 mt-0.5 leading-tight">Marca esta opción si ya consumiste el resto y quieres quitar este artículo de tus asignaciones activas.</span>
                      </label>
                    </div>
                  )}
                </div>

                {selectedBinAction.action === 'retirar' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Proyecto asignado (Opcional)</label>
                    <select 
                      value={requestForm.projectId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const selectedProject = projects.find(pr => pr.id === pid);
                        let dest = requestForm.destination;
                        if (selectedProject) {
                          dest = selectedProject.address 
                            ? `${selectedProject.address}${selectedProject.city ? `, ${selectedProject.city}` : ''}` 
                            : selectedProject.name;
                        } else {
                          dest = '';
                        }
                        setRequestForm({...requestForm, projectId: pid, destination: dest});
                      }}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all text-slate-600 mb-3"
                    >
                      <option value="">-- Sin asignar / Uso interno --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.address ? `(${p.address}${p.city ? `, ${p.city}` : ''})` : ''}
                        </option>
                      ))}
                    </select>
                    
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Ubicación de Destino (Opcional)</label>
                    <input 
                      type="text" 
                      value={requestForm.destination}
                      onChange={(e) => setRequestForm({...requestForm, destination: e.target.value})}
                      placeholder={requestForm.projectId ? "Automático (Dirección del proyecto)" : "Ej. Planta Baja, Bodega 2..."}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Si el proyecto no tiene dirección o es uso interno, especifica dónde se usará.</p>
                  </div>
                )}
                {selectedBinAction.action === 'devolver' && (
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <Box className="text-emerald-500 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">Retorno al Almacén</p>
                        <p className="text-xs text-emerald-600 mt-0.5">Selecciona a qué sección del estante o almacén físico regresará el artículo.</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-emerald-800 mb-1">Sección de Retorno</label>
                      <select 
                        value={requestForm.destination || (selectedBinAction.item?.location) || ''}
                        onChange={(e) => setRequestForm({...requestForm, destination: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                      >
                        <option value="">-- Seleccionar Sección --</option>
                        <optgroup label="Estante (Izquierda)">
                          <option value="EST_I_3">IZQ-ARRIBA</option>
                          <option value="EST_I_2">IZQ-MEDIO</option>
                          <option value="EST_I_1">IZQ-SUELO</option>
                        </optgroup>
                        <optgroup label="Estante (Centro)">
                          <option value="EST_C_4">CENTRO-TECHO</option>
                          <option value="EST_C_3">CENTRO-ALTO</option>
                          <option value="EST_C_2">CENTRO-BAJO</option>
                          <option value="EST_C_1">CENTRO-SUELO</option>
                        </optgroup>
                        <optgroup label="Estante (Derecha)">
                          <option value="EST_D_4">DER-TECHO</option>
                          <option value="EST_D_3">DER-ALTO</option>
                          <option value="EST_D_2">DER-BAJO</option>
                          <option value="EST_D_1">DER-SUELO</option>
                        </optgroup>
                        <optgroup label="Zonas Externas">
                          <option value="EXT_IZQ">Izquierda (Exterior)</option>
                          <option value="EXT_DER">Derecha (Exterior)</option>
                          <option value="EXT_FRENTE">Frente (Exterior)</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Notas / Motivo</label>
                  <input 
                    type="text" 
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm({...requestForm, notes: e.target.value})}
                    placeholder="Ej. Para reparar fuga en techo..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedBinAction(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleRequestItem}
                  disabled={!selectedBinAction.item || requestForm.quantity <= 0 || (selectedBinAction.action === 'retirar' && requestForm.quantity > selectedBinAction.item.stock)}
                  className="px-4 py-2 text-sm font-bold bg-[#001c3a] text-white hover:bg-[#002855] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedBinAction.action === 'retirar' ? 'Confirmar Solicitud' : 'Confirmar Devolución'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
