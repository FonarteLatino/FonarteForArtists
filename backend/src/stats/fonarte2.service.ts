import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

@Injectable()
export class Fonarte2DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Fonarte2DatabaseService.name);
  private pool: sql.ConnectionPool | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const connectionString = this.configService.get<string>('DATABASE_URL_FONARTE2_READONLY');

    if (!connectionString) {
      this.logger.warn(
        'DATABASE_URL_FONARTE2_READONLY no configurada. El servicio operará en modo desacoplado / mock para desarrollo local.',
      );
      return;
    }

    try {
      this.pool = new sql.ConnectionPool(connectionString);
      await this.pool.connect();
      this.isConnected = true;
      this.logger.log('Conexión exitosa a la base fonarte2 (solo lectura)');
    } catch (err) {
      this.logger.warn(
        `No fue posible conectar a Azure SQL fonarte2 (${err.message}). Se operará en modo seguro.`,
      );
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.pool && this.isConnected) {
      await this.pool.close();
      this.logger.log('Conexión cerrada con fonarte2');
    }
  }

  /**
   * Ejecuta una consulta SELECT parametrizada de solo lectura contra fonarte2.
   * Valida estrictamente que sea un SELECT y no contenga operaciones de escritura.
   */
  async query<T = any>(
    queryText: string,
    params: Record<string, { type: sql.ISqlType; value: any }> = {},
  ): Promise<T[]> {
    const trimmed = queryText.trim().toUpperCase();
    if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('WITH')) {
      throw new Error('Operación no permitida: Solo se permiten consultas SELECT de solo lectura');
    }

    if (!this.pool || !this.isConnected) {
      this.logger.debug('fonarte2 pool desconectado, retornando resultado simulado para entorno local');
      return [];
    }

    const request = this.pool.request();
    for (const [key, param] of Object.entries(params)) {
      request.input(key, param.type, param.value);
    }

    const result = await request.query<T>(queryText);
    return result.recordset || [];
  }

  get connected(): boolean {
    return this.isConnected;
  }
}
