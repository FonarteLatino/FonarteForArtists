-- =============================================================================
-- FASE 2 — Migración 01: Creación del Esquema para la Base de Datos fonarte_portal
-- Base de datos objetivo: fonarte_portal (Azure SQL Database separada de fonarte2)
--
-- PROPÓSITO:
-- 1. Almacenar la jerarquía organizacional (Sellos -> Artistas).
-- 2. Almacenar referencias al catálogo (ISRC / UPC) sin exponer datos monetarios.
-- 3. Gestionar usuarios provistos por administradores (sin autoregistro).
-- 4. Almacenar tokens de activación e invitación de un solo uso.
-- 5. Gestionar refresh tokens para sesiones seguras.
-- 6. Implementar el motor de concesiones jerárquicas y granulares (ALLOW / DENY).
-- 7. Registrar auditoría completa e inmutable de eventos de acceso y seguridad.
-- =============================================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

-- 1. TABLA: sellos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sellos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[sellos] (
        [id] INT IDENTITY(1,1) NOT NULL,
        [nombre] NVARCHAR(500) NOT NULL,
        [creado_en] DATETIME2(7) NOT NULL CONSTRAINT [DF_sellos_creado_en] DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_sellos] PRIMARY KEY CLUSTERED ([id] ASC)
    );
END;

-- 2. TABLA: artistas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[artistas]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[artistas] (
        [id] INT IDENTITY(1,1) NOT NULL,
        [sello_id] INT NOT NULL,
        [nombre] NVARCHAR(500) NOT NULL,
        CONSTRAINT [PK_artistas] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_artistas_sellos] FOREIGN KEY ([sello_id]) REFERENCES [dbo].[sellos] ([id]) ON DELETE NO ACTION
    );
    CREATE NONCLUSTERED INDEX [IX_artistas_sello_id] ON [dbo].[artistas] ([sello_id] ASC);
END;

-- 3. TABLA: entidades_catalogo
-- Referencia IDs en fonarte2 (ISRC para canciones/videos, UPC para álbumes)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[entidades_catalogo]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[entidades_catalogo] (
        [id] INT IDENTITY(1,1) NOT NULL,
        [artista_id] INT NOT NULL,
        [tipo] NVARCHAR(20) NOT NULL CONSTRAINT [CK_entidades_catalogo_tipo] CHECK ([tipo] IN (N'ALBUM', N'CANCION', N'VIDEO')),
        [referencia_id_en_fonarte2] NVARCHAR(200) NOT NULL,
        [nombre] NVARCHAR(500) NULL,
        [creado_en] DATETIME2(7) NOT NULL CONSTRAINT [DF_entidades_catalogo_creado_en] DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_entidades_catalogo] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_entidades_catalogo_artistas] FOREIGN KEY ([artista_id]) REFERENCES [dbo].[artistas] ([id]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX [IX_entidades_catalogo_artista_tipo] ON [dbo].[entidades_catalogo] ([artista_id] ASC, [tipo] ASC);
    CREATE NONCLUSTERED INDEX [IX_entidades_catalogo_ref] ON [dbo].[entidades_catalogo] ([referencia_id_en_fonarte2] ASC);
END;

-- 4. TABLA: usuarios
-- Cuentas provistas exclusivamente por administradores (sin autoregistro).
-- Cada usuario de artista tiene exactamente una cuenta vinculada.
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usuarios]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[usuarios] (
        [id] INT IDENTITY(1,1) NOT NULL,
        [artista_id] INT NULL,
        [email] NVARCHAR(500) NOT NULL,
        [hash_password] NVARCHAR(1000) NULL, -- Argon2id; NULL si está pendiente de activación
        [es_admin] BIT NOT NULL CONSTRAINT [DF_usuarios_es_admin] DEFAULT (0),
        [activo] BIT NOT NULL CONSTRAINT [DF_usuarios_activo] DEFAULT (1),
        [mfa_habilitado] BIT NOT NULL CONSTRAINT [DF_usuarios_mfa_habilitado] DEFAULT (0),
        [mfa_secret] NVARCHAR(500) NULL,
        [creado_por] INT NULL,
        [creado_en] DATETIME2(7) NOT NULL CONSTRAINT [DF_usuarios_creado_en] DEFAULT (SYSUTCDATETIME()),
        [actualizado_en] DATETIME2(7) NOT NULL CONSTRAINT [DF_usuarios_actualizado_en] DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_usuarios] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [UQ_usuarios_email] UNIQUE NONCLUSTERED ([email] ASC),
        CONSTRAINT [FK_usuarios_artistas] FOREIGN KEY ([artista_id]) REFERENCES [dbo].[artistas] ([id]) ON DELETE SET NULL
    );
    CREATE NONCLUSTERED INDEX [IX_usuarios_artista_id] ON [dbo].[usuarios] ([artista_id] ASC);
END;

