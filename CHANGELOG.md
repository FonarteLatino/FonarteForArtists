# CHANGELOG — Fonarte For Artists

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

---

## [Unreleased]

> Trabajo en progreso según el [Implementation Plan](./implementation_plan.md).
> Cubre la auditoría de Fase 0, la capa de datos de Fase 1 (vistas SQL sin escribir aún
> en Azure) y el inicio de la Fase 2 (esquema de permisos y resolución de accesos).

---

## [0.1.0] — 2026-09-15 — Fase 0 completada, Fase 1 escrita y Fase 2 iniciada

### Añadido

#### Documentación de auditoría y planificación
- **`docs/fase0_hallazgos.md`** — documento de hallazgos de la Fase 0: catálogo de las
  tablas de `fonarte2.Reporteador` usadas por Power BI, inventario explícito de columnas
  monetarias a excluir, columnas seguras (conteos), esquema inferido de `fonarte2`,
  componentes reutilizables vs. descartables, discrepancias plan↔realidad y acciones
  requeridas antes de la Fase 1.
- **`implementation_plan.md`** — plan de implementación en 7 fases: decisiones de
  arquitectura justificadas (NestJS + Prisma + Next.js sobre Azure), modelo de permisos,
  reglas de la API y checklist de seguridad previo a producción.

#### Fase 1 — Capa de datos (vistas SQL de solo lectura)
- **`sql/setup/01_create_readonly_login.sql`** — plantilla para crear el login
  `fonarte_portal_reader` y otorgarle `GRANT SELECT` **solo sobre las 7 vistas**,
  nunca sobre las tablas base. Incluye query de verificación de permisos.
- **`sql/views/01_vw_stats_catalogo_canciones.sql`** — catálogo unificado de canciones,
  álbumes (ISRC sintético = UPC) y videos que no están ya en el catálogo de canciones.
  Port de la query "Base Total" del Power BI.
- **`sql/views/02_vw_stats_catalogo_videos.sql`** — catálogo de videos en dos niveles
  (álbum de video por UPC y video individual por ISRC).
- **`sql/views/03_vw_stats_streams_por_cancion.sql`** — streams agregados por canción,
  plataforma, período y país.
- **`sql/views/04_vw_stats_streams_por_plataforma.sql`** — streams por plataforma
  (`Retailer`) y período, para las gráficas de distribución.
- **`sql/views/05_vw_stats_streams_por_pais.sql`** — streams por país, alimenta el mapa
  geográfico (excluye país nulo).
- **`sql/views/06_vw_stats_resumen_artista.sql`** — resumen de streams por artista,
  desagregado por plataforma y período, para las tarjetas KPI.
- **`sql/views/07_vw_stats_tendencia_mensual.sql`** — tendencia mes a mes para la gráfica
  de línea temporal.
- Todas las vistas usan `CREATE OR ALTER VIEW`, documentan en comentarios las columnas
  monetarias excluidas, y replican el filtro del Power BI que descarta el ISRC
  `191018096595`.

#### Fase 2 — Modelo de permisos y autenticación
- **`backend/prisma/schema.prisma`** — esquema completo de la base `fonarte_portal`
  (separada de `fonarte2`), con los modelos `Sello`, `Artista`, `EntidadCatalogo`,
  `Usuario`, `InvitacionActivacion`, `RefreshToken`, `ConcesionAcceso` y
  `AuditoriaAcceso`, más los enums `TipoContenido`, `TipoEntidadPermiso`,
  `EfectoPermiso` y `TipoEventoAuditoria`.
- **`backend/src/permissions/permissions.service.ts`** — `PermissionsService` con la
  resolución de permisos como función testeable e independiente de los endpoints:
  `resolverPermiso()` (regla "lo más específico gana": `DENY` explícito gana, si no se
  hereda el `ALLOW` más cercano, y default deny sin concesión) y
  `listarEntidadesPermitidas()` (resolución en batch filtrando denies explícitos).
- **`backend/src/permissions/permissions.service.spec.ts`** — 10 pruebas unitarias que
  cubren los 4 escenarios exigidos por el plan §5.2 (acceso completo a artista, canción
  revocada dentro de un artista accesible, acceso a un solo álbum, herencia desde el
  sello) más los casos de default deny.
