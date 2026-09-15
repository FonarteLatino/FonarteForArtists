-- =============================================================================
-- FASE 1 — Vista: vw_stats_catalogo_canciones
-- Catálogo completo de canciones y álbumes SIN datos monetarios.
-- Basado en la query "Base Total" de Querys originales Power BI.
-- =============================================================================

USE [Reporteador];
GO

CREATE OR ALTER VIEW [dbo].[vw_stats_catalogo_canciones]
AS
/*
  Catálogo unificado de canciones y álbumes de Fonarte.
  Combina canciones individuales (ISRC) y álbumes (UPC como ISRC sintético).
  EXCLUYE ISRC '191018096595' según filtro del Power BI original.
  NO contiene columnas monetarias.
*/
WITH CTE AS (
    -- Deduplicar: para cada ISRC, tomar el registro con RELEASE_DATE más reciente y UPC máximo
    SELECT
        ISRC,
        MAX(RELEASE_DATE) AS [RELEASE_DATE],
        MAX(UPC)          AS [UPC]
    FROM [dbo].[BBDD_FINAL_CANCIONES]
    GROUP BY ISRC
),
CTE2 AS (
    -- Canciones individuales (deduplicadas)
    SELECT SONGS.*
    FROM CTE
    INNER JOIN [dbo].[BBDD_FINAL_CANCIONES] AS SONGS
        ON  CTE.ISRC         = SONGS.ISRC
        AND CTE.RELEASE_DATE = SONGS.RELEASE_DATE
        AND CTE.UPC          = SONGS.UPC

    UNION

    -- Álbumes (representados con UPC como ISRC sintético)
    SELECT
        [UPC],
        [ALBUM_ID],
        [ARTIST],
        [ALBUM_NAME],
        NULL       AS [TRACK_NUMBER],
        [UPC]      AS [ISRC],      -- ISRC sintético = UPC para álbumes
        NULL       AS [TRACK_NAME],
        [GENRE],
        [SELLO],
        [LABEL],
        [COPYRIGHT_YEAR],
        [RELEASE_DATE]
    FROM [dbo].[BBDD_FINAL_CANCIONES]
    GROUP BY
        [UPC], [ALBUM_ID], [ARTIST], [ALBUM_NAME],
        [GENRE], [SELLO], [LABEL], [COPYRIGHT_YEAR], [RELEASE_DATE]
)
SELECT
    FINAL.[UPC],
    FINAL.[ALBUM_ID],
    FINAL.[ARTIST],
    FINAL.[ALBUM_NAME],
    FINAL.[TRACK_NUMBER],
    FINAL.[ISRC],
    FINAL.[TRACK_NAME],
    FINAL.[GENRE],
    FINAL.[SELLO],
    FINAL.[LABEL],
    FINAL.[COPYRIGHT_YEAR],
    FINAL.[RELEASE_DATE],
    'CANCION' AS [TIPO_CONTENIDO]    -- Tipo explícito para el frontend
FROM (
    SELECT * FROM CTE2

    UNION

    -- Videos que no aparecen ya en el catálogo de canciones
    SELECT
        [UPC],
        [VIDEO_ID]    AS [ALBUM_ID],
        [ARTIST],
        [TITLE_ALBUM] AS [ALBUM_NAME],
        NULL          AS [TRACK_NUMBER],
        [ISRC],
        [TITLE_VIDEO] AS [TRACK_NAME],
        'VIDEO'       AS [GENRE],
        NULL          AS [SELLO],
        NULL          AS [LABEL],
        NULL          AS [COPYRIGHT_YEAR],
        NULL          AS [RELEASE_DATE]
    FROM [dbo].[BBDD_FINAL_VIDEOS]
    WHERE ISRC NOT IN (SELECT ISRC FROM CTE2)
) FINAL
WHERE FINAL.ISRC NOT IN ('191018096595')
GO

-- Verificar que la vista NO contiene columnas monetarias
-- SELECT * FROM [dbo].[vw_stats_catalogo_canciones] -- inspeccion manual
GO
