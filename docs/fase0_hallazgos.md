# Fonarte For Artist — Documento de Hallazgos: Fase 0

> Generado: 2026-09-15  
> Auditor: Agente de IA (Antigravity)

> ℹ️ **Nota sobre las rutas (actualizado 2026-09-15).** Este documento es la fotografía
> del repositorio **antes** de la reestructura, por lo que las rutas que menciona son las
> originales. Después de la limpieza:
>
> | Ruta en este documento | Ubicación actual |
> |---|---|
> | `nodejsapi/` | `legacy/nodejsapi/` (conservado como referencia) |
> | `Api2/`, `ApiRestFonarte/`, `FrontFonarteForArtists/`, `OldFrontFonarteForArtists/` | Retirados del control de versiones; siguen en disco y en el historial de git |
>
> Ver [`../legacy/README.md`](../legacy/README.md) y [`../CHANGELOG.md`](../CHANGELOG.md).

---

## 1. Estructura del repositorio actual

El repositorio contiene **cuatro capas** independientes, no integradas entre sí bajo un monorepo formal:

| Directorio | Tecnología | Puerto | Rol |
|---|---|---|---|
| `nodejsapi/` | Node.js + Express + mssql | 8090 | **API Maestra**: lee directo de `fonarte2.database.windows.net` (Azure SQL, BD `Reporteador`) — fuente de verdad |
| `Api2/` | Node.js + Express + MySQL (mysql2) | 8091 | **API de Permisos/Regalías**: lee/escribe en MySQL local `resumen_regalias`; hace proxy hacia `nodejsapi` y calcula regalías |
| `ApiRestFonarte/` | Node.js + Express + MySQL | 8090 | **API de Sincronización**: sincroniza artistas/discos/canciones/regalías desde `nodejsapi` hacia `resumen_regalias` |
| `FrontFonarteForArtists/` | Angular 12 | — | **Frontend nuevo** (inacabado, aún usa template de Angular CLI sin componentes funcionales) |
| `OldFrontFonarteForArtists/` | AngularJS 1.x + Bootstrap 5 + jVectorMap | — | **Frontend anterior** (funcional con estadísticas básicas + mapa + gráficas) |

**Archivos de datos relevantes en la raíz:**
- `Querys originales power Bi` — queries fuente del Power BI
- `Query De la tabla Bi` — versión limpia/legible de los queries
- `resumen_regalias.sql` — dump del esquema MySQL local (BD `resumen_regalias`)
- `Prueba Power Bi.pbix` — archivo Power BI

---

## 2. Catálogo de queries de `Querys originales Power BI`

### 2.1 Tablas en `fonarte2.Reporteador` identificadas

| Tabla en `fonarte2` | Descripción inferida |
|---|---|
| `[dbo].[BBDD_FINAL_CANCIONES]` | Catálogo maestro de canciones: ISRC, UPC, ARTIST, ALBUM_NAME, ALBUM_ID, TRACK_NUMBER, TRACK_NAME, GENRE, SELLO, LABEL, COPYRIGHT_YEAR, RELEASE_DATE |
| `[dbo].[BBDD_FINAL_VIDEOS]` | Catálogo de videos: UPC, ISRC, VIDEO_ID, ARTIST, TITLE_ALBUM, TITLE_VIDEO |
| `[dbo].[APPLEMUSIC]` | Streams de Apple Music: Quantity, Item_Type, Media_Type, Offline_Indicator, Anio, Mes, Currency, Net_Royalty, Net_Royalty_Total |
| `[dbo].[APPLE_CURRENCY]` | Tipos de cambio para Apple: Divisa, Mes, Anio, Tipo_de_cambio |
| `[dbo].[ITUNES]` | Ventas de iTunes: Quantity, UPC, Vendor_Identifier, Start_Date, End_Date, Partner_Share, Extended_Partner_Share, Partner_Share_Currency, Anio, Mes |
| `[dbo].[ORCHARD]` | Streams/ventas de Orchard: ISRC, Orchard_UPC, Label_Share_Net_Receipts, Quantity, Period, Volume, Track, Anio, Mes |
| `[dbo].[000_Client_Dashboard_Total]` | Vista/tabla agregada con: ISRC, UPC, Retailer, Year_Month, Country_Sale, Net_Royalty_Total, Quantity |

### 2.2 Columnas monetarias — **EXCLUIR del portal**

| Tabla | Columnas monetarias a excluir |
|---|---|
| `APPLEMUSIC` | `Net_Royalty`, `Net_Royalty_Total` |
| `ITUNES` | `Partner_Share`, `Extended_Partner_Share` |
| `ORCHARD` | `Label_Share_Net_Receipts` |
| `000_Client_Dashboard_Total` | `Net_Royalty_Total` |
| Columnas derivadas (Power BI) | `Net_Royalty_Artist_*`, `Net_Royalty_Total_Artist_*` |

### 2.3 Columnas NO monetarias — **Seguras para el portal**

| Columna | Tabla | Significado |
|---|---|---|
| `Quantity` | APPLEMUSIC, ITUNES, ORCHARD | Unidades/streams/escuchas |
| `Year_Month`, `Anio`, `Mes` | Todas | Período de reporte |
| `Country_Sale` | 000_Client_Dashboard_Total | País de la venta/stream |
| `Retailer` | 000_Client_Dashboard_Total | Plataforma de streaming |
| `ISRC` | Todas | ID de canción/video |
| `UPC` | Todas | ID de álbum |

### 2.4 Plataformas de distribución identificadas

