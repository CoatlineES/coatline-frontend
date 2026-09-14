import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportAccountsKpiToExcel = async (data: any, filtersInfo: string) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Coastline CRM';
  workbook.created = new Date();

  // ──────────────────────────────────────────────
  // HOJA 1: RESUMEN Y KPIs
  // ──────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Resumen de Empresas', { views: [{ showGridLines: false }] });
  
  summarySheet.mergeCells('A1:J1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'INFORME DE KPIs POR EMPRESAS Y SECTORES';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  
  summarySheet.mergeCells('A2:J2');
  const filterCell = summarySheet.getCell('A2');
  filterCell.value = `Filtros Aplicados: ${filtersInfo || 'Todos'}`;
  filterCell.font = { italic: true, color: { argb: 'FF666666' } };
  filterCell.alignment = { horizontal: 'center' };

  summarySheet.mergeCells('A3:J3');
  const tipCell = summarySheet.getCell('A3');
  tipCell.value = ' 👉  INFORMACIÓN IMPORTANTE: El desglose detallado empresa por empresa se encuentra en la pestaña "Detalle de Empresas"';
  tipCell.font = { bold: true, color: { argb: 'FF0F172A' }, size: 11 };
  tipCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  tipCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(3).height = 25;

  // Calculate global KPIs and sector breakdown
  let totalActivities = 0, totalCalls = 0, totalEmails = 0, totalMeetings = 0;
  let totalProjects = 0, totalDeals = 0, totalCompleted = 0;
  let totalPlannedWithDate = 0, totalPlannedWithoutDate = 0;
  let totalQuoted = 0, totalPipeline = 0;

  const sectorsData: Record<string, any> = {};

  data.forEach((acc: any) => {
    totalActivities += acc.totalActivities || 0;
    totalCompleted += acc.completedActivities || 0;
    totalPlannedWithDate += acc.plannedWithDate || 0;
    totalPlannedWithoutDate += acc.plannedWithoutDate || 0;
    totalCalls += acc.breakdown?.calls || 0;
    totalEmails += acc.breakdown?.emails || 0;
    totalMeetings += acc.breakdown?.meetings || 0;
    totalProjects += acc.activeProjects || 0;
    totalDeals += acc.activeDeals || 0;
    totalQuoted += acc.totalQuoted || 0;
    totalPipeline += acc.pipelineAmount || 0;

    const s = acc.sector || 'Sin Sector';
    if (!sectorsData[s]) {
      sectorsData[s] = {
        empresas: 0,
        totalActivities: 0,
        completed: 0,
        plannedWithDate: 0,
        plannedWithoutDate: 0,
        calls: 0,
        emails: 0,
        meetings: 0,
        projects: 0
      };
    }
    sectorsData[s].empresas++;
    sectorsData[s].totalActivities += acc.totalActivities || 0;
    sectorsData[s].completed += acc.completedActivities || 0;
    sectorsData[s].plannedWithDate += acc.plannedWithDate || 0;
    sectorsData[s].plannedWithoutDate += acc.plannedWithoutDate || 0;
    sectorsData[s].calls += acc.breakdown?.calls || 0;
    sectorsData[s].emails += acc.breakdown?.emails || 0;
    sectorsData[s].meetings += acc.breakdown?.meetings || 0;
    sectorsData[s].projects += acc.activeProjects || 0;
  });

  // --- SECCIÓN 1: MÉTRICAS GLOBALES ---
  summarySheet.getRow(5).values = ['RESUMEN DE MÉTRICAS GLOBALES'];
  summarySheet.getCell('A5').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.mergeCells('A5:B5');
  summarySheet.getRow(5).height = 25;

  const summaryDataList = [
    ['Total Empresas:', data.length],
    ['Total Actividades:', totalActivities],
    ['Completadas:', totalCompleted],
    ['Planeadas (Con fecha):', totalPlannedWithDate],
    ['Planeadas (Sin fecha):', totalPlannedWithoutDate],
    ['Llamadas:', totalCalls],
    ['Correos:', totalEmails],
    ['Reuniones:', totalMeetings],
    ['Proyectos Activos:', totalProjects],
    ['Monto Total Cotizado:', totalQuoted],
    ['Negocios en Curso (Deals):', totalDeals],
    ['Valor del Pipeline (Deals):', totalPipeline]
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
    
    if (item[0] === 'Monto Total Cotizado:' || item[0] === 'Valor del Pipeline (Deals):') {
      row.getCell(2).numFmt = '#,##0.00';
    }
    currentRow++;
  });

  summarySheet.getColumn('A').width = 35;
  summarySheet.getColumn('B').width = 25;

  // --- SECCIÓN 2: DESGLOSE POR SECTOR ---
  currentRow += 2;
  summarySheet.getRow(currentRow).values = ['DESGLOSE DE ACTIVIDADES POR SECTOR'];
  summarySheet.getCell(`A${currentRow}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell(`A${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  summarySheet.getCell(`A${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.mergeCells(`A${currentRow}:J${currentRow}`);
  summarySheet.getRow(currentRow).height = 25;

  currentRow++;
  const sectorHeaders = [
    'SECTOR', 'EMPRESAS', 'TOTAL ACT.', 'COMPLETADAS', 'PLAN. (FECHA)',
    'PLAN. (S/ FECHA)', 'LLAMADAS', 'CORREOS', 'REUNIONES', 'PROYECTOS'
  ];
  
  const sectorHeaderRow = summarySheet.getRow(currentRow);
  sectorHeaders.forEach((header, idx) => {
    const cell = sectorHeaderRow.getCell(idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
    };
  });
  sectorHeaderRow.height = 35;

  let isAlternateRow = false;
  Object.entries(sectorsData)
    .sort((a, b) => b[1].totalActivities - a[1].totalActivities) // Sort by total activities desc
    .forEach(([sector, sData]) => {
      currentRow++;
      const row = summarySheet.getRow(currentRow);
      row.values = [
        sector, sData.empresas, sData.totalActivities, sData.completed,
        sData.plannedWithDate, sData.plannedWithoutDate, sData.calls,
        sData.emails, sData.meetings, sData.projects
      ];
      
      row.getCell(1).font = { bold: true, color: { argb: 'FF333333' } };
      for (let i = 2; i <= 10; i++) {
        row.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      for (let i = 1; i <= 10; i++) {
        row.getCell(i).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
        if (isAlternateRow) {
          row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      }
      isAlternateRow = !isAlternateRow;
    });

  // Totals row for the sector table
  currentRow++;
  const totalsRow = summarySheet.getRow(currentRow);
  totalsRow.values = [
    'TOTALES', data.length, totalActivities, totalCompleted,
    totalPlannedWithDate, totalPlannedWithoutDate, totalCalls,
    totalEmails, totalMeetings, totalProjects
  ];
  totalsRow.getCell(1).font = { bold: true, color: { argb: 'FF002D5A' } };
  totalsRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  
  for (let i = 2; i <= 10; i++) {
    totalsRow.getCell(i).font = { bold: true, color: { argb: 'FF002D5A' } };
    totalsRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    totalsRow.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
  }
  totalsRow.height = 20;

  // Adjust columns for sector table
  summarySheet.getColumn('C').width = 15;
  summarySheet.getColumn('D').width = 15;
  summarySheet.getColumn('E').width = 15;
  summarySheet.getColumn('F').width = 15;
  summarySheet.getColumn('G').width = 15;
  summarySheet.getColumn('H').width = 12;
  summarySheet.getColumn('I').width = 12;
  summarySheet.getColumn('J').width = 15;

  // ──────────────────────────────────────────────
  // HOJA 2: DETALLE DE EMPRESAS
  // ──────────────────────────────────────────────
  const detailSheet = workbook.addWorksheet('Detalle de Empresas', {
    views: [{ state: 'frozen', ySplit: 1 }] // Freeze header row
  });
  
  detailSheet.columns = [
    { header: 'EMPRESA', key: 'name', width: 35 },
    { header: 'SECTOR', key: 'sector', width: 25 },
    { header: 'CONTACTADA', key: 'isContacted', width: 15 },
    { header: 'TOTAL ACT.', key: 'totalActivities', width: 15 },
    { header: 'COMPLETADAS', key: 'completedActivities', width: 15 },
    { header: 'PLAN. (FECHA)', key: 'plannedWithDate', width: 15 },
    { header: 'PLAN. (S/ FECHA)', key: 'plannedWithoutDate', width: 18 },
    { header: 'LLAMADAS', key: 'calls', width: 12 },
    { header: 'CORREOS', key: 'emails', width: 12 },
    { header: 'REUNIONES', key: 'meetings', width: 12 },
    { header: 'PROYECTOS', key: 'activeProjects', width: 15 },
    { header: 'MONTO COTIZADO', key: 'totalQuoted', width: 20 },
    { header: 'DEALS', key: 'activeDeals', width: 10 },
    { header: 'PIPELINE', key: 'pipelineAmount', width: 20 },
    { header: 'ÚLTIMO CONTACTO', key: 'lastContactDate', width: 20 },
    { header: 'PRÓXIMO CONTACTO', key: 'nextContactDate', width: 20 },
    { header: 'CONTACTOS CLAVE', key: 'contactsFollowedUp', width: 40 }
  ];

  const detailHeaderRow = detailSheet.getRow(1);
  detailHeaderRow.height = 35;
  for (let col = 1; col <= 17; col++) {
    const cell = detailHeaderRow.getCell(col);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } }; // Brand dark blue
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
  data.forEach((acc: any) => {
    const row = detailSheet.addRow({
      name: acc.name,
      sector: acc.sector,
      isContacted: acc.isContacted ? 'Sí' : 'No',
      totalActivities: acc.totalActivities,
      completedActivities: acc.completedActivities || 0,
      plannedWithDate: acc.plannedWithDate || 0,
      plannedWithoutDate: acc.plannedWithoutDate || 0,
      calls: acc.breakdown?.calls || 0,
      emails: acc.breakdown?.emails || 0,
      meetings: acc.breakdown?.meetings || 0,
      activeProjects: acc.activeProjects || 0,
      totalQuoted: acc.totalQuoted || 0,
      activeDeals: acc.activeDeals || 0,
      pipelineAmount: acc.pipelineAmount || 0,
      lastContactDate: formatDate(acc.lastContactDate),
      nextContactDate: formatDate(acc.nextContactDate),
      contactsFollowedUp: acc.contactsFollowedUp?.join(', ') || ''
    });
    
    row.getCell('isContacted').font = { color: { argb: acc.isContacted ? 'FF166534' : 'FF991B1B' }, bold: true };
    row.getCell('totalQuoted').numFmt = '#,##0.00';
    row.getCell('pipelineAmount').numFmt = '#,##0.00';
    
    for (let col = 3; col <= 16; col++) {
      row.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    row.getCell(1).alignment = { vertical: 'middle' };
    row.getCell(2).alignment = { vertical: 'middle' };

    for (let col = 1; col <= 17; col++) {
      row.getCell(col).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
      if (isAlternateDetailRow) {
        row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    }
    isAlternateDetailRow = !isAlternateDetailRow;
  });

  // Totals row for Detail Sheet
  const totalsRowDetail = detailSheet.addRow({
    name: 'TOTALES GLOBALES',
    sector: '',
    isContacted: '',
    totalActivities: totalActivities,
    completedActivities: totalCompleted,
    plannedWithDate: totalPlannedWithDate,
    plannedWithoutDate: totalPlannedWithoutDate,
    calls: totalCalls,
    emails: totalEmails,
    meetings: totalMeetings,
    activeProjects: totalProjects,
    totalQuoted: totalQuoted,
    activeDeals: totalDeals,
    pipelineAmount: totalPipeline,
    lastContactDate: '',
    nextContactDate: '',
    contactsFollowedUp: ''
  });

  totalsRowDetail.height = 25;
  for (let col = 1; col <= 17; col++) {
    const cell = totalsRowDetail.getCell(col);
    cell.font = { bold: true, color: { argb: 'FF002D5A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    if (col >= 4 && col <= 14) {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }
  }
  totalsRowDetail.getCell('totalQuoted').numFmt = '#,##0.00';
  totalsRowDetail.getCell('pipelineAmount').numFmt = '#,##0.00';

  // Enable AutoFilter for the detail table
  if (data.length > 0) {
    detailSheet.autoFilter = {
      from: 'A1',
      to: { row: data.length + 1, column: 17 }
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Informe_Empresas_${new Date().toISOString().split('T')[0]}.xlsx`);
};

