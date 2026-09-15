import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateSelloDto {
  @IsString({ message: 'El nombre del sello debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del sello es requerido' })
  @MinLength(2, { message: 'El nombre debe contener al menos 2 caracteres' })
  nombre: string;
}

export class CreateArtistaDto {
  @IsString({ message: 'El nombre del artista es requerido' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;

  @IsInt({ message: 'selloId debe ser un número entero' })
  selloId: number;
}

export class CreateCatalogoItemDto {
  @IsInt({ message: 'artistaId debe ser un número entero' })
  artistaId: number;

  @IsString({ message: 'tipo debe ser CANCION, ALBUM o VIDEO' })
  @IsIn(['CANCION', 'ALBUM', 'VIDEO'], { message: 'El tipo debe ser CANCION, ALBUM o VIDEO' })
  tipo: 'CANCION' | 'ALBUM' | 'VIDEO';

  @IsString({ message: 'referenciaIdFonarte2 (ISRC/UPC) es requerida' })
  @IsNotEmpty()
  referenciaIdFonarte2: string;

  @IsOptional()
  @IsString()
  nombre?: string;
}

export class CreateConcesionDto {
  @IsInt({ message: 'usuarioId debe ser un número entero' })
  usuarioId: number;

  @IsString()
  @IsIn(['SELLO', 'ARTISTA', 'ALBUM', 'CANCION', 'VIDEO'], {
    message: 'tipoEntidad debe ser SELLO, ARTISTA, ALBUM, CANCION o VIDEO',
  })
  tipoEntidad: string;

  @IsInt({ message: 'entidadId debe ser un número entero' })
  entidadId: number;

  @IsString()
  @IsIn(['ALLOW', 'DENY'], { message: 'efecto debe ser ALLOW o DENY' })
  efecto: 'ALLOW' | 'DENY';
}

export class UpdateUsuarioStatusDto {
  @IsBoolean({ message: 'activo debe ser booleano' })
  activo: boolean;
}