- **Apple Music** (tabla `APPLEMUSIC`)
- **iTunes** (tabla `ITUNES`)
- **Orchard** (tabla `ORCHARD`) — distribuidor que agrega múltiples plataformas

> ⚠️ **Punto de confirmación con Allan (ítem 5 de Fase 0):** ¿Existen tablas adicionales para Spotify, YouTube Music, Amazon Music, Deezer u otras plataformas en `fonarte2`? La tabla `000_Client_Dashboard_Total` agrega `Retailer`, lo que sugiere que sí puede haber más plataformas consolidadas ahí.

---

## 3. Esquema inferido de `fonarte2` (sin acceso directo)

Inferido exclusivamente de los queries en los archivos del repositorio. **Debe verificarse contra la BD real antes de la Fase 1.**

```
Esquema: Reporteador

BBDD_FINAL_CANCIONES (catálogo de canciones)
  ISRC, UPC, ALBUM_ID, ARTIST, ALBUM_NAME, TRACK_NUMBER,
  TRACK_NAME, GENRE, SELLO, LABEL, COPYRIGHT_YEAR, RELEASE_DATE

BBDD_FINAL_VIDEOS (catálogo de videos)
  UPC, ISRC, VIDEO_ID, ARTIST, TITLE_ALBUM, TITLE_VIDEO

APPLEMUSIC (streams Apple Music)
  Quantity [streams], Anio, Mes, Currency,
  Net_Royalty [MONETARIO], Net_Royalty_Total [MONETARIO], ...

APPLE_CURRENCY (tipos de cambio)
  Divisa, Mes, Anio, Tipo_de_cambio

ITUNES (ventas iTunes)
  UPC, Vendor_Identifier, Quantity [streams], Anio, Mes,
  Partner_Share [MONETARIO], Extended_Partner_Share [MONETARIO],
  Partner_Share_Currency

ORCHARD (streams/ventas Orchard)
  ISRC, Orchard_UPC, Quantity [streams], Period, Anio, Mes,
  Label_Share_Net_Receipts [MONETARIO]

000_Client_Dashboard_Total (tabla/vista agregada — la más útil para el portal)
  ISRC, UPC, Retailer [plataforma], Year_Month, Country_Sale,
  Quantity [streams], Net_Royalty_Total [MONETARIO — excluir]
```

---

## 4. Componentes actuales: reutilizables vs. a reemplazar

### ✅ Reutilizables / referencia valiosa

| Componente | Uso |
|---|---|
| Queries SQL en `nodejsapi/dboperations.js` | Referencia para las vistas de Fase 1 |
| Lógica de mapa geográfico (`OldFrontFonarteForArtists`) | Migrar a Next.js con librería equivalente |
| UX de dashboard en `OldFrontFonarteForArtists/views/stats.html` | Referencia de diseño: filtros por período, gráfica pie, top plataformas, mapa |
| Jerarquía de datos `resumen_regalias.sql` | `sello → artista → disco → canción` — base para diseñar esquema `fonarte_portal` |

### ❌ A reemplazar / descartar

| Componente | Razón |
|---|---|
| `FrontFonarteForArtists/` (Angular 12) | Template vacío sin funcionalidad real; se reemplaza con Next.js 14+ |
| `Api2/` — lógica de regalías | **Expone datos monetarios** — fuera del scope del portal |
| `OldFrontFonarteForArtists/` — columna "Ingresos estimados" | Muestra montos en MXN — **prohibido en el nuevo portal** |
| Autenticación en `Api2/app.js` | Contraseña en texto plano sin hash, JWT con clave hardcodeada `'secretkey'` |
| `nodejsapi/dbconfig.js` | Credenciales en texto plano en el repositorio — riesgo inmediato |
| `resumen_regalias` MySQL local | Se reemplaza con Azure SQL `fonarte_portal` |

---

## 5. Discrepancias entre el plan y la realidad

| # | Discrepancia | Impacto |
|---|---|---|
| 1 | El plan asume un monorepo limpio; la realidad son 4+ proyectos sueltos | Bajo — se crean `backend/` y `frontend/` nuevas |
| 2 | Plan: NestJS; realidad: Express puro | Sin impacto — Express se descarta |
| 3 | Plan: Next.js 14+; realidad: Angular 12 y AngularJS 1.x | Sin impacto — Angular se descarta |
| 4 | **🔴 Credenciales en texto plano:** `user: 'Dataguys2', password: 'Fonarte2018'` en `nodejsapi/dbconfig.js` | **CRÍTICO** — requiere rotación inmediata |
| 5 | `000_Client_Dashboard_Total` ya puede ser un agregado multi-plataforma útil | **Positivo** — simplifica la Fase 1 si está completa |
| 6 | El frontend anterior muestra ingresos en MXN | **Crítico por diseño** — confirma la restricción del plan |

---

## 6. Acciones requeridas antes de Fase 1

1. **🔴 URGENTE:** Rotar credenciales `Dataguys2 / Fonarte2018` de `fonarte2.database.windows.net` y agregar `nodejsapi/dbconfig.js` al `.gitignore`.
2. **Confirmar con Allan:** ¿Qué plataformas están en `fonarte2`? ¿La tabla `000_Client_Dashboard_Total` está actualizada y cubre todas las plataformas?
3. **Verificar esquema real** de `000_Client_Dashboard_Total` ejecutando `SELECT TOP 1 * FROM [dbo].[000_Client_Dashboard_Total]`.
4. **Decidir:** ¿monorepo o repos separados para backend/frontend?

---

*Documento generado en Fase 0. No se modificó ningún código de producción durante la auditoría.*
