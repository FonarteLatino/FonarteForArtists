import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsOptional()
  @IsInt({ message: 'El artistaId debe ser un número entero' })
  artistaId?: number;

  @IsOptional()
  @IsBoolean({ message: 'esAdmin debe ser un valor booleano' })
  esAdmin?: boolean;
}
