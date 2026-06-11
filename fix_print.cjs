const fs = require('fs');
const file = 'src/components/dashboard/MemberIDCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('/* // Legacy print window code:');
const endIdx = content.indexOf('  }; */', startIdx);
if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + content.substring(endIdx + 7);
    fs.writeFileSync(file, content);
}
