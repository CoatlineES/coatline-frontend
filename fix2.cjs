const fs = require('fs');
let content = fs.readFileSync('src/utils/exportActivityReport.ts', 'utf8');

// Undo table changes
content = content.replace("summarySheet.mergeCells(`A${userStartRow}:I${userStartRow}`);", "summarySheet.mergeCells(`A${userStartRow}:H${userStartRow}`);");
content = content.replace("['Empleado', 'Planif.', 'Sin Fecha', 'Vencid.', 'En Curso', 'Complet.', 'Total', 'Negocios Gen.', 'Proyectos Gen.']", "['Empleado', 'Planif.', 'Vencid.', 'En Curso', 'Complet.', 'Total', 'Negocios Gen.', 'Proyectos Gen.']");
content = content.replace("user.filters?.planned || 0,\n      user.filters?.noDate || 0,", "(user.filters?.planned || 0) + (user.filters?.noDate || 0),");
content = content.replace("row.getCell(6).alignment = { horizontal: 'center' };\n    row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };\n    row.getCell(7).font = { bold: true };\n    row.getCell(8).alignment = { horizontal: 'center' };\n    row.getCell(9).alignment = { horizontal: 'center' };", "row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };\n    row.getCell(6).font = { bold: true };\n    row.getCell(7).alignment = { horizontal: 'center' };\n    row.getCell(8).alignment = { horizontal: 'center' };");
content = content.replace("summarySheet.getColumn('F').width = 12;\n  summarySheet.getColumn('G').width = 12;\n  summarySheet.getColumn('H').width = 12;", "summarySheet.getColumn('F').width = 12;\n  summarySheet.getColumn('G').width = 12;");

// Fix dashboardDistribution
const idx = content.indexOf('if (metrics.dashboardDistribution) {');
const endIdx = content.indexOf('// Actividades por Resultado');

if (idx !== -1 && endIdx !== -1) {
    const newDashboardCode = "if (metrics.dashboardDistribution) {\n" +
    "    const dist = { ...metrics.dashboardDistribution };\n" +
    "    if (dist.noDate) {\n" +
    "      dist.planned = (dist.planned || 0) + dist.noDate;\n" +
    "      delete dist.noDate;\n" +
    "    }\n" +
    "    const dashboardLabels = { planned: 'Planificadas', overdue: 'Vencidas', inProgress: 'En curso', completed: 'Completadas' };\n" +
    "    Object.entries(dist).forEach(([status, count]) => {\n" +
    "      summarySheet.addRow([dashboardLabels[status] || status, count]);\n" +
    "      summarySheet.getCell('A' + statusRow).font = { bold: true };\n" +
    "      summarySheet.getCell('B' + statusRow).alignment = { horizontal: 'right' };\n" +
    "      statusRow++;\n" +
    "    });\n" +
    "  }\n\n  ";
    content = content.substring(0, idx) + newDashboardCode + content.substring(endIdx);
}

fs.writeFileSync('src/utils/exportActivityReport.ts', content);
console.log('Done!');
