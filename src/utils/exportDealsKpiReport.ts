import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DealStage } from '../services/deals.service';

const translateStage = (stage: string) => {
  const stages: Record<string, string> = {
    [DealStage.LEAD]: 'Lead (Prospecto)',
    [DealStage.QUALIFIED]: 'Calificado',
    [DealStage.PROPOSAL]: 'Propuesta',
    [DealStage.NEGOTIATION]: 'Negociación',
    [DealStage.WON]: 'Ganado',
    [DealStage.LOST]: 'Perdido',
  };
  return stages[stage] || stage;
};

export const exportDealsKpiToExcel = async (data: any[], filtersInfo: string) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Coastline CRM';
  workbook.created = new Date();

  // ──────────────────────────────────────────────
  // HOJA 1: RESUMEN Y KPIs
  // ──────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Resumen de Negocios', { views: [{ showGridLines: false }] });
  
  summarySheet.mergeCells('A1:H1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'INFORME DE KPIs DE NEGOCIOS (DEALS)';
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
  tipCell.value = ' 👉  INFORMACIÓN IMPORTANTE: El desglose detallado negocio por negocio se encuentra en la pestaña "Detalle de Negocios"';
  tipCell.font = { bold: true, color: { argb: 'FF0F172A' }, size: 11 };
  tipCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  tipCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(3).height = 25;

  // Calculate global KPIs
  let totalDeals = 0;
  let totalAmount = 0;
  let totalQuotations = 0;
  let totalProjects = 0;
  let totalActivities = 0;
  let totalCompletedActivities = 0;

  const stageData: Record<string, any> = {};
  const businessLineData: Record<string, any> = {};

  data.forEach((deal: any) => {
    totalDeals++;
    totalAmount += deal.amount || 0;
    totalQuotations += deal.quotations?.length || 0;
    totalProjects += deal.projects?.length || 0;
    totalActivities += deal.totalActivities || 0;
    totalCompletedActivities += deal.completedActivities || 0;

    // Breakdown by Stage
    const stage = translateStage(deal.stage);
    if (!stageData[stage]) {
      stageData[stage] = { count: 0, amount: 0, quotations: 0, projects: 0 };
    }
    stageData[stage].count++;
    stageData[stage].amount += deal.amount || 0;
    stageData[stage].quotations += deal.quotations?.length || 0;
    stageData[stage].projects += deal.projects?.length || 0;

    // Breakdown by Business Line
    const bl = deal.businessLine?.name || 'Sin Línea de Negocio';
    if (!businessLineData[bl]) {
      businessLineData[bl] = { count: 0, amount: 0, quotations: 0, projects: 0 };
    }
    businessLineData[bl].count++;
    businessLineData[bl].amount += deal.amount || 0;
    businessLineData[bl].quotations += deal.quotations?.length || 0;
    businessLineData[bl].projects += deal.projects?.length || 0;
  });

  // --- SECCIÓN 1: MÉTRICAS GLOBALES ---
  summarySheet.getRow(5).values = ['RESUMEN DE MÉTRICAS GLOBALES'];
  summarySheet.getCell('A5').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.mergeCells('A5:B5');
  summarySheet.getRow(5).height = 25;

  const summaryDataList = [
    ['Total Negocios:', totalDeals],
    ['Monto Total Cotizado:', totalAmount],
    ['Total Cotizaciones Generadas:', totalQuotations],
    ['Total Proyectos Creados:', totalProjects],
    ['Total Actividades (CRM):', totalActivities],
    ['Actividades Completadas:', totalCompletedActivities],
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
    
    if (item[0] === 'Monto Total Cotizado:') {
      row.getCell(2).numFmt = '#,##0.00';
    }
    currentRow++;
  });

  summarySheet.getColumn('A').width = 35;
  summarySheet.getColumn('B').width = 25;

  const renderBreakdownTable = (title: string, dataObj: Record<string, any>, startRow: number, keyLabel: string) => {
    summarySheet.getRow(startRow).values = [title];
    summarySheet.getCell(`A${startRow}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    summarySheet.getCell(`A${startRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
    summarySheet.getCell(`A${startRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.mergeCells(`A${startRow}:E${startRow}`);
    summarySheet.getRow(startRow).height = 25;

    const headers = [keyLabel, 'NEGOCIOS', 'MONTO TOTAL', 'COTIZACIONES', 'PROYECTOS'];
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
          stats.quotations,
          stats.projects
        ];

        row.getCell(3).numFmt = '#,##0.00';

        for (let i = 1; i <= 5; i++) {
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
      Object.values(dataObj).reduce((sum, s: any) => sum + s.quotations, 0),
      Object.values(dataObj).reduce((sum, s: any) => sum + s.projects, 0)
    ];

    tRow.getCell(3).numFmt = '#,##0.00';

    for (let i = 1; i <= 5; i++) {
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
  currentRow = renderBreakdownTable('DESGLOSE POR ESTADO DEL NEGOCIO', stageData, currentRow, 'ESTADO');

  currentRow += 3;
  renderBreakdownTable('DESGLOSE POR LÍNEA DE NEGOCIO', businessLineData, currentRow, 'LÍNEA DE NEGOCIO');

  summarySheet.getColumn('C').width = 20;
  summarySheet.getColumn('D').width = 15;
  summarySheet.getColumn('E').width = 15;


  // ──────────────────────────────────────────────
  // HOJA 2: DETALLE DE NEGOCIOS
  // ──────────────────────────────────────────────
  const detailSheet = workbook.addWorksheet('Detalle de Negocios', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  
  detailSheet.columns = [
    { header: 'NEGOCIO', key: 'name', width: 35 },
    { header: 'EMPRESA', key: 'account', width: 30 },
    { header: 'CONTACTO', key: 'contact', width: 25 },
    { header: 'LÍNEA NEGOCIO', key: 'businessLine', width: 25 },
    { header: 'ESTADO', key: 'stage', width: 20 },
    { header: 'PROBABILIDAD', key: 'probability', width: 15 },
    { header: 'MONTO', key: 'amount', width: 20 },
    { header: 'FECHA CIERRE', key: 'closeDate', width: 18 },
    { header: 'Nº COTIZACIONES', key: 'totalQuotations', width: 18 },
    { header: 'COTIZACIONES (DETALLE)', key: 'quotationsDetail', width: 45 },
    { header: 'Nº PROYECTOS', key: 'totalProjects', width: 15 },
    { header: 'PROYECTOS (DETALLE)', key: 'projectsDetail', width: 45 },
    { header: 'TOTAL ACTIVIDADES', key: 'totalActivities', width: 20 },
    { header: 'ACT. COMPLETADAS', key: 'completedActivities', width: 20 }
  ];

  const detailHeaderRow = detailSheet.getRow(1);
  detailHeaderRow.height = 35;
  for (let col = 1; col <= 14; col++) {
    const cell = detailHeaderRow.getCell(col);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
    };
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-ES');
  };

  let isAlternateDetailRow = false;
  data.forEach((deal: any) => {
    const qDetail = deal.quotations?.map((q: any) => `${q.number} (${q.status})`).join(' | ') || 'Ninguna';
    const pDetail = deal.projects?.map((p: any) => `${p.name} (${p.status})`).join(' | ') || 'Ninguno';

    const row = detailSheet.addRow({
      name: deal.name,
      account: deal.account?.name || 'N/A',
      contact: deal.contact?.name || 'N/A',
      businessLine: deal.businessLine?.name || 'N/A',
      stage: translateStage(deal.stage),
      probability: deal.probability ? `${deal.probability}%` : 'N/A',
      amount: deal.amount || 0,
      closeDate: formatDate(deal.closeDate),
      totalQuotations: deal.quotations?.length || 0,
      quotationsDetail: qDetail,
      totalProjects: deal.projects?.length || 0,
      projectsDetail: pDetail,
      totalActivities: deal.totalActivities || 0,
      completedActivities: deal.completedActivities || 0
    });
    
    row.getCell('amount').numFmt = '#,##0.00';
    
    for (let col = 5; col <= 14; col++) {
      if (col !== 10 && col !== 12) { // Allow detail columns to left-align
        row.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        row.getCell(col).alignment = { vertical: 'middle', wrapText: true };
      }
    }
    for (let col = 1; col <= 4; col++) {
      row.getCell(col).alignment = { vertical: 'middle' };
    }

    for (let col = 1; col <= 14; col++) {
      row.getCell(col).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
      if (isAlternateDetailRow) {
        row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    }
    isAlternateDetailRow = !isAlternateDetailRow;
  });

  // Enable AutoFilter for the detail table
  if (data.length > 0) {
    detailSheet.autoFilter = {
      from: 'A1',
      to: { row: data.length + 1, column: 14 }
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const dateStr = new Date().toISOString().split('T')[0];
  saveAs(blob, `Informe_KPIs_Negocios_${dateStr}.xlsx`);
};