-- 5. TABLA: invitaciones_activacion
-- Enlace de un solo uso con token de alta entropía (hash SHA-256 almacenado)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[invitaciones_activacion]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[invitaciones_activacion] (
        [id] INT IDENTITY(1,1) NOT NULL,
        [usuario_id] INT NOT NULL,
        [token_hash] NVARCHAR(128) NOT NULL,
        [expira_en] DATETIME2(7) NOT NULL,
        [usada_en] DATETIME2(7) NULL,
        [creado_en] DATETIME2(7) NOT NULL CONSTRAINT [DF_invitaciones_creado_en] DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_invitaciones_activacion] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [UQ_invitaciones_token_hash] UNIQUE NONCLUSTERED ([token_hash] ASC),
        CONSTRAINT [FK_invitaciones_usuarios] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios] ([id]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX [IX_invitaciones_usuario_id] ON [dbo].[invitaciones_activacion] ([usuario_id] ASC);
END;

-- 6. TABLA: refresh_tokens
-- Sesiones de larga duración con rotación y hash SHA-256
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[refresh_tokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[refresh_tokens] (
        [id] INT IDENTITY(1,1) NOT NULL,
        [usuario_id] INT NOT NULL,
        [token_hash] NVARCHAR(128) NOT NULL,
        [expira_en] DATETIME2(7) NOT NULL,
        [revocado_en] DATETIME2(7) NULL,
        [creado_en] DATETIME2(7) NOT NULL CONSTRAINT [DF_refresh_tokens_creado_en] DEFAULT (SYSUTCDATETIME()),
        [ip_origen] NVARCHAR(50) NULL,
        CONSTRAINT [PK_refresh_tokens] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [UQ_refresh_tokens_token_hash] UNIQUE NONCLUSTERED ([token_hash] ASC),
        CONSTRAINT [FK_refresh_tokens_usuarios] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios] ([id]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX [IX_refresh_tokens_usuario_revocado] ON [dbo].[refresh_tokens] ([usuario_id] ASC, [revocado_en] ASC);
END;

-- 7. TABLA: concesiones_acceso
-- Implementa la regla: "lo más específico gana"
-- tipo_entidad: SELLO | ARTISTA | ALBUM | CANCION | VIDEO
-- efecto: ALLOW | DENY
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[concesiones_acceso]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[concesiones_acceso] (
        [id] INT IDENTITY(1,1) NOT NULL,
        [usuario_id] INT NOT NULL,
        [tipo_entidad] NVARCHAR(20) NOT NULL CONSTRAINT [CK_concesiones_tipo_entidad] CHECK ([tipo_entidad] IN (N'SELLO', N'ARTISTA', N'ALBUM', N'CANCION', N'VIDEO')),
        [entidad_id] INT NOT NULL,
        [efecto] NVARCHAR(10) NOT NULL CONSTRAINT [CK_concesiones_efecto] CHECK ([efecto] IN (N'ALLOW', N'DENY')),
        [otorgado_por] INT NOT NULL,
        [otorgado_en] DATETIME2(7) NOT NULL CONSTRAINT [DF_concesiones_otorgado_en] DEFAULT (SYSUTCDATETIME()),
        [revocado_en] DATETIME2(7) NULL,
        CONSTRAINT [PK_concesiones_acceso] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_concesiones_usuario] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios] ([id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_concesiones_otorgado_por] FOREIGN KEY ([otorgado_por]) REFERENCES [dbo].[usuarios] ([id]) ON DELETE NO ACTION
    );
    CREATE NONCLUSTERED INDEX [IX_concesiones_usuario_activo] ON [dbo].[concesiones_acceso] ([usuario_id] ASC, [revocado_en] ASC);
    CREATE NONCLUSTERED INDEX [IX_concesiones_resolucion] ON [dbo].[concesiones_acceso] ([usuario_id] ASC, [tipo_entidad] ASC, [entidad_id] ASC, [revocado_en] ASC);
END;

-- 8. TABLA: auditoria_accesos
-- Registro inmutable de eventos de acceso, autenticación y permisos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[auditoria_accesos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[auditoria_accesos] (
        [id] INT IDENTITY(1,1) NOT NULL,
        [usuario_id] INT NULL,
        [evento] NVARCHAR(50) NOT NULL CONSTRAINT [CK_auditoria_evento] CHECK ([evento] IN (
            N'LOGIN_OK', N'LOGIN_FAIL', N'LOGOUT', N'TOKEN_REFRESH',
            N'PASSWORD_RESET_REQUEST', N'PASSWORD_CHANGED',
            N'INVITACION_CREADA', N'INVITACION_ACTIVADA',
            N'PERMISO_OTORGADO', N'PERMISO_REVOCADO',
            N'DATOS_CONSULTADOS', N'CUENTA_CREADA', N'CUENTA_DESACTIVADA'
        )),
        [detalle] NVARCHAR(2000) NULL,
        [ip_origen] NVARCHAR(50) NULL,
        [user_agent] NVARCHAR(500) NULL,
        [fecha] DATETIME2(7) NOT NULL CONSTRAINT [DF_auditoria_fecha] DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_auditoria_accesos] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_auditoria_usuarios] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios] ([id]) ON DELETE SET NULL
    );
    CREATE NONCLUSTERED INDEX [IX_auditoria_usuario_fecha] ON [dbo].[auditoria_accesos] ([usuario_id] ASC, [fecha] DESC);
    CREATE NONCLUSTERED INDEX [IX_auditoria_evento_fecha] ON [dbo].[auditoria_accesos] ([evento] ASC, [fecha] DESC);
END;
GO
