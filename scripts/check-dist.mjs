import { accessSync } from 'node:fs';
accessSync('dist/index.js');
console.log('OK');
