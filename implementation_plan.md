# Fonarte For Artist — Implementation Plan

## 1. Contexto y objetivo

Fonarte distribuye álbumes, canciones y videos de artistas en múltiples plataformas de streaming. Actualmente existe:

- Una base de datos **Azure SQL Server** (`fonarte2.database.windows.net`) que es la fuente de verdad de regalías y clicks/reproducciones, actualizada mensualmente.
- Un sistema en **Power BI** conectado a esa misma base, que calcula cuánto se le paga a cada artista cada mes. Sus queries viven en un archivo del repositorio llamado `Querys originales Power BI`.
- Un desarrollo previo de **Fonarte For Artist**, con un mapa y estadísticas básicas ya implementadas.

El objetivo es evolucionar Fonarte For Artist a un portal tipo "Spotify for Artists / Apple for Artists" (pero multi-plataforma, agregando todas las plataformas de distribución de Fonarte), con:

- Estadísticas de clicks/streams por artista, álbum, canción y video — **sin ninguna información financiera** (ni montos, ni regalías en dinero).
- Acceso **no autoregistrable**: las cuentas solo las crea un administrador desde un panel.
- Permisos **granulares y jerárquicos**: sello → artista → álbum/video/canción, otorgables en bloque y revocables de forma individual.
- Acceso **único por artista** (una identidad de acceso por artista, no compartida).
- Alojamiento en **Azure**.

**Restricción no negociable de seguridad de datos:** ningún componente nuevo debe escribir en la base `fonarte2` original ni exponer columnas monetarias. Todo lo nuevo se lee vía una capa de solo lectura separada.

---

## 2. Decisiones de arquitectura y tecnología

| Área | Decisión | Razón |
|---|---|---|
| Backend | Node.js + TypeScript + NestJS | Máxima cobertura en agentes de IA de código; tipado fuerte para un modelo de permisos complejo; buen soporte de SQL Server vía Prisma |
| ORM / acceso a datos | Prisma (con `@prisma/client`, conector SQL Server) | Migraciones versionadas, tipado end-to-end, separa claramente el esquema de permisos del esquema de datos fuente |
| Frontend | Next.js 14+ (App Router) + TypeScript + Tailwind CSS | SSR para dashboards con datos por artista, buen soporte de gráficas, despliegue nativo en Azure |
| Gráficas | Recharts o Chart.js | Estadísticas tipo streams por plataforma/tiempo/geografía |
| Autenticación | Azure AD B2C **o** sistema propio con JWT + Argon2 (ver sección 5) | Acceso admin-provisioned, sin autoregistro, con MFA opcional |
| Base de datos fuente | Azure SQL `fonarte2` (existente, **solo lectura** para esta app) | Ya es la fuente de verdad; no se modifica su esquema ni sus datos |
| Capa de reporte | Vistas SQL nuevas sobre `fonarte2`, basadas en los queries de `Querys originales Power BI` | Garantiza que los números coincidan entre Power BI y el portal |
| Base de datos de permisos | Azure SQL Database nueva y separada (o esquema separado dentro del mismo servidor, con login distinto) | Aísla el sistema de accesos del dato financiero/operativo |
| Hosting | Azure App Service (backend + frontend) o Azure Container Apps | Evita límites de hosting compartido; integra con Key Vault, Azure AD, Application Insights |
| Secretos | Azure Key Vault | Ninguna cadena de conexión ni secreto en código o `.env` en el repo |
| Auditoría/monitoreo | Azure Application Insights + tabla de auditoría propia (ver 5.3) | Trazabilidad de quién accedió a qué y quién otorgó cada permiso |

**Justificación clave:** se elige aislar la capa de permisos en una base de datos completamente separada de `fonarte2`, en vez de agregar tablas de usuarios ahí mismo. Esto reduce el radio de blast si algo sale mal en el nuevo desarrollo, y evita cualquier riesgo de que un bug exponga datos financieros que Power BI sí necesita ver.

---

## 3. Fase 0 — Auditoría obligatoria del repositorio actual (hacer antes que nada)

Un agente de IA que implemente este plan **debe empezar aquí, no saltarse a código nuevo**:

