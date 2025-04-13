import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KickCounter } from '../entities/kick-counter.entity';
import { KickLog } from '../entities/kick-log.entity';
import { KickCounterService } from './kick-counter.service';
import { KickCounterController } from './kick-counter.controller';
import { KickLogService } from './kick-log.service';
import { KickLogController } from './kick-log.controller';
import { User } from 'src/entities/user.entity';
import { CounterSetting } from 'src/entities/counter-setting.entity';
import { EmailModule } from 'src/email/email.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([KickCounter, KickLog, User, CounterSetting]),
    EmailModule,
  ],
  controllers: [KickCounterController, KickLogController],
  providers: [KickCounterService, KickLogService],
  exports: [KickCounterService, KickLogService],
})
export class KickCounterModule {}
