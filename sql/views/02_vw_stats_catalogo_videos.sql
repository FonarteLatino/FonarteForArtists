-- =============================================================================
-- FASE 1 — Vista: vw_stats_catalogo_videos
-- Catálogo de videos de Fonarte SIN datos monetarios.
-- =============================================================================

USE [Reporteador];
GO

CREATE OR ALTER VIEW [dbo].[vw_stats_catalogo_videos]
AS
/*
  Catálogo de videos de Fonarte.
  Dos niveles: álbum de video (por UPC) y video individual (por ISRC).
  NO contiene columnas monetarias.
*/
SELECT
    [UPC],
    [ISRC],
    [VIDEO_ID],
    [ARTIST],
    [TITLE_ALBUM],
    [TITLE_VIDEO]
FROM [dbo].[BBDD_FINAL_VIDEOS]
GROUP BY
    [UPC], [ISRC], [VIDEO_ID], [ARTIST], [TITLE_ALBUM], [TITLE_VIDEO]
GO
