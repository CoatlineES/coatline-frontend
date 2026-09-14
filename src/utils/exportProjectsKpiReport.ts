import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportProjectsKpiToExcel = async (data: any, filtersInfo: string) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Coastline CRM';
  workbook.created = new Date();

  // ──────────────────────────────────────────────
  // HOJA 1: RESUMEN Y KPIs
  // ──────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Resumen General', { views: [{ showGridLines: false }] });
  
  // Título
  summarySheet.mergeCells('A1:D1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'INFORME DE KPIs POR PROYECTOS';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Filtros aplicados
  summarySheet.mergeCells('A2:D2');
  summarySheet.getCell('A2').value = `Filtros: ${filtersInfo || 'Todos'}`;
  summarySheet.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };

  // KPIs Generales
  summarySheet.getRow(4).values = ['MÉTRICAS GLOBALES'];
  summarySheet.getCell('A4').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.mergeCells('A4:B4');

  const { globalKpis } = data;

  summarySheet.addRow(['Total Proyectos:', globalKpis.totalProjects]);
  summarySheet.addRow(['Presupuesto Global Cotizado:', globalKpis.globalQuotedAmount]);
  summarySheet.getCell('B6').numFmt = '#,##0.00';
  summarySheet.addRow(['Monto Global Certificado:', globalKpis.globalCertifiedAmount || 0]);
  summarySheet.getCell('B7').numFmt = '#,##0.00';
  summarySheet.addRow(['Avance Financiero Global:', `${(globalKpis.globalFinancialProgress || 0).toFixed(2)}%`]);
  
  summarySheet.addRow(['Total Actividades:', globalKpis.globalTotalActivities]);
  summarySheet.addRow(['Media Actividades/Proyecto:', Number(globalKpis.averageActivitiesPerProject.toFixed(1))]);
  summarySheet.addRow(['Completitud Global de Actividades:', `${globalKpis.globalCompletionRate.toFixed(2)}%`]);
  
  // Estilizar filas de métricas
  for (let i = 5; i <= 11; i++) {
    summarySheet.getCell(`A${i}`).font = { bold: true };
    summarySheet.getCell(`B${i}`).alignment = { horizontal: 'right' };
    
    // Bordes sutiles
    summarySheet.getCell(`A${i}`).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
    summarySheet.getCell(`B${i}`).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
  }

  // Desglose de actividades
  let totalCalls = 0;
  let totalEmails = 0;
  let totalMeetings = 0;
  let totalInactives = 0;
  
  data.projectsData.forEach((p: any) => {
    totalCalls += p.breakdown.calls;
    totalEmails += p.breakdown.emails;
    totalMeetings += p.breakdown.meetings;
    if (p.daysSinceLastActivity !== null && p.daysSinceLastActivity > 30) {
      totalInactives++;
    }
  });

  summarySheet.getRow(14).values = ['DESGLOSE DE ACTIVIDADES'];
  summarySheet.getCell('A14').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A14').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.mergeCells('A14:B14');

  summarySheet.addRow(['Llamadas:', totalCalls]);
  summarySheet.addRow(['Correos:', totalEmails]);
  summarySheet.addRow(['Reuniones:', totalMeetings]);
  summarySheet.addRow(['Proyectos Inactivos (>30 días):', totalInactives]);

  for (let i = 15; i <= 18; i++) {
    summarySheet.getCell(`A${i}`).font = { bold: true };
    summarySheet.getCell(`B${i}`).alignment = { horizontal: 'right' };
    summarySheet.getCell(`A${i}`).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
    summarySheet.getCell(`B${i}`).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
  }

  if (totalInactives > 0) {
    summarySheet.getCell('B18').font = { color: { argb: 'FF991B1B' }, bold: true };
  }

  // Ajustar anchos
  summarySheet.getColumn('A').width = 30;
  summarySheet.getColumn('B').width = 20;


  // ──────────────────────────────────────────────
  // HOJA 2: DETALLE DE PROYECTOS
  // ──────────────────────────────────────────────
  const detailSheet = workbook.addWorksheet('Detalle de Proyectos');
  
  // Configurar columnas
  detailSheet.columns = [
    { header: 'PROYECTO', key: 'name', width: 35 },
    { header: 'EMPRESA', key: 'accountName', width: 30 },
    { header: 'SECTOR', key: 'sector', width: 20 },
    { header: 'MONTO COTIZADO', key: 'quotedAmount', width: 20 },
    { header: 'AVANCE FINANCIERO %', key: 'financialProgress', width: 22 },
    { header: 'TOTAL ACT.', key: 'totalActivities', width: 15 },
    { header: 'TASA COMP. %', key: 'completionRate', width: 18 },
    { header: 'COMPLETADAS', key: 'completedActivities', width: 15 },
    { header: 'PLANEADAS (CON FECHA)', key: 'plannedWithDate', width: 25 },
    { header: 'PLANEADAS (SIN FECHA)', key: 'plannedWithoutDate', width: 25 },
    { header: 'LLAMADAS', key: 'calls', width: 12 },
    { header: 'CORREOS', key: 'emails', width: 12 },
    { header: 'REUNIONES', key: 'meetings', width: 12 },
    { header: 'DÍAS INACTIVO', key: 'daysSinceLastActivity', width: 18 },
    { header: 'ÚLTIMA ACT.', key: 'lastActivityDate', width: 20 },
    { header: 'PRÓXIMA ACT.', key: 'nextActivityDate', width: 20 }
  ];

  // Estilo cabecera
  const headerRow = detailSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-ES');
  };

  // Llenar datos
  data.projectsData.forEach((p: any) => {
    const row = detailSheet.addRow({
      name: p.name,
      accountName: p.accountName,
      sector: p.sector || '-',
      quotedAmount: p.quotedAmount || 0,
      financialProgress: (p.financialProgress || 0) / 100,
      totalActivities: p.totalActivities,
      completionRate: (p.completionRate || 0) / 100,
      completedActivities: p.completedActivities || 0,
      plannedWithDate: p.plannedWithDate || 0,
      plannedWithoutDate: p.plannedWithoutDate || 0,
      calls: p.breakdown?.calls || 0,
      emails: p.breakdown?.emails || 0,
      meetings: p.breakdown?.meetings || 0,
      daysSinceLastActivity: p.daysSinceLastActivity !== null ? p.daysSinceLastActivity : '-',
      lastActivityDate: formatDate(p.lastActivityDate),
      nextActivityDate: formatDate(p.nextActivityDate)
    });

    // Formatear números de la fila
    row.getCell('quotedAmount').numFmt = '#,##0.00';
    row.getCell('financialProgress').numFmt = '0.00%';
    row.getCell('completionRate').numFmt = '0.00%';

    // Alinear al centro numéricos
    ['financialProgress', 'completionRate', 'totalActivities', 'completedActivities', 'plannedWithDate', 'plannedWithoutDate', 'calls', 'emails', 'meetings', 'daysSinceLastActivity', 'lastActivityDate'].forEach(key => {
      row.getCell(key as any).alignment = { horizontal: 'center' };
    });

    // Color condicional en días de inactividad
    if (p.daysSinceLastActivity !== null) {
      const cell = row.getCell('daysSinceLastActivity');
      if (p.daysSinceLastActivity > 30) {
        cell.font = { color: { argb: 'FF991B1B' }, bold: true }; // Red
      } else {
        cell.font = { color: { argb: 'FF166534' } }; // Green
      }
    }
  });

  // Exportar
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Informe_KPI_Proyectos_${new Date().toISOString().split('T')[0]}.xlsx`);
};
