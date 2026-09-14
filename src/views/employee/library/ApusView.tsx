import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Folder, FolderOpen, ChevronRight, ChevronDown, Package, Edit, Trash2, Copy, FileText, Plus, X, Calculator } from 'lucide-react';
import { Resource, ResourceFolder, resourcesService, ResourceType } from '../../../services/resources.service';
import ApuEditorModal from './ApuEditorModal';
import { useCurrency } from '../../../hooks/useCurrency';

const FolderNode = ({ 
  folder, 
  selectedFolderId, 
  onSelect 
}: { 
  folder: ResourceFolder; 
  selectedFolderId: string | null; 
  onSelect: (id: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedFolderId === folder.id;
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
          isSelected ? 'bg-[#001c3a]/10 text-[#001c3a] font-semibold' : 'text-slate-600 hover:bg-slate-100'
        }`}
        onClick={() => {
          onSelect(folder.id);
          if (hasChildren && !isSelected) setIsOpen(true);
        }}
      >
        <div 
          className="w-4 flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setIsOpen(!isOpen);
          }}
        >
          {hasChildren ? (
            isOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />
          ) : (
            <span className="w-4" />
          )}
        </div>
        
        {isOpen || isSelected ? (
          <FolderOpen size={16} className={isSelected ? 'text-[#001c3a]' : 'text-amber-500'} />
        ) : (
          <Folder size={16} className="text-amber-500" />
        )}
        
        <span className="text-sm truncate">{folder.name}</span>
      </div>
      
      {hasChildren && isOpen && (
        <div className="ml-4 pl-2 border-l border-slate-200 mt-1 flex flex-col gap-1">
          {folder.children!.map(child => (
            <FolderNode 
              key={child.id} 
              folder={child} 
              selectedFolderId={selectedFolderId} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TagInput = ({ name, initialTags = [], placeholder, label }: { name: string, initialTags?: string[], placeholder?: string, label: string }) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState('');

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim() && !tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <div className="px-3 py-2 border border-slate-200 rounded-lg bg-white min-h-[42px] focus-within:ring-2 focus-within:ring-[#001c3a]/20 focus-within:border-[#001c3a] transition-all">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="bg-[#001c3a]/10 text-[#001c3a] px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
              {tag}
              <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeTag(index)} />
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={addTag}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
          />
        </div>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(tags)} />
      <p className="text-[10px] text-slate-400">Presiona Enter para añadir</p>
    </div>
  );
};

export default function ApusView() {
  const { formatCurrency } = useCurrency();
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [apus, setApus] = useState<Resource[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingApu, setEditingApu] = useState<Resource | null>(null);
  const [editingApuComponents, setEditingApuComponents] = useState<Resource | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = await resourcesService.getFolders();
        setFolders(data);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };
    fetchFolders();
  }, []);

  useEffect(() => {
    const fetchApus = async () => {
      setLoading(true);
      try {
        const data = await resourcesService.getAll({
          resourceType: ResourceType.APU,
          folderId: selectedFolderId || undefined,
          search: search || undefined,
          isActive: showInactive ? undefined : true
        });
        setApus(data);
      } catch (error) {
        console.error('Error fetching APUs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchApus();
    }, 300); // debounce search
    
    return () => clearTimeout(timeoutId);
  }, [selectedFolderId, search, showInactive]);

  const triggerReload = () => {
    // Simply mutate a state or re-fetch to trigger an update.
    // Easiest is to force a re-fetch. We can just reuse the effect logic by slightly modifying a toggle state.
    // Or just fetch again directly:
    const fetchApus = async () => {
      try {
        const data = await resourcesService.getAll({
          resourceType: ResourceType.APU,
          folderId: selectedFolderId || undefined,
          search: search || undefined
        });
        setApus(data);
      } catch (error) {}
    };
    fetchApus();
  };

  ;

  const handleSaveApu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingApu) return;
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const updatedData = {
        name: formData.get('name') as string,
        code: (formData.get('code') as string) || null,
        resourceType: formData.get('resourceType') as ResourceType,
        unit: formData.get('unit') as string,
        unitCost: parseFloat(formData.get('unitCost') as string) || 0,
        margin: parseFloat(formData.get('margin') as string) || 0,
        salesPrice: parseFloat(formData.get('salesPrice') as string) || 0,
        folderId: formData.get('folderId') as string || null,
        notes: formData.get('notes') as string,
        isActive: formData.get('isActive') === 'true',
        
        yieldPerHour: parseFloat(formData.get('yieldPerHour') as string) || null,
        workersCount: parseInt(formData.get('workersCount') as string) || null,
        laborHourlyCost: parseFloat(formData.get('laborHourlyCost') as string) || null,
        curingHours: parseFloat(formData.get('curingHours') as string) || null,
        curingBlocksNext: formData.get('curingBlocksNext') === 'true',
        workPhase: formData.get('workPhase') as string || null,
        wizardRole: formData.get('wizardRole') as string || null,
        wizardPriority: parseInt(formData.get('wizardPriority') as string) || null,
        wizardWorkTypes: JSON.parse(formData.get('wizardWorkTypes') as string || '[]'),
        wizardFinishes: JSON.parse(formData.get('wizardFinishes') as string || '[]'),
        wizardSupports: JSON.parse(formData.get('wizardSupports') as string || '[]'),
        wizardSystems: JSON.parse(formData.get('wizardSystems') as string || '[]'),
      };
      
      let saved;
      if (editingApu.id) {
        saved = await resourcesService.update(editingApu.id, updatedData);
        setApus(prev => prev.map(a => a.id === saved.id ? { ...a, ...saved } : a));
      } else {
        saved = await resourcesService.create(updatedData);
        setApus(prev => [saved, ...prev]);
      }
      
      setEditingApu(null);
    } catch (error) {
      console.error('Error updating APU:', error);
      alert('Error al guardar el APU. Verifica la conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApu = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este APU?')) return;
    try {
      await resourcesService.delete(id);
      setApus(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting APU:', error);
      alert('Error al eliminar el APU.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar APU por código o nombre..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] focus:bg-white transition-all shadow-sm"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer ml-2">
            <input 
              type="checkbox" 
              checked={showInactive} 
              onChange={e => setShowInactive(e.target.checked)} 
              className="rounded text-[#001c3a] focus:ring-[#001c3a]"
            />
            <span className="text-sm text-slate-600 font-medium">Mostrar inactivos</span>
          </label>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm">
            <Folder size={16} /> Nueva Carpeta
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-[#001c3a] text-white rounded-lg hover:bg-[#001c3a]/90 transition-colors text-sm font-medium shadow-md"
            onClick={() => setEditingApu({ resourceType: ResourceType.APU, isActive: true, unitCost: 0, margin: 0 } as any)}
          >
            <Plus size={16} /> Nuevo APU
          </button>
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Folder Tree */}
        <div className="w-64 border-r border-slate-100 bg-slate-50/50 flex flex-col h-full">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Carpetas</h3>
          </div>
          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-1">
            <div 
              className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                selectedFolderId === null ? 'bg-[#001c3a] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => setSelectedFolderId(null)}
            >
              <FileText size={16} className={selectedFolderId === null ? 'text-white/80' : 'text-slate-400'} />
              <span className="text-sm font-medium">Todos los APUs</span>
            </div>
            
            {folders.length === 0 ? (
              <div className="text-center py-8 px-4 text-slate-400 text-sm">
                No hay carpetas creadas.
              </div>
            ) : (
              folders.filter(f => !f.parentId).map(folder => (
                <FolderNode 
                  key={folder.id} 
                  folder={folder} 
                  selectedFolderId={selectedFolderId} 
                  onSelect={setSelectedFolderId} 
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Data Grid */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#001c3a]/20 border-t-[#001c3a] rounded-full animate-spin"></div>
            </div>
          )}
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200/80">
                <tr className="text-slate-500 font-medium">
                  <th className="px-6 py-4">Código / Nombre</th>
                  <th className="px-6 py-4">Carpeta</th>
                  <th className="px-6 py-4 text-right">Coste Base</th>
                  <th className="px-6 py-4 text-right">Margen</th>
                  <th className="px-6 py-4 text-right">Precio Venta</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right sticky right-0 bg-slate-50 z-20 border-l border-slate-200 shadow-[-4px_0_12px_rgba(0,0,0,0.03)]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apus.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Package size={48} className="text-slate-300" />
                        <p className="text-base font-medium text-slate-600">No se encontraron APUs</p>
                        <p className="text-sm">Prueba ajustando los filtros o seleccionando otra carpeta.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  apus.map((apu) => (
                    <tr key={apu.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{apu.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold text-[#001c3a] bg-[#001c3a]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                              {apu.code || 'S/C'}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">{apu.unit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          {apu.folder?.name ? (
                            <>
                              <Folder size={14} className="text-amber-500" />
                              <span className="text-sm font-medium">{apu.folder.name}</span>
                            </>
                          ) : (
                            <span className="text-sm italic text-slate-400">Sin carpeta</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-slate-700">{formatCurrency(apu.unitCost)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-emerald-600 font-medium">
                          {apu.margin ? `${apu.margin}%` : '0%'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-[#001c3a]">{formatCurrency(apu.salesPrice || apu.unitCost)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                          apu.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {apu.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right sticky right-0 bg-white z-10 border-l border-slate-100 group-hover:bg-slate-50/80 transition-colors shadow-[-4px_0_12px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" 
                            title="Desglose (Materiales y Componentes)"
                            onClick={() => setEditingApuComponents(apu)}
                          >
                            <Calculator size={16} />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-[#001c3a] hover:bg-slate-100 rounded-md transition-colors" title="Duplicar">
                            <Copy size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                            title="Editar"
                            onClick={() => setEditingApu(apu)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                            title="Eliminar"
                            onClick={() => handleDeleteApu(apu.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit APU Modal */}
      {editingApu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-[#001c3a] flex items-center gap-2">
                {editingApu.id ? <Edit size={20} className="text-amber-500" /> : <Plus size={20} className="text-emerald-500" />} 
                {editingApu.id ? 'Editar APU / Recurso' : 'Nuevo APU / Recurso'}
              </h3>
              <button 
                onClick={() => setEditingApu(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveApu} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 flex-1 overflow-y-auto max-h-[75vh] custom-scrollbar">
                
                {/* 1. INFORMACIÓN GENERAL */}
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Información General</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                      <input 
                        name="name"
                        defaultValue={editingApu.name || ''}
                        required
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Código</label>
                      <input 
                        name="code"
                        defaultValue={editingApu.code || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
                      <select 
                        name="resourceType"
                        defaultValue={editingApu.resourceType || ResourceType.APU}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      >
                        <option value="MATERIAL">Material</option>
                        <option value="MANO_OBRA">Mano de Obra</option>
                        <option value="MAQUINARIA">Maquinaria</option>
                        <option value="SUBCONTRATA">Subcontrata</option>
                        <option value="SUMINISTRO">Suministro</option>
                        <option value="CDC">Coste Directo (CDC)</option>
                        <option value="APU">APU</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Carpeta</label>
                      <select 
                        name="folderId"
                        defaultValue={editingApu.folderId || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      >
                        <option value="">Sin carpeta</option>
                        {folders.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Estado</label>
                      <select 
                        name="isActive"
                        defaultValue={editingApu.isActive !== false ? 'true' : 'false'}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Notas / Descripción técnica</label>
                      <textarea 
                        name="notes"
                        defaultValue={editingApu.notes || ''}
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* 2. COSTES Y RENDIMIENTO */}
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Costes y Rendimiento</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Unidad de Medida</label>
                      <input 
                        name="unit"
                        list="units-list"
                        placeholder="Ej: m², kg, ud..."
                        defaultValue={editingApu.unit || ''}
                        required
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                      <datalist id="units-list">
                        <option value="ud">Unidad</option>
                        <option value="m">Metro lineal</option>
                        <option value="m²">Metro cuadrado</option>
                        <option value="m³">Metro cúbico</option>
                        <option value="kg">Kilogramo</option>
                        <option value="t">Tonelada</option>
                        <option value="l">Litro</option>
                        <option value="h">Hora</option>
                        <option value="jor">Jornada</option>
                        <option value="pa">Partida alzada</option>
                        <option value="gl">Global</option>
                        <option value="mes">Mes</option>
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Proveedor (Opcional)</label>
                      <input 
                        name="provider"
                        defaultValue={editingApu.provider?.name || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    
                    <div className="col-span-2 grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Coste Base (€)</label>
                        <input 
                          name="unitCost"
                          type="number"
                          step="0.01"
                          defaultValue={editingApu.unitCost || 0}
                          required
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Margen (%)</label>
                        <input 
                          name="margin"
                          type="number"
                          step="0.1"
                          defaultValue={editingApu.margin || 0}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Precio Venta (€)</label>
                        <input 
                          name="salesPrice"
                          type="number"
                          step="0.01"
                          defaultValue={editingApu.salesPrice || editingApu.unitCost}
                          className="w-full px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-bold text-[#001c3a] focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Rendimiento (ud/h)</label>
                      <input 
                        name="yieldPerHour"
                        type="number"
                        step="0.01"
                        defaultValue={editingApu.yieldPerHour || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Costo Hora Cuadrilla (€)</label>
                      <input 
                        name="laborHourlyCost"
                        type="number"
                        step="0.01"
                        defaultValue={editingApu.laborHourlyCost || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. DETALLES DE EJECUCIÓN */}
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Detalles de Ejecución</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Nº Operarios Requeridos</label>
                      <input 
                        name="workersCount"
                        type="number"
                        defaultValue={editingApu.workersCount || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Fase de Obra</label>
                      <input 
                        name="workPhase"
                        placeholder="Ej: Preparación, Acabado..."
                        defaultValue={editingApu.workPhase || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Horas de Curado / Secado</label>
                      <input 
                        name="curingHours"
                        type="number"
                        step="0.5"
                        defaultValue={editingApu.curingHours || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    <div className="flex items-center mt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="curingBlocksNext" 
                          value="true"
                          defaultChecked={!!editingApu.curingBlocksNext}
                          className="w-4 h-4 text-[#001c3a] border-slate-300 rounded focus:ring-[#001c3a]"
                        />
                        <span className="text-sm font-semibold text-slate-700">El curado bloquea el paso siguiente</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 4. CLASIFICACIÓN WIZARD */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Package size={14} /> Clasificación Avanzada (Wizard)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Rol Lógico (Wizard)</label>
                      <input 
                        name="wizardRole"
                        placeholder="Ej: imprimacion, acabado..."
                        defaultValue={editingApu.wizardRole || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Prioridad de Ordenación</label>
                      <input 
                        name="wizardPriority"
                        type="number"
                        defaultValue={editingApu.wizardPriority || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    
                    <div className="col-span-2 mt-2">
                      <TagInput 
                        name="wizardWorkTypes" 
                        label="Tipos de Obra Compatibles" 
                        placeholder="Ej: reparacion, obra-nueva" 
                        initialTags={editingApu.wizardWorkTypes || []} 
                      />
                    </div>
                    <div className="col-span-2">
                      <TagInput 
                        name="wizardFinishes" 
                        label="Acabados Compatibles" 
                        placeholder="Ej: transitable, no-transitable" 
                        initialTags={editingApu.wizardFinishes || []} 
                      />
                    </div>
                    <div className="col-span-2">
                      <TagInput 
                        name="wizardSupports" 
                        label="Soportes Compatibles" 
                        placeholder="Ej: hormigon, ceramica, chapa" 
                        initialTags={editingApu.wizardSupports || []} 
                      />
                    </div>
                    <div className="col-span-2">
                      <TagInput 
                        name="wizardSystems" 
                        label="Sistemas Constructivos" 
                        placeholder="Ej: poliurea, poliuretano, epoxi" 
                        initialTags={editingApu.wizardSystems || []} 
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setEditingApu(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-all active:scale-95"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 text-sm font-bold text-white bg-[#001c3a] hover:bg-[#001c3a]/90 rounded-lg transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {isSaving ? <span className="animate-pulse">Guardando...</span> : 'Guardar APU / Recurso'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Editor de Componentes / Desglose */}
      {editingApuComponents && (
        <ApuEditorModal
          apu={editingApuComponents}
          onClose={() => setEditingApuComponents(null)}
          onUpdate={triggerReload}
        />
      )}
    </div>
  );
}
