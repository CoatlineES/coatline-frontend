import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { QuotationStatus, QuotationSummary } from '../types/quotation';

const translateStatus = (status: QuotationStatus | string) => {
  const statuses: Record<string, string> = {
    [QuotationStatus.DRAFT]: 'Borrador',
    [QuotationStatus.SENT]: 'Enviada',
    [QuotationStatus.PENDING_SIGNATURE]: 'Pendiente Firma',
    [QuotationStatus.SIGNED]: 'Firmado',
    [QuotationStatus.ACCEPTED]: 'Aceptada',
    [QuotationStatus.REJECTED]: 'Rechazada',
    [QuotationStatus.EXPIRED]: 'Caducada',
  };
  return statuses[status] || status;
};

const calculateTotal = (q: QuotationSummary) => {
  if (!q.chapters) return 0;
  const subtotal = q.chapters.reduce((acc: number, ch: any) => {
    return acc + ch.lines.reduce((a: number, l: any) => a + (l.quantity * l.unitPrice), 0);
  }, 0);
  const taxable = subtotal - (q.discount || 0);
  return taxable * (1 + (q.taxRate / 100));
};

export const exportQuotationsKpiToExcel = async (data: QuotationSummary[], filtersInfo: string) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Coastline CRM';
  workbook.created = new Date();

  // ──────────────────────────────────────────────
  // HOJA 1: RESUMEN Y KPIs
  // ──────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Resumen de Cotizaciones', { views: [{ showGridLines: false }] });
  
  summarySheet.mergeCells('A1:H1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'INFORME DE KPIs DE COTIZACIONES';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  
  summarySheet.mergeCells('A2:H2');
  const filterCell = summarySheet.getCell('A2');
  filterCell.value = `Filtros Aplicados: ${filtersInfo || 'Todos'}`;
  filterCell.font = { italic: true, color: { argb: 'FF666666' } };
  filterCell.alignment = { horizontal: 'center' };

  summarySheet.mergeCells('A3:H3');
  const tipCell = summarySheet.getCell('A3');
  tipCell.value = ' 👉  INFORMACIÓN IMPORTANTE: El desglose detallado cotización por cotización se encuentra en la pestaña "Detalle de Cotizaciones"';
  tipCell.font = { bold: true, color: { argb: 'FF0F172A' }, size: 11 };
  tipCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  tipCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(3).height = 25;

  // Calculate global KPIs
  let totalQuotations = 0;
  let totalValue = 0;
  let totalConvertedToProjects = 0;

  const statusData: Record<string, any> = {};
  const businessLineData: Record<string, any> = {};

  data.forEach((quotation: QuotationSummary) => {
    const qValue = calculateTotal(quotation);
    totalQuotations++;
    totalValue += qValue;
    
    // Converted to project via Deal relation
    const hasProject = (quotation.deal?.projects && quotation.deal.projects.length > 0);
    if (hasProject) {
      totalConvertedToProjects++;
    }

    // Breakdown by Status
    const statusStr = translateStatus(quotation.status);
    if (!statusData[statusStr]) {
      statusData[statusStr] = { count: 0, amount: 0, converted: 0 };
    }
    statusData[statusStr].count++;
    statusData[statusStr].amount += qValue;
    if (hasProject) statusData[statusStr].converted++;

    // Breakdown by Business Line
    const bl = quotation.businessLine?.name || 'Sin Línea de Negocio';
    if (!businessLineData[bl]) {
      businessLineData[bl] = { count: 0, amount: 0, converted: 0 };
    }
    businessLineData[bl].count++;
    businessLineData[bl].amount += qValue;
    if (hasProject) businessLineData[bl].converted++;
  });

  // --- SECCIÓN 1: MÉTRICAS GLOBALES ---
  summarySheet.getRow(5).values = ['RESUMEN DE MÉTRICAS GLOBALES'];
  summarySheet.getCell('A5').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.mergeCells('A5:B5');
  summarySheet.getRow(5).height = 25;

  const summaryDataList = [
    ['Total Cotizaciones Generadas:', totalQuotations],
    ['Valor Monetario Total:', totalValue],
    ['Cotizaciones con Proyectos Generados:', totalConvertedToProjects],
  ];

  let currentRow = 6;
  summaryDataList.forEach(item => {
    const row = summarySheet.getRow(currentRow);
    row.getCell(1).value = item[0];
    row.getCell(2).value = item[1];
    
    row.getCell(1).font = { bold: true, color: { argb: 'FF333333' } };
    row.getCell(2).font = { bold: true, color: { argb: 'FF002D5A' } };
    row.getCell(2).alignment = { horizontal: 'right' };
    row.getCell(1).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
    row.getCell(2).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
    
    if (item[0] === 'Valor Monetario Total:') {
      row.getCell(2).numFmt = '#,##0.00';
    }
    currentRow++;
  });

  summarySheet.getColumn('A').width = 40;
  summarySheet.getColumn('B').width = 25;

  const renderBreakdownTable = (title: string, dataObj: Record<string, any>, startRow: number, keyLabel: string) => {
    summarySheet.getRow(startRow).values = [title];
    summarySheet.getCell(`A${startRow}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    summarySheet.getCell(`A${startRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
    summarySheet.getCell(`A${startRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.mergeCells(`A${startRow}:D${startRow}`);
    summarySheet.getRow(startRow).height = 25;

    const headers = [keyLabel, 'COTIZACIONES', 'MONTO TOTAL', 'PROYECTOS GENERADOS'];
    const headerRow = summarySheet.getRow(startRow + 1);
    
    headers.forEach((header, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
      };
    });
    headerRow.height = 20;

    let r = startRow + 2;
    let isAlternate = false;

    Object.entries(dataObj)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([key, stats]: [string, any]) => {
        const row = summarySheet.getRow(r);
        row.values = [
          key,
          stats.count,
          stats.amount,
          stats.converted
        ];

        row.getCell(3).numFmt = '#,##0.00';

        for (let i = 1; i <= 4; i++) {
          row.getCell(i).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
          if (isAlternate) {
            row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
          if (i > 1) {
            row.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            row.getCell(i).alignment = { vertical: 'middle' };
          }
        }
        isAlternate = !isAlternate;
        r++;
      });

    // Totals row for breakdown
    const tRow = summarySheet.getRow(r);
    tRow.values = [
      'TOTALES',
      Object.values(dataObj).reduce((sum, s: any) => sum + s.count, 0),
      Object.values(dataObj).reduce((sum, s: any) => sum + s.amount, 0),
      Object.values(dataObj).reduce((sum, s: any) => sum + s.converted, 0)
    ];

    tRow.getCell(3).numFmt = '#,##0.00';

    for (let i = 1; i <= 4; i++) {
      tRow.getCell(i).font = { bold: true, color: { argb: 'FF002D5A' } };
      tRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      if (i > 1) {
        tRow.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
      }
    }
    tRow.height = 20;

    return r;
  };

  currentRow += 2;
  currentRow = renderBreakdownTable('DESGLOSE POR ESTADO', statusData, currentRow, 'ESTADO');

  currentRow += 3;
  renderBreakdownTable('DESGLOSE POR LÍNEA DE NEGOCIO', businessLineData, currentRow, 'LÍNEA DE NEGOCIO');

  summarySheet.getColumn('C').width = 20;
  summarySheet.getColumn('D').width = 25;


  // ──────────────────────────────────────────────
  // HOJA 2: DETALLE DE COTIZACIONES
  // ──────────────────────────────────────────────
  const detailSheet = workbook.addWorksheet('Detalle de Cotizaciones', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  
  detailSheet.columns = [
    { header: 'NÚMERO', key: 'number', width: 15 },
    { header: 'TÍTULO', key: 'title', width: 35 },
    { header: 'ESTADO', key: 'status', width: 20 },
    { header: 'EMPRESA', key: 'account', width: 30 },
    { header: 'NEGOCIO', key: 'deal', width: 30 },
    { header: 'LÍNEA DE NEGOCIO', key: 'businessLine', width: 25 },
    { header: 'VALOR TOTAL', key: 'totalValue', width: 20 },
    { header: 'CREADO POR', key: 'createdBy', width: 25 },
    { header: 'FECHA CREACIÓN', key: 'createdAt', width: 18 },
    { header: 'FECHA EMISIÓN', key: 'issuedAt', width: 18 },
    { header: 'FECHA VALIDEZ', key: 'validUntil', width: 18 },
    { header: 'Nº PROYECTOS (VÍA NEGOCIO)', key: 'projectsCount', width: 25 },
    { header: 'PROYECTOS (DETALLE)', key: 'projectsDetail', width: 45 }
  ];

  const detailHeaderRow = detailSheet.getRow(1);
  detailHeaderRow.height = 35;
  for (let col = 1; col <= 13; col++) {
    const cell = detailHeaderRow.getCell(col);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1E293B' } },
      bottom: { style: 'thin', color: { argb: 'FF1E293B' } },
      left: { style: 'thin', color: { argb: 'FF1E293B' } },
      right: { style: 'thin', color: { argb: 'FF1E293B' } }
    };
  }

  detailSheet.autoFilter = 'A1:M1';

  data.forEach(q => {
    let projectsDetail = 'Sin proyectos generados';
    let projectsCount = 0;
    
    if (q.deal?.projects && q.deal.projects.length > 0) {
      projectsCount = q.deal.projects.length;
      projectsDetail = q.deal.projects.map(p => `[${p.status}] ${p.name}`).join(' | ');
    }

    const row = detailSheet.addRow({
      number: q.number,
      title: q.title || 'Sin Título',
      status: translateStatus(q.status),
      account: q.account?.name || 'Sin Empresa',
      deal: q.deal?.name || 'Sin Negocio',
      businessLine: q.businessLine?.name || 'Sin Línea',
      totalValue: calculateTotal(q),
      createdBy: q.user?.name || 'Desconocido',
      createdAt: new Date(q.createdAt).toLocaleDateString(),
      issuedAt: q.issuedAt ? new Date(q.issuedAt).toLocaleDateString() : '-',
      validUntil: q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '-',
      projectsCount,
      projectsDetail
    });

    row.getCell('totalValue').numFmt = '#,##0.00';
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const dateStr = new Date().toISOString().split('T')[0];
  saveAs(blob, `KPI_Cotizaciones_${dateStr}.xlsx`);
};
