# `legacy/` — Código anterior conservado como referencia

Este directorio agrupa piezas del repositorio que **no forman parte del portal nuevo**
Fonarte For Artists (NestJS + Next.js sobre Azure). No son dependencias de `backend/` ni
de `sql/`, no deben desplegarse, y ningún componente nuevo debe importarlas.

Se conservan **únicamente** como material de consulta histórica:

- para reutilizar las queries SQL que ya están probadas contra `fonarte2`,
- para copiar decisiones de UX del dashboard anterior,
- para entender de dónde viene el modelo de datos `sello → artista → disco → canción`.

> Contexto completo del proyecto y estado actual: [`../README.md`](../README.md)
> Auditoría que justifica qué se descarta y por qué: [`../docs/fase0_hallazgos.md`](../docs/fase0_hallazgos.md)

---

## Inventario

| Ruta | Qué es | Por qué está aquí |
|---|---|---|
| `nodejsapi/` | API Node.js + Express + `mssql` (puerto 8090) que leía directo de Azure SQL `fonarte2.Reporteador` | Es la **referencia viva** de los `SELECT` originales contra `fonarte2`. Se portaron a las vistas de `sql/views/` |
| `Pruebas/` | Proyectos de práctica ajenos al portal (Laravel, SQL Server, curso Udemy) | Nunca perteneció al producto; se saca de la raíz para no ensuciar el repo |
| `En construccion/` | Sitio web estático (plantilla Nicepage) | Prototipo de marketing sin relación con el portal |

### Código anterior retirado del control de versiones

Las cuatro capas de la generación anterior **ya no se trackean en git** (están en
`.gitignore`), pero siguen en disco en tu copia local por si quieres consultarlas:

| Ruta local | Qué era | Destino según Fase 0 |
|---|---|---|
| `../Api2/` | API de regalías/permisos (Express + MySQL + JWT) | ❌ Descartada — exponía datos monetarios, password en texto plano, JWT con `'secretkey'` |
| `../ApiRestFonarte/` | API de sincronización hacia MySQL `resumen_regalias` | ❌ Descartada — reemplazada por la capa de vistas sobre `fonarte2` |
| `../FrontFonarteForArtists/` | Frontend Angular 12 | ❌ Descartada — template de Angular CLI sin funcionalidad real |
| `../OldFrontFonarteForArtists/` | Frontend AngularJS 1.x + jVectorMap + Chart.js (**sí funcionaba**) | ⚠️ Descartada como producto, **valor como referencia de UX** (filtros por período, gráfica pie, top plataformas, mapa) |

---

## Cómo recuperar cualquiera de estas capas

Todo el código sigue en el historial de git. Como se movió/eliminó en el commit de
reestructura del 2026-09-15 sobre la rama `develop`, se recupera así:

```bash
# Ver el commit donde se retiraron las capas
git log --oneline --all -- Api2 | head

# Restaurar una capa completa desde el commit anterior a la limpieza
git checkout <commit>~1 -- Api2

# O restaurar todo el estado anterior a la reestructura
git checkout <commit>~1 -- Api2 ApiRestFonarte FrontFonarteForArtists OldFrontFonarteForArtists
```

También puedes explorarlas sin restaurarlas:

```bash
git show <commit>~1:Api2/app.js
git log --follow -- legacy/nodejsapi/dboperations.js
```

---

## ⚠️ Advertencia de seguridad

`legacy/nodejsapi/dbconfig.js` contenía credenciales **reales y en texto plano** de
Azure SQL (`fonarte2.database.windows.net`). Ese archivo **ya no se trackea** (está en
`.gitignore`), pero la contraseña **sigue existiendo en el historial de git** y por lo
tanto debe considerarse comprometida.

Acciones obligatorias (ver [`../docs/fase0_hallazgos.md`](../docs/fase0_hallazgos.md) §6):

1. **Rotar la contraseña** del usuario `Dataguys2` en Azure SQL.
2. No volver a commitear `dbconfig.js` — usa variables de entorno o Azure Key Vault.
3. Usar para el portal el login de solo lectura `fonarte_portal_reader`
   definido en [`../sql/setup/01_create_readonly_login.sql`](../sql/setup/01_create_readonly_login.sql).

**Ningún módulo nuevo del backend debe leer de `legacy/`.** Las vistas versionadas en
`sql/views/` son la única fuente de datos permitida para el portal.
