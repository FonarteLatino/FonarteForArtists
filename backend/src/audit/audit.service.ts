import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditQueryDto } from './dto/audit-query.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async getLogs(query: AuditQueryDto) {
    const where: any = {};

    if (query.usuarioId) {
      where.usuarioId = query.usuarioId;
    }

    if (query.evento) {
      where.evento = query.evento;
    }

    if (query.desde || query.hasta) {
      where.fecha = {};
      if (query.desde) {
        where.fecha.gte = new Date(query.desde);
      }
      if (query.hasta) {
        where.fecha.lte = new Date(query.hasta);
      }
    }

    const skip = (query.page - 1) * query.limit;

    const [total, logs] = await Promise.all([
      (this.prisma as any).auditoriaAcceso.count({ where }),
      (this.prisma as any).auditoriaAcceso.findMany({
        where,
        include: {
          usuario: {
            select: { id: true, email: true, esAdmin: true },
          },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: query.limit,
      }),
    ]);

    return {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
      logs,
    };
  }

  async getStats() {
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [loginsOk24h, loginsFail24h, permisosModificados24h, totalUsuarios] =
      await Promise.all([
        (this.prisma as any).auditoriaAcceso.count({
          where: { evento: 'LOGIN_OK', fecha: { gte: hace24h } },
        }),
        (this.prisma as any).auditoriaAcceso.count({
          where: { evento: 'LOGIN_FAIL', fecha: { gte: hace24h } },
        }),
        (this.prisma as any).auditoriaAcceso.count({
          where: {
            evento: { in: ['PERMISO_OTORGADO', 'PERMISO_REVOCADO'] },
            fecha: { gte: hace24h },
          },
        }),
        (this.prisma as any).usuario.count({ where: { activo: true } }),
      ]);

    return {
      ultimas24Horas: {
        loginsExitosos: loginsOk24h,
        loginsFallidos: loginsFail24h,
        permisosModificados: permisosModificados24h,
      },
      usuariosActivos: totalUsuarios,
    };
  }
}
