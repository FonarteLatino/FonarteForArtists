import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload, AuthenticatedUser } from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'fonarte-dev-secret-key-change-in-production-min-32-chars',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await (this.prisma as any).usuario.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario inactivo o no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      esAdmin: user.esAdmin,
      artistaId: user.artistaId,
      activo: user.activo,
    };
  }
}
