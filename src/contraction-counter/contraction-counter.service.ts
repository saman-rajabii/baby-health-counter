import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ContractionCounter,
  ContractionCounterStatus,
} from '../entities/contraction-counter.entity';
import { CreateContractionCounterDto } from './dto/create-contraction-counter.dto';
import { NotificationService } from '../email/services/notification.service';
import { User } from '../entities/user.entity';
import { CounterSetting } from '../entities/counter-setting.entity';
import { CounterType } from '../entities/counter-setting.entity';
import { PregnancyStatus } from '../entities/pregnancy-status.entity';

@Injectable()
export class ContractionCounterService {
  private readonly logger = new Logger(ContractionCounterService.name);

  constructor(
    @InjectRepository(ContractionCounter)
    private contractionCounterRepository: Repository<ContractionCounter>,
    @InjectRepository(CounterSetting)
    private counterSettingRepository: Repository<CounterSetting>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PregnancyStatus)
    private pregnancyStatusRepository: Repository<PregnancyStatus>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Create a new contraction counter for a user
   * @param userId - The ID of the user creating the counter
   * @param createContractionCounterDto - Optional DTO with additional properties
   * @returns The created contraction counter
   */
  async createCounter(
    userId: string,
    createContractionCounterDto?: CreateContractionCounterDto,
  ): Promise<ContractionCounter> {
    const contractionCounter = this.contractionCounterRepository.create({
      userId,
      status:
        createContractionCounterDto?.status || ContractionCounterStatus.ACTIVE,
    });

    return this.contractionCounterRepository.save(contractionCounter);
  }

  /**
   * Find all contraction counters for a specific user
   * @param userId - The ID of the user
   * @returns Array of contraction counters
   */
  async findByUserId(userId: string): Promise<ContractionCounter[]> {
    return this.contractionCounterRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['contractionLogs'],
    });
  }

  /**
   * Find a specific contraction counter by ID
   * @param id - The ID of the contraction counter
   * @returns The contraction counter or null if not found
   */
  async findById(id: string): Promise<ContractionCounter | null> {
    return this.contractionCounterRepository.findOne({
      where: { id },
      relations: ['contractionLogs'],
    });
  }

  /**
   * Close a contraction counter
   * @param id - The ID of the contraction counter to close
   * @returns The updated contraction counter
   */
  async closeCounter(id: string): Promise<ContractionCounter> {
    const counter = await this.findById(id);

    if (!counter) {
      throw new Error(`Contraction counter with ID ${id} not found`);
    }

    counter.status = ContractionCounterStatus.CLOSED;

    // Check contraction activity before closing
    await this.checkContractionActivity(counter);

    return this.contractionCounterRepository.save(counter);
  }

  /**
   * Check contraction activity and send alerts if needed
   * @param counter - The contraction counter to check
   */
  private async checkContractionActivity(
    counter: ContractionCounter,
  ): Promise<void> {
    this.logger.log(`Checking contraction activity for counter ${counter.id}`);

    try {
      // Get the contraction settings for minimum count
      const contractionSetting = await this.counterSettingRepository.findOne({
        where: { counterType: CounterType.CONTRACTION },
      });

      if (!contractionSetting) {
        this.logger.warn('No contraction settings found, skipping check');
        return;
      }

      // Reload counter with user details if not already loaded
      if (!counter.user) {
        counter = await this.contractionCounterRepository.findOne({
          where: { id: counter.id },
          relations: ['user', 'contractionLogs'],
        });
      }

      // Get the latest pregnancy status for this user
      const pregnancyStatus = await this.pregnancyStatusRepository.findOne({
        where: { userId: counter.user.id },
        order: { createdAt: 'DESC' },
      });

      const minimumCount = contractionSetting.minCount;
      const logsCount = counter.contractionLogs?.length || 0;

      this.logger.log(
        `User has ${logsCount} contractions in counter ${counter.id} (minimum recommended: ${minimumCount})`,
      );

      const nowInMs = new Date().getTime();
      const createdAtInMs = new Date(counter.createdAt).getTime();

      this.logger.log(
        `now: ${nowInMs} , timeSinceCreationInMinutes: ${createdAtInMs}`,
      );
      // Check if the counter has been active for at least the minimum period
      const minimumPeriod = contractionSetting.minPeriod || 1; // Default to 1 hour if not set
      const timeSinceCreationInMinutes =
        (nowInMs - createdAtInMs) / (1000 * 60);

      this.logger.log(
        `Counter has been active for ${timeSinceCreationInMinutes.toFixed(2)} minutes (minimum period: ${minimumPeriod} minutes)`,
      );
      // Check if below minimum threshold
      if (
        logsCount < minimumCount &&
        timeSinceCreationInMinutes >= minimumPeriod &&
        pregnancyStatus &&
        pregnancyStatus.week >= 25
      ) {
        await this.sendAlertEmail(counter.user, logsCount, minimumCount);
      }
    } catch (error) {
      this.logger.error(
        `Error checking contraction activity: ${error.message}`,
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
  ): Promise<boolean> {
    this.logger.log(`Sending alert email to user ${user.id}`);

    await this.notificationService.sendAlertNotification({
      to: user.email,
      userName: user.name,
      type: 'contraction-alert',
      actualCount: actualCount,
      minimumCount: minimumCount,
      alertColor: '#e74c3c', // Red for warning
      alertTitle: 'Low Contraction Activity Alert',
      alertMessage: `You've had only ${actualCount} contractions in the monitoring period (minimum recommended: ${minimumCount}).`,
      alertTime: new Date().toLocaleString(),
      alertDescription:
        'Regular contraction monitoring is important for tracking your labor progress. Please check your health status and consult your healthcare provider if necessary.',
      appUrl: `${process.env.APP_URL}/contraction-counter`,
    });

    return true;
  }

  /**
   * Delete a contraction counter
   * @param id - The ID of the contraction counter to delete
   * @returns The result of the delete operation
   */
  async deleteCounter(id: string): Promise<void> {
    const counter = await this.findById(id);

    if (!counter) {
      throw new NotFoundException(
        `Contraction counter with ID ${id} not found`,
      );
    }

    await this.contractionCounterRepository.remove(counter);
  }
}
