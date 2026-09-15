-- =============================================================================
-- FASE 1 — Vista: vw_stats_streams_por_pais
-- Streams por país — alimenta el mapa geográfico del dashboard.
-- =============================================================================

USE [Reporteador];
GO

CREATE OR ALTER VIEW [dbo].[vw_stats_streams_por_pais]
AS
/*
  Streams por país para el mapa geográfico del portal.
  El backend filtra por ISRC/UPC autorizados para el usuario.
  NO contiene columnas monetarias.
*/
SELECT
    [ISRC],
    [UPC],
    [Country_Sale]  AS [pais],
    [Year_Month]    AS [periodo],
    [Retailer]      AS [plataforma],
    SUM([Quantity]) AS [streams]
    -- Net_Royalty_Total EXCLUIDO intencionalmente
FROM [dbo].[000_Client_Dashboard_Total]
WHERE [ISRC] NOT IN ('191018096595')
  AND [Country_Sale] IS NOT NULL
GROUP BY
    [ISRC],
    [UPC],
    [Country_Sale],
    [Year_Month],
    [Retailer]
GO
