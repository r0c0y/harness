const fs = require('fs');
const file = '/tmp/vfs-inspect/node_modules/@deepseek-ai/dsh-client-ui-settings-models/lib/client.js';
let code = fs.readFileSync(file, 'utf8');

code = code.replace("if (!automatic && !explicit) return null;", "return null;");
fs.writeFileSync(file, code);
