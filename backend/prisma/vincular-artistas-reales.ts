/**
 * Vincula el catálogo del portal con los artistas REALES de fonarte2.
 *
 * Por qué existe este script:
 * El portal filtra las estadísticas cruzando el nombre del artista
 * (`artistas.nombre` en fonarte_portal) contra la columna `ARTIST` de las vistas
 * de fonarte2. Por eso un artista inventado por el seed no muestra nada: hay que
 * usar los nombres exactos que existen en la fuente.
 *
 * Este script:
 *  1. Lee los artistas realmente presentes en fonarte2 (vw_stats_catalogo_canciones).
 *  2. Da de alta en fonarte_portal los sellos y artistas que falten.
 *  3. Importa sus canciones/álbumes/videos al catálogo (entidad_catalogo),
 *     guardando solo la referencia ISRC/UPC — nunca datos de streaming ni montos.
 *
 * Es idempotente: puede ejecutarse varias veces sin duplicar registros.
 *
 * Uso:
 *   npx ts-node prisma/vincular-artistas-reales.ts
 *   npx ts-node prisma/vincular-artistas-reales.ts --limite 5
 */

import { PrismaClient } from '@prisma/client';
import * as sql from 'mssql';

const prisma = new PrismaClient();

/** Lee el límite de artistas a importar desde `--limite N` (por defecto 5). */
function leerLimite(): number {
  const idx = process.argv.indexOf('--limite');
  const valor = idx >= 0 ? Number(process.argv[idx + 1]) : 5;
  return Number.isInteger(valor) && valor > 0 ? valor : 5;
}

interface FilaCatalogo {
  ARTIST: string | null;
  SELLO: string | null;
  ISRC: string | null;
  UPC: string | null;
  ALBUM_NAME: string | null;
  TRACK_NAME: string | null;
  TIPO_CONTENIDO: string | null;
}

async function main() {
  const limite = leerLimite();

  const connectionString = process.env.DATABASE_URL_FONARTE2_READONLY;
  if (!connectionString) {
    console.error(
      'Falta DATABASE_URL_FONARTE2_READONLY en el entorno. Configúrala en backend/.env antes de ejecutar este script.',
    );
    process.exit(1);
  }

  console.log('--- Vinculando artistas reales de fonarte2 ---');
  console.log(`Conectando a fonarte2 (solo lectura)...`);

  const pool = new sql.ConnectionPool(connectionString);
  await pool.connect();
  console.log('✓ Conexión establecida');

  // 1. Artistas con más catálogo primero, para que el límite tome los más útiles
  const artistasRes = await pool.request().query<{ ARTIST: string; SELLO: string | null; total: number }>(`
    SELECT TOP ${limite}
      [ARTIST],
      MAX([SELLO]) AS [SELLO],
      COUNT(*) AS [total]
    FROM [dbo].[vw_stats_catalogo_canciones]
    WHERE [ARTIST] IS NOT NULL AND LTRIM(RTRIM([ARTIST])) <> ''
    GROUP BY [ARTIST]
    ORDER BY COUNT(*) DESC
  `);

  const artistas = artistasRes.recordset;
  if (artistas.length === 0) {
    console.warn(
      '⚠️  La vista vw_stats_catalogo_canciones no devolvió artistas. ¿Está creada la vista de la Fase 1 y tiene datos?',
    );
    await pool.close();
    return;
  }

  console.log(`Se importarán ${artistas.length} artista(s):`);
  for (const a of artistas) {
    console.log(`  · ${a.ARTIST} — ${a.total} elemento(s) de catálogo`);
  }

  let sellosCreados = 0;
  let artistasCreados = 0;
  let itemsCreados = 0;
  let itemsOmitidos = 0;

  for (const fila of artistas) {
    const nombreArtista = (fila.ARTIST || '').trim();
    const nombreSello = (fila.SELLO || 'Fonarte Latino').trim();

    if (!nombreArtista) continue;

    // 2. Sello (upsert por nombre)
    let sello = await prisma.sello.findFirst({ where: { nombre: nombreSello } });
    if (!sello) {
      sello = await prisma.sello.create({ data: { nombre: nombreSello } });
      sellosCreados++;
      console.log(`  + Sello creado: ${nombreSello}`);
    }

    // 3. Artista (upsert por nombre + sello)
    let artista = await prisma.artista.findFirst({
      where: { nombre: nombreArtista, selloId: sello.id },
    });
    if (!artista) {
      artista = await prisma.artista.create({
        data: { nombre: nombreArtista, selloId: sello.id },
      });
      artistasCreados++;
      console.log(`  + Artista creado: ${nombreArtista} (sello ${nombreSello})`);
    } else {
      console.log(`  = Artista ya existía: ${nombreArtista}`);
    }

    // 4. Catálogo de ese artista
    const catalogoRes = await pool
      .request()
      .input('artistaNombre', sql.NVarChar(500), nombreArtista)
      .query<FilaCatalogo>(`
        SELECT [ARTIST], [SELLO], [ISRC], [UPC], [ALBUM_NAME], [TRACK_NAME], [TIPO_CONTENIDO]
        FROM [dbo].[vw_stats_catalogo_canciones]
        WHERE [ARTIST] = @artistaNombre
      `);

    // Deduplicar por tipo + referencia antes de insertar
    const vistos = new Set<string>();
    for (const item of catalogoRes.recordset) {
      const referencia = (item.ISRC || item.UPC || '').trim();
      if (!referencia) continue;

      // Los videos se marcan como VIDEO; el resto, según el catálogo
      const tipo: 'ALBUM' | 'CANCION' | 'VIDEO' =
        item.TIPO_CONTENIDO === 'VIDEO'
          ? 'VIDEO'
          : item.TRACK_NAME
            ? 'CANCION'
            : 'ALBUM';

      const clave = `${tipo}:${referencia}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);

      const nombre = (item.TRACK_NAME || item.ALBUM_NAME || referencia).trim();

      const existente = await prisma.entidadCatalogo.findFirst({
        where: { artistaId: artista.id, tipo, referenciaIdFonarte2: referencia },
      });

      if (existente) {
        itemsOmitidos++;
        continue;
      }

      await prisma.entidadCatalogo.create({
        data: {
          artistaId: artista.id,
          tipo,
          referenciaIdFonarte2: referencia,
          nombre,
        },
      });
      itemsCreados++;
    }
  }

  await pool.close();

  console.log('\n--- Resumen ---');
  console.log(`Sellos creados:    ${sellosCreados}`);
  console.log(`Artistas creados:  ${artistasCreados}`);
  console.log(`Ítems de catálogo: ${itemsCreados} creados, ${itemsOmitidos} ya existían`);
  console.log(
    '\nNota: solo se guardaron referencias ISRC/UPC. No se copiaron datos de streaming ni montos.',
  );
  console.log(
    'Siguiente paso: abre /admin/permisos y otorga acceso al artista para que su cuenta vea estadísticas.',
  );
}

main()
  .catch((e) => {
    console.error('Error vinculando artistas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
