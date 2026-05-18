const fs = require('fs');
const file = 'c:/Users/kural/Downloads/capstone_project_assignments/ai_hr_copilot/frontend/components/ai/chat-panel.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed successfully');
