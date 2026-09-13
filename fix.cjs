
const fs = require('fs');
let content = fs.readFileSync('src/views/public/PublicCertificationView.tsx', 'utf8');

const oldRegex = /const \\{ data \\} = await api\\.post\\(\\/certifications\\/public\\/\\$\\{token\\}\\/sign, \\{\\s*signatoryName: name,\\s*signatoryDni: dni,\\s*signature: signatureBase64\\s*\\}\\);\\s*setCertification\\(\\(prev: any\\) => \\(\\{ \\.\\.\\.prev, \\.\\.\\.data \\}\\)\\);/g;

const newCode = [
  '        await api.post(/certifications/public//sign, {',
  '          signatoryName: name,',
  '          signatoryDni: dni,',
  '          signature: signatureBase64',
  '        });',
  '        ',
  '        const { data: newData } = await api.get(/certifications/public/);',
  '        if (newData.certification) {',
  '          setFullData(newData);',
  '          setCertification(newData.certification);',
  '        } else {',
  '          setFullData({ certification: newData, baseQuotation: null, budgetQuotation: null, certifications: [] });',
  '          setCertification(newData);',
  '        }'
].join('\\n');

content = content.replace(oldRegex, newCode);
fs.writeFileSync('src/views/public/PublicCertificationView.tsx', content);

