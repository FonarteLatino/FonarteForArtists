# CHANGELOG — Fonarte For Artists

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

---

## [Unreleased]

> Trabajo en progreso según el [Implementation Plan](./implementation_plan.md).
> Siguiente hito: **Fase 5 — Portal del Artista** (resumen de streams, desglose por
> álbum/canción/video, tendencia, plataformas y mapa geográfico).

---

## [0.4.0] — 2026-09-15 — Fase 4 completada (Panel de Administración)

Implementación completa de la **Fase 4** del [Implementation Plan](./implementation_plan.md):
el panel de administración en Next.js 14 (App Router) que cubre los 5 puntos de la sección 7
del plan. Incluye la corrección de una vulnerabilidad de control de acceso por rol que
permitía a cualquier usuario autenticado renderizar el panel.

### Añadido

#### Panel de administración (`frontend/`)
- **`frontend/src/app/admin/sellos/page.tsx`** — alta y baja de sellos (punto 1 del plan):
  listado con conteo de artistas, alta con validación y eliminación protegida por
  confirmación. El backend rechaza borrar un sello con artistas asignados y la UI muestra
  ese mensaje tal cual.
- **`frontend/src/app/admin/artistas/page.tsx`** — alta de artistas por sello y registro de
  su catálogo (punto 1 del plan): listado expandible por artista, alta con selector de
  sello, y registro de elementos de catálogo por **ISRC/UPC** indicando tipo
  (álbum/canción/video), con la aclaración de que solo se guarda la referencia y no se
  duplican datos de streaming ni montos.
- **`frontend/src/app/admin/usuarios/page.tsx`** — provisión de cuentas (punto 2 del plan):
  tabla de usuarios con rol, artista/sello asignado, estado y **estado de invitación
  derivado en 4 variantes** (sin invitación / pendiente con fecha de expiración / activada /
  expirada); formulario de provisión que distingue cuenta de Artista o Administrador;
  generación del **enlace de invitación de un solo uso** copiable al portapapeles; búsqueda
  por correo; y activación/desactivación de cuentas siempre mediante confirmación.
- **`frontend/src/app/admin/permisos/page.tsx`** — asignación de accesos (punto 3 del plan):
  selector de cuenta de artista, botón único para otorgar o revocar **todo el catálogo**
  (nivel artista), y catálogo agrupado por tipo (álbumes / canciones / videos) expandible
  para conceder o revocar **de forma individual** cada elemento. Distingue visualmente el
  permiso explícito (`ALLOW`/`DENY`) del **heredado** del artista o del sello, y muestra el
  nivel del que hereda cada elemento. Incluye historial de concesiones con quién otorgó cada
  acceso, cuándo y si sigue vigente o fue revocada.
- **`frontend/src/app/admin/auditoria/page.tsx`** — vista de auditoría (punto 4 del plan):
  KPIs de 24 h (logins exitosos, **logins fallidos destacados en rojo**, permisos
  modificados, usuarios activos), tabla de eventos con badges por tipo de evento resueltos
  por valor exacto, filtros por evento y rango de fechas aplicados en el servidor, búsqueda
  de texto en la página actual, paginación y aviso de que el registro es inmutable.
- **`frontend/src/app/invitacion/page.tsx`** — activación de cuenta (Fase 2 §5.3, extremo
  del flujo de provisión): el artista define su propia contraseña mediante un enlace de un
  solo uso. Valida los requisitos en vivo (longitud, letra, número, coincidencia) y maneja
  explícitamente el caso de enlace expirado o ya utilizado.
- **`frontend/src/components/ConfirmModal.tsx`** — modal de confirmación reutilizable
  (punto 5 del plan): usado obligatoriamente antes de revocaciones masivas, desactivación
  de cuentas y eliminación de sellos. Cierra con Escape o clic fuera y bloquea el cierre
  mientras la operación está en curso.
- **`frontend/verificar-compilacion.cjs`** — compila cada página y componente con SWC (el
  motor real de Next.js) para verificar sintaxis y TSX sin depender de `next build`, cuyos
  workers fallan en entornos con sandbox de archivos.

#### Otros
- **`.env.example` del backend** y configuración de Next.js/Tailwind del frontend, si no
  existían previamente.

### Corregido

