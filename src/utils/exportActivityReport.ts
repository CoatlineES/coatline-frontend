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
  'NO_ANSWER': 'No contesta',
  'CALL_BACK': 'Llamar otro día',
  'INTERESTED': 'Interesado',
  'SUCCESSFUL': 'Reunión agendada',
  'UNSUCCESSFUL': 'No interesado',
  'NO_TARGET': 'No target',
  'NO_RESULT': 'Sin resultado / Pendiente'
};

const STANDARD_RESULTS = [
  { key: 'NO_ANSWER', label: 'No contesta', tag: 'Seguimiento', fontColor: 'FF475569', bgColor: 'FFF8FAFC' },
  { key: 'CALL_BACK', label: 'Llamar otro día', tag: 'Seguimiento', fontColor: 'FF1D4ED8', bgColor: 'FFEFF6FF' },
  { key: 'INTERESTED', label: 'Interesado', tag: 'Potencial', fontColor: 'FF15803D', bgColor: 'FFF0FDF4' },
  { key: 'SUCCESSFUL', label: 'Reunión agendada', tag: 'Éxito / Conversión', fontColor: 'FF047857', bgColor: 'FFECFDF5' },
  { key: 'UNSUCCESSFUL', label: 'No interesado', tag: 'Cierre Negativo', fontColor: 'FFB91C1C', bgColor: 'FFFEF2F2' },
  { key: 'NO_TARGET', label: 'No target', tag: 'Descarte', fontColor: 'FFB45309', bgColor: 'FFFFFBEB' }
];

const normalizeResultKey = (rawResult?: string | null): string => {
  if (!rawResult) return 'NO_RESULT';
  const s = rawResult.toString().trim().toUpperCase();
  if (s === 'NO_ANSWER' || s === 'NO CONTESTA') return 'NO_ANSWER';
  if (s === 'CALL_BACK' || s === 'LLAMAR OTRO DÍA' || s === 'LLAMAR OTRO DIA') return 'CALL_BACK';
  if (s === 'INTERESTED' || s === 'INTERESADO') return 'INTERESTED';
  if (s === 'SUCCESSFUL' || s === 'REUNIÓN AGENDADA' || s === 'REUNION AGENDADA') return 'SUCCESSFUL';
  if (s === 'UNSUCCESSFUL' || s === 'NO INTERESADO') return 'UNSUCCESSFUL';
  if (s === 'NO_TARGET' || s === 'NO TARGET') return 'NO_TARGET';
  return s;
};

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
};

const doubleBottomBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF94A3B8' } },
  left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  bottom: { style: 'double', color: { argb: 'FF002D5A' } },
  right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
};

