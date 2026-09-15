import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Fonarte2DatabaseService } from './fonarte2.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  controllers: [StatsController],
  providers: [StatsService, Fonarte2DatabaseService],
  exports: [StatsService, Fonarte2DatabaseService],
})
export class StatsModule {}
