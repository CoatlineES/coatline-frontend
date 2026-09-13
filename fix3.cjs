const fs = require('fs');
let content = fs.readFileSync('src/services/clauses.service.ts', 'utf8');

content = content.replace(/return response;/g, 'return response.data;');

fs.writeFileSync('src/services/clauses.service.ts', content);
console.log('Done!');
