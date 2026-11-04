import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Search, Package, Check, Layers, Folder, FolderOpen, 
  BookOpen, ChevronRight, ChevronDown, Plus, RefreshCw, FileText,
  CornerDownRight, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resourcesService, Resource, ResourceFolder, ResourceType } from '../../../services/resources.service';
import { useCurrency } from '../../../hooks/useCurrency';
import toast from 'react-hot-toast';

export interface ApuPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (apu: Resource, targetChapterId?: string) => void;
  resourceType?: ResourceType;
  title?: string;
  chapters?: { id: string; title: string }[];
  currentChapterId?: string;
}

export default function ApuPickerModal({
  isOpen,
  onClose,
  onSelect,
  resourceType,
  title,
  chapters = [],
  currentChapterId
}: ApuPickerModalProps) {
  const { formatCurrency } = useCurrency();

  // Selected chapter for insertion
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    if (currentChapterId) return currentChapterId;
    if (chapters && chapters.length > 0) return chapters[0].id;
    return '';
  });

  // Folders & Data
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Type filter: 'ALL' | 'PARTIDA' | 'APU' | 'CAPITULO'
  const [typeFilter, setTypeFilter] = useState<'ALL' | ResourceType>(() => {
    if (resourceType) return resourceType;
    return 'ALL';
  });

  // Folder creation inline state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isSubmittingFolder, setIsSubmittingFolder] = useState(false);

  // Quick Partida creation modal
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickForm, setQuickForm] = useState({
    name: '',
    description: '',
    unit: 'ud',
    unitCost: 0,
    margin: 0,
    resourceType: resourceType === ResourceType.APU ? ResourceType.APU : ResourceType.PARTIDA,
    folderId: ''
  });
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  // Load folders once when modal is open
  const fetchFolders = async () => {
    try {
      const data = await resourcesService.getFolders();
      setFolders(data || []);
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen]);

  // Sync selected chapter if currentChapterId or chapters change
  useEffect(() => {
    if (currentChapterId) {
      setSelectedChapterId(currentChapterId);
    } else if (chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [currentChapterId, chapters]);

  // Load resources based on active filters
  const fetchResources = async () => {
    setLoading(true);
    try {
      const effectiveType = typeFilter !== 'ALL' ? typeFilter : undefined;
      const data = await resourcesService.getAll({
        resourceType: effectiveType,
        folderId: selectedFolderId || undefined,
        search: search.trim() || undefined,
        isActive: true,
      });
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching resources for library picker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      fetchResources();
    }, 200);
    return () => clearTimeout(timeout);
  }, [isOpen, selectedFolderId, search, typeFilter]);

  // Organize root & child folders
  const rootFolders = useMemo(() => {
    return folders.filter(f => !f.parentId);
  }, [folders]);

  // Get current active folder object
  const currentFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return folders.find(f => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

  // Subfolders of the currently active folder (or root folders if at root)
  const currentSubfolders = useMemo(() => {
    if (!selectedFolderId) {
      return rootFolders;
    }
    return folders.filter(f => f.parentId === selectedFolderId);
  }, [folders, selectedFolderId, rootFolders]);

  if (!isOpen) return null;

  // Handle folder creation
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsSubmittingFolder(true);
    try {
      const created = await resourcesService.createFolder({
        name: newFolderName.trim(),
        parentId: selectedFolderId || undefined,
      });
      toast.success('Carpeta creada');
      setNewFolderName('');
      setIsCreatingFolder(false);
      await fetchFolders();
      if (created?.id) {
        setSelectedFolderId(created.id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al crear la carpeta');
    } finally {
      setIsSubmittingFolder(false);
    }
  };

  // Handle quick item creation
  const handleQuickCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickForm.name.trim()) return;
    setIsSubmittingQuick(true);
    try {
      const fullName = quickForm.description.trim()
        ? `${quickForm.name.trim()}\n${quickForm.description.trim()}`
        : quickForm.name.trim();

      const created = await resourcesService.create({
        name: fullName,
        resourceType: quickForm.resourceType,
        unit: quickForm.unit || 'ud',
        unitCost: Number(quickForm.unitCost || 0),
        margin: Number(quickForm.margin || 0),
        folderId: quickForm.folderId || selectedFolderId || undefined,
        isActive: true,
      });

      toast.success('Partida creada en la biblioteca');
      setShowQuickCreate(false);
      setQuickForm({
        name: '',
        description: '',
        unit: 'ud',
        unitCost: 0,
        margin: 0,
        resourceType: resourceType === ResourceType.APU ? ResourceType.APU : ResourceType.PARTIDA,
        folderId: ''
      });

      // Immediately select the created item
      onSelect(created, selectedChapterId || undefined);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error al crear la partida');
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  // Dynamic modal title
  const modalTitle = title || (
    resourceType === ResourceType.APU 
      ? 'Biblioteca de APUs' 
      : resourceType === ResourceType.CAPITULO 
        ? 'Biblioteca de Capítulos' 
        : 'Biblioteca de partidas'
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] max-h-[820px] flex flex-col overflow-hidden border border-slate-200"
        >
          {/* TOP HEADER */}
          <div className="h-14 px-5 sm:px-6 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <BookOpen size={20} className="text-slate-700 shrink-0" />
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                {modalTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Insertar en: Select */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Insertar en:
                </span>
                <select 
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[170px] sm:max-w-[220px] truncate"
                >
                  {chapters && chapters.length > 0 ? (
                    <>
                      {chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.title}
                        </option>
                      ))}
                      <option value="">Sin capítulo</option>
                    </>
                  ) : (
                    <option value="">Sin capítulo</option>
                  )}
                </select>
              </div>

              {/* Close Button */}
              <button 
                type="button"
                onClick={onClose} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* MAIN MODAL BODY: SIDEBAR + CONTENT */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            
            {/* LEFT SIDEBAR: FOLDERS */}
            <div className="w-60 sm:w-64 border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0">
              {/* Folder list scroll */}
              <div className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
                {/* Todas las partidas item */}
                <button
                  type="button"
                  onClick={() => setSelectedFolderId(null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    selectedFolderId === null
                      ? 'bg-[#001c3a] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <BookOpen size={15} className={selectedFolderId === null ? 'text-white' : 'text-slate-500'} />
                    <span className="truncate">Todas las partidas</span>
                  </div>
                </button>

                {/* Separator */}
                <div className="py-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Carpetas
                </div>

                {/* Recursive Folder Node List */}
                {rootFolders.length === 0 ? (
                  <div className="text-center py-6 px-2 text-xs text-slate-400 italic">
                    Sin carpetas creadas
                  </div>
                ) : (
                  rootFolders.map((folder) => {
                    const isSelected = selectedFolderId === folder.id;
                    const children = folders.filter(f => f.parentId === folder.id);
                    const hasChildren = children.length > 0;

                    return (
                      <div key={folder.id} className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => setSelectedFolderId(folder.id)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200 shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                          title={folder.name}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isSelected ? (
                              <FolderOpen size={15} className="text-blue-600 shrink-0" />
                            ) : (
                              <Folder size={15} className="text-slate-400 shrink-0" />
                            )}
                            <span className="truncate">{folder.name}</span>
                          </div>
                        </button>

                        {/* Children folders if any */}
                        {hasChildren && (
                          <div className="pl-4 space-y-0.5 border-l border-slate-200 ml-3">
                            {children.map((child) => {
                              const isChildSelected = selectedFolderId === child.id;
                              return (
                                <button
                                  key={child.id}
                                  type="button"
                                  onClick={() => setSelectedFolderId(child.id)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                                    isChildSelected
                                      ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200 shadow-2xs'
                                      : 'text-slate-600 hover:bg-slate-200/60'
                                  }`}
                                  title={child.name}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <Folder size={13} className={isChildSelected ? 'text-blue-600' : 'text-slate-400'} />
                                    <span className="truncate">{child.name}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom: + Nueva Carpeta */}
              <div className="p-3 border-t border-slate-200 bg-white">
                {isCreatingFolder ? (
                  <form onSubmit={handleCreateFolder} className="space-y-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Nombre de la carpeta..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#001c3a] text-slate-800"
                    />
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingFolder || !newFolderName.trim()}
                        className="px-2.5 py-1 text-[11px] font-bold bg-[#001c3a] text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
                      >
                        {isSubmittingFolder ? 'Creando...' : 'Crear'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl border border-dashed border-slate-300 transition-colors cursor-pointer justify-center"
                  >
                    <Plus size={14} className="text-slate-500" />
                    <span>Nueva carpeta</span>
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT MAIN PANEL */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              
              {/* TOP SEARCH & ACTION BAR */}
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input 
                    type="text" 
                    placeholder="Buscar partidas..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/15 focus:bg-white focus:border-slate-300 transition-all shadow-2xs"
                  />
                  {search && (
                    <button 
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Type Filter Pills (Todas, Partidas, APUs) */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setTypeFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      typeFilter === 'ALL'
                        ? 'bg-white text-[#001c3a] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter(ResourceType.PARTIDA)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      typeFilter === ResourceType.PARTIDA
                        ? 'bg-white text-[#001c3a] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Partidas
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter(ResourceType.APU)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      typeFilter === ResourceType.APU
                        ? 'bg-white text-amber-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    APUs
                  </button>
                </div>

                {/* + Nueva Partida Button */}
                <button
                  type="button"
                  onClick={() => setShowQuickCreate(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-95 shrink-0 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Nueva partida</span>
                </button>
              </div>

              {/* BREADCRUMB & SUBFOLDER CHIPS */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/40 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    {selectedFolderId && (
                      <button
                        type="button"
                        onClick={() => setSelectedFolderId(null)}
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Raíz
                        <ChevronRight size={13} className="text-slate-400" />
                      </button>
                    )}
                    <span>
                      {currentFolder ? currentFolder.name : 'Raíz'} ({items.length} {items.length === 1 ? 'partida' : 'partidas'})
                    </span>
                  </div>
                </div>

                {/* Category Pills matching the example screenshot */}
                {currentSubfolders.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentSubfolders.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFolderId(f.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        title={`Ir a ${f.name}`}
                      >
                        <Folder size={13} className="text-amber-500 shrink-0" />
                        <span className="truncate max-w-[180px]">{f.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RESULTS LIST */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col justify-center items-center h-48 text-slate-400 gap-2">
                    <RefreshCw size={24} className="animate-spin text-slate-400" />
                    <span className="text-xs font-semibold">Cargando biblioteca...</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-16 px-4 text-slate-400">
                    <Package size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No se encontraron partidas</p>
                    <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otra carpeta o buscando con otros términos.</p>
                  </div>
                ) : (
                  items.map((item) => {
                    const [titleLine, ...descLines] = (item.name || '').split('\n');
                    const titleText = titleLine || item.name;
                    const descriptionText = descLines.join(' ') || item.notes || '';
                    const isApu = item.resourceType === ResourceType.APU || (item.components && item.components.length > 0);
                    const calculatedSalesPrice = item.salesPrice || (item.unitCost ? item.unitCost * (1 + (item.margin || 0) / 100) : 0);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelect(item, selectedChapterId || undefined);
                          onClose();
                        }}
                        className="group flex items-center justify-between p-4 px-6 hover:bg-blue-50/30 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-[#001c3a]"
                      >
                        {/* Left Info Column */}
                        <div className="flex-1 pr-4 min-w-0">
                          {/* Title & Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-[#001c3a] transition-colors">
                              {titleText}
                            </span>
                            
                            {/* APU Badge */}
                            {isApu && (
                              <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-300/80 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs shrink-0">
                                📒 APU
                              </span>
                            )}

                            {/* Grouped badge */}
                            {(item as any).isGroup && (
                              <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs shrink-0">
                                <Layers size={10} /> Agrupada
                              </span>
                            )}
                          </div>

                          {/* Description snippet */}
                          {descriptionText && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal">
                              {descriptionText}
                            </p>
                          )}

                          {/* Unit, Cost, Margin Line */}
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1 flex-wrap">
                            <span>{item.unit || 'ud'}</span>
                            <span>&bull;</span>
                            <span>Coste: {formatCurrency(item.unitCost || 0)}</span>
                            <span>&bull;</span>
                            <span>Margen: {item.margin || 0}%</span>
                            {item.code && (
                              <>
                                <span>&bull;</span>
                                <span className="font-mono text-[11px] font-bold text-slate-400">[{item.code}]</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right: Price & Insert Button */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-base font-extrabold text-slate-900 tracking-tight">
                              {formatCurrency(calculatedSalesPrice)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(item, selectedChapterId || undefined);
                              onClose();
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#001c3a] hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Insertar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>

          {/* QUICK CREATE PARTIDA MODAL */}
          <AnimatePresence>
            {showQuickCreate && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-slate-200"
                >
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Plus size={18} className="text-blue-600" />
                      Crear nueva partida para la biblioteca
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowQuickCreate(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleQuickCreateSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Título / Concepto *
                      </label>
                      <input
                        autoFocus
                        type="text"
                        required
                        value={quickForm.name}
                        onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                        placeholder="Ej. Anclaje perimetral de membrana TPO..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Descripción detallada
                      </label>
                      <textarea
                        rows={2}
                        value={quickForm.description}
                        onChange={(e) => setQuickForm({ ...quickForm, description: e.target.value })}
                        placeholder="Explicación técnica de la partida..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tipo de recurso
                        </label>
                        <select
                          value={quickForm.resourceType}
                          onChange={(e) => setQuickForm({ ...quickForm, resourceType: e.target.value as ResourceType })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 cursor-pointer"
                        >
                          <option value={ResourceType.PARTIDA}>Partida Simple</option>
                          <option value={ResourceType.APU}>APU (Compuesta)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Unidad de medida
                        </label>
                        <input
                          type="text"
                          value={quickForm.unit}
                          onChange={(e) => setQuickForm({ ...quickForm, unit: e.target.value })}
                          placeholder="m², ud, ml, kg..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Coste base (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={quickForm.unitCost}
                          onChange={(e) => setQuickForm({ ...quickForm, unitCost: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Margen comercial (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={quickForm.margin}
                          onChange={(e) => setQuickForm({ ...quickForm, margin: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickCreate(false)}
                        disabled={isSubmittingQuick}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingQuick || !quickForm.name.trim()}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#001c3a] hover:bg-slate-800 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSubmittingQuick ? 'Guardando...' : 'Crear e insertar'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