- **`backend/package.json`** — proyecto NestJS 10 + Prisma 5 (conector `sqlserver`),
  `argon2` para hashing, `@nestjs/throttler` para rate limiting, Swagger, JWT/passport
  y Jest con `ts-jest`; scripts de build, test, lint y ciclo de vida de Prisma.

### Cambiado
- **`README.md`** — reescrito por completo: antes contenía una sola línea con el nombre
  del proyecto. Ahora documenta la regla de "cero datos monetarios", el estado real por
  fase, el diagrama de arquitectura, la estructura del repositorio, el stack y sus
  dependencias, el modelo de permisos con sus escenarios, el catálogo de las 7 vistas y
  sus columnas prohibidas, la guía para correr el proyecto localmente (entorno,
  aplicación de la capa de datos, migraciones, tests) y el checklist de seguridad.

### Eliminado
- **Cuatro capas de la generación anterior retiradas del control de versiones**
  (`Api2/`, `ApiRestFonarte/`, `FrontFonarteForArtists/`, `OldFrontFonarteForArtists/`),
  descartadas en la auditoría de Fase 0. Se **conservan en el disco local** para consulta
  y se recuperan desde el historial de git; añadidas a `.gitignore`. Motivos:
  `Api2` exponía datos monetarios con password en texto plano y JWT hardcodeado;
  `ApiRestFonarte` sincronizaba a un MySQL local reemplazado por las vistas;
  `FrontFonarteForArtists` era un template de Angular CLI sin funcionalidad;
  `OldFrontFonarteForArtists` mostraba ingresos en MXN (su UX queda como referencia).
- **`legacy/nodejsapi/dbconfig.js`** — dejado de trackear por contener credenciales
  **reales y en texto plano** de Azure SQL. Sigue en disco y ahora está cubierto por
  `.gitignore`; **la contraseña permanece en el historial de git y debe rotarse.**

### Movido
- **`nodejsapi/` → `legacy/nodejsapi/`** — se conserva como referencia de las queries
  originales contra `fonarte2`, fuera de la raíz para no confundirse con el backend nuevo.
- **`Pruebas/` → `legacy/Pruebas/`** — proyectos de práctica (Laravel, SQL Server,
  curso Udemy) ajenos al portal.
- **`En construccion/` → `legacy/En construccion/`** — plantilla web estática sin
  relación con el portal.
- Añadido **`legacy/README.md`** con el inventario de lo conservado, las razones de cada
  descarte, el comando para recuperar cada capa del historial de git y la advertencia
  de rotación de credenciales.

### Seguridad
- Se dejan de versionar credenciales de Azure SQL (`dbconfig.js`).
- Se documenta la rotación obligatoria del usuario `Dataguys2` como acción urgente.
- La capa de datos queda aislada a nivel de motor: el login del portal solo puede
  ejecutar `SELECT` sobre las vistas, que no exponen columnas monetarias.

### Pendiente
- Aplicar las 7 vistas en Azure y **validar los totales contra Power BI** (Fase 1, paso 5).
- Confirmar con el negocio qué plataformas están efectivamente en `fonarte2`.
- Completar `PrismaService`, `main.ts`, `tsconfig.json` y `nest-cli.json` del backend:
  hoy solo existen el esquema y el módulo de permisos.
- Generar la primera migración de Prisma (no hay ninguna en `backend/prisma/migrations/`).
- Crear el frontend Next.js (Fase 5) y el panel de administración (Fase 4).

---

## [0.0.0] — 2026-09-15 — Estado baseline del proyecto

> Esta versión documenta el **estado actual del repositorio** antes de iniciar la migración al nuevo stack definido en el implementation plan. No es una versión "publicada" formalmente; es el punto de partida auditado en la Fase 0.

### Estado general

El proyecto existe como cuatro capas independientes sin integración formal de monorepo. Hay funcionalidad básica operativa (estadísticas + mapa) en el frontend AngularJS con datos de Azure SQL Server.

---

### Componentes existentes (baseline)

