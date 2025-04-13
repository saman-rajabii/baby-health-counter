import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KickLog } from '../entities/kick-log.entity';
import { KickCounter } from '../entities/kick-counter.entity';
import { CreateKickLogDto } from './dto';

@Injectable()
export class KickLogService {
  constructor(
    @InjectRepository(KickLog)
    private kickLogRepository: Repository<KickLog>,
    @InjectRepository(KickCounter)
    private kickCounterRepository: Repository<KickCounter>,
  ) {}

  /**
   * Create a new kick log
   * @param createKickLogDto - DTO with kick log data
   * @param userId - The ID of the authenticated user
   * @returns The created kick log
   */
  async createLog(
    createKickLogDto: CreateKickLogDto,
    userId: string,
  ): Promise<KickLog> {
    const { counterId, happenedAt } = createKickLogDto;

    // Verify the counter belongs to the user
    const counter = await this.kickCounterRepository.findOneBy({
      id: counterId,
    });
    if (!counter) {
      throw new NotFoundException('Kick counter not found');
    }

    if (counter.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to add logs to this counter',
      );
    }

    const now = new Date();
    const kickLog = this.kickLogRepository.create({
      counterId,
      happenedAt: happenedAt || now,
    });

    return this.kickLogRepository.save(kickLog);
  }

  /**
   * Find all kick logs for a specific counter
   * @param counterId - The ID of the counter
   * @param userId - The ID of the authenticated user
   * @returns Array of kick logs
   */
  async findByCounterId(counterId: string, userId: string): Promise<KickLog[]> {
    // Verify the counter belongs to the user
    const counter = await this.kickCounterRepository.findOneBy({
      id: counterId,
    });
    if (!counter) {
      throw new NotFoundException('Kick counter not found');
    }

    if (counter.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view logs for this counter',
      );
    }

    return this.kickLogRepository.find({
      where: { counterId },
      order: { happenedAt: 'ASC' },
    });
  }

  /**
   * Delete a kick log
   * @param id - The ID of the kick log to delete
   * @param userId - The ID of the authenticated user
   */
  async deleteLog(id: string, userId: string): Promise<void> {
    const log = await this.kickLogRepository.findOne({
      where: { id },
      relations: ['counter'],
    });

    if (!log) {
      throw new NotFoundException('Kick log not found');
    }

    // Check if the log's counter belongs to the user
    if (log.counter.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this log',
      );
    }

    await this.kickLogRepository.delete(id);
  }
}
