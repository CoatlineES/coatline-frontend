import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Quotation } from '../../../types/quotation';
import { quotationsService } from '../../../services/quotations.service';
import { contactsService, Contact } from '../../../services/crm.service';
import { UserResponse } from '../../../services/types';
import { BusinessLine } from '../../../services/business-lines.service';
import toast from 'react-hot-toast';

interface EditQuotationModalProps {
  quotation: Quotation;
  users: UserResponse[];
  businessLines: BusinessLine[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditQuotationModal({ quotation, users, businessLines, onClose, onSuccess }: EditQuotationModalProps) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState({
    number: quotation.number || '',
    title: quotation.title || '',
    validUntil: quotation.validUntil ? new Date(quotation.validUntil).toISOString().split('T')[0] : '',
    taxRate: quotation.taxRate || defaultTaxRate,
    discount: quotation.discount || 0,
    userId: quotation.user?.id || '',
    contactId: quotation.contact?.id || '',
    businessLineId: quotation.businessLine?.id || '',
    paymentTerms: quotation.paymentTerms || '',
    paymentDeadline: quotation.paymentDeadline ? new Date(quotation.paymentDeadline).toISOString().split('T')[0] : ''
  });

  useEffect(() => {
    if (quotation.accountId) {
      contactsService.getAll({ accountId: quotation.accountId })
        .then(res => setContacts(res.items || res))
        .catch(err => console.error('Error fetching contacts:', err));
    }
  }, [quotation.accountId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await quotationsService.update(quotation.id, {
        number: formData.number,
        title: formData.title,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        taxRate: formData.taxRate,
        discount: formData.discount,
        userId: formData.userId || null,
        contactId: formData.contactId || null,
        businessLineId: formData.businessLineId || null,
        paymentTerms: formData.paymentTerms || null,
        paymentDeadline: formData.paymentDeadline ? new Date(formData.paymentDeadline).toISOString() : null
      } as any);
      
      toast.success('Cotización actualizada');
      onSuccess();
    } catch (err) {
      toast.error('Error al actualizar la cotización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Editar Cotización</h2>
            <p className="text-sm text-slate-500">Configuración general del documento</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nº Cotización</label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="COT-2026-001"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Título de la Cotización</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej. Reparación Cubierta Nave A..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Formato de Pago</label>
              <input
                type="text"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                placeholder="Ej. Transferencia"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Plazo de Pago</label>
              <input
                type="date"
                name="paymentDeadline"
                value={formData.paymentDeadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Válida hasta</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Responsable</label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="">Selecciona un responsable...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contacto Firmante</label>
              <select
                name="contactId"
                value={formData.contactId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="">Selecciona un contacto...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Línea de Negocio</label>
            <select
              name="businessLineId"
              value={formData.businessLineId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
            >
              <option value="">Selecciona una línea...</option>
              {businessLines.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">IVA (%)</label>
              <input
                type="number"
                name="taxRate"
                min="0"
                max="100"
                step="0.1"
                value={formData.taxRate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descuento Global (€)</label>
              <input
                type="number"
                name="discount"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-red-600 font-bold"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
