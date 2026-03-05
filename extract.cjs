const ExcelJS = require('exceljs');
const fs = require('fs');

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('컬러테이블.xlsx');
  const ws = wb.worksheets[0];

  const headers = {};
  ws.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber] = cell.value;
  });

  const data = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const r = {};
    row.eachCell((cell, colNumber) => {
      r[headers[colNumber]] = cell.value;
    });
    data.push({
      id: r['번호'],
      code: r['약호'],
      nameKo: r['계통색명 (국문)'],
      nameEn: r['계통색명 (영문)'],
      munsell: r['먼셀기호'],
      l: r['L*'],
      a: r['a*'],
      b: r['b*'],
      commonKo: r['관용색명 (국문)'] || '',
      commonEn: r['관용색명 (영문)'] || ''
    });
  });

  const js = `// Auto-generated from 컬러테이블.xlsx\nexport const colorData = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync('./colorspace-app/src/colorData.js', js, 'utf8');
  console.log('Done! Exported', data.length, 'colors');
}

main().catch(console.error);
