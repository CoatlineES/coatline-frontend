import { useAuth } from '../contexts/AuthContext';

export function useCurrency() {
  const { activeSubsidiary } = useAuth();

  const formatCurrency = (val: number, options?: Intl.NumberFormatOptions) => {
    const currency = activeSubsidiary?.currency || 'EUR';
    const locale = currency === 'COP' ? 'es-CO' : currency === 'CLP' ? 'es-CL' : 'es-ES';
    
    // Si la moneda es CLP, normalmente no tiene decimales
    const fractionDigits = currency === 'CLP' ? 0 : 2;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      ...options
    }).format(val);
  };

  const taxRate = activeSubsidiary?.taxRate || 21;

  return {
    formatCurrency,
    taxRate,
    currency: activeSubsidiary?.currency || 'EUR'
  };
}
