import { IsOptional, IsString, Matches } from 'class-validator';

export class StatsFiltroDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'periodoInicio debe tener formato YYYY-MM (ej. 2024-01)' })
  periodoInicio?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'periodoFin debe tener formato YYYY-MM (ej. 2024-12)' })
  periodoFin?: string;

  @IsOptional()
  @IsString()
  plataforma?: string;

  @IsOptional()
  @IsString()
  pais?: string;
}
