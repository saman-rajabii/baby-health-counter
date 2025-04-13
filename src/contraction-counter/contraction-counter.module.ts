import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractionCounter } from '../entities/contraction-counter.entity';
import { ContractionCounterService } from './contraction-counter.service';
import { ContractionCounterController } from './contraction-counter.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContractionCounter])],
  controllers: [ContractionCounterController],
  providers: [ContractionCounterService],
  exports: [ContractionCounterService],
})
export class ContractionCounterModule {}
