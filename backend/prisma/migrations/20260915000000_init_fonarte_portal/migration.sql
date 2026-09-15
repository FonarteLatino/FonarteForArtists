-- CreateTable
CREATE TABLE [dbo].[sellos] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] VARCHAR(500) NOT NULL,
    [creado_en] DATETIME2 NOT NULL CONSTRAINT [sellos_creado_en_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [sellos_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[artistas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [sello_id] INT NOT NULL,
    [nombre] VARCHAR(500) NOT NULL,
    CONSTRAINT [artistas_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[entidades_catalogo] (
    [id] INT NOT NULL IDENTITY(1,1),
    [artista_id] INT NOT NULL,
    [tipo] NVARCHAR(1000) NOT NULL,
    [referencia_id_en_fonarte2] VARCHAR(200) NOT NULL,
    [nombre] VARCHAR(500),
    [creado_en] DATETIME2 NOT NULL CONSTRAINT [entidades_catalogo_creado_en_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [entidades_catalogo_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[usuarios] (
    [id] INT NOT NULL IDENTITY(1,1),
    [artista_id] INT,
    [email] VARCHAR(500) NOT NULL,
    [hash_password] VARCHAR(1000),
    [es_admin] BIT NOT NULL CONSTRAINT [usuarios_es_admin_df] DEFAULT 0,
    [activo] BIT NOT NULL CONSTRAINT [usuarios_activo_df] DEFAULT 1,
    [mfa_habilitado] BIT NOT NULL CONSTRAINT [usuarios_mfa_habilitado_df] DEFAULT 0,
    [mfa_secret] VARCHAR(500),
    [creado_por] INT,
    [creado_en] DATETIME2 NOT NULL CONSTRAINT [usuarios_creado_en_df] DEFAULT CURRENT_TIMESTAMP,
    [actualizado_en] DATETIME2 NOT NULL,
    CONSTRAINT [usuarios_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [usuarios_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[invitaciones_activacion] (
    [id] INT NOT NULL IDENTITY(1,1),
    [usuario_id] INT NOT NULL,
    [token_hash] VARCHAR(128) NOT NULL,
    [expira_en] DATETIME2 NOT NULL,
    [usada_en] DATETIME2,
    [creado_en] DATETIME2 NOT NULL CONSTRAINT [invitaciones_activacion_creado_en_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [invitaciones_activacion_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [invitaciones_activacion_token_hash_key] UNIQUE NONCLUSTERED ([token_hash])
);

-- CreateTable
CREATE TABLE [dbo].[refresh_tokens] (
    [id] INT NOT NULL IDENTITY(1,1),
    [usuario_id] INT NOT NULL,
    [token_hash] VARCHAR(128) NOT NULL,
    [expira_en] DATETIME2 NOT NULL,
    [revocado_en] DATETIME2,
    [creado_en] DATETIME2 NOT NULL CONSTRAINT [refresh_tokens_creado_en_df] DEFAULT CURRENT_TIMESTAMP,
    [ip_origen] VARCHAR(50),
    CONSTRAINT [refresh_tokens_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [refresh_tokens_token_hash_key] UNIQUE NONCLUSTERED ([token_hash])
);

-- CreateTable
CREATE TABLE [dbo].[concesiones_acceso] (
    [id] INT NOT NULL IDENTITY(1,1),
    [usuario_id] INT NOT NULL,
    [tipo_entidad] NVARCHAR(1000) NOT NULL,
    [entidad_id] INT NOT NULL,
    [efecto] NVARCHAR(1000) NOT NULL,
    [otorgado_por] INT NOT NULL,
    [otorgado_en] DATETIME2 NOT NULL CONSTRAINT [concesiones_acceso_otorgado_en_df] DEFAULT CURRENT_TIMESTAMP,
    [revocado_en] DATETIME2,
    CONSTRAINT [concesiones_acceso_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[auditoria_accesos] (
    [id] INT NOT NULL IDENTITY(1,1),
    [usuario_id] INT,
    [evento] NVARCHAR(1000) NOT NULL,
    [detalle] VARCHAR(2000),
    [ip_origen] VARCHAR(50),
    [user_agent] VARCHAR(500),
    [fecha] DATETIME2 NOT NULL CONSTRAINT [auditoria_accesos_fecha_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [auditoria_accesos_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [entidades_catalogo_artista_id_tipo_idx] ON [dbo].[entidades_catalogo]([artista_id], [tipo]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [entidades_catalogo_referencia_id_en_fonarte2_idx] ON [dbo].[entidades_catalogo]([referencia_id_en_fonarte2]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [invitaciones_activacion_token_hash_idx] ON [dbo].[invitaciones_activacion]([token_hash]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [refresh_tokens_token_hash_idx] ON [dbo].[refresh_tokens]([token_hash]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [refresh_tokens_usuario_id_revocado_en_idx] ON [dbo].[refresh_tokens]([usuario_id], [revocado_en]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [concesiones_acceso_usuario_id_revocado_en_idx] ON [dbo].[concesiones_acceso]([usuario_id], [revocado_en]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [concesiones_acceso_usuario_id_tipo_entidad_entidad_id_revocado_en_idx] ON [dbo].[concesiones_acceso]([usuario_id], [tipo_entidad], [entidad_id], [revocado_en]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [auditoria_accesos_usuario_id_fecha_idx] ON [dbo].[auditoria_accesos]([usuario_id], [fecha]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [auditoria_accesos_evento_fecha_idx] ON [dbo].[auditoria_accesos]([evento], [fecha]);

-- AddForeignKey
ALTER TABLE [dbo].[artistas] ADD CONSTRAINT [artistas_sello_id_fkey] FOREIGN KEY ([sello_id]) REFERENCES [dbo].[sellos]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[entidades_catalogo] ADD CONSTRAINT [entidades_catalogo_artista_id_fkey] FOREIGN KEY ([artista_id]) REFERENCES [dbo].[artistas]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[usuarios] ADD CONSTRAINT [usuarios_artista_id_fkey] FOREIGN KEY ([artista_id]) REFERENCES [dbo].[artistas]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[invitaciones_activacion] ADD CONSTRAINT [invitaciones_activacion_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[refresh_tokens] ADD CONSTRAINT [refresh_tokens_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[concesiones_acceso] ADD CONSTRAINT [concesiones_acceso_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[concesiones_acceso] ADD CONSTRAINT [concesiones_acceso_otorgado_por_fkey] FOREIGN KEY ([otorgado_por]) REFERENCES [dbo].[usuarios]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[auditoria_accesos] ADD CONSTRAINT [auditoria_accesos_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE SET NULL ON UPDATE CASCADE;
