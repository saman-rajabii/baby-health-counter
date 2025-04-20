import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractionCounter } from '../entities/contraction-counter.entity';
import { ContractionCounterService } from './contraction-counter.service';
import { ContractionCounterController } from './contraction-counter.controller';
import { ContractionLog } from '../entities/contraction-log.entity';
import { CounterSetting } from '../entities/counter-setting.entity';
import { User } from '../entities/user.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractionCounter,
      ContractionLog,
      CounterSetting,
      User,
    ]),
    EmailModule,
  ],
  controllers: [ContractionCounterController],
  providers: [ContractionCounterService],
  exports: [ContractionCounterService],
})
export class ContractionCounterModule {}
