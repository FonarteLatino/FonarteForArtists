-- =============================================================================
-- FASE 1 — Vista: vw_stats_resumen_artista
-- Resumen total de streams por artista — tarjetas KPI del dashboard principal.
-- =============================================================================

USE [Reporteador];
GO

CREATE OR ALTER VIEW [dbo].[vw_stats_resumen_artista]
AS
/*
  Resumen de streams agregados por artista.
  Une el catálogo de canciones con la tabla de streams para dar un total por artista,
  desagregado por plataforma y período.
  
  El backend utiliza esta vista para las tarjetas KPI del artista logueado.
  Acceso siempre filtrado por ISRC/UPC autorizados por el módulo de permisos.
  NO contiene columnas monetarias.
*/
SELECT
    c.[ARTIST]          AS [artista],
    c.[SELLO]           AS [sello],
    s.[Retailer]        AS [plataforma],
    s.[Year_Month]      AS [periodo],
    SUM(s.[Quantity])   AS [streams_totales]
    -- Net_Royalty_Total EXCLUIDO intencionalmente
FROM [dbo].[000_Client_Dashboard_Total] s
INNER JOIN [dbo].[vw_stats_catalogo_canciones] c
    ON s.[ISRC] = c.[ISRC]
WHERE s.[ISRC] NOT IN ('191018096595')
GROUP BY
    c.[ARTIST],
    c.[SELLO],
    s.[Retailer],
    s.[Year_Month]
GO
