// Simple build artifact check to avoid shell quoting issues on Windows PowerShell
const fs = require('fs');
fs.accessSync('dist/index.js');
console.log('OK');
