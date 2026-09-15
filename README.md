# Fonarte For Artists

Portal de estadísticas de streaming para los artistas distribuidos por **Fonarte** — un
"Spotify for Artists" pero **multi-plataforma** (Apple Music, iTunes, Orchard y las que
agrega la tabla maestra del dashboard).

El artista entra con la cuenta que le crea un administrador y ve **cuántas veces se
reprodujo su música**: por canción, álbum, video, plataforma, país y período de tiempo.

> ### 🔒 Regla número uno del proyecto
> **Ningún componente nuevo puede escribir en la base `fonarte2`, ni exponer una sola
> columna monetaria.** Nada de regalías, montos, pagos, `Net_Royalty_Total`,
> `Partner_Share` ni equivalentes — ni en una vista SQL, ni en un DTO, ni en una pantalla.
> El cálculo de cuánto se le paga a cada artista se queda donde está: Power BI.
> Todo lo que este repositorio construye es **solo lectura y solo conteos (streams/clicks)**.

---

## Tabla de contenidos

- [Estado actual](#estado-actual)
- [Cómo funciona](#cómo-funciona)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Stack tecnológico](#stack-tecnológico)
- [Modelo de permisos](#modelo-de-permisos)
- [Capa de datos: las vistas SQL](#capa-de-datos-las-vistas-sql)
- [Correr el proyecto localmente](#correr-el-proyecto-localmente)
- [Reglas de seguridad innegociables](#reglas-de-seguridad-innegociables)
- [Documentación](#documentación)
- [Hoja de ruta](#hoja-de-ruta)

---

## Estado actual

El proyecto está en construcción, siguiendo el
[implementation plan](./implementation_plan.md) fase por fase.

| Fase | Alcance | Estado |
|---|---|---|
| **Fase 0** | Auditoría del repositorio anterior | ✅ Completada — [hallazgos](./docs/fase0_hallazgos.md) |
| **Fase 1** | Capa de datos: vistas SQL sobre `fonarte2` | 🟡 Vistas escritas y versionadas, **pendientes de aplicar y validar** contra Power BI |
| **Fase 2** | Modelo de permisos y autenticación | ✅ Esquema Prisma, `PermissionsService`, `AuthModule` (JWT + Argon2id + invitaciones) y auditoría |
| **Fase 3** | API backend (NestJS) | ✅ `AuthModule`, `PermissionsModule`, `StatsModule`, `AdminModule`, `AuditModule` + 27 tests |
| **Fase 4** | Panel de administración | ✅ Completada — sellos, artistas/catálogo, usuarios/invitaciones, permisos y auditoría |
| **Fase 5** | Portal del artista (frontend) | ⚪ No iniciada — solo existe el panel de administración |
| **Fase 6** | Despliegue en Azure | ⚪ No iniciada |

**Qué existe hoy en código:** backend NestJS completo (auth con Argon2id y refresh tokens
rotativos, guards de rol y de permisos, endpoints de estadísticas sin datos monetarios,
CRUD de administración y auditoría) con **27 pruebas unitarias pasando**, más el panel de
administración en Next.js descrito abajo. Lo que **falta** es el portal del artista
(Fase 5), que es distinto del panel: todavía no hay pantallas de estadísticas para el
artista.

### Panel de administración (Fase 4)

Vive en `frontend/` (Next.js 14 App Router) y cubre los 5 puntos del plan §7:

| Ruta | Qué hace |
|---|---|
| `/login` | Inicio de sesión. Sin autoregistro; muestra el aviso de "solicita tu enlace de activación" |
| `/invitacion?token=…` | Activación de cuenta: el artista define su propia contraseña (validación en vivo). Enlace de un solo uso |
| `/admin` | Panel general: KPIs (sellos, artistas, usuarios activos, logins 24 h) y actividad reciente |
| `/admin/sellos` | Alta y baja de sellos (nivel superior de la jerarquía) |
| `/admin/artistas` | Alta de artistas por sello y registro de su catálogo por **ISRC/UPC** |
| `/admin/usuarios` | Provisión de cuentas: genera el enlace de invitación de un solo uso, copiable, con expiración. Activar/desactivar cuentas |
| `/admin/permisos` | **Asignación granular**: catálogo completo del artista, o expandir a álbumes / canciones / videos. Otorgar, denegar y revocar por elemento, con historial de quién otorgó cada acceso |
| `/admin/auditoria` | Trazabilidad inmutable: logins (exitosos y fallidos), cambios de permisos, con filtros por evento y rango de fechas + paginación |

Toda la ruta `/admin` está **protegida por rol**: un usuario autenticado que no sea
administrador ve una pantalla de "acceso restringido" y nunca el panel. Cada acción
sensible (revocar accesos masivos, desactivar cuentas, eliminar sellos) pasa por un modal
de confirmación explícito.

---

## Cómo funciona

```
┌──────────────────────────┐
│  Azure SQL «fonarte2»    │   Fuente de verdad de los streams.
│  (Reporteador)           │   Actualizada mensualmente.
│                          │   ⚠️ SOLO LECTURA — nunca se escribe.
│  BBDD_FINAL_CANCIONES    │   Contiene columnas monetarias que NO se tocan.
│  BBDD_FINAL_VIDEOS       │
│  APPLEMUSIC / ITUNES     │
│  ORCHARD                 │
│  000_Client_Dashboard_Total │
└────────────┬─────────────┘
             │
             │  login SQL «fonarte_portal_reader»
             │  GRANT SELECT solo sobre las vistas (nunca sobre las tablas base)
             ▼
┌──────────────────────────────────────────────┐
│  Vistas de reporte  (sql/views/)             │
│  vw_stats_catalogo_canciones                 │   Columnas monetarias
│  vw_stats_catalogo_videos                    │   eliminadas por diseño:
│  vw_stats_streams_por_cancion                │   la vista ni siquiera
│  vw_stats_streams_por_plataforma             │   puede devolverlas.
│  vw_stats_streams_por_pais                   │
│  vw_stats_resumen_artista                    │
│  vw_stats_tendencia_mensual                  │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐        ┌─────────────────────────────┐
│  Backend NestJS  (backend/)                  │◄───────┤  Azure SQL «fonarte_portal» │
│                                              │        │  Base SEPARADA:            │
│  AuthModule       ── login, invitaciones     │        │  usuarios, sellos,         │
│  PermissionsModule── «¿puede ver esto?»      │        │  artistas, concesiones,    │
│  StatsModule      ── consulta las vistas,    │        │  auditoría, refresh tokens │
│                      filtrado por permisos   │        └─────────────────────────────┘
│  AdminModule      ── CRUD (solo admin)       │
│  AuditModule      ── logs de acceso          │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│  Portal del artista (Next.js 14+ App Router) │
│  Resumen · por álbum/canción/video ·         │
│  tendencia · plataformas · mapa geográfico   │
│  💰 Cero montos en pantalla.                 │
└──────────────────────────────────────────────┘
```

**La idea central:** los permisos viven en una base de datos **separada** de `fonarte2`.
Así, un bug en el código nuevo no puede alcanzar los datos financieros que Power BI sí
necesita ver, y el radio de impacto queda contenido.

---

## Estructura del repositorio

```
.
├── backend/                     # API NestJS + Prisma
│   ├── prisma/
│   │   ├── schema.prisma        # Esquema de «fonarte_portal» (permisos, usuarios, auditoría)
│   │   ├── seed.ts              # Siembra el primer administrador y datos base
│   │   └── migrations/          # 20260915000000_init_fonarte_portal
│   ├── src/
│   │   ├── auth/                # Login, refresh rotativo, invitaciones, guards de rol
│   │   ├── permissions/         # Resolución de permisos («lo más específico gana») + guard
│   │   ├── stats/               # Endpoints de solo lectura, sin columnas monetarias
│   │   ├── admin/               # CRUD de sellos, artistas, catálogo, usuarios y concesiones
│   │   ├── audit/               # Consulta de logs de acceso y estadísticas
│   │   ├── prisma/              # PrismaService
│   │   ├── app.module.ts        # ThrottlerGuard global (rate limiting)
│   │   └── main.ts              # Swagger en /api/docs
│   ├── .env.example
│   └── package.json
│
├── frontend/                    # Panel de administración (Next.js 14 App Router)
│   ├── src/app/
│   │   ├── login/               # Inicio de sesión
│   │   ├── invitacion/          # Activación de cuenta por enlace de un solo uso
│   │   └── admin/               # Ruta protegida por rol
│   │       ├── page.tsx         #   Panel general (KPIs + actividad reciente)
│   │       ├── sellos/          #   Alta y baja de sellos
│   │       ├── artistas/        #   Artistas + registro de catálogo (ISRC/UPC)
│   │       ├── usuarios/        #   Provisión de cuentas e invitaciones
│   │       ├── permisos/        #   Asignación granular de accesos
│   │       └── auditoria/       #   Trazabilidad de accesos y cambios
│   ├── src/components/          # AdminNavbar, AdminSidebar, ConfirmModal
│   ├── src/lib/api.ts           # Cliente HTTP con refresh automático de token
│   ├── verificar-compilacion.cjs# Compila cada página con SWC (útil bajo sandbox)
│   └── package.json
│
├── sql/                         # Capa de datos, versionada — no se aplica a mano en Azure
│   ├── setup/
│   │   └── 01_create_readonly_login.sql   # Login de solo lectura + GRANT SELECT
│   └── views/                   # 7 vistas de estadísticas, sin columnas monetarias
│       ├── 01_vw_stats_catalogo_canciones.sql
│       ├── 02_vw_stats_catalogo_videos.sql
│       ├── 03_vw_stats_streams_por_cancion.sql
│       ├── 04_vw_stats_streams_por_plataforma.sql
│       ├── 05_vw_stats_streams_por_pais.sql
│       ├── 06_vw_stats_resumen_artista.sql
│       └── 07_vw_stats_tendencia_mensual.sql
│
├── docs/
│   └── fase0_hallazgos.md       # Auditoría del repositorio anterior (Fase 0)
│
├── legacy/                      # Código anterior, solo referencia — ver legacy/README.md
│   ├── nodejsapi/               #   queries originales contra fonarte2
│   ├── Pruebas/                 #   proyectos de práctica, ajenos al portal
│   └── En construccion/         #   plantilla web estática
│
├── implementation_plan.md       # Plan por fases: arquitectura y decisiones
├── CHANGELOG.md                 # Historial de cambios notables
├── Querys originales power Bi   # 📌 Queries fuente del Power BI (referencia canónica)
├── Query De la tabla Bi         # Versión legible de los queries del dashboard
├── resumen_regalias.sql         # Dump del esquema MySQL antiguo (referencia histórica)
└── Prueba Power Bi.pbix         # Reporte Power BI de referencia para validar totales
```

### Dos referencias que hay que entender antes de tocar SQL

- **`Querys originales power Bi`** es la fuente de verdad de cómo se calculan los números
  hoy. Las vistas de `sql/views/` son un port directo de estos queries, con las columnas
  monetarias recortadas. Si el portal y Power BI no coinciden, el bug está en la vista.
- **`Prueba Power Bi.pbix`** es el reporte contra el que se validan los totales
  (Fase 1, paso 5 del plan): para un artista de prueba, los streams de la vista nueva
  deben dar **exactamente** lo mismo que el reporte.

---

## Stack tecnológico

| Capa | Tecnología | Estado |
|---|---|---|
| Backend | **Node.js + TypeScript + NestJS 10** | ✅ implementado |
| ORM | **Prisma 5** (`@prisma/client`, conector `sqlserver`) | ✅ esquema + migración inicial |
| Base de datos de permisos | **Azure SQL** — base `fonarte_portal` (separada de `fonarte2`) | ⚪ pendiente de crear en Azure |
| Base de datos fuente | **Azure SQL** `fonarte2` / esquema `Reporteador` — **solo lectura** | ✅ existe |
| Autenticación | JWT de vida corta + refresh token rotativo, **Argon2id** | ✅ implementado |
| Rate limiting | `@nestjs/throttler` con `ThrottlerGuard` global | ✅ implementado |
| Frontend | **Next.js 14 (App Router) + TypeScript + Tailwind CSS** | ✅ panel de administración |
| Gráficas | Recharts o Chart.js | ⚪ pendiente (Fase 5) |
| Secretos | **Azure Key Vault** — nada de `.env` en el repo | ⚪ pendiente |
| Hosting | Azure App Service o Container Apps + Application Insights | ⚪ pendiente |

Documentación de la API: Swagger se publica en `/api/docs`.

Dependencias del backend ya declaradas en `backend/package.json`:
`@nestjs/{common,core,config,jwt,passport,platform-express,swagger,throttler}`,
`@prisma/client`, `argon2`, `class-validator`, `class-transformer`, `mssql`,
`passport-jwt`, `uuid`, `jest` + `ts-jest`.

### Código anterior — descartado, no usar

| Capa | Por qué se descartó |
|---|---|
| `Api2/` (Express + MySQL) | Exponía datos monetarios; password en texto plano; JWT con `'secretkey'` hardcodeado |
| `ApiRestFonarte/` (Express + MySQL) | Sincronizaba hacia MySQL local `resumen_regalias`, reemplazado por las vistas |
| `FrontFonarteForArtists/` (Angular 12) | Template de Angular CLI sin funcionalidad real |
| `OldFrontFonarteForArtists/` (AngularJS 1.x) | Sí funcionaba, pero mostraba ingresos en MXN. **Su UX es la referencia de diseño** |

Estas capas ya no se trackean en git. Detalles y cómo recuperarlas: [`legacy/README.md`](./legacy/README.md).

---

## Modelo de permisos

El sistema **no tiene autoregistro**: las cuentas las crea un administrador y cada
artista tiene **una sola identidad de acceso**.

### Jerarquía

```
Sello
 └── Artista
      ├── Álbum / Video
      │    └── Canción
```

Un permiso es una **concesión** (`concesiones_acceso`) con un `efecto`:

- `ALLOW` — acceso permitido
- `DENY` — acceso explícitamente denegado

### La regla: «lo más específico gana»

Implementada como una función pura y testeable en
[`backend/src/permissions/permissions.service.ts`](./backend/src/permissions/permissions.service.ts)
— nunca repetida en cada endpoint.

1. **`DENY` explícito en el nivel exacto** → se niega, aunque haya `ALLOW` en el artista o el sello.
2. **Sin `DENY` explícito** → se hereda el `ALLOW` del nivel superior más cercano (canción → álbum → artista → sello).
3. **Sin ninguna concesión en ningún nivel** → **default deny**.

Cada concesión guarda quién la otorgó (`otorgado_por`) y cuándo se revocó
(`revocado_en`), así que revocar es marcar una fecha, no borrar el registro.

### Escenarios cubiertos por los tests

Las pruebas en `permissions.service.spec.ts` (10 casos) cubren los 4 escenarios exigidos
por el plan:

| Escenario | Comportamiento esperado |
|---|---|
| Acceso completo a un artista | `ALLOW` en artista → permite todo su catálogo (heredado) |
| Artista con una canción revocada | `DENY` en esa canción gana, el resto del catálogo sigue accesible |
| Acceso solo a un álbum específico | El álbum se permite; el artista completo y los demás álbumes se niegan |
| Acceso heredado desde el sello | `ALLOW` en el sello → permite todos sus artistas |

```bash
cd backend
npm install
npm test          # corre las pruebas unitarias del módulo de permisos
```

### Otros modelos del esquema

- `usuarios` — `artista_id` nulo ⇒ es admin. Un artista = una cuenta (constraint único).
- `invitaciones_activacion` — enlace de un solo uso; el admin **nunca** ve la contraseña.
- `refresh_tokens` — sesiones revocables, con IP de origen.
- `auditoria_accesos` — `LOGIN_OK`, `LOGIN_FAIL`, `LOGOUT`, `PERMISO_OTORGADO`,
  `PERMISO_REVOCADO`, `DATOS_CONSULTADOS`, `CUENTA_CREADA`, `CUENTA_DESACTIVADA`.
- `entidades_catalogo` — apunta a `fonarte2` por `referencia_id_en_fonarte2`
  (ISRC para canciones/videos, UPC para álbumes) **sin duplicar** los datos de streaming.

---

## Capa de datos: las vistas SQL

Las 7 vistas de `sql/views/` son el **port de los queries de Power BI sin las columnas
monetarias**. Todas se crean con `CREATE OR ALTER VIEW` sobre `[Reporteador]`.

| Vista | Alimenta | Fuente |
|---|---|---|
| `vw_stats_catalogo_canciones` | Catálogo unificado de canciones, álbumes y videos | `BBDD_FINAL_CANCIONES` + `BBDD_FINAL_VIDEOS` |
| `vw_stats_catalogo_videos` | Catálogo de videos (álbum de video + video individual) | `BBDD_FINAL_VIDEOS` |
| `vw_stats_streams_por_cancion` | Detalle por canción/plataforma/período/país | `000_Client_Dashboard_Total` |
| `vw_stats_streams_por_plataforma` | Gráfica de distribución por plataforma | `000_Client_Dashboard_Total` |
| `vw_stats_streams_por_pais` | Mapa geográfico de audiencia | `000_Client_Dashboard_Total` |
| `vw_stats_resumen_artista` | Tarjetas KPI del dashboard | `000_Client_Dashboard_Total` + catálogo |
| `vw_stats_tendencia_mensual` | Gráfica de línea temporal | `000_Client_Dashboard_Total` |

### Columnas monetarias excluidas (nunca exponer)

| Tabla en `fonarte2` | Columnas prohibidas |
|---|---|
| `APPLEMUSIC` | `Net_Royalty`, `Net_Royalty_Total` |
| `ITUNES` | `Partner_Share`, `Extended_Partner_Share` |
| `ORCHARD` | `Label_Share_Net_Receipts` |
| `000_Client_Dashboard_Total` | `Net_Royalty_Total` |
| Derivadas de Power BI | `Net_Royalty_Artist_*`, `Net_Royalty_Total_Artist_*` |

Columnas seguras: `Quantity` (streams), `Year_Month` / `Anio` / `Mes` (período),
`Country_Sale` (país), `Retailer` (plataforma), `ISRC`, `UPC`.

> El ISRC `191018096595` se excluye en todas las vistas, replicando el filtro del Power BI original.

### Defensa en profundidad

El dato monetario se bloquea en **tres capas independientes**, para que un solo error no
lo filtre:

1. **SQL** — el login `fonarte_portal_reader` tiene `GRANT SELECT` **solo sobre las
   vistas**, nunca sobre las tablas base. Un `SELECT *` no puede alcanzar una columna
   que la vista no expone.
2. **Backend** — los DTO de respuesta de `StatsModule` no declaran campos monetarios.
3. **Frontend** — ninguna pantalla tiene un componente para mostrar dinero.

---

## Correr el proyecto localmente

> ⚠️ Requisitos: Node.js 20+, acceso de red a Azure SQL y **credenciales nuevas**
> (las del repositorio están comprometidas — ver la sección de seguridad).

### 1. Backend

```bash
cd backend
npm install
npx prisma generate
```

### 2. Variables de entorno

Crea `backend/.env` (está en `.gitignore` — **nunca lo commitees**):

```env
# Base de permisos del portal (Azure SQL, base separada de fonarte2)
DATABASE_URL_PORTAL="sqlserver://<host>:1433;database=fonarte_portal;user=<user>;password=<pass>;encrypt=true"

# Base fuente, SOLO LECTURA — usar el login fonarte_portal_reader
DATABASE_URL_FONARTE2="sqlserver://fonarte2.database.windows.net:1433;database=Reporteador;user=fonarte_portal_reader;password=<pass>;encrypt=true"

# Auth
JWT_SECRET="<genera-un-secreto-largo-y-aleatorio>"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
```

En Azure estas variables se inyectan desde **Key Vault**, no desde un archivo.

### 3. Aplicar la capa de datos (Fase 1)

Ejecutar **una sola vez**, con una cuenta `db_owner` sobre `fonarte2`:

```bash
# 1) Crear el login de solo lectura (reemplaza <STRONG_PASSWORD>)
#    sql/setup/01_create_readonly_login.sql

# 2) Crear las vistas, en orden
#    sql/views/01_...sql  →  sql/views/07_...sql
```

Las vistas deben aplicarse en orden: la 06 depende de `vw_stats_catalogo_canciones`.

### 4. Migraciones de la base de permisos

```bash
cd backend
npm run prisma:migrate:dev     # desarrollo
npm run prisma:migrate:deploy  # CI/CD
npm run prisma:studio          # inspeccionar datos
```

> Aún no hay migraciones generadas en `backend/prisma/migrations/`. La primera
> `prisma migrate dev` las creará a partir de `schema.prisma`.

### 5. Tests

```bash
cd backend
npm test -- --runInBand     # 27 tests: permisos, auth, stats, admin, auditoría
```

> `--runInBand` evita que Jest levante workers por pipe. En un entorno con sandbox de
> archivos los workers fallan con `EPERM`; fuera de sandbox `npm test` funciona igual.

### 6. Frontend (panel de administración)

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

Crea `frontend/.env.local` si la API no está en el puerto por defecto:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

El backend debe estar corriendo para poder iniciar sesión. Si el caché global de npm no es
escribible (entornos con sandbox), usa `npm install --cache .npm-cache`.

Verificación de compilación sin `next build` (útil cuando los workers de Next están
bloqueados por el sandbox):

```bash
node verificar-compilacion.cjs   # compila cada página con SWC, el motor real de Next
```

> El portal del artista (Fase 5) todavía no existe. `frontend/` contiene **solo** el panel
> de administración y las pantallas de login/activación.

---

## Reglas de seguridad innegociables

Antes de mergear cualquier cambio que toque datos, verifica:

- [ ] **Cero columnas monetarias.** Ninguna vista, DTO ni pantalla expone montos,
      regalías, `Net_Royalty_Total`, `Partner_Share` ni equivalentes.
- [ ] **`fonarte2` es solo lectura.** El portal usa `fonarte_portal_reader` con `SELECT`
      únicamente sobre las vistas. Nunca `db_owner`, nunca `INSERT`/`UPDATE`/`DELETE`.
- [ ] **Default deny.** Sin concesión explícita, el acceso se niega.
- [ ] **Cada endpoint de estadísticas valida permisos primero**, antes de tocar la capa
      de datos. Jamás confiar en que el frontend solo pida lo permitido.
- [ ] **Sin autoregistro.** Toda cuenta se crea desde el panel de administración.
- [ ] **Una sola cuenta por artista** (constraint único en `usuarios`).
- [ ] **Sin secretos en el repo.** Cadenas de conexión y claves van en Key Vault.
- [ ] **Todo acceso se audita** — logins (exitosos y fallidos) y cambios de permisos.
- [ ] **Los totales cuadran con Power BI** para al menos 3 artistas de prueba
      (catálogo grande, mediano y con videos).

### 🔴 Pendiente urgente

El usuario `Dataguys2` de Azure SQL tenía su contraseña **en texto plano** dentro del
repositorio (`legacy/nodejsapi/dbconfig.js`, hoy ya no trackeado). La contraseña
**sigue en el historial de git**: debe considerarse comprometida y **rotarse**.
Ver [`docs/fase0_hallazgos.md`](./docs/fase0_hallazgos.md) §6.

---

## Documentación

| Documento | Contenido |
|---|---|
| [`implementation_plan.md`](./implementation_plan.md) | **Empieza aquí.** Arquitectura, decisiones técnicas justificadas y las 7 fases del proyecto |
| [`docs/fase0_hallazgos.md`](./docs/fase0_hallazgos.md) | Auditoría del repositorio anterior: qué se reutiliza, qué se descarta y las discrepancias encontradas |
| [`legacy/README.md`](./legacy/README.md) | Qué es el código anterior, por qué está ahí y cómo recuperarlo del historial |
| [`CHANGELOG.md`](./CHANGELOG.md) | Historial de cambios notables, en formato Keep a Changelog |

**Fuentes de datos de referencia en la raíz:** `Querys originales power Bi` (queries
canónicos), `Query De la tabla Bi` (versión legible), `Prueba Power Bi.pbix` (reporte
para validar totales), `resumen_regalias.sql` (esquema MySQL antiguo, histórico).

---

## Hoja de ruta

1. **Cerrar Fase 1** — aplicar las vistas en Azure y validar los totales contra Power BI.
2. **Confirmar con el negocio** qué plataformas están realmente en `fonarte2` y si
   `000_Client_Dashboard_Total` está completa y al día.
3. **Desplegar el backend y crear `fonarte_portal`** — generar y aplicar la primera
   migración de Prisma, sembrar el primer administrador con `prisma/seed.ts` y mover los
   secretos a Key Vault.
4. **Fase 5** — portal del artista: resumen de streams, desglose por álbum/canción/video,
   tendencia, plataformas y mapa geográfico. Es lo único que falta del producto central.
5. **Fase 6** — despliegue en Azure con Key Vault, Application Insights y CI/CD.
