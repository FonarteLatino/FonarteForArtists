-- =============================================================================
-- FASE 1 — Vista: vw_stats_streams_por_plataforma
-- Total de streams por plataforma para un conjunto de ISRCs/UPCs.
-- Optimizada para el gráfico de barras/pie por plataforma del dashboard.
-- =============================================================================

USE [Reporteador];
GO

CREATE OR ALTER VIEW [dbo].[vw_stats_streams_por_plataforma]
AS
/*
  Streams agregados por plataforma (Retailer) y período.
  Se usa para los gráficos de distribución por plataforma en el portal.
  
  El backend debe filtrar esta vista por los ISRC/UPC a los que el usuario tiene acceso.
  NO contiene columnas monetarias.
*/
SELECT
    [ISRC],
    [UPC],
    [Retailer]      AS [plataforma],
    [Year_Month]    AS [periodo],
    SUM([Quantity]) AS [streams]
    -- Net_Royalty_Total EXCLUIDO intencionalmente
FROM [dbo].[000_Client_Dashboard_Total]
WHERE [ISRC] NOT IN ('191018096595')
GROUP BY
    [ISRC],
    [UPC],
    [Retailer],
    [Year_Month]
GO
