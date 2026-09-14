import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Project } from '../services/types';

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    'AWARDED': 'Adjudicado',
    'IN_PROGRESS': 'En ejecución',
    'COMPLETED': 'Ejecutado',
    'INVOICED': 'Facturado',
    'CLOSED': 'Cerrado',
    'CANCELLED': 'Cancelado',
  };
  return map[status] || status;
};

export const exportProjectsListToExcel = async (projects: Project[], filtersInfo: string) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Coastline CRM';
  workbook.created = new Date();

  // ==========================================
  // HOJA 1: RESUMEN Y ANALÍTICAS
  // ==========================================
  const summarySheet = workbook.addWorksheet('Resumen General', { views: [{ showGridLines: false }] });
  
  // Título
  summarySheet.mergeCells('A1:C1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'ANALÍTICA DE PROYECTOS';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Filtros
  summarySheet.mergeCells('A2:C2');
  summarySheet.getCell('A2').value = `Filtros aplicados: ${filtersInfo || 'Ninguno'}`;
  summarySheet.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };

  // Cálculos de analítica
  const totalProjects = projects.length;
  let totalQuoted = 0;
  let totalCertified = 0;
  let totalInvoiced = 0;
  
  const byStatus: Record<string, number> = { 'Adjudicado': 0, 'En ejecución': 0, 'Ejecutado': 0, 'Facturado': 0, 'Cerrado': 0, 'Cancelado': 0 };
  const byType: Record<string, number> = { 'Real': 0, 'Demo/Plantilla': 0 };

  projects.forEach(p => {
    totalQuoted += p.quotedAmount || 0;
    totalCertified += p.certifiedAmount || 0;
    totalInvoiced += p.invoicedAmount || 0;
    
    const translatedStatus = translateStatus(p.status);
    if (byStatus[translatedStatus] !== undefined) byStatus[translatedStatus]++;
    
    const type = p.projectOrigin === 'DEMO' ? 'Demo/Plantilla' : 'Real';
    if (byType[type] !== undefined) byType[type]++;
  });

  // Sección: Globales
  summarySheet.getRow(4).values = ['MÉTRICAS GLOBALES'];
  summarySheet.getCell('A4').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.mergeCells('A4:B4');

    summarySheet.addRow(['Total Proyectos (Todos):', totalProjects]);
  summarySheet.addRow(['Proyectos Reales:', byType['Real']]);
  summarySheet.addRow(['Demos / Plantillas:', byType['Demo/Plantilla']]);
  
  summarySheet.addRow(['Total Cotizado:', totalQuoted]);
  summarySheet.getCell('B8').numFmt = '#,##0.00';
  summarySheet.addRow(['Total Certificado:', totalCertified]);
  summarySheet.getCell('B9').numFmt = '#,##0.00';
  summarySheet.addRow(['Total Facturado:', totalInvoiced]);
  summarySheet.getCell('B10').numFmt = '#,##0.00';

  // Sección: Por Estado
  summarySheet.getRow(13).values = ['PROYECTOS POR ESTADO'];
  summarySheet.getCell('A13').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A13').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.mergeCells('A13:B13');

  summarySheet.addRow(['Adjudicados:', byStatus['Adjudicado']]);
  summarySheet.addRow(['En ejecución:', byStatus['En ejecuciA3n'] || byStatus['En ejecución'] || 0]);
  summarySheet.addRow(['Ejecutados:', byStatus['Ejecutado']]);
  summarySheet.addRow(['Facturados:', byStatus['Facturado']]);
  summarySheet.addRow(['Cerrados:', byStatus['Cerrado']]);
  summarySheet.addRow(['Cancelados:', byStatus['Cancelado']]);

  // Sección: Por Tipo
  summarySheet.getRow(22).values = ['PROYECTOS POR TIPO'];
  summarySheet.getCell('A22').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A22').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.mergeCells('A22:B22');

  summarySheet.addRow(['Reales:', byType['Real']]);
  summarySheet.addRow(['Demos / Plantillas:', byType['Demo/Plantilla']]);

  // Estilos de filas
  [5,6,7,8,9,10, 14,15,16,17,18,19, 23,24].forEach(rowIdx => {
    summarySheet.getCell(`A${rowIdx}`).font = { bold: true };
    summarySheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'right' };
    summarySheet.getCell(`A${rowIdx}`).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
    summarySheet.getCell(`B${rowIdx}`).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
  });

  summarySheet.getColumn('A').width = 25;
  summarySheet.getColumn('B').width = 20;




  // ==========================================
  // HOJA 2: DETALLES DE PROYECTOS
  // ==========================================
  const sheet = workbook.addWorksheet('Detalle');

  sheet.getRow(1).values = [
    'PROYECTO',
    'ESTADO',
    'EMPRESA',
    'CIUDAD',
    'MONTO COTIZADO',
    'MONTO CERTIFICADO',
    'MONTO FACTURADO',
    'INICIO PLANIFICADO',
    'FIN PLANIFICADO',
    'LÍNEA DE NEGOCIO',
    'TIPO'
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // Data
  projects.forEach((p) => {
    const row = sheet.addRow([
      p.name,
      translateStatus(p.status),
      (p as any).account?.name || 'Sin Empresa',
      p.city || '-',
      p.quotedAmount || 0,
      p.certifiedAmount || 0,
      p.invoicedAmount || 0,
      p.plannedStart ? new Date(p.plannedStart).toLocaleDateString('es-ES') : '-',
      p.plannedEnd ? new Date(p.plannedEnd).toLocaleDateString('es-ES') : '-',
      (p as any).businessLine?.name || '-',
      p.projectOrigin === 'DEMO' ? 'Demo/Plantilla' : 'Real'
    ]);

    row.getCell(6).numFmt = '#,##0.00';
    row.getCell(7).numFmt = '#,##0.00';
    row.getCell(8).numFmt = '#,##0.00';
  });

  // Widths
  sheet.getColumn(1).width = 35;
  sheet.getColumn(2).width = 15;
  
  sheet.getColumn(4).width = 30;
  sheet.getColumn(5).width = 20;
  sheet.getColumn(6).width = 20;
  sheet.getColumn(7).width = 20;
  sheet.getColumn(8).width = 20;
  sheet.getColumn(9).width = 20;
  sheet.getColumn(10).width = 20;
  

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Analitica_Proyectos_${new Date().toISOString().split('T')[0]}.xlsx`);
};