#### `nodejsapi/` — API Maestra (Azure SQL Reader)
- **Tecnología:** Node.js + Express.js + `mssql` package
- **Puerto:** 8090
- **Base de datos:** Azure SQL Server `fonarte2.database.windows.net`, BD `Reporteador`
- **Endpoints disponibles:**
  - `GET /api/artistas` — Lista todos los artistas distintos de `BBDD_FINAL_CANCIONES`
  - `GET /api/discos` — Lista todos los discos (UPC, ARTIST, ALBUM_NAME)
  - `GET /api/canciones` — Lista canciones (UPC, ISRC, TRACK_NAME)
  - `GET /api/artista/:artists` — Discos de un artista específico
  - `GET /api/disco/:disco` — Canciones de un disco
  - `GET /api/upc/:upc` — Canciones por UPC
  - `GET /api/regalia/fecha/upc/isrc` — Datos completos de `000_Client_Dashboard_Total` por UPC, ISRC y período
  - `GET /api/plataforma/fecha/:fecha/upc/` — Plataformas disponibles para un período y UPC
  - `GET /api/pais/fecha/:fecha/plataforma/:plataforma/isrc/:isrc` — Países por fecha/plataforma/ISRC
  - `GET /api/resumen/pais/:pais/fecha/:fecha/plataforma/:plataforma/isrc/:isrc` — Resumen con `SUM(Net_Royalty_Total)` y `SUM(Quantity)` ⚠️ expone dato monetario
- **Problemas conocidos:**
  - Credenciales de Azure SQL en texto plano en `dbconfig.js` (`user: 'Dataguys2'`) — **riesgo de seguridad**
  - Sin autenticación en los endpoints
  - SQL dinámico con concatenación directa (riesgo de SQL injection)
  - Endpoint de resumen retorna `Net_Royalty_Total` (dato financiero)

#### `Api2/` — API de Regalías/Permisos (MySQL)
- **Tecnología:** Node.js + Express.js + MySQL (`mysql2`) + JWT (`jsonwebtoken`) + `bcryptjs`
- **Puerto:** 8091
- **Base de datos:** MySQL local `resumen_regalias`
- **Autenticación:** JWT con clave hardcodeada `'secretkey'`
- **Endpoints disponibles:**
  - `POST /api/login` — Login por usuario/contraseña (sello)
  - `GET /api/regalias/:usr` — Regalías completas del sello autenticado (incluye monto `ingresos`)
  - `GET /api/regalias/:usr/fecha/` — Regalías filtradas por período
  - `GET /api/sello/:usr` — Info del sello
  - `GET /api/artists/inicial` — Inicialización de artistas desde `nodejsapi`
  - `GET /api/regalias/actualizar` — Proceso de sincronización de regalías
  - Otros endpoints de inicialización/actualización de datos
- **Problemas conocidos:**
  - Contraseña comparada en texto plano (sin bcrypt en uso real)
  - JWT con `secretkey` literal — inseguro
  - Cálculos de regalías con factores financieros (0.62, 18.5) — no debe trasladarse al portal
  - Sin rate limiting

#### `ApiRestFonarte/` — API de Sincronización
- **Tecnología:** Node.js + Express.js + MySQL + `replaceall`
- **Puerto:** 8090
- **Rol:** Orquesta la sincronización de datos desde `nodejsapi` hacia `resumen_regalias` MySQL
- **Endpoints:**
  - `GET /api/actualizar/artistas` — Sincroniza artistas
  - `GET /api/actualizar/discos` — Sincroniza discos
  - `GET /api/actualizar/canciones` — Sincroniza canciones
  - `GET /api/actualizar/regalias` — Sincroniza regalías (incluye cálculos financieros)
  - `POST /api/altadiscos` — Asigna discos a sellos

#### `FrontFonarteForArtists/` — Frontend Angular (inacabado)
- **Tecnología:** Angular 12 + Bootstrap 5 + TypeScript
- **Estado:** Template de Angular CLI sin funcionalidad real implementada; componente `usuario` vacío
- **No funcional** — no tiene integración con ninguna API

