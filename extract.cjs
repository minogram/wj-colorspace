const xlsx = require('./node_modules/xlsx');
const fs = require('fs');

const wb = xlsx.readFile('컬러테이블.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = xlsx.utils.sheet_to_json(ws);

const data = raw.map(r => ({
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
}));

const js = `// Auto-generated from 컬러테이블.xlsx\nexport const colorData = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync('./colorspace-app/src/colorData.js', js, 'utf8');
console.log('Done! Exported', data.length, 'colors');
