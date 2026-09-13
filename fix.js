const fs = require('fs');
let content = fs.readFileSync('src/utils/exportActivityReport.ts', 'utf8');

content = content.replace("summarySheet.mergeCells(`A${userStartRow}:H${userStartRow}`);", "summarySheet.mergeCells(`A${userStartRow}:I${userStartRow}`);");

content = content.replace("['Empleado', 'Planif.', 'Vencid.', 'En Curso', 'Complet.', 'Total', 'Negocios Gen.', 'Proyectos Gen.']", "['Empleado', 'Planif.', 'Sin Fecha', 'Vencid.', 'En Curso', 'Complet.', 'Total', 'Negocios Gen.', 'Proyectos Gen.']");

content = content.replace("(user.filters?.planned || 0) + (user.filters?.noDate || 0),", "user.filters?.planned || 0,\n      user.filters?.noDate || 0,");

let alignOld = "row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };\n    row.getCell(6).font = { bold: true };\n    row.getCell(7).alignment = { horizontal: 'center' };\n    row.getCell(8).alignment = { horizontal: 'center' };";
let alignNew = "row.getCell(6).alignment = { horizontal: 'center' };\n    row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };\n    row.getCell(7).font = { bold: true };\n    row.getCell(8).alignment = { horizontal: 'center' };\n    row.getCell(9).alignment = { horizontal: 'center' };";
content = content.replace(alignOld, alignNew);

// Also need to add width for column G which is now shifted, wait G was Negocios Gen. now it's Total
let colsOld = "summarySheet.getColumn('F').width = 12;\n  summarySheet.getColumn('G').width = 12;";
let colsNew = "summarySheet.getColumn('F').width = 12;\n  summarySheet.getColumn('G').width = 12;\n  summarySheet.getColumn('H').width = 12;";
content = content.replace(colsOld, colsNew);

fs.writeFileSync('src/utils/exportActivityReport.ts', content);
console.log('Done!');