1. Clonar/inspeccionar el repositorio actual de Fonarte For Artist.
2. Ubicar y leer el archivo `Querys originales Power BI` completo; catalogar cada query: qué tabla(s) de `fonarte2` usa, qué columnas devuelve, y cuáles de esas columnas son monetarias (para excluirlas).
3. Inspeccionar el esquema real de `fonarte2` (tablas, vistas, relaciones) — no asumir nombres de columnas sin verificarlos contra la base o contra los queries encontrados.
4. Documentar qué partes del desarrollo actual (mapa, estadísticas básicas) son reutilizables vs. qué se reemplaza.
5. Confirmar con el stakeholder (Allan / Fonarte) qué plataformas de streaming están representadas en los datos actuales y si faltan por integrar.
6. Producir un documento corto de hallazgos antes de tocar código, señalando cualquier discrepancia entre lo que dice este plan y lo que existe realmente.

**No continuar a la Fase 1 sin completar la Fase 0.**

---

## 4. Fase 1 — Capa de datos (reporting layer)

1. Crear una base de datos Azure SQL nueva (`fonarte_portal`) o, si no es posible, un esquema dedicado dentro de `fonarte2` con un login SQL propio de solo `SELECT`.
2. Crear un login SQL de solo lectura (`fonarte_portal_reader`) con permisos `SELECT` únicamente sobre las tablas/vistas fuente necesarias — nunca `db_owner` ni `INSERT/UPDATE/DELETE`.
3. Portar cada query de `Querys originales Power BI` a una vista SQL parametrizable o a una función con parámetros (artista/álbum/rango de fechas), **removiendo explícitamente cualquier columna de regalías, pagos o montos**.
4. Nombrar las vistas de forma explícita, ej. `vw_stats_streams_por_cancion`, `vw_stats_clicks_por_plataforma`, `vw_stats_resumen_artista`.
5. Validar cruzando resultados: para un artista de prueba, comparar los totales de streams/clicks de la vista nueva contra el reporte de Power BI — deben coincidir exactamente antes de continuar.
6. (Opcional pero recomendado) Configurar un job de Azure Data Factory o Azure Function con timer trigger que materialice agregados pesados en tablas de resumen, para no pegarle en vivo a `fonarte2` en cada carga del dashboard.

---

## 5. Fase 2 — Modelo de permisos y autenticación

### 5.1 Esquema de la base de permisos (`fonarte_portal`)

Tablas mínimas:

- `usuarios` (id, artista_id o admin, email, hash_password o referencia a Azure AD B2C, activo, mfa_habilitado, creado_por, creado_en)
- `sellos` (id, nombre)
- `artistas` (id, sello_id, nombre)
- `entidades_catalogo` (id, tipo: album/video/cancion, artista_id, referencia_id_en_fonarte2)
- `concesiones_acceso` (id, usuario_id, tipo_entidad: sello/artista/album/video/cancion, entidad_id, efecto: ALLOW/DENY, otorgado_por, otorgado_en, revocado_en nullable)
- `auditoria_accesos` (id, usuario_id, entidad_consultada, fecha, ip)

### 5.2 Regla de resolución de permisos

La regla debe ser **"lo más específico gana"**:

1. Si existe una concesión `DENY` explícita al nivel exacto (canción/video/álbum), se niega, sin importar concesiones de nivel superior.
2. Si no hay `DENY` explícito, se hereda el permiso del nivel superior más cercano con `ALLOW` (artista → sello).
3. Sin ninguna concesión en ningún nivel, el acceso se niega por defecto (default deny).

Implementar esta resolución como una función pura y testeable en el backend (no como lógica repetida en cada endpoint), con pruebas unitarias que cubran: acceso completo a artista, acceso a artista con una canción revocada, acceso solo a un álbum específico sin acceso al resto del artista, y acceso heredado desde el sello.

### 5.3 Autenticación y provisión de cuentas

- **Nada de autoregistro.** El único punto de creación de usuarios es el panel de administración (ver Fase 4).
- Al crear una cuenta, el sistema genera una invitación (enlace de un solo uso con expiración) para que el artista establezca su propia contraseña — el admin nunca ve ni transmite la contraseña en texto plano.
- Contraseñas con Argon2id si se implementa auth propia; si se usa Azure AD B2C, delegar el hashing/políticas a B2C.
- Sesiones vía JWT de vida corta + refresh token, o el flujo estándar de B2C.
- MFA opcional pero recomendado, especialmente para cuentas de administrador.
- Cada acceso exitoso o fallido se registra en `auditoria_accesos`.

---

## 6. Fase 3 — API backend (NestJS)

Módulos sugeridos:

- `AuthModule`: login, refresh, invitaciones, recuperación de contraseña.
- `PermissionsModule`: resolución de permisos (5.2), guards de NestJS reutilizables (`@RequireAccess('cancion', ':id')`) que se aplican a cada endpoint de estadísticas.
- `StatsModule`: endpoints de solo lectura contra las vistas de la Fase 1, siempre filtrados por lo que el `PermissionsModule` autorice para el usuario autenticado.
- `AdminModule`: CRUD de usuarios, sellos, artistas, catálogo y concesiones — accesible solo a rol `admin`.
- `AuditModule`: consulta de logs de acceso (solo admin).