- **🔴 Vulnerabilidad de control de acceso en `frontend/src/app/admin/layout.tsx`** — la
  ruta protegida por rol autorizaba explícitamente a los usuarios **no** administradores
  (la rama `else` hacía `setAuthorized(true)`). Cualquier usuario autenticado, incluida una
  cuenta de artista, podía renderizar el panel completo. Ahora la autorización se resuelve
  contra el backend vía `GET /auth/me`, con tres estados (verificando / autorizado /
  denegado); un usuario sin rol admin recibe una pantalla de "Acceso restringido" y nunca
  el panel. La verificación autoritativa es del servidor: la caché en `localStorage` solo
  evita el parpadeo del spinner.
- **`frontend/src/app/login/page.tsx`** — redirigía a `/admin` a **cualquier** usuario
  autenticado, incluidos los artistas, sin comprobar el rol. Ahora solo los
  administradores van al panel; una cuenta de artista recibe un mensaje claro de que el
  portal de artistas aún no está disponible, y se limpian sus tokens localmente.
- **`frontend/src/app/page.tsx`** — misma corrección: la redirección raíz ya no envía a
  `/admin` a las cuentas sin rol de administrador.

### Cambiado

- **`README.md`** — actualizado al estado real del proyecto: la tabla de fases refleja las
  fases 2, 3 y 4 completadas; se añadió una sección del **panel de administración** con sus
  rutas; la estructura del repositorio ahora incluye `frontend/`, la migración de Prisma y
  el seed; la tabla de stack pasa de "pendiente" a "implementado" en backend, autenticación
  y rate limiting; y se documenta cómo correr el frontend, la variable
  `NEXT_PUBLIC_API_URL` y la verificación de compilación vía SWC.
- **`.gitignore`** — se ignora `.npm-cache/` (caché local de npm de ~246 MB usado cuando el
  caché global no es escribible).

### Verificación

- `npm test -- --runInBand` en `backend/`: **27 pruebas en 5 suites, todas pasando**
  (permisos, auth, stats, admin, auditoría). Requiere `--runInBand` porque los workers de
  Jest fallan con `EPERM` bajo sandbox de archivos.
- `tsc --noEmit` en `backend/` y en `frontend/`: **sin errores de tipos**.
- `node verificar-compilacion.cjs` en `frontend/`: **15/15 archivos compilan** con SWC.
- **Limitación conocida:** `next build` completo no pudo ejecutarse en el entorno de
  desarrollo usado porque Next levanta workers con stdio por pipe, bloqueado por el sandbox
  (`spawn EPERM`). La verificación se hizo por tipos (tsc) y compilación real (SWC) de todos
  los archivos; el build completo queda pendiente de correr en un entorno sin sandbox.

### Pendiente

- **Fase 5** — el portal del artista (pantallas de estadísticas, gráficas y mapa). Es lo
  único que falta del producto central; hoy `frontend/` contiene solo el panel de
  administración.
- **Fase 1** — aplicar las 7 vistas en Azure y validar los totales contra Power BI.
- **Fase 6** — despliegue en Azure, `fonarte_portal`, Key Vault y CI/CD.
- Confirmar con el negocio qué plataformas están efectivamente en `fonarte2`.

---

## [0.3.0] — 2026-09-15 — Fase 3 completada (API Backend NestJS)

Implementación completa de la **Fase 3** del [Implementation Plan](./implementation_plan.md): endpoints de estadísticas de solo lectura contra las 7 vistas SQL de la Fase 1, motor de base de datos de solo lectura para `fonarte2`, defensa en profundidad sin exposición de columnas monetarias, módulo de administración completa (Sellos, Artistas, Catálogo, Usuarios, Concesiones de Acceso), módulo de auditoría de seguridad y rate limiting global con Throttler.

### Añadido

#### Módulo de Estadísticas (`StatsModule`)
- **`backend/src/stats/fonarte2.service.ts`** — servicio de conexión a la base `fonarte2` (`Reporteador` en Azure SQL) en modo estricto de solo lectura mediante `mssql` Connection Pool. Valida que únicamente se ejecuten consultas `SELECT` y soporta modo desacoplado para desarrollo local.
- **`backend/src/stats/dto/stats-responses.dto.ts`** — contratos y DTOs de salida fuertemente tipados con **defensa en profundidad**: ninguna propiedad financiera (regalías, montos, pagos) existe en los DTOs, exponiendo únicamente métricas de streams, conteos y metadatos de catálogo.
- **`backend/src/stats/dto/stats-filtro.dto.ts`** — DTO con validación de parámetros de consulta (`periodoInicio`, `periodoFin`, `plataforma`, `pais`) en formato estándar `YYYY-MM`.
- **`backend/src/stats/stats.service.ts`** — lógica de negocio de estadísticas:
  - `getKpi()`: resumen para tarjetas KPI (streams totales, streams periodo actual, plataformas activas, top plataforma).
  - `getStreamsPorCancion()`: streams por canción (ISRC), plataforma, país y período, con ordenamiento por volumen y **filtrado automático de cualquier ISRC con DENY explícito para el usuario**.
  - `getStreamsPorPlataforma()`: distribución por plataforma (`Retailer`) con cálculo de porcentajes.
  - `getStreamsPorPais()`: métricas geográficas para el mapa de audiencia.
  - `getTendenciaMensual()`: serie de tiempo mensual de reproducciones agrupada cronológicamente.
  - `getCatalogo()`: consulta de entidades del artista en el portal.
