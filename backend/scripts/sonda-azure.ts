/**
 * Sonda de solo lectura contra Azure SQL.
 *
 * Comprueba conexión, permisos reales y qué objetos de la Fase 1 existen.
 * NO crea, modifica ni elimina nada: solo consulta catálogos del sistema.
 *
 * Uso: npx ts-node scripts/sonda-azure.ts
 */

import * as sql from 'mssql';

function conexion(database: string): string {
  const server = process.env.AZURE_SERVER || 'fonarte2.database.windows.net';
  const user = process.env.AZURE_USER || '';
  const password = process.env.AZURE_PASSWORD || '';
  return `Server=${server},1433;Database=${database};User Id=${user};Password=${password};Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;`;
}

async function probar(database: string) {
  console.log(`\n=== Base: ${database} ===`);
  const pool = new sql.ConnectionPool(conexion(database));

  try {
    await pool.connect();
    console.log('✓ Conexión establecida');
  } catch (e: any) {
    console.log(`✗ No se pudo conectar: ${e.message}`);
    return null;
  }

  try {
    // 1. Identidad y permisos a nivel servidor
    const who = await pool.request().query<{
      login: string;
      usuario: string;
      sysadmin: number;
      dbowner: number;
      creador: number;
    }>(`
      SELECT
        SUSER_SNAME() AS login,
        USER_NAME()   AS usuario,
        IS_SRVROLEMEMBER('sysadmin') AS sysadmin,
        IS_ROLEMEMBER('db_owner')    AS dbowner,
        IS_ROLEMEMBER('db_ddladmin') AS creador
    `);
    const w = who.recordset[0];
    console.log(`  login: ${w.login} | usuario en la base: ${w.usuario}`);
    console.log(`  sysadmin: ${w.sysadmin} | db_owner: ${w.dbowner} | db_ddladmin: ${w.creador}`);

    // 2. Bases de datos visibles
    const dbs = await pool.request().query<{ name: string }>(
      `SELECT name FROM sys.databases ORDER BY name`,
    );
    console.log(`  bases visibles: ${dbs.recordset.map((d) => d.name).join(', ')}`);

    // 3. Vistas de la Fase 1
    const vistas = await pool.request().query<{ name: string }>(`
      SELECT name FROM sys.views WHERE name LIKE 'vw_stats%' ORDER BY name
    `);
    const nombres = vistas.recordset.map((v) => v.name);
    console.log(`  vistas vw_stats_* encontradas: ${nombres.length}`);
    for (const n of nombres) console.log(`    · ${n}`);

    // 4. ¿Existen las tablas base que usan las vistas?
    const tablas = await pool.request().query<{ name: string }>(`
      SELECT name FROM sys.tables
      WHERE name IN ('BBDD_FINAL_CANCIONES','BBDD_FINAL_VIDEOS','APPLEMUSIC','ITUNES','ORCHARD','000_Client_Dashboard_Total','APPLE_CURRENCY')
      ORDER BY name
    `);
    console.log(`  tablas base encontradas: ${tablas.recordset.map((t) => t.name).join(', ') || 'ninguna'}`);

    // 5. Volumen de datos (solo conteos, sin leer columnas monetarias)
    for (const tabla of ['BBDD_FINAL_CANCIONES', '000_Client_Dashboard_Total']) {
      try {
        const c = await pool
          .request()
          .query<{ n: number }>(`SELECT COUNT_BIG(*) AS n FROM [dbo].[${tabla}]`);
        console.log(`  filas en ${tabla}: ${Number(c.recordset[0].n).toLocaleString('es-MX')}`);
      } catch (e: any) {
        console.log(`  no se pudo contar ${tabla}: ${e.message.split('\n')[0]}`);
      }
    }

    return pool;
  } catch (e: any) {
    console.log(`  error consultando metadatos: ${e.message}`);
    return pool;
  }
}

async function main() {
  if (!process.env.AZURE_USER || !process.env.AZURE_PASSWORD) {
    console.error('Faltan AZURE_USER / AZURE_PASSWORD en el entorno.');
    process.exit(1);
  }

  const master = await probar('master');
  if (master) {
    // ¿Existe ya fonarte_portal?
    try {
      const existe = await master
        .request()
        .query<{ n: number }>(`SELECT COUNT(*) AS n FROM sys.databases WHERE name = 'fonarte_portal'`);
      const hay = Number(existe.recordset[0].n) > 0;
      console.log(`\n¿Existe la base fonarte_portal?: ${hay ? 'SÍ' : 'NO'}`);
    } catch (e: any) {
      console.log(`No se pudo comprobar fonarte_portal: ${e.message}`);
    }
    await master.close();
  }

  const rep = await probar('Reporteador');
  if (rep) await rep.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
