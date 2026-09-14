import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Folder, FolderOpen, ChevronRight, ChevronDown, Package, Edit, Trash2, Copy, FileText, Plus, X, Layers } from 'lucide-react';
import { Resource, ResourceFolder, resourcesService, ResourceType } from '../../../services/resources.service';
import PartidaComponentsEditor from './PartidaComponentsEditor';
import ApuPickerModal from '../quotations/ApuPickerModal';
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

export default function PartidasView() {
  const { formatCurrency } = useCurrency();
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [partidas, setPartidas] = useState<Resource[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPartida, setEditingPartida] = useState<Resource | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApuPickerOpen, setIsApuPickerOpen] = useState(false);
  const [apuToImport, setApuToImport] = useState<Resource | null>(null);
  const [apuQuantity, setApuQuantity] = useState<number | string>(1);
  const [formKey, setFormKey] = useState(0);

  const handleImportApu = (apu: Resource) => {
    setEditingPartida({
      ...editingPartida,
      name: apu.name,
      code: apu.code,
      unit: apu.unit,
      unitCost: apu.unitCost,
      margin: apu.margin,
      salesPrice: apu.salesPrice,
      notes: apu.notes,
    } as any);
    setApuToImport(apu);
    setFormKey(prev => prev + 1);
    setIsApuPickerOpen(false);
  };

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
    const fetchPartidas = async () => {
      setLoading(true);
      try {
        const data = await resourcesService.getAll({
          resourceType: ResourceType.PARTIDA,
          folderId: selectedFolderId || undefined,
          search: search || undefined,
          isActive: showInactive ? undefined : true
        });
        setPartidas(data);
      } catch (error) {
        console.error('Error fetching Partidas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchPartidas();
    }, 300); // debounce search
    
    return () => clearTimeout(timeoutId);
  }, [selectedFolderId, search, showInactive]);

  ;

  const handleSavePartida = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPartida) return;
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const finalName = description ? `${title}\n${description}` : title;

      const rawCode = (formData.get('code') as string)?.trim();
      const updatedData = {
        name: finalName,
        code: rawCode ? rawCode : null,
        resourceType: ResourceType.PARTIDA,
        unit: formData.get('unit') as string,
        unitCost: parseFloat(formData.get('unitCost') as string) || 0,
        margin: parseFloat(formData.get('margin') as string) || 0,
        salesPrice: parseFloat(formData.get('salesPrice') as string) || 0,
        defaultQuantity: parseFloat(formData.get('defaultQuantity') as string) || 1,
        folderId: formData.get('folderId') as string || null,
        notes: formData.get('notes') as string,
        isActive: formData.get('isActive') === 'true',
      };
      
      let saved;
      if (editingPartida.id) {
        saved = await resourcesService.update(editingPartida.id, updatedData);
        setPartidas(prev => prev.map(a => a.id === saved.id ? { ...a, ...saved } : a));
      } else {
        saved = await resourcesService.create(updatedData);
        setPartidas(prev => [saved, ...prev]);

        if (apuToImport) {
          const [title, ...descParts] = (apuToImport.name || '').split('\n');
          const concept = `${title}${descParts.length > 0 ? '\n' + descParts.join('\n') : ''}`;
          await resourcesService.addComponent(saved.id, {
            childResourceId: apuToImport.id,
            concept,
            unit: apuToImport.unit,
            quantity: parseFloat(apuQuantity.toString()) || 1,
            unitCost: apuToImport.salesPrice || apuToImport.unitCost,
          });
        }
      }
      
      setEditingPartida(null);
      setApuToImport(null);
      setApuQuantity(1);
    } catch (error: any) {
      console.error('Error updating Partida:', error);
      const backendMessage = error.response?.data?.message || '';
      alert('Error al guardar la Partida: ' + (backendMessage || 'Verifica la conexión con el servidor.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePartida = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar esta partida?')) return;
    try {
      await resourcesService.delete(id);
      setPartidas(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting partida:', error);
      alert('Error al eliminar la partida.');
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
              placeholder="Buscar Partida por código o nombre..." 
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
            onClick={() => setEditingPartida({ resourceType: ResourceType.PARTIDA, isActive: true, unitCost: 0, margin: 0 } as any)}
          >
            <Plus size={16} /> Nueva Partida
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
              <span className="text-sm font-medium">Todas las Partidas</span>
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
                {partidas.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Package size={48} className="text-slate-300" />
                        <p className="text-base font-medium text-slate-600">No se encontraron Partidas</p>
                        <p className="text-sm">Prueba ajustando los filtros o seleccionando otra carpeta.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  partidas.map((partida) => {
                    const title = partida.name ? partida.name.split('\n')[0] : '';
                    return (
                    <tr key={partida.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{title}</span>
                            {partida.isGroup && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider"><Layers size={10}/> Agrupada</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold text-[#001c3a] bg-[#001c3a]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                              {partida.code || 'S/C'}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">{partida.unit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          {partida.folder?.name ? (
                            <>
                              <Folder size={14} className="text-amber-500" />
                              <span className="text-sm font-medium">{partida.folder.name}</span>
                            </>
                          ) : (
                            <span className="text-sm italic text-slate-400">Sin carpeta</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-slate-700">{formatCurrency(partida.unitCost)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-emerald-600 font-medium">
                          {partida.margin ? `${partida.margin}%` : '0%'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-[#001c3a]">{formatCurrency(partida.salesPrice || partida.unitCost)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                          partida.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {partida.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right sticky right-0 bg-white z-10 border-l border-slate-100 group-hover:bg-slate-50/80 transition-colors shadow-[-4px_0_12px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-[#001c3a] hover:bg-slate-100 rounded-md transition-colors" title="Duplicar">
                            <Copy size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                            title="Editar"
                            onClick={() => setEditingPartida(partida)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                            title="Eliminar"
                            onClick={() => handleDeletePartida(partida.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Partida Modal */}
      {editingPartida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-[#001c3a] flex items-center gap-2">
                {editingPartida.id ? <Edit size={20} className="text-amber-500" /> : <Plus size={20} className="text-emerald-500" />} 
                {editingPartida.id ? 'Editar Partida' : 'Nueva Partida'}
              </h3>
              <button 
                onClick={() => { setEditingPartida(null); setApuToImport(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <form key={formKey} onSubmit={handleSavePartida} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 flex-1 overflow-y-auto max-h-[75vh] custom-scrollbar">
                
                {/* 1. INFORMACIÓN GENERAL */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Información General</h4>
                    {!editingPartida.id && !apuToImport && (
                      <button
                        type="button"
                        onClick={() => setIsApuPickerOpen(true)}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md shadow-sm hover:shadow transition-all"
                      >
                        <Package size={14} /> Vincular un APU principal
                      </button>
                    )}
                  </div>
                  
                  {apuToImport && !editingPartida.id && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-4">
                      <div className="p-2 bg-amber-100 rounded-md text-amber-600">
                        <Package size={20} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-amber-900 text-sm">Vincular APU base (Opcional):</h5>
                        <p className="text-sm text-amber-800 font-semibold mt-0.5">{apuToImport.name.split('\n')[0]}</p>
                        
                        <div className="mt-3 flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-bold text-amber-900">Cantidad requerida de este APU:</label>
                            <input 
                              type="number" 
                              step="0.01" 
                              value={apuQuantity}
                              onChange={e => setApuQuantity(e.target.value)}
                              className="w-24 px-3 py-1 bg-white border border-amber-300 rounded-md text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <span className="text-sm font-medium text-amber-800">{apuToImport.unit}</span>
                          </div>
                          <span className="text-xs text-amber-700 mt-1 italic">
                            * Podrás agregar múltiples APUs adicionales o componentes manuales después de guardar.
                          </span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setApuToImport(null)}
                        className="p-1 hover:bg-amber-100 text-amber-500 rounded-md"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Título de la Partida</label>
                      <input 
                        name="title"
                        defaultValue={editingPartida.name ? editingPartida.name.split('\n')[0] : ''}
                        required
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción de la Partida</label>
                      <textarea 
                        name="description"
                        defaultValue={editingPartida.name && editingPartida.name.includes('\n') ? editingPartida.name.substring(editingPartida.name.indexOf('\n') + 1) : ''}
                        rows={4}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] resize-y"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Código</label>
                      <input 
                        name="code"
                        defaultValue={editingPartida.code || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Carpeta</label>
                      <select 
                        name="folderId"
                        defaultValue={editingPartida.folderId || ''}
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
                        defaultValue={editingPartida.isActive !== false ? 'true' : 'false'}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Notas internas adicionales</label>
                      <textarea 
                        name="notes"
                        defaultValue={editingPartida.notes || ''}
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
                        defaultValue={editingPartida.unit || ''}
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
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Cantidad por defecto</label>
                      <input 
                        name="defaultQuantity"
                        type="number"
                        step="0.01"
                        defaultValue={(editingPartida as any).defaultQuantity ?? 1}
                        required
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Proveedor (Opcional)</label>
                      <input 
                        name="provider"
                        defaultValue={editingPartida.provider?.name || ''}
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
                          defaultValue={editingPartida.unitCost || 0}
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
                          defaultValue={editingPartida.margin || 0}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Precio Venta (€)</label>
                        <input 
                          name="salesPrice"
                          type="number"
                          step="0.01"
                          defaultValue={editingPartida.salesPrice || editingPartida.unitCost}
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
                        defaultValue={editingPartida.yieldPerHour || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. COMPOSICIÓN (SÓLO SI LA PARTIDA YA EXISTE) */}
                {editingPartida.id && (
                  <PartidaComponentsEditor partidaId={editingPartida.id} />
                )}

              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => { setEditingPartida(null); setApuToImport(null); }}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 text-sm font-bold text-white bg-[#001c3a] hover:bg-[#001c3a]/90 rounded-lg transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {isSaving ? <span className="animate-pulse">Guardando...</span> : 'Guardar Partida'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* APU Picker Modal */}
      <ApuPickerModal 
        isOpen={isApuPickerOpen} 
        onClose={() => setIsApuPickerOpen(false)} 
        onSelect={handleImportApu}
        resourceType={ResourceType.APU}
      />
    </div>
  );
}
