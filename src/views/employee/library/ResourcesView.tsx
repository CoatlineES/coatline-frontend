import React, { useState, useEffect, useRef } from 'react';
import { Search, Copy, Edit2, Trash2, Folder, FolderOpen, FileSpreadsheet, Plus, X, Save, ChevronRight, ChevronDown, FileText, Download } from 'lucide-react';
import ApuEditorModal from './ApuEditorModal';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Resource, resourcesService, ResourceFolder } from '../../../services/resources.service';
import { useCurrency } from '../../../hooks/useCurrency';

const RESOURCE_TYPES = [
  { id: '', label: 'Todos' },
  { id: 'MATERIAL', label: 'Material' },
  { id: 'MANO_OBRA', label: 'Mano de obra' },
  { id: 'SUMINISTRO', label: 'Suministro' },
  { id: 'MAQUINARIA', label: 'Maquinaria' },
  { id: 'SUBCONTRATA', label: 'Subcontrata' },
  { id: 'CDC', label: 'CDC' },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'MAQUINARIA':
      return 'bg-orange-100 text-orange-700';
    case 'MATERIAL':
      return 'bg-blue-100 text-blue-700';
    case 'MANO_OBRA':
      return 'bg-purple-100 text-purple-700';
    case 'SUMINISTRO':
      return 'bg-green-100 text-green-700';
    case 'SUBCONTRATA':
      return 'bg-pink-100 text-pink-700';
    case 'CDC':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const getTypeName = (type: string) => {
  return RESOURCE_TYPES.find(t => t.id === type)?.label || type;
};

const FolderNode = ({ 
  folder, 
  selectedFolderId, 
  onSelect,
  onEdit,
  onDelete
}: { 
  folder: ResourceFolder; 
  selectedFolderId: string | null; 
  onSelect: (id: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedFolderId === folder.id;
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={`group flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
          isSelected ? 'bg-[#002D5A]/10 text-[#002D5A] font-semibold' : 'text-slate-600 hover:bg-slate-100'
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
          <FolderOpen size={16} className={isSelected ? 'text-[#002D5A]' : 'text-amber-500 min-w-[16px]'} />
        ) : (
          <Folder size={16} className="text-amber-500 min-w-[16px]" />
        )}
        
        <span className="text-sm truncate flex-1">{folder.name}</span>

        {/* Acciones de carpeta (editar/borrar) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(folder.id, folder.name); }}
            className="p-1 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded transition-colors"
            title="Editar carpeta"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(folder.id); }}
            className="p-1 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded transition-colors"
            title="Eliminar carpeta"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      
      {hasChildren && isOpen && (
        <div className="ml-4 pl-2 border-l border-slate-200 mt-1 flex flex-col gap-1">
          {folder.children!.map(child => (
            <FolderNode 
              key={child.id} 
              folder={child} 
              selectedFolderId={selectedFolderId} 
              onSelect={onSelect} 
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ResourcesView() {
  const { formatCurrency } = useCurrency();
  const [resources, setResources] = useState<Resource[]>([]);
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null);
  const [editingApu, setEditingApu] = useState<Resource | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, fData] = await Promise.all([
        resourcesService.getAll({
          search: search || undefined,
          resourceType: activeFilter || undefined,
          folderId: selectedFolderId || undefined,
          isActive: showInactive ? undefined : true
        }),
        resourcesService.getFolders()
      ]);
      setResources(resData);
      setFolders(fData);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Error al cargar los recursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, activeFilter, selectedFolderId, showInactive]);

  const handleSaveResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingResource) return;

    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      resourceType: formData.get('resourceType') as any,
      folderId: formData.get('folderId') as string || null,
      unit: formData.get('unit') as string || 'ud',
      unitCost: parseFloat(formData.get('unitCost') as string) || 0,
      margin: parseFloat(formData.get('margin') as string) || 0,
      salesPrice: parseFloat(formData.get('salesPrice') as string) || 0,
      notes: formData.get('notes') as string || '',
      isActive: formData.get('isActive') === 'true',
    };

    try {
      setIsSaving(true);
      if (editingResource.id) {
        await resourcesService.update(editingResource.id, data);
        toast.success('Recurso actualizado correctamente');
      } else {
        await resourcesService.create(data);
        toast.success('Recurso creado correctamente');
      }
      setEditingResource(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el recurso');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas desactivar este recurso?')) return;
    try {
      await resourcesService.delete(id);
      toast.success('Recurso desactivado correctamente');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al desactivar el recurso');
    }
  };

  const handleDuplicateResource = async (resource: Resource) => {
    try {
      const data: any = {
        name: `${resource.name} (Copia)`,
        code: `${resource.code || ''}-COPIA`,
        resourceType: resource.resourceType,
        folderId: resource.folderId,
        unit: resource.unit,
        unitCost: resource.unitCost,
        margin: resource.margin,
        salesPrice: resource.salesPrice,
        notes: resource.notes,
        isActive: true,
      };
      await resourcesService.create(data);
      toast.success('Recurso duplicado correctamente');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al duplicar el recurso');
    }
  };

  const handleCreateFolder = async () => {
    const folderName = window.prompt('Nombre de la nueva carpeta:');
    if (!folderName) return;

    try {
      await resourcesService.createFolder({
        name: folderName,
        parentId: selectedFolderId || undefined
      });
      toast.success('Carpeta creada correctamente');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al crear la carpeta');
    }
  };

  const handleEditFolder = async (id: string, currentName: string) => {
    const newName = window.prompt('Nuevo nombre de la carpeta:', currentName);
    if (!newName || newName === currentName) return;

    try {
      await resourcesService.updateFolder(id, { name: newName });
      toast.success('Carpeta actualizada correctamente');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar la carpeta');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta carpeta?')) return;
    try {
      await resourcesService.deleteFolder(id);
      if (selectedFolderId === id) setSelectedFolderId(null);
      toast.success('Carpeta eliminada correctamente');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar la carpeta. Asegúrate de que esté vacía.');
    }
  };

  

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const blob = await resourcesService.exportExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Recursos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Recursos exportados correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al exportar los recursos');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const result = await resourcesService.importExcel(file);
      toast.success(`Se han importado/actualizado ${result.data.importedCount} recursos correctamente`);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al importar los recursos. Revisa el formato del archivo.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] relative">
      {/* Header */}
      <div className="px-8 py-6 flex justify-between items-center bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Biblioteca de recursos</h1>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportExcel} 
            accept=".xlsx,.xls" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isImporting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <FileSpreadsheet size={16} />}
            {isImporting ? 'Importando...' : 'Importar'}
          </button>
          <button 
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Download size={16} />}
            {isExporting ? 'Exportando...' : 'Exportar'}
          </button>
          <button 
            onClick={handleCreateFolder}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <Folder size={16} /> Carpeta
          </button>
          <button 
            onClick={() => {
              setEditingResource({ resourceType: activeFilter || 'MATERIAL', isActive: true } as Partial<Resource>);
              setFormKey(prev => prev + 1);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#002D5A] text-white rounded-lg hover:bg-[#002D5A]/90 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Nuevo recurso
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Carpetas */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">CARPETAS</h3>
            <div className="space-y-1">
              <div 
                className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  selectedFolderId === null ? 'bg-[#002D5A] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setSelectedFolderId(null)}
              >
                <FileText size={16} className={selectedFolderId === null ? 'text-white/80' : 'text-slate-400'} />
                <span className="text-sm font-medium">Todas las carpetas</span>
              </div>
              
              <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
                {folders.filter(f => !f.parentId).map(folder => (
                  <FolderNode 
                    key={folder.id} 
                    folder={folder} 
                    selectedFolderId={selectedFolderId} 
                    onSelect={setSelectedFolderId} 
                    onEdit={handleEditFolder}
                    onDelete={handleDeleteFolder}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content (Filtros y Tabla) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between gap-4">
              {/* Input Buscador */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar recurso o proveedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent placeholder:text-slate-400"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer ml-2">
                <input 
                  type="checkbox" 
                  checked={showInactive} 
                  onChange={e => setShowInactive(e.target.checked)} 
                  className="rounded text-[#002D5A] focus:ring-[#002D5A]"
                />
                <span className="text-sm text-slate-600 font-medium whitespace-nowrap">Mostrar inactivos</span>
              </label>

              {/* Pills Filtros */}
              <div className="flex p-1 bg-slate-100 rounded-lg">
                {RESOURCE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setActiveFilter(type.id)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95 ${
                      activeFilter === type.id
                        ? 'bg-[#2a3f54] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="flex-1 overflow-auto relative">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium text-slate-500 w-[40%]">Nombre</th>
                  <th className="px-6 py-4 font-medium text-slate-500">Tipo</th>
                  <th className="px-6 py-4 font-medium text-slate-500">Unidad</th>
                  <th className="px-6 py-4 font-medium text-slate-500 text-right">Coste</th>
                  <th className="px-6 py-4 font-medium text-slate-500">Proveedor</th>
                  <th className="px-6 py-4 font-medium text-slate-500 text-center">Estado</th>
                  <th className="px-6 py-4 font-medium text-slate-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#002D5A] border-t-transparent rounded-full animate-spin"></div>
                        <span>Cargando recursos...</span>
                      </div>
                    </td>
                  </tr>
                ) : resources.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No se encontraron recursos.
                    </td>
                  </tr>
                ) : (
                  resources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{resource.name}</span>
                          <span className="text-xs text-slate-400">{resource.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(resource.resourceType)}`}>
                          {getTypeName(resource.resourceType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{resource.unit}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        {formatCurrency(resource.unitCost)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {resource.provider?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {resource.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#002D5A]/10 text-[#002D5A]">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors" 
                            title="Duplicar"
                            onClick={() => handleDuplicateResource(resource)}
                          >
                            <Copy size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                            title="Editar"
                            onClick={() => {
                              if (resource.resourceType === ResourceType.APU) {
                                setEditingApu(resource);
                              } else {
                                setEditingResource(resource);
                                setFormKey(prev => prev + 1);
                              }
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                            title="Borrar"
                            onClick={() => handleDeleteResource(resource.id)}
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

      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-[#002D5A]">
                {editingResource.id ? 'Editar Recurso' : 'Nuevo Recurso'}
              </h3>
              <button onClick={() => setEditingResource(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form key={formKey} onSubmit={handleSaveResource} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                    <input 
                      name="name"
                      defaultValue={editingResource.name || ''}
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Código</label>
                    <input 
                      name="code"
                      defaultValue={editingResource.code || ''}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Recurso</label>
                    <select 
                      name="resourceType"
                      defaultValue={editingResource.resourceType || 'MATERIAL'}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent"
                    >
                      {RESOURCE_TYPES.filter(t => t.id !== '').map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Carpeta</label>
                    <select 
                      name="folderId"
                      defaultValue={editingResource.folderId || ''}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent"
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
                      defaultValue={editingResource.isActive !== false ? 'true' : 'false'}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Unidad</label>
                    <input 
                      name="unit"
                      defaultValue={editingResource.unit || 'ud'}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Costo Unitario</label>
                    <input 
                      name="unitCost"
                      type="number"
                      step="0.01"
                      defaultValue={editingResource.unitCost || 0}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Margen (%)</label>
                    <input 
                      name="margin"
                      type="number"
                      step="0.01"
                      defaultValue={editingResource.margin || 0}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Precio de Venta</label>
                    <input 
                      name="salesPrice"
                      type="number"
                      step="0.01"
                      defaultValue={editingResource.salesPrice || 0}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Notas internas</label>
                    <textarea 
                      name="notes"
                      defaultValue={editingResource.notes || ''}
                      rows={3}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent resize-y"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-[#002D5A] text-white rounded-lg hover:bg-[#002D5A]/90 transition-all active:scale-95 font-medium disabled:opacity-50 text-sm shadow-md hover:shadow-lg"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-[#002D5A]/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar Recurso'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {editingApu && (
        <ApuEditorModal 
          apu={editingApu}
          onClose={() => setEditingApu(null)}
          onUpdate={() => {
            fetchData();
            // Refetch current APU to update modal data
            resourcesService.getById(editingApu.id).then(setEditingApu);
          }}
        />
      )}
    </div>
  );
}
