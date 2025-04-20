import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractionLog } from '../entities/contraction-log.entity';
import { ContractionCounter } from '../entities/contraction-counter.entity';
import { ContractionLogService } from './contraction-log.service';
import { ContractionLogController } from './contraction-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContractionLog, ContractionCounter])],
  controllers: [ContractionLogController],
  providers: [ContractionLogService],
  exports: [ContractionLogService],
})
export class ContractionLogModule {}
