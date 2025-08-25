// Import the built entry to ensure it loads without throwing
import('file://'+process.cwd().replace(/\\/g,'/')+'/dist/index.js')
  .then(()=>{ console.log('OK'); })
  .catch((e)=>{ console.error(e); process.exit(1); });
