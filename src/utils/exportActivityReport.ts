import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  'TASK': 'Tarea',
  'CALL': 'Llamada (Sist.)',
  'EMAIL': 'Email',
  'LLAMADA': 'Llamada',
  'REUNION_COMERCIAL': 'Reunión Comercial',
  'REUNION_SEGUIMIENTO': 'Reunión Seguim.',
  'COTIZACION': 'Envío Cotización',
  'SEGUIMIENTO': 'Seguimiento'
};

const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  'PLANNED': 'Planificada',
  'IN_PROGRESS': 'En Curso',
  'COMPLETED': 'Completada',
  'CANCELLED': 'Cancelada'
};

const ACTIVITY_RESULT_LABELS: Record<string, string> = {
  'CALL_BACK': 'Devolver Llamada',
  'INTERESTED': 'Interesado',
  'NO_ANSWER': 'Sin Respuesta',
  'SUCCESSFUL': 'Exitoso',
  'UNSUCCESSFUL': 'No Exitoso'
};

export const exportActivitiesToExcel = async (data: any, filtersInfo: string) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Coastline CRM';
  workbook.created = new Date();

  // ──────────────────────────────────────────────
  // HOJA 1: RESUMEN Y KPIs
  // ──────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Resumen de Actividades', { views: [{ showGridLines: false }] });
  
  // Título
  summarySheet.mergeCells('A1:E1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'INFORME DE RENDIMIENTO DE ACTIVIDADES';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Filtros aplicados
  summarySheet.mergeCells('A2:E2');
  summarySheet.getCell('A2').value = `Parámetros: ${filtersInfo}`;
  summarySheet.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };

  // KPIs Generales
  summarySheet.getRow(4).values = ['MÉTRICAS GENERALES'];
  summarySheet.getCell('A4').font = { bold: true, size: 12 };
  summarySheet.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
  summarySheet.mergeCells('A4:C4');

  const { metrics } = data;

  summarySheet.addRow(['Total Actividades:', metrics.totalActivities]);
  summarySheet.addRow(['Actividades Completadas:', metrics.completedActivities]);
  summarySheet.addRow(['Tasa de Finalización:', `${metrics.completionRate.toFixed(2)}%`]);
  
  // Estilizar filas de métricas
  for (let i = 5; i <= 7; i++) {
    summarySheet.getCell(`A${i}`).font = { bold: true };
    summarySheet.getCell(`B${i}`).alignment = { horizontal: 'right' };
  }

  // Actividades por Estado (Panel)
  summarySheet.getRow(13).values = ['DISTRIBUCIÓN POR ESTADO (PANEL)'];
  summarySheet.getCell('A13').font = { bold: true, size: 12 };
  summarySheet.getCell('A13').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
  summarySheet.mergeCells('A13:B13');

  let statusRow = 14;
  if (metrics.dashboardDistribution) {
    const dist = { ...metrics.dashboardDistribution };
    if (dist.noDate) {
      dist.planned = (dist.planned || 0) + dist.noDate;
      delete dist.noDate;
    }
    const dashboardLabels = { planned: 'Planificadas', overdue: 'Vencidas', inProgress: 'En curso', completed: 'Completadas' };
    Object.entries(dist).forEach(([status, count]) => {
      summarySheet.addRow([dashboardLabels[status] || status, count]);
      summarySheet.getCell('A' + statusRow).font = { bold: true };
      summarySheet.getCell('B' + statusRow).alignment = { horizontal: 'right' };
      statusRow++;
    });
  }

  // Actividades por Resultado
  statusRow++;
  summarySheet.getRow(statusRow).values = ['DISTRIBUCIÓN POR RESULTADO'];
  summarySheet.getCell(`A${statusRow}`).font = { bold: true, size: 12 };
  summarySheet.getCell(`A${statusRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
  summarySheet.mergeCells(`A${statusRow}:B${statusRow}`);
  statusRow++;

  if (metrics.resultDistribution) {
    const resultLabels: any = { CALL_BACK: 'Llamar más tarde', INTERESTED: 'Interesado', NO_ANSWER: 'No responde', SUCCESSFUL: 'Exitoso', UNSUCCESSFUL: 'Fallido', NO_RESULT: 'Sin resultado' };
    Object.entries(metrics.resultDistribution).forEach(([res, count]) => {
      summarySheet.addRow([resultLabels[res] || res, count]);
      summarySheet.getCell(`A${statusRow}`).font = { bold: true };
      summarySheet.getCell(`B${statusRow}`).alignment = { horizontal: 'right' };
      statusRow++;
    });
  }

  // Rendimiento por Usuario
  const userStartRow = statusRow + 2;
  summarySheet.getRow(userStartRow).values = ['RENDIMIENTO POR USUARIO'];
  summarySheet.getCell(`A${userStartRow}`).font = { bold: true, size: 12 };
  summarySheet.getCell(`A${userStartRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
  summarySheet.mergeCells(`A${userStartRow}:H${userStartRow}`);

  summarySheet.getRow(userStartRow + 1).values = ['Empleado', 'Planif.', 'Vencid.', 'En Curso', 'Complet.', 'Total', 'Negocios Gen.', 'Proyectos Gen.'];
  summarySheet.getRow(userStartRow + 1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summarySheet.getRow(userStartRow + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  summarySheet.getRow(userStartRow + 1).alignment = { horizontal: 'center' };
  summarySheet.getCell(`A${userStartRow + 1}`).alignment = { horizontal: 'left' };

  let currentRow = userStartRow + 2;
  for (const user of metrics.userPerformance) {
    const row = summarySheet.addRow([
      user.name,
      (user.filters?.planned || 0) + (user.filters?.noDate || 0),
      user.filters?.overdue || 0,
      user.filters?.inProgress || 0,
      user.filters?.completed || 0,
      user.assigned || 0,
      user.dealsGenerated || 0,
      user.projectsGenerated || 0
    ]);
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(3).alignment = { horizontal: 'center' };
    row.getCell(4).alignment = { horizontal: 'center' };
    row.getCell(5).alignment = { horizontal: 'center' };
    row.getCell(6).alignment = { horizontal: 'center' };
    row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(7).font = { bold: true };
    row.getCell(9).alignment = { horizontal: 'center' };
    row.getCell(8).alignment = { horizontal: 'center' };
    currentRow++;
  }

  summarySheet.getColumn('A').width = 30;
  summarySheet.getColumn('B').width = 12;
  summarySheet.getColumn('C').width = 12;
  summarySheet.getColumn('D').width = 12;
  summarySheet.getColumn('E').width = 12;
  summarySheet.getColumn('F').width = 12;

  // ──────────────────────────────────────────────
  // HOJA 2: SABANA DE DATOS (DETALLE)
  // ──────────────────────────────────────────────
  const dataSheet = workbook.addWorksheet('Detalle de Actividades');

  dataSheet.columns = [
    { header: 'Ref', key: 'ref', width: 10 },
    { header: 'Asunto / Título', key: 'subject', width: 40 },
    { header: 'Tipo', key: 'type', width: 20 },
    { header: 'Estado', key: 'status', width: 15 },
    { header: 'Resultado', key: 'result', width: 20 },
    { header: 'Responsable', key: 'user', width: 25 },
    { header: 'Cliente', key: 'account', width: 30 },
    { header: 'Negocio Asociado', key: 'deal', width: 30 },
    { header: 'Contacto', key: 'contact', width: 25 },
    { header: 'Fecha Creada', key: 'createdAt', width: 15 },
    { header: 'Fecha Planificada', key: 'plannedDate', width: 15 },
    { header: 'Fecha Finalización', key: 'completedAt', width: 15 },
    { header: 'Retraso (Días)', key: 'delayDays', width: 15 },
    { header: 'Seguimiento De', key: 'parentActivity', width: 25 },
    { header: 'Notas', key: 'notes', width: 50 },
  ];

  dataSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  dataSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };

  data.activities.forEach((act: any) => {
    dataSheet.addRow({
      ref: act.id.substring(0, 8),
      subject: act.subject,
      type: ACTIVITY_TYPE_LABELS[act.activityType] || act.activityType,
      status: ACTIVITY_STATUS_LABELS[act.status] || act.status,
      result: act.result ? (ACTIVITY_RESULT_LABELS[act.result] || act.result) : '-',
      user: act.user?.name || 'Sin Asignar',
      account: act.account?.name || '-',
      deal: act.deal?.name || '-',
      contact: act.contact?.name || '-',
      createdAt: new Date(act.createdAt).toLocaleDateString(),
      plannedDate: act.plannedDate ? new Date(act.plannedDate).toLocaleDateString() : '-',
      completedAt: act.completedAt ? new Date(act.completedAt).toLocaleDateString() : '-',
      delayDays: act.delayDays || 0,
      parentActivity: act.parentActivity?.subject || '-',
      notes: (act.notes || '').replace(/(<([^>]+)>)/gi, '') // Remove HTML tags if rich text
    });
  });

  // Generar y descargar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Informe_Actividades_${new Date().getTime()}.xlsx`);
};