- **`backend/src/stats/stats.controller.ts`** — endpoints REST protegidos en cada ruta por `JwtAuthGuard`, `PermissionsGuard` y `@RequireAccess(TipoEntidadPermiso.ARTISTA, 'artistaId')`:
  - `GET /stats/kpi/:artistaId`
  - `GET /stats/canciones/:artistaId`
  - `GET /stats/plataformas/:artistaId`
  - `GET /stats/paises/:artistaId`
  - `GET /stats/tendencia/:artistaId`
  - `GET /stats/catalogo/:artistaId`
- **`backend/src/stats/stats.module.ts`** — configuración y exportación de servicios y controladores de estadísticas.

#### Módulo de Administración (`AdminModule`)
- **`backend/src/admin/dto/admin.dtos.ts`** — DTOs con validación estricta (`CreateSelloDto`, `CreateArtistaDto`, `CreateCatalogoItemDto`, `CreateConcesionDto`, `UpdateUsuarioStatusDto`).
- **`backend/src/admin/admin.service.ts`** — servicio integral de gestión administrativa con trazabilidad inmutable:
  - **Sellos**: creación, consulta y eliminación con validación de integridad referencial (no permite borrar sellos con artistas vinculados).
  - **Artistas**: alta y consulta de artistas vinculados a sellos.
  - **Catálogo**: registro y sincronización de canciones, álbumes y videos (ISRC / UPC).
  - **Usuarios**: listado de usuarios con artista asignado y estado de invitación, y activación/desactivación de cuentas con registro `CUENTA_DESACTIVADA`.
  - **Concesiones de Acceso**: otorgamiento de permisos `ALLOW` o `DENY` con revocación automática de concesiones previas redundantes, y revocación explícita registrando `PERMISO_REVOCADO`.
- **`backend/src/admin/admin.controller.ts`** — endpoints REST protegidos por `JwtAuthGuard`, `RolesGuard` y `@RequireAdmin()`.
- **`backend/src/admin/admin.module.ts`** — empaquetado del módulo de administración.

#### Módulo de Auditoría (`AuditModule`)
- **`backend/src/audit/dto/audit-query.dto.ts`** — parámetros de consulta paginada con filtros por usuario, tipo de evento y rango de fechas (`desde`/`hasta`).
- **`backend/src/audit/audit.service.ts`** — consulta paginada de la tabla `auditoria_accesos` y cálculo de métricas de seguridad en ventana deslizante de 24 horas (logins exitosos, logins fallidos, cambios de permisos, usuarios activos).
- **`backend/src/audit/audit.controller.ts`** — endpoints `GET /audit/logs` y `GET /audit/stats` restringidos exclusivamente a administradores.
- **`backend/src/audit/audit.module.ts`** — módulo de auditoría.

#### Seguridad y Rate Limiting
- **Throttler Global**: Integración de `@nestjs/throttler` en `AppModule` con límite de 100 peticiones por minuto por IP y `ThrottlerGuard` registrado globalmente vía `APP_GUARD`.

### Verificación y Pruebas
- **Pruebas unitarias añadidas en Fase 3**:
  - `backend/src/stats/stats.service.spec.ts` (3 pruebas) — verificación estricta de ausencia de campos financieros, cálculo de KPIs y filtrado de exclusiones DENY.
  - `backend/src/admin/admin.service.spec.ts` (4 pruebas) — integridad referencial en sellos, revocación y otorgamiento de permisos con auditoría.
  - `backend/src/audit/audit.service.spec.ts` (2 pruebas) — paginación de logs y métricas de seguridad de 24 horas.
