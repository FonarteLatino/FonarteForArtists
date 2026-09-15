-- =============================================================================
-- FASE 1 — Vista: vw_stats_streams_por_cancion
-- Streams/escuchas agregados por canción (ISRC), plataforma, período y país.
-- Basado en 000_Client_Dashboard_Total — tabla/vista maestra del dashboard.
-- COLUMNAS MONETARIAS EXPLÍCITAMENTE EXCLUIDAS.
-- =============================================================================

USE [Reporteador];
GO

CREATE OR ALTER VIEW [dbo].[vw_stats_streams_por_cancion]
AS
/*
  Estadísticas de streams/clicks por canción.

  COLUMNAS INCLUIDAS (seguras — no monetarias):
    ISRC, UPC, Retailer, Year_Month, Country_Sale, Quantity

  COLUMNAS EXCLUIDAS (monetarias — nunca exponer):
    Net_Royalty_Total, y cualquier variante de royalty/ingreso/pago

  Uso previsto:
    - Dashboard del artista: streams por canción en el tiempo
    - Filtro por plataforma, período, país
    - Siempre combinado con permisos del usuario (el backend filtra por ISRC/UPC autorizados)
*/
SELECT
    [ISRC],
    [UPC],
    [Retailer]     AS [plataforma],
    [Year_Month]   AS [periodo],
    [Country_Sale] AS [pais],
    SUM([Quantity]) AS [streams]
    -- Net_Royalty_Total EXCLUIDO intencionalmente
FROM [dbo].[000_Client_Dashboard_Total]
WHERE [ISRC] NOT IN ('191018096595')
GROUP BY
    [ISRC],
    [UPC],
    [Retailer],
    [Year_Month],
    [Country_Sale]
GO

-- =============================================================================
-- NOTA DE VALIDACIÓN (Fase 1, paso 5):
-- Para validar contra Power BI, ejecutar:
--   SELECT ISRC, SUM(streams) AS total_streams
--   FROM [dbo].[vw_stats_streams_por_cancion]
--   WHERE ISRC = '<ISRC_DE_PRUEBA>'
--   GROUP BY ISRC
-- y comparar con el total de Quantity en el reporte de Power BI para ese ISRC.
-- =============================================================================
GO
