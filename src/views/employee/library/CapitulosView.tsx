import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Folder, FolderOpen, ChevronRight, ChevronDown, Package, Edit, Trash2, Copy, FileText, Plus, X } from 'lucide-react';
import { Resource, ResourceFolder, resourcesService, ResourceType, ResourceComponent } from '../../../services/resources.service';
import CapituloComponentsEditor from './CapituloComponentsEditor';
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

export default function CapitulosView() {
  const { formatCurrency } = useCurrency();
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [capitulos, setCapítulos] = useState<Resource[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingCapitulo, setEditingCapitulo] = useState<Resource | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApuPickerOpen, setIsApuPickerOpen] = useState(false);
  const [apuToImport, setApuToImport] = useState<Resource | null>(null);
  const [apuQuantity, setApuQuantity] = useState<number | string>(1);
  const [draftComponents, setDraftComponents] = useState<ResourceComponent[]>([]);
  const [formKey, setFormKey] = useState(0);

  // Removed handleImportApu since we no longer link an APU base directly to a Capitulo

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
    const fetchCapítulos = async () => {
      setLoading(true);
      try {
        const data = await resourcesService.getAll({
          resourceType: ResourceType.CAPITULO,
          folderId: selectedFolderId || undefined,
          search: search || undefined,
          isActive: showInactive ? undefined : true
        });
        setCapítulos(data);
      } catch (error) {
        console.error('Error fetching Capítulos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchCapítulos();
    }, 300); // debounce search
    
    return () => clearTimeout(timeoutId);
  }, [selectedFolderId, search, showInactive]);

  ;

  const handleSaveCapitulo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCapitulo) return;
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const desc = formData.get('description') as string;
      
      const componentsSum = editingCapitulo.id 
        ? (editingCapitulo.components?.reduce((a, c) => a + (c.quantity * c.unitCost), 0) || 0)
        : draftComponents.reduce((a, c) => a + (c.quantity * c.unitCost), 0);
      
      const payload: Partial<Resource> = {
        name: `${title}${desc ? '\n' + desc : ''}`,
        code: formData.get('code') as string,
        folderId: (formData.get('folderId') as string) || null,
        notes: formData.get('notes') as string,
        isActive: formData.get('isActive') === 'true',
        unit: 'gl',
        unitCost: componentsSum,
        margin: 0,
        salesPrice: componentsSum,
      };
      
      let saved;
      if (editingCapitulo.id) {
        saved = await resourcesService.update(editingCapitulo.id, payload);
        setCapítulos(prev => prev.map(a => a.id === saved.id ? { ...a, ...saved } : a));
      } else {
        saved = await resourcesService.create({ ...payload, resourceType: ResourceType.CAPITULO });
        
        for (const comp of draftComponents) {
          await resourcesService.addComponent(saved.id, {
            concept: comp.concept,
            unit: comp.unit,
            quantity: comp.quantity,
            unitCost: comp.unitCost,
            childResourceId: comp.childResourceId
          });
        }
        
        const finalSaved = await resourcesService.getById(saved.id);
        setCapítulos(prev => [finalSaved, ...prev]);
      }
      
      setEditingCapitulo(null);
      setDraftComponents([]);
      setApuToImport(null);
      setApuQuantity(1);
    } catch (error) {
      console.error('Error updating Capitulo:', error);
      alert('Error al guardar la Capitulo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCapitulo = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este capítulo?')) return;
    try {
      await resourcesService.delete(id);
      setCapítulos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting capitulo:', error);
      alert('Error al eliminar el capítulo.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar Capítulo..." 
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
            <span className="text-sm text-slate-600 font-medium whitespace-nowrap">Mostrar inactivos</span>
          </label>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-[#001c3a] text-white rounded-lg hover:bg-[#001c3a]/90 transition-colors text-sm font-medium shadow-md"
            onClick={() => {
              setEditingCapitulo({ resourceType: ResourceType.CAPITULO, isActive: true } as any);
              setDraftComponents([]);
            }}
          >
            <Plus size={16} /> Nuevo Capítulo
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
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
              <span className="text-sm font-medium">Todos los Capítulos</span>
            </div>
            
            {folders.filter(f => !f.parentId).map(folder => (
              <FolderNode 
                key={folder.id} 
                folder={folder} 
                selectedFolderId={selectedFolderId} 
                onSelect={setSelectedFolderId} 
              />
            ))}
          </div>
        </div>

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
                  <th className="px-6 py-4">Título del Capítulo</th>
                  <th className="px-6 py-4">Carpeta</th>
                  <th className="px-6 py-4 text-center">Partidas</th>
                  <th className="px-6 py-4 text-right">Costo Total</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right sticky right-0 bg-slate-50 z-20 border-l border-slate-200 shadow-[-4px_0_12px_rgba(0,0,0,0.03)]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {capitulos.map((capitulo) => {
                  const title = capitulo.name ? capitulo.name.split('\n')[0] : '';
                  return (
                    <tr key={capitulo.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">{title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">{capitulo.folder?.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                          {capitulo.components?.length || 0} partidas
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        {formatCurrency(capitulo.components?.reduce((a, c) => a + (c.quantity * c.unitCost), 0) || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                          capitulo.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {capitulo.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right sticky right-0 bg-white z-10 border-l border-slate-100 group-hover:bg-slate-50/80 transition-colors shadow-[-4px_0_12px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                            onClick={() => setEditingCapitulo(capitulo)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                            onClick={() => handleDeleteCapitulo(capitulo.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingCapitulo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-[#001c3a]">Editar Capítulo</h3>
              <button onClick={() => { setEditingCapitulo(null); setDraftComponents([]); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form key={formKey} onSubmit={handleSaveCapitulo} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 flex-1 overflow-y-auto max-h-[75vh] custom-scrollbar">
                
                {/* 1. INFORMACIÓN GENERAL */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalles del Capítulo</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Título del Capítulo</label>
                      <input 
                        name="title"
                        defaultValue={editingCapitulo.name ? editingCapitulo.name.split('\n')[0] : ''}
                        required
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
                      <textarea 
                        name="description"
                        defaultValue={editingCapitulo.name && editingCapitulo.name.includes('\n') ? editingCapitulo.name.substring(editingCapitulo.name.indexOf('\n') + 1) : ''}
                        rows={4}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] resize-y"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Código</label>
                      <input 
                        name="code"
                        defaultValue={editingCapitulo.code || ''}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Carpeta</label>
                      <select 
                        name="folderId"
                        defaultValue={editingCapitulo.folderId || ''}
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
                        defaultValue={editingCapitulo.isActive !== false ? 'true' : 'false'}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Notas internas</label>
                      <textarea 
                        name="notes"
                        defaultValue={editingCapitulo.notes || ''}
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* 3. COMPOSICIÓN */}
                <CapituloComponentsEditor 
                  capituloId={editingCapitulo.id} 
                  initialComponents={draftComponents}
                  onChange={setDraftComponents}
                />

              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => { setEditingCapitulo(null); setDraftComponents([]); setApuToImport(null); }}
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
                  {isSaving ? <span className="animate-pulse">Guardando...</span> : 'Guardar Capitulo'}
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
        onSelect={(apu) => { /* Dummy */ }}
        resourceType={ResourceType.PARTIDA}
        title="Seleccionar Partida"
      />
    </div>
  );
}
