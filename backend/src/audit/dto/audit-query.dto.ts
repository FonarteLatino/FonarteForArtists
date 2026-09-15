import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AuditQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsString()
  evento?: string;

  @IsOptional()
  @IsString()
  desde?: string; // ISO string

  @IsOptional()
  @IsString()
  hasta?: string; // ISO string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 50;
}