#### `OldFrontFonarteForArtists/` — Frontend AngularJS (funcional)
- **Tecnología:** AngularJS 1.x + Bootstrap 5 + jVectorMap + Chart.js
- **Estado:** Funcional con datos reales
- **Funcionalidad implementada:**
  - Login por usuario/contraseña (sello)
  - Dashboard de estadísticas por períodos: 1 mes, 3 meses, 6 meses, todo
  - Gráfica de pie de ingresos por plataforma
  - Top plataformas con escuchas e **ingresos estimados en MXN** ⚠️
  - Gráfica de línea de tendencia temporal
  - Top canciones con escuchas e **ingresos** ⚠️
  - Mapa geográfico mundial (jVectorMap) con distribución por país
  - Visualización por álbum y por canción individual
- **Problemas conocidos:**
  - Muestra datos financieros (`iTotal`, `ingresos`) — **no debe trasladarse al nuevo portal**
  - Dependencia de `Api2` que requiere MySQL local corriendo

---

### Esquema de base de datos MySQL local (`resumen_regalias`)

```
sello        (id, nombre, rol, usr, psw)            ← autenticación básica
artista      (id, sello_id, nombre)                 ← jerarquía sello→artista
disco        (UPC, artista_id, nombre)              ← álbum
cancion      (ISRC, disco_UPC, nombre)              ← track
regalias     (id, cancion_id, plataforma, clics,    ← datos de consumo + monetarios
              ingresos, anio, mes, pais)
sello_disco  (id_sello, disco_UPC)                  ← relación sello-álbum
```

### Tablas Azure SQL `fonarte2.Reporteador` identificadas

```
BBDD_FINAL_CANCIONES  — catálogo de canciones/álbumes
BBDD_FINAL_VIDEOS     — catálogo de videos
APPLEMUSIC            — streams Apple Music (incluye columnas monetarias)
APPLE_CURRENCY        — tipos de cambio
ITUNES                — ventas iTunes (incluye columnas monetarias)
ORCHARD               — streams Orchard (incluye columnas monetarias)
000_Client_Dashboard_Total — tabla/vista agregada multi-plataforma
```

---

### Deuda técnica y problemas de seguridad registrados en baseline

| Severidad | Problema | Archivo |
|---|---|---|
| 🔴 CRÍTICO | Credenciales Azure SQL en texto plano en el repo | `nodejsapi/dbconfig.js` |
| 🔴 CRÍTICO | JWT con secret `'secretkey'` hardcodeado | `Api2/app.js:51` |
| 🔴 CRÍTICO | Contraseña comparada en texto plano (sin hash) | `Api2/app.js:47` |
| 🟠 ALTO | SQL dinámico por concatenación (riesgo SQL injection) | `nodejsapi/dboperations.js` |
| 🟠 ALTO | Endpoint expone `Net_Royalty_Total` (dato monetario) | `nodejsapi/app.js:140` |
| 🟠 ALTO | Frontend muestra ingresos en MXN al usuario | `OldFront/views/stats.html:32-41` |
| 🟡 MEDIO | Sin rate limiting en endpoints de autenticación | `Api2/app.js` |
| 🟡 MEDIO | Sin HTTPS/TLS configurado explícitamente | Toda la capa backend |
| 🟡 MEDIO | `FrontFonarteForArtists/` vacío pero con dependencias desactualizadas | `package.json` |
| 🔵 INFO | Cuatro proyectos independientes sin monorepo formal | Estructura raíz |
| 🔵 INFO | Sin tests unitarios en ninguna capa | — |
| 🔵 INFO | Sin CI/CD configurado | — |

---

### Referencias

- [README del proyecto](./README.md)
- [Documento de Hallazgos Fase 0](./docs/fase0_hallazgos.md)
- [Implementation Plan](./implementation_plan.md)
- [Código anterior conservado como referencia](./legacy/README.md)
- [Querys originales Power BI](./Querys%20originales%20power%20Bi)

[Unreleased]: https://github.com/FonarteLatino/FonarteForArtists/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/FonarteLatino/FonarteForArtists/compare/v0.0.0...v0.1.0
[0.0.0]: https://github.com/FonarteLatino/FonarteForArtists/releases/tag/v0.0.0
