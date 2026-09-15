-- =============================================================================
-- FASE 1 — Vista: vw_stats_tendencia_mensual
-- Tendencia de streams mes a mes — gráfica de línea temporal del dashboard.
-- =============================================================================

USE [Reporteador];
GO

CREATE OR ALTER VIEW [dbo].[vw_stats_tendencia_mensual]
AS
/*
  Tendencia mensual de streams para un conjunto de ISRCs.
  Usada para las gráficas de línea temporal en el portal del artista.
  
  Ordena por período para facilitar la presentación cronológica en el frontend.
  El backend filtra por ISRC/UPC autorizados para el usuario autenticado.
  NO contiene columnas monetarias.
*/
SELECT
    [ISRC],
    [UPC],
    [Year_Month]    AS [periodo],
    [Retailer]      AS [plataforma],
    SUM([Quantity]) AS [streams]
    -- Net_Royalty_Total EXCLUIDO intencionalmente
FROM [dbo].[000_Client_Dashboard_Total]
WHERE [ISRC] NOT IN ('191018096595')
GROUP BY
    [ISRC],
    [UPC],
    [Year_Month],
    [Retailer]
-- Nota: ORDER BY no se puede usar en vistas SQL Server.
-- El backend debe ordenar por periodo ASC al consultar.
GO
