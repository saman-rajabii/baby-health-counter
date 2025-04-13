import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KickCounter } from '../entities/kick-counter.entity';
import { CreateKickCounterDto } from './dto/create-kick-counter.dto';
import {
  CounterSetting,
  CounterType,
} from 'src/entities/counter-setting.entity';
import { KickLog } from 'src/entities/kick-log.entity';
import { User } from 'src/entities/user.entity';
import { NotificationService } from 'src/email/services/notification.service';

@Injectable()
export class KickCounterService {
  constructor(
    @InjectRepository(KickCounter)
    private kickCounterRepository: Repository<KickCounter>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(KickLog)
    private kickLogRepository: Repository<KickLog>,
    @InjectRepository(CounterSetting)
    private counterSettingRepository: Repository<CounterSetting>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Create a new kick counter for a user with start time set to creation time
   * @param userId - The ID of the user creating the counter
   * @param createKickCounterDto - Optional DTO with additional properties
   * @returns The created kick counter
   */
  async createCounter(
    userId: string,
    createKickCounterDto?: CreateKickCounterDto,
  ): Promise<KickCounter> {
    const now = new Date();
    const period = createKickCounterDto?.period || 2; // Default to 2 hours if not specified

    const finishedAt = new Date(now.getTime() + period * 60 * 60 * 1000); // period in hours to ms

    const kickCounter = this.kickCounterRepository.create({
      userId,
      startedAt: now,
      finishedAt,
      period,
    });

    return this.kickCounterRepository.save(kickCounter);
  }

  /**
   * Find all kick counters for a specific user
   * @param userId - The ID of the user
   * @returns Array of kick counters
   */
  async findByUserId(userId: string): Promise<KickCounter[]> {
    return this.kickCounterRepository.find({
      where: { userId },
      order: { startedAt: 'DESC' },
    });
  }

  /**
   * Find a specific kick counter by ID
   * @param id - The ID of the kick counter
   * @returns The kick counter or null if not found
   */
  async findById(id: string): Promise<KickCounter | null> {
    return this.kickCounterRepository.findOneBy({ id });
  }

  /**
   * Complete a kick counter by setting the finishedAt time to current time
   * @param id - The ID of the kick counter to complete
   * @returns The updated kick counter
   */
  async completeCounter(id: string): Promise<KickCounter> {
    const kickCounter = await this.kickCounterRepository.findOneBy({ id });

    if (!kickCounter) {
      throw new NotFoundException('Kick counter not found');
    }

    kickCounter.finishedAt = new Date();

    const result = await this.kickCounterRepository.save(kickCounter);

    // Check if we need to send an email notification
    try {
      // Get the user associated with this kick counter
      const user = await this.userRepository.findOneBy({
        id: kickCounter.userId,
      });

      // Get the kick count for this counter

      const kickLogCount = await this.kickLogRepository.count({
        where: { counterId: id },
      });

      // Get the counter settings for kick type
      const kickSettings = await this.counterSettingRepository.findOne({
        where: { counterType: CounterType.KICK },
      });

      // Check if conditions are met to send notification
      if (
        kickSettings &&
        kickLogCount < kickSettings.minCount &&
        kickCounter.period >= kickSettings.minPeriod
      ) {
        // Send notification email
        await this.notificationService.sendAlertNotification({
          type: 'counter-completed',
          to: user.email,
          userName: user.name,
          totalKicks: kickLogCount,
          duration: `${kickCounter.period} hours`,
          completedAt: kickCounter.finishedAt.toISOString(),
          appUrl: process.env.APP_URL || 'https://babyhealth.app',
        });
      }
    } catch (error) {
      // Log error but don't fail the operation
      console.error(
        'Failed to send kick counter completion notification:',
        error,
      );
    }

    return result;
  }

  /**
   * Reset finishedAt time to be calculated based on period from startedAt
   * @param id - The ID of the kick counter to reset
   * @returns The updated kick counter
   */
  async resetCounterPeriod(id: string): Promise<KickCounter> {
    const kickCounter = await this.kickCounterRepository.findOneBy({ id });

    if (!kickCounter) {
      throw new NotFoundException('Kick counter not found');
    }

    // Calculate finishedAt based on startedAt and period
    kickCounter.finishedAt = new Date(
      kickCounter.startedAt.getTime() + kickCounter.period * 60 * 60 * 1000,
    );

    return this.kickCounterRepository.save(kickCounter);
  }

  /**
   * Update a kick counter's period and recalculate finishedAt
   * @param id - The ID of the kick counter to update
   * @param period - The new period in hours
   * @returns The updated kick counter
   */
  async updatePeriod(id: string, period: number): Promise<KickCounter> {
    const kickCounter = await this.kickCounterRepository.findOneBy({ id });

    if (!kickCounter) {
      throw new NotFoundException('Kick counter not found');
    }

    kickCounter.period = period;
    kickCounter.finishedAt = new Date(
      kickCounter.startedAt.getTime() + period * 60 * 60 * 1000,
    );

    return this.kickCounterRepository.save(kickCounter);
  }

  /**
   * Delete a kick counter
   * @param id - The ID of the kick counter to delete
   */
  async deleteCounter(id: string): Promise<void> {
    const result = await this.kickCounterRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Kick counter not found');
    }
  }
}
