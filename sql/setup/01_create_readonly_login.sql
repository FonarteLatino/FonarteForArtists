-- =============================================================================
-- FASE 1 — Script 01: Crear login de solo lectura para fonarte_portal
-- Base de datos objetivo: fonarte2.database.windows.net / Reporteador
-- EJECUTAR CON CUENTA DE ADMIN (db_owner o sysadmin en el servidor)
-- =============================================================================

-- IMPORTANTE: Reemplazar <STRONG_PASSWORD> con la contraseña real,
-- que debe almacenarse en Azure Key Vault, NUNCA en este archivo.
-- Este script es solo la plantilla; la contraseña se inyecta desde el pipeline CI/CD.

-- 1. Crear login a nivel servidor (ejecutar en master)
USE [master];
GO

CREATE LOGIN [fonarte_portal_reader]
    WITH PASSWORD = '<STRONG_PASSWORD>';  -- Reemplazar con Key Vault secret
GO

-- 2. Crear usuario en la base de datos Reporteador
USE [Reporteador];
GO

CREATE USER [fonarte_portal_reader]
    FOR LOGIN [fonarte_portal_reader];
GO

-- 3. Otorgar permisos de solo lectura (SELECT) en las vistas del portal
-- NOTA: Los permisos se otorgan sobre las VISTAS (vw_stats_*), NO sobre las tablas base.
-- Esto garantiza que nunca se expongan columnas monetarias incluso si el cliente
-- ejecuta SELECT * FROM la vista.

GRANT SELECT ON [dbo].[vw_stats_catalogo_canciones]   TO [fonarte_portal_reader];
GRANT SELECT ON [dbo].[vw_stats_catalogo_videos]       TO [fonarte_portal_reader];
GRANT SELECT ON [dbo].[vw_stats_streams_por_cancion]   TO [fonarte_portal_reader];
GRANT SELECT ON [dbo].[vw_stats_streams_por_plataforma] TO [fonarte_portal_reader];
GRANT SELECT ON [dbo].[vw_stats_streams_por_pais]      TO [fonarte_portal_reader];
GRANT SELECT ON [dbo].[vw_stats_resumen_artista]       TO [fonarte_portal_reader];
GRANT SELECT ON [dbo].[vw_stats_tendencia_mensual]     TO [fonarte_portal_reader];
GO

-- 4. Verificar permisos (diagnóstico)
SELECT dp.name AS 'Usuario',
       o.name AS 'Objeto',
       p.permission_name AS 'Permiso',
       p.state_desc AS 'Estado'
FROM sys.database_permissions p
JOIN sys.database_principals dp ON p.grantee_principal_id = dp.principal_id
JOIN sys.objects o ON p.major_id = o.object_id
WHERE dp.name = 'fonarte_portal_reader'
ORDER BY o.name;
GO

-- =============================================================================
-- RESULTADO ESPERADO: fonarte_portal_reader tiene solo SELECT en las 7 vistas.
-- NO tiene acceso a tablas base (APPLEMUSIC, ITUNES, ORCHARD, etc.)
-- =============================================================================