Reglas de implementación:

- Cada endpoint de `StatsModule` recibe el `artista_id`/`entidad_id` solicitado y **primero** valida con `PermissionsModule` antes de tocar la capa de datos — nunca confiar en que el frontend solo pida lo permitido.
- Ningún endpoint de `StatsModule` debe poder devolver, ni por error, columnas monetarias — enforced tanto en la vista SQL (Fase 1) como en el DTO de respuesta (defensa en profundidad).
- Rate limiting básico (ej. `@nestjs/throttler`) en endpoints de autenticación.

---

## 7. Fase 4 — Panel de administración (dentro del mismo Next.js, ruta protegida por rol)

Funcionalidad mínima:

1. Alta/baja de sellos y artistas (reflejando la jerarquía real de Fonarte).
2. Alta de un usuario-artista: formulario que dispara la invitación descrita en 5.3.
3. Pantalla de asignación de accesos: selector de artista → toggle "todo el catálogo" o expandir a álbumes/videos/canciones individuales, con acción explícita de "otorgar" y "revocar" por elemento.
4. Vista de auditoría: quién otorgó qué acceso, cuándo, y quién ha iniciado sesión.
5. Confirmación explícita antes de revocar accesos masivos (a nivel sello o artista completo).

---

## 8. Fase 5 — Portal del artista (frontend público, autenticado)

Inspirado en Spotify for Artists / Apple for Artists, pero multi-plataforma:

- Resumen general: streams/clicks totales, tendencia en el tiempo, desglose por plataforma de distribución.
- Vista por álbum, por canción y por video, con el mismo tipo de desglose.
- Filtros por rango de fechas y por plataforma.
- Mapa geográfico de audiencia (reutilizando/mejorando el mapa que ya existe en el desarrollo actual).
- Ningún monto, ningún cálculo de pago, en ninguna pantalla.

---

## 9. Fase 6 — Hosting y despliegue en Azure

1. Azure App Service (o Container Apps) para el backend NestJS y para el frontend Next.js — pueden ir en el mismo App Service Plan si el tráfico es bajo, o separados si se prefiere escalar independiente.
2. Azure SQL Database nueva (`fonarte_portal`) en el mismo resource group, con firewall restringido a los servicios de la app (no acceso público abierto).
3. Azure Key Vault con: cadena de conexión a `fonarte2` (solo lectura), cadena de conexión a `fonarte_portal`, secretos de JWT/B2C.
4. Azure Application Insights conectado a ambos servicios para logs y monitoreo de errores.
5. CI/CD con GitHub Actions (o Azure DevOps) hacia Azure App Service, con ambientes separados de staging y producción.
6. Azure Front Door o Web Application Firewall como capa adicional si el presupuesto lo permite (recomendado, no bloqueante para el MVP).

---

## 10. Fase 7 — Checklist de seguridad antes de salir a producción

- [ ] El login SQL usado por el portal no tiene permisos de escritura sobre `fonarte2`.
- [ ] Ninguna vista ni endpoint expone columnas monetarias — verificado con una revisión manual de cada DTO de respuesta.
- [ ] No existe ningún flujo de autoregistro; todas las cuentas se crean desde el panel admin.
- [ ] Cada artista tiene una única cuenta de acceso (validar constraint único en la tabla `usuarios`).
- [ ] La resolución de permisos por defecto es "denegar" cuando no hay concesión explícita.
- [ ] Los tests unitarios de `PermissionsModule` cubren los 4 escenarios descritos en 5.2.
- [ ] Todos los secretos están en Key Vault, ninguno en el repositorio.
- [ ] Los totales de streams/clicks del portal coinciden con los de Power BI para al menos 3 artistas de prueba con catálogos distintos (grande, mediano, con videos).
- [ ] Existe registro de auditoría tanto de inicios de sesión como de cambios de permisos.

---

## 11. Entregables esperados de este plan

1. Repositorio con backend (NestJS) y frontend (Next.js) organizados en el monorepo o en repos separados, según lo que ya exista.
2. Scripts de migración de Prisma para `fonarte_portal`.
3. Vistas SQL de la Fase 1 versionadas en el repo (no solo aplicadas manualmente en Azure).
4. Documentación corta de cómo correr el proyecto localmente contra una copia/subset de `fonarte2`.
5. El documento de hallazgos de la Fase 0.