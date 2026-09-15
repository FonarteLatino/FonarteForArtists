// Verificación de compilación con el compilador real de Next (SWC).
// El sandbox bloquea los workers de `next build`, así que se transforma
// cada archivo con el mismo motor que usa Next para validar sintaxis/TSX.
const fs = require('fs');
const path = require('path');
const swc = require('next/dist/build/swc');

const archivos = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/login/page.tsx',
  'src/app/invitacion/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/sellos/page.tsx',
  'src/app/admin/artistas/page.tsx',
  'src/app/admin/usuarios/page.tsx',
  'src/app/admin/permisos/page.tsx',
  'src/app/admin/auditoria/page.tsx',
  'src/components/AdminNavbar.tsx',
  'src/components/AdminSidebar.tsx',
  'src/components/ConfirmModal.tsx',
  'src/lib/api.ts',
];

(async () => {
  let fallos = 0;
  for (const rel of archivos) {
    const abs = path.resolve(rel);
    if (!fs.existsSync(abs)) {
      console.log('FALTA  ' + rel);
      fallos++;
      continue;
    }
    try {
      await swc.transform(fs.readFileSync(abs, 'utf8'), {
        filename: abs,
        jsc: {
          parser: { syntax: 'typescript', tsx: rel.endsWith('.tsx') },
          target: 'es2017',
        },
        isModule: true,
      });
      console.log('OK     ' + rel);
    } catch (e) {
      fallos++;
      console.log('FALLO  ' + rel + '  ::  ' + e.message.split('\n')[0]);
    }
  }
  console.log('\n' + (archivos.length - fallos) + '/' + archivos.length + ' archivos compilan');
  process.exit(fallos ? 1 : 0);
})();