- **Suite completa Jest**: **5/5 suites pasadas, 27/27 pruebas aprobadas (100%)**.
- **Compilación NestJS**: `nest build` ejecutado exitosamente sin advertencias ni errores.

---

## [0.2.0] — 2026-09-15 — Fase 2 completada (Modelo de Permisos, Autenticación y Provisión)

Implementación completa de la **Fase 2** del [Implementation Plan](./implementation_plan.md): esquema de base de datos para `fonarte_portal` (Azure SQL), motor de resolución de permisos jerárquicos y granulares ("lo más específico gana"), flujo de provisión administrativa de cuentas sin autoregistro vía invitaciones de un solo uso, autenticación con Argon2id + JWT con rotación de refresh tokens, registro inmutable de auditoría de accesos y suite de pruebas unitarias al 100%.

### Añadido

#### Esquema de Base de Datos y Migraciones (`fonarte_portal`)
- **`sql/migrations/01_create_fonarte_portal_schema.sql`** — script DDL idempotente para Azure SQL Database (`fonarte_portal`, base separada de `fonarte2`). Crea las tablas: `sellos`, `artistas`, `entidades_catalogo`, `usuarios`, `invitaciones_activacion`, `refresh_tokens`, `concesiones_acceso` y `auditoria_accesos`, con índices optimizados y constraints de integridad referencial sin ciclos.
- **`backend/prisma/schema.prisma`** — modelo Prisma adaptado al conector `sqlserver` (sin enums nativos no soportados en Azure SQL, claves referenciales con `onDelete: NoAction` para evitar cascadas cíclicas).
- **`backend/prisma/migrations/20260915000000_init_fonarte_portal/migration.sql`** — migración inicial versionada para despliegue automatizado con `prisma migrate deploy`.
- **`backend/prisma/seed.ts`** — script de inicialización que provisiona el sello base ("Fonarte Latino"), artista demo y cuenta administradora inicial con contraseña segura hasheada en Argon2id y evento en auditoría.

#### Motor de Permisos Granulares y Jerárquicos (§5.2)
- **`backend/src/permissions/permissions.types.ts`** — tipos e interfaces del motor: `TipoEntidadPermiso` (`SELLO`, `ARTISTA`, `ALBUM`, `CANCION`, `VIDEO`), `EfectoPermiso` (`ALLOW`, `DENY`), `SolicitudPermiso` y `ResultadoPermiso`.
- **`backend/src/permissions/permissions.service.ts`** — motor de resolución desacoplado de los endpoints. Implementa la regla "lo más específico gana":
  1. `DENY` explícito al nivel exacto niega el acceso inmediatamente.
  2. `ALLOW` explícito al nivel exacto concede el acceso.
  3. Sin concesión exacta, busca y hereda el `ALLOW` más cercano en la jerarquía superior (`ARTISTA` → `SELLO`).
  4. Sin ninguna concesión en la jerarquía, deniega por defecto (*default deny*).
  5. Soporta resolución masiva (`listarEntidadesPermitidas`).
- **`backend/src/permissions/permissions.decorator.ts`** — decorador `@RequireAccess(tipoEntidad, paramKey)` para declarar requisitos de autorización en controladores.
- **`backend/src/permissions/permissions.guard.ts`** — `PermissionsGuard` de NestJS que intercepta solicitudes, omite administradores, resuelve la jerarquía en base de datos y autoriza/deniega arrojando `ForbiddenException`.
- **`backend/src/permissions/permissions.module.ts`** — módulo de permisos exportando el servicio y el guard.

#### Autenticación, Sesiones y Provisión de Cuentas (§5.3)
- **`backend/src/auth/auth.types.ts`** — enums de auditoría (`TipoEventoAuditoria`) y contratos de tokens JWT.
- **`backend/src/auth/dto/`** — validación estricta con `class-validator`:
  - `login.dto.ts`: credenciales de acceso con email y contraseña.
  - `create-invitation.dto.ts`: creación de invitación por admin (asociada opcionalmente a un `artistaId`).
  - `accept-invitation.dto.ts`: activación con validación de complejidad de contraseña.
  - `refresh-token.dto.ts`: rotación de token de refresco.
