const fs = require('fs');

const filepath = 'src/views/public/PublicCertificationView.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const badCode = `        const { data: newData } = await api.get(/certifications/public/);`;
const goodCode = '        const { data: newData } = await api.get(`/certifications/public/${token}`);';

content = content.replace(badCode, goodCode);
fs.writeFileSync(filepath, content);
console.log('Done!');
