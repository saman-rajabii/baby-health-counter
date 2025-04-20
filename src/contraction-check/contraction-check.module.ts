import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractionCounter } from '../entities/contraction-counter.entity';
import { EmailModule } from '../email/email.module';
import { ContractionCheckService } from './contraction-check.service';
import { CounterSetting } from '../entities/counter-setting.entity';
import { User } from '../entities/user.entity';
import { ContractionLog } from '../entities/contraction-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractionCounter,
      CounterSetting,
      User,
      ContractionLog,
    ]),
    EmailModule,
  ],
  providers: [ContractionCheckService],
})
export class ContractionCheckModule {}