- **`backend/src/auth/auth.service.ts`** — servicio integral de autenticación:
  - **Sin autoregistro**: cuentas creadas únicamente por administradores.
  - **Invitaciones de un solo uso**: tokens criptográficos aleatorios de 32 bytes (64 caracteres hex) con almacenamiento de hash SHA-256 y expiración configurable (default 72h). El admin nunca conoce ni transmite contraseñas en texto claro.
  - **Argon2id**: hasheo de contraseñas siguiendo estándares OWASP (64MB memoria, 3 iteraciones).
  - **Sesiones seguras**: JWT de vida corta (15 min) + `refresh_tokens` almacenados con hash SHA-256 y rotación obligatoria en cada refresco.
  - **Auditoría inmutable**: registro automático en `auditoria_accesos` para eventos `LOGIN_OK`, `LOGIN_FAIL`, `LOGOUT`, `TOKEN_REFRESH`, `INVITACION_CREADA`, `INVITACION_ACTIVADA` y `CUENTA_CREADA`, con IP y User-Agent.
  - **Perfil de usuario**: endpoint `getPerfil` que expone artista y sello asignado.
- **`backend/src/auth/auth.controller.ts`** — endpoints REST:
  - `POST /auth/login` — inicio de sesión.
  - `POST /auth/refresh` — rotación de tokens.
  - `POST /auth/logout` — revocación de sesión y refresh token.
  - `POST /auth/invitations` — generación de invitación (restringido a admin).
  - `POST /auth/invitations/accept` — activación y definición de contraseña.
  - `GET /auth/me` — consulta del perfil y permisos del usuario autenticado.
- **`backend/src/auth/guards/` y `strategies/`**:
  - `jwt.strategy.ts` y `jwt-auth.guard.ts` — validación de Bearer tokens y usuario activo.
  - `roles.guard.ts` y `roles.decorator.ts` (`@RequireAdmin()`) — control de acceso basado en rol de administrador.
  - `current-user.decorator.ts` (`@CurrentUser()`) — extracción limpia del usuario autenticado en controladores.
- **`backend/src/auth/auth.module.ts`** — configuración de `PassportModule` y `JwtModule`.

#### Estructura y Configuración del Backend NestJS
- **`backend/tsconfig.json`** y **`backend/tsconfig.build.json`** — compilación TypeScript con soporte completo de decoradores.
- **`backend/nest-cli.json`** — configuración del CLI de NestJS.
- **`backend/.env.example`** — plantilla de variables de entorno (separación estricta entre `DATABASE_URL_PORTAL` y `DATABASE_URL_FONARTE2_READONLY`, secretos JWT y expiraciones).
- **`backend/src/prisma/prisma.service.ts`** y **`prisma.module.ts`** — servicio global de conexión Prisma con desconexión limpia en ciclo de vida del módulo.
- **`backend/src/app.module.ts`** — módulo raíz ensamblando configuración, Prisma, Auth y Permissions.
- **`backend/src/main.ts`** — punto de entrada con `ValidationPipe` global (whitelist + forbidNonWhitelisted), CORS parametrizado y documentación Swagger OpenAPI en `/api/docs`.

### Verificación y Pruebas
- **`backend/src/permissions/permissions.service.spec.ts`** (10 pruebas unitarias) — cubriendo los 4 escenarios de negocio:
  1. Acceso completo a nivel de artista.
  2. Acceso a artista con una canción específicamente revocada con DENY.
  3. Acceso restringido a un solo álbum sin acceso al resto del artista.
  4. Acceso heredado desde el nivel de sello.
  5. Casos de default-deny y filtros en batch.
- **`backend/src/auth/auth.service.spec.ts`** (8 pruebas unitarias) — cubriendo:
  1. Login exitoso con hash Argon2id y registro de auditoría `LOGIN_OK`.
  2. Login fallido con usuario inexistente y registro `LOGIN_FAIL`.
  3. Rechazo de cuentas inactivas o pendientes de activación.
  4. Creación y hasheo de tokens de invitación por admin (`INVITACION_CREADA`).
  5. Activación de cuenta por artista con hash Argon2id (`INVITACION_ACTIVADA`).
  6. Rechazo de invitaciones expiradas o ya usadas.
  7. Rotación segura de refresh tokens (`TOKEN_REFRESH`).
- Total de pruebas en suite Jest: **18/18 pruebas aprobadas (100%)**.
- Compilación del backend con `nest build` completada sin errores.

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

[Unreleased]: https://github.com/FonarteLatino/FonarteForArtists/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/FonarteLatino/FonarteForArtists/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/FonarteLatino/FonarteForArtists/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/FonarteLatino/FonarteForArtists/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/FonarteLatino/FonarteForArtists/compare/v0.0.0...v0.1.0
[0.0.0]: https://github.com/FonarteLatino/FonarteForArtists/releases/tag/v0.0.0
