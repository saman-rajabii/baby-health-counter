import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import {
  ContractionCounter,
  ContractionCounterStatus,
} from '../entities/contraction-counter.entity';
import { CounterSetting } from '../entities/counter-setting.entity';
import { CounterType } from '../entities/counter-setting.entity';
import { User } from '../entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContractionCheckService {
  private readonly logger = new Logger(ContractionCheckService.name);

  constructor(
    @InjectRepository(ContractionCounter)
    private contractionCounterRepository: Repository<ContractionCounter>,
    @InjectRepository(CounterSetting)
    private counterSettingRepository: Repository<CounterSetting>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  /**
   * Runs every hour to check contraction activity and send alerts if needed
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkContractions() {
    this.logger.log('Starting scheduled contraction check');

    try {
      // Get the contraction settings for minimum count
      const contractionSetting = await this.counterSettingRepository.findOne({
        where: { counterType: CounterType.CONTRACTION },
      });

      if (!contractionSetting) {
        this.logger.warn('No contraction settings found, skipping check');
        return;
      }

      const now = new Date();

      const minimumCount = contractionSetting.minCount;
      const hoursAgo = new Date(
        now.getTime() - contractionSetting.minPeriod * 60 * 1000,
      );

      this.logger.log(
        `Checking contractions from ${hoursAgo.toISOString()} to ${now.toISOString()}`,
      );

      // Find all active contraction counters
      const activeCounters = await this.contractionCounterRepository.find({
        where: {
          status: ContractionCounterStatus.ACTIVE,
          createdAt: LessThan(hoursAgo), // Only check counters that are older than the minimum period
        },
        relations: ['user', 'contractionLogs'],
      });

      this.logger.log(
        `Found ${activeCounters.length} active contraction counters to check`,
      );

      // Process each counter
      for (const counter of activeCounters) {
        try {
          // Count contractions in the past period
          const recentLogs =
            counter.contractionLogs?.filter(
              (log) => new Date(log.createdAt) >= hoursAgo,
            ) || [];

          const contractionCount = recentLogs.length;

          this.logger.log(
            `User ${counter.userId} has ${contractionCount} contractions in the evaluation period`,
          );

          // Check if below minimum threshold
          if (contractionCount < minimumCount) {
            await this.sendAlertEmail(
              counter.user,
              contractionCount,
              minimumCount,
              counter.id,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error processing counter ${counter.id}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log('Completed contraction check');
    } catch (error) {
      this.logger.error(
        `Error in contraction check: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send alert email to user with insufficient contractions
   */
  private async sendAlertEmail(
    user: User,
    actualCount: number,
    minimumCount: number,
    counterId: string,
  ): Promise<boolean> {
    this.logger.log(`Sending alert email to user ${user.id}`);

    return this.emailService.sendTemplateEmail({
      to: user.email,
      subject: 'Important: Low Contraction Activity Detected',
      template: 'alert-notification',
      context: {
        alertColor: '#e74c3c', // Red for warning
        alertType: 'Contraction Activity',
        alertTitle: 'Low Contraction Activity Alert',
        userName: user.name,
        alertMessage: `You've had only ${actualCount} contractions in the monitoring period (minimum recommended: ${minimumCount}).`,
        alertTime: new Date().toLocaleString(),
        alertDescription:
          'Regular contraction monitoring is important for tracking your labor progress. Please check your health status and consult your healthcare provider if necessary.',
        appUrl: `${process.env.APP_URL}/contraction-counter/${counterId}`,
      },
    });
  }
}
