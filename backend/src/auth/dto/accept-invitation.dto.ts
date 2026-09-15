import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class AcceptInvitationDto {
  @IsString({ message: 'El token de invitación es requerido' })
  @IsNotEmpty({ message: 'El token de invitación no puede estar vacío' })
  token: string;

  @IsString({ message: 'La contraseña es requerida' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(8, { message: 'La contraseña debe contener al menos 8 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe incluir al menos una letra mayúscula, una minúscula y un número o símbolo especial',
  })
  password: string;
}