export const exportActivitiesToExcel = async (data: any, filtersInfo: string) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Coastline CRM';
  workbook.created = new Date();

  const activities: any[] = Array.isArray(data?.activities) ? data.activities : [];
  const metrics = data?.metrics || {};

  // ──────────────────────────────────────────────
  // TALLY GLOBAL & PER-USER RESULT METRICS
  // ──────────────────────────────────────────────
  const globalResultCounts: Record<string, number> = {
    NO_ANSWER: 0,
    CALL_BACK: 0,
    INTERESTED: 0,
    SUCCESSFUL: 0,
    UNSUCCESSFUL: 0,
    NO_TARGET: 0,
    NO_RESULT: 0
  };

  const userResultMap: Record<string, Record<string, number>> = {};

  activities.forEach((act: any) => {
    const key = normalizeResultKey(act.result);
    globalResultCounts[key] = (globalResultCounts[key] || 0) + 1;

    const userName = act.user?.name || 'Sin Asignar';
    if (!userResultMap[userName]) {
      userResultMap[userName] = {
        NO_ANSWER: 0,
        CALL_BACK: 0,
        INTERESTED: 0,
        SUCCESSFUL: 0,
        UNSUCCESSFUL: 0,
        NO_TARGET: 0,
        NO_RESULT: 0
      };
    }
    userResultMap[userName][key] = (userResultMap[userName][key] || 0) + 1;
  });

  // If activities array was empty but metrics.resultDistribution exists, fallback to it
  if (activities.length === 0 && metrics.resultDistribution) {
    Object.entries(metrics.resultDistribution).forEach(([k, count]: [string, any]) => {
      const norm = normalizeResultKey(k);
      globalResultCounts[norm] = Number(count) || 0;
    });
  }

  const totalActivitiesCount = activities.length || metrics.totalActivities || 0;
  const totalWithResultCount = 
    globalResultCounts.NO_ANSWER +
    globalResultCounts.CALL_BACK +
    globalResultCounts.INTERESTED +
    globalResultCounts.SUCCESSFUL +
    globalResultCounts.UNSUCCESSFUL +
    globalResultCounts.NO_TARGET;

  const totalNoResultCount = globalResultCounts.NO_RESULT || Math.max(0, totalActivitiesCount - totalWithResultCount);

  // ──────────────────────────────────────────────
  // HOJA 1: RESUMEN EJECUTIVO Y ANALÍTICA
  // ──────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Resumen de Actividades', { views: [{ showGridLines: true }] });

  // Configuración de anchos de columnas
  summarySheet.getColumn('A').width = 34; // Categoría / Nombre
  summarySheet.getColumn('B').width = 18; // Cantidad / No contesta / Planificadas
  summarySheet.getColumn('C').width = 18; // % Total / Llamar otro día / Vencidas
  summarySheet.getColumn('D').width = 18; // % Gestionadas / Interesado / En Curso
  summarySheet.getColumn('E').width = 20; // Reunión agendada / Completadas
  summarySheet.getColumn('F').width = 18; // No interesado / Total Asignadas
  summarySheet.getColumn('G').width = 18; // No target / Negocios Gen.
  summarySheet.getColumn('H').width = 18; // Sin resultado / Proyectos Gen.
  summarySheet.getColumn('I').width = 18; // Total
  summarySheet.getColumn('J').width = 22; // % Éxito Comercial

  // BANNER DE TÍTULO
  summarySheet.mergeCells('A1:J1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'INFORME DE GESTIÓN Y RENDIMIENTO DE ACTIVIDADES';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(1).height = 36;

  // SUBTÍTULO Y FILTROS
  summarySheet.mergeCells('A2:J2');
  const subCell = summarySheet.getCell('A2');
  subCell.value = `Filtros y parámetros aplicados: ${filtersInfo || 'Todos los registros'}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'left' };
  summarySheet.getRow(2).height = 20;

  summarySheet.mergeCells('A3:J3');
  const dateCell = summarySheet.getCell('A3');
  dateCell.value = `Generado el: ${new Date().toLocaleString('es-ES')}`;
  dateCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF94A3B8' } };
  dateCell.alignment = { vertical: 'middle', horizontal: 'left' };
  summarySheet.getRow(3).height = 18;

  // ──────────────────────────────────────────────
  // SECCIÓN 1: MÉTRICAS GENERALES & ESTADO (PANEL)
  // ──────────────────────────────────────────────
  summarySheet.addRow([]); // Fila 4 vacía

  const kpiHeaderRow = summarySheet.addRow(['MÉTRICAS CLAVE DE GESTIÓN', '', '', 'DISTRIBUCIÓN POR ESTADO (PANEL)']);
  summarySheet.mergeCells(`A${kpiHeaderRow.number}:C${kpiHeaderRow.number}`);
  summarySheet.mergeCells(`D${kpiHeaderRow.number}:F${kpiHeaderRow.number}`);
  
  [summarySheet.getCell(`A${kpiHeaderRow.number}`), summarySheet.getCell(`D${kpiHeaderRow.number}`)].forEach(c => {
    c.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
    c.alignment = { vertical: 'middle', horizontal: 'left' };
  });
  kpiHeaderRow.height = 24;

  const dashboardDist = metrics.dashboardDistribution || {};
  const plannedCount = (dashboardDist.planned || 0) + (dashboardDist.noDate || 0);
  const overdueCount = dashboardDist.overdue || 0;
  const inProgressCount = dashboardDist.inProgress || 0;
  const completedCount = dashboardDist.completed || metrics.completedActivities || 0;

  const kpiRowsData = [
    [
      'Total Actividades:', totalActivitiesCount, '',
      'Planificadas:', plannedCount, totalActivitiesCount > 0 ? `${((plannedCount / totalActivitiesCount) * 100).toFixed(1)}%` : '0.0%'
    ],
    [
      'Actividades Completadas:', completedCount, '',
      'Vencidas:', overdueCount, totalActivitiesCount > 0 ? `${((overdueCount / totalActivitiesCount) * 100).toFixed(1)}%` : '0.0%'
    ],
    [
      'Tasa de Finalización:', `${(metrics.completionRate || 0).toFixed(1)}%`, '',
      'En Curso:', inProgressCount, totalActivitiesCount > 0 ? `${((inProgressCount / totalActivitiesCount) * 100).toFixed(1)}%` : '0.0%'
    ],
    [
      'Actividades con Retraso:', metrics.delayedActivitiesCount || 0, '',
      'Completadas:', completedCount, totalActivitiesCount > 0 ? `${((completedCount / totalActivitiesCount) * 100).toFixed(1)}%` : '0.0%'
    ],
    [
      'Promedio Retraso:', `${(metrics.avgDelayDays || 0).toFixed(1)} días`, '',
      '', '', ''
    ]
  ];

  kpiRowsData.forEach((rData, idx) => {
    const row = summarySheet.addRow(rData);
    row.height = 20;
    const isEven = idx % 2 === 0;
    const fill = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    [1, 2, 4, 5, 6].forEach(colIdx => {
      const cell = row.getCell(colIdx);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
      cell.border = thinBorder;
      if (colIdx === 1 || colIdx === 4) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        cell.font = { name: 'Calibri', size: 10, bold: colIdx === 2 };
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      }
    });
  });

  // ──────────────────────────────────────────────
  // SECCIÓN 2: ANALÍTICA POR RESULTADO
  // ──────────────────────────────────────────────
  summarySheet.addRow([]); // Separador

  const resultHeaderTitleRow = summarySheet.addRow(['ANALÍTICA POR RESULTADO DE LA ACTIVIDAD']);
  summarySheet.mergeCells(`A${resultHeaderTitleRow.number}:E${resultHeaderTitleRow.number}`);
  const rTitleCell = summarySheet.getCell(`A${resultHeaderTitleRow.number}`);
  rTitleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  rTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  rTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  resultHeaderTitleRow.height = 26;

  const resultTableHead = summarySheet.addRow([
    'Resultado de la Actividad',
    'Categoría / Tipología',
    'Cantidad',
    '% del Total General',
    '% sobre Gestionadas con Resultado'
  ]);
  resultTableHead.height = 24;
  for (let c = 1; c <= 5; c++) {
    const cell = resultTableHead.getCell(c);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: c <= 2 ? 'left' : 'center' };
    cell.border = thinBorder;
  }

  // Fila para cada uno de los 6 resultados estándar
  STANDARD_RESULTS.forEach((resDef, idx) => {
    const count = globalResultCounts[resDef.key] || 0;
    const pctTotal = totalActivitiesCount > 0 ? ((count / totalActivitiesCount) * 100).toFixed(1) + '%' : '0.0%';
    const pctGestionadas = totalWithResultCount > 0 ? ((count / totalWithResultCount) * 100).toFixed(1) + '%' : '0.0%';

    const row = summarySheet.addRow([
      resDef.label,
      resDef.tag,
      count,
      pctTotal,
      pctGestionadas
    ]);
    row.height = 21;
    const isEven = idx % 2 === 0;
    const rowFill = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    for (let c = 1; c <= 5; c++) {
      const cell = row.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } };
      cell.border = thinBorder;

      if (c === 1) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: resDef.fontColor } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (c === 2) {
        cell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (c === 3) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else {
        cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF334155' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  });

  // Fila para actividades sin resultado
  const noResultPct = totalActivitiesCount > 0 ? ((totalNoResultCount / totalActivitiesCount) * 100).toFixed(1) + '%' : '0.0%';
  const noResultRow = summarySheet.addRow([
    'Sin resultado / Pendiente',
    'En proceso / Planificada',
    totalNoResultCount,
    noResultPct,
    '-'
  ]);
  noResultRow.height = 21;
  for (let c = 1; c <= 5; c++) {
    const cell = noResultRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    cell.border = thinBorder;
    if (c === 1) {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF94A3B8' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    } else if (c === 2) {
      cell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF94A3B8' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    } else if (c === 3) {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
    } else {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF94A3B8' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  }

  // Fila Subtotal Gestionadas con Resultado
  const subtotalPctTotal = totalActivitiesCount > 0 ? ((totalWithResultCount / totalActivitiesCount) * 100).toFixed(1) + '%' : '0.0%';
  const subtotalRow = summarySheet.addRow([
    'SUBTOTAL GESTIONADAS CON RESULTADO',
    'Concluidas',
    totalWithResultCount,
    subtotalPctTotal,
    '100.0%'
  ]);
  subtotalRow.height = 22;
  for (let c = 1; c <= 5; c++) {
    const cell = subtotalRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.border = thinBorder;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF002D5A' } };
    cell.alignment = { vertical: 'middle', horizontal: c <= 2 ? 'left' : (c === 3 ? 'right' : 'center') };
  }

  // Fila Total General
  const totalRow = summarySheet.addRow([
    'TOTAL GENERAL DE ACTIVIDADES',
    'Universo Total',
    totalActivitiesCount,
    '100.0%',
    '-'
  ]);
  totalRow.height = 24;
  for (let c = 1; c <= 5; c++) {
    const cell = totalRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.border = doubleBottomBorder;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    cell.alignment = { vertical: 'middle', horizontal: c <= 2 ? 'left' : (c === 3 ? 'right' : 'center') };
  }

  // Mini KPI de Rendimiento Comercial
  const successCount = (globalResultCounts.SUCCESSFUL || 0) + (globalResultCounts.INTERESTED || 0);
  const successRate = totalWithResultCount > 0 ? ((successCount / totalWithResultCount) * 100).toFixed(1) : '0.0';

  const kpiInsightRow = summarySheet.addRow([
    `* Tasa de Efectividad Comercial (Reunión agendada + Interesado): ${successRate}% (${successCount} de ${totalWithResultCount} gestionadas)`
  ]);
  summarySheet.mergeCells(`A${kpiInsightRow.number}:E${kpiInsightRow.number}`);
  kpiInsightRow.getCell(1).font = { name: 'Calibri', size: 9, italic: true, bold: true, color: { argb: 'FF047857' } };
  kpiInsightRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
  kpiInsightRow.height = 20;

  // ──────────────────────────────────────────────
  // SECCIÓN 3: DESGLOSE DE RESULTADOS POR EMPLEADO
  // ──────────────────────────────────────────────
  summarySheet.addRow([]); // Separador

  const userResultTitleRow = summarySheet.addRow(['DESGLOSE DE RESULTADOS POR EMPLEADO / RESPONSABLE']);
  summarySheet.mergeCells(`A${userResultTitleRow.number}:J${userResultTitleRow.number}`);
  const urTitle = summarySheet.getCell(`A${userResultTitleRow.number}`);
  urTitle.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  urTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  urTitle.alignment = { vertical: 'middle', horizontal: 'left' };
  userResultTitleRow.height = 26;

  const userResultHead = summarySheet.addRow([
    'Empleado',
    'No contesta',
    'Llamar otro día',
    'Interesado',
    'Reunión agendada',
    'No interesado',
    'No target',
    'Sin resultado',
    'Total Asignadas',
    '% Éxito (Reunión / Interesado)'
  ]);
  userResultHead.height = 24;
  for (let c = 1; c <= 10; c++) {
    const cell = userResultHead.getCell(c);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'center' };
    cell.border = thinBorder;
  }

  // Consolidar lista de usuarios
  const allUsersMap = new Map<string, any>();
  if (Array.isArray(metrics.userPerformance)) {
    metrics.userPerformance.forEach((u: any) => {
      allUsersMap.set(u.name, u);
    });
  }
  Object.keys(userResultMap).forEach(uName => {
    if (!allUsersMap.has(uName)) {
      allUsersMap.set(uName, { name: uName, assigned: 0 });
    }
  });

  const usersList = Array.from(allUsersMap.values());
  const colTotals = {
    noAnswer: 0,
    callBack: 0,
    interested: 0,
    successful: 0,
    unsuccessful: 0,
    noTarget: 0,
    noResult: 0,
    total: 0
  };

  usersList.forEach((u, idx) => {
    const uCounts = userResultMap[u.name] || u.results || {};
    const noAnswer = uCounts.NO_ANSWER || 0;
    const callBack = uCounts.CALL_BACK || 0;
    const interested = uCounts.INTERESTED || 0;
    const successful = uCounts.SUCCESSFUL || 0;
    const unsuccessful = uCounts.UNSUCCESSFUL || 0;
    const noTarget = uCounts.NO_TARGET || 0;
    const noResult = uCounts.NO_RESULT || 0;
    const total = (u.assigned !== undefined && u.assigned > 0) 
      ? u.assigned 
      : (noAnswer + callBack + interested + successful + unsuccessful + noTarget + noResult);

    colTotals.noAnswer += noAnswer;
    colTotals.callBack += callBack;
    colTotals.interested += interested;
    colTotals.successful += successful;
    colTotals.unsuccessful += unsuccessful;
    colTotals.noTarget += noTarget;
    colTotals.noResult += noResult;
    colTotals.total += total;

    const uGestionadas = noAnswer + callBack + interested + successful + unsuccessful + noTarget;
    const uSuccess = interested + successful;
    const successPct = uGestionadas > 0 ? ((uSuccess / uGestionadas) * 100).toFixed(1) + '%' : '0.0%';

    const row = summarySheet.addRow([
      u.name,
      noAnswer,
      callBack,
      interested,
      successful,
      unsuccessful,
      noTarget,
      noResult,
      total,
      successPct
    ]);
    row.height = 20;
    const isEven = idx % 2 === 0;
    const rowFill = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    for (let c = 1; c <= 10; c++) {
      const cell = row.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } };
      cell.border = thinBorder;
      if (c === 1) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (c === 9) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF002D5A' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (c === 10) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF475569' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  });

  // Fila Totalizadora de Usuarios
  const totalGestionadasGlobal = colTotals.interested + colTotals.successful + colTotals.noAnswer + colTotals.callBack + colTotals.unsuccessful + colTotals.noTarget;
  const globalSuccessRate = totalGestionadasGlobal > 0 
    ? (((colTotals.interested + colTotals.successful) / totalGestionadasGlobal) * 100).toFixed(1) + '%' 
    : '0.0%';

  const totalUserRow = summarySheet.addRow([
    'TOTAL GENERAL',
    colTotals.noAnswer,
    colTotals.callBack,
    colTotals.interested,
    colTotals.successful,
    colTotals.unsuccessful,
    colTotals.noTarget,
    colTotals.noResult,
    colTotals.total,
    globalSuccessRate
  ]);
  totalUserRow.height = 23;
  for (let c = 1; c <= 10; c++) {
    const cell = totalUserRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.border = doubleBottomBorder;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'center' };
  }

  // ──────────────────────────────────────────────
  // SECCIÓN 4: RENDIMIENTO GENERAL POR EMPLEADO
  // ──────────────────────────────────────────────
  summarySheet.addRow([]); // Separador

  const perfHeaderTitleRow = summarySheet.addRow(['RENDIMIENTO GENERAL POR EMPLEADO (ESTADOS Y GENERACIÓN)']);
  summarySheet.mergeCells(`A${perfHeaderTitleRow.number}:H${perfHeaderTitleRow.number}`);
  const perfTitleCell = summarySheet.getCell(`A${perfHeaderTitleRow.number}`);
  perfTitleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  perfTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  perfTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  perfHeaderTitleRow.height = 26;

  const perfTableHead = summarySheet.addRow([
    'Empleado',
    'Planificadas',
    'Vencidas',
    'En Curso',
    'Completadas',
    'Total Asignadas',
    'Negocios Gen.',
    'Proyectos Gen.'
  ]);
  perfTableHead.height = 24;
  for (let c = 1; c <= 8; c++) {
    const cell = perfTableHead.getCell(c);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'center' };
    cell.border = thinBorder;
  }

  let perfTotals = {
    planned: 0,
    overdue: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
    deals: 0,
    projects: 0
  };

  (metrics.userPerformance || []).forEach((user: any, idx: number) => {
    const p = (user.filters?.planned || 0) + (user.filters?.noDate || 0);
    const o = user.filters?.overdue || 0;
    const ip = user.filters?.inProgress || 0;
    const co = user.filters?.completed || 0;
    const tot = user.assigned || (p + o + ip + co);
    const dg = user.dealsGenerated || 0;
    const pg = user.projectsGenerated || 0;

    perfTotals.planned += p;
    perfTotals.overdue += o;
    perfTotals.inProgress += ip;
    perfTotals.completed += co;
    perfTotals.total += tot;
    perfTotals.deals += dg;
    perfTotals.projects += pg;

    const row = summarySheet.addRow([
      user.name,
      p,
      o,
      ip,
      co,
      tot,
      dg,
      pg
    ]);
    row.height = 20;
    const isEven = idx % 2 === 0;
    const rowFill = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } };
      cell.border = thinBorder;
      if (c === 1) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (c === 6) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF002D5A' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF475569' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  });

  // Fila Total Rendimiento
  const totalPerfRow = summarySheet.addRow([
    'TOTAL GENERAL',
    perfTotals.planned,
    perfTotals.overdue,
    perfTotals.inProgress,
    perfTotals.completed,
    perfTotals.total,
    perfTotals.deals,
    perfTotals.projects
  ]);
  totalPerfRow.height = 23;
  for (let c = 1; c <= 8; c++) {
    const cell = totalPerfRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.border = doubleBottomBorder;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'center' };
  }

  // ──────────────────────────────────────────────
  // HOJA 2: SÁBANA DE DATOS (DETALLE COMPLETO)
  // ──────────────────────────────────────────────
  const dataSheet = workbook.addWorksheet('Detalle de Actividades', { views: [{ showGridLines: true }] });

  dataSheet.columns = [
    { header: 'Ref', key: 'ref', width: 12 },
    { header: 'Asunto / Título', key: 'subject', width: 38 },
    { header: 'Tipo', key: 'type', width: 20 },
    { header: 'Estado', key: 'status', width: 16 },
    { header: 'Resultado', key: 'result', width: 22 },
    { header: 'Responsable', key: 'user', width: 24 },
    { header: 'Cliente / Cuenta', key: 'account', width: 28 },
    { header: 'Negocio Asociado', key: 'deal', width: 28 },
    { header: 'Contacto', key: 'contact', width: 24 },
    { header: 'Fecha Creada', key: 'createdAt', width: 16 },
    { header: 'Fecha Planificada', key: 'plannedDate', width: 18 },
    { header: 'Fecha Finalización', key: 'completedAt', width: 18 },
    { header: 'Retraso (Días)', key: 'delayDays', width: 15 },
    { header: 'Seguimiento De', key: 'parentActivity', width: 26 },
    { header: 'Notas / Comentarios', key: 'notes', width: 50 },
  ];

  const headRow = dataSheet.getRow(1);
  headRow.height = 26;
  for (let c = 1; c <= 15; c++) {
    const cell = headRow.getCell(c);
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  }

  activities.forEach((act: any, idx: number) => {
    const normalizedRes = normalizeResultKey(act.result);
    const resultLabel = normalizedRes !== 'NO_RESULT' ? (ACTIVITY_RESULT_LABELS[normalizedRes] || normalizedRes) : '-';

    const row = dataSheet.addRow({
      ref: act.id ? act.id.substring(0, 8).toUpperCase() : '-',
      subject: act.subject || 'Sin Asunto',
      type: ACTIVITY_TYPE_LABELS[act.activityType] || act.activityType || '-',
      status: ACTIVITY_STATUS_LABELS[act.status] || act.status || '-',
      result: resultLabel,
      user: act.user?.name || 'Sin Asignar',
      account: act.account?.name || '-',
      deal: act.deal?.name || '-',
      contact: act.contact?.name || '-',
      createdAt: act.createdAt ? new Date(act.createdAt).toLocaleDateString('es-ES') : '-',
      plannedDate: act.plannedDate ? new Date(act.plannedDate).toLocaleDateString('es-ES') : '-',
      completedAt: act.completedAt ? new Date(act.completedAt).toLocaleDateString('es-ES') : '-',
      delayDays: act.delayDays || 0,
      parentActivity: act.parentActivity?.subject || '-',
      notes: (act.notes || '').replace(/(<([^>]+)>)/gi, '') // Limpiar etiquetas HTML
    });

    row.height = 20;
    const isEven = idx % 2 === 0;
    const rowFill = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    for (let c = 1; c <= 15; c++) {
      const cell = row.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } };
      cell.border = thinBorder;
      cell.font = { name: 'Calibri', size: 9.5 };

      if (c === 5 && normalizedRes !== 'NO_RESULT') {
        // Estilizar celda de resultado con color correspondiente
        const def = STANDARD_RESULTS.find(r => r.key === normalizedRes);
        if (def) {
          cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: def.fontColor } };
        }
      }

      if (c === 1 || c === 4 || c === 5 || c === 10 || c === 11 || c === 12 || c === 13) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    }
  });

  // ──────────────────────────────────────────────
  // GENERAR Y DESCARGAR ARCHIVO EXCEL
  // ──────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Informe_Actividades_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
