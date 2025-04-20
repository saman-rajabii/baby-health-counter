import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractionLog } from '../entities/contraction-log.entity';
import {
  ContractionCounter,
  ContractionCounterStatus,
} from '../entities/contraction-counter.entity';
import { CreateContractionLogDto } from './dto/create-contraction-log.dto';

@Injectable()
export class ContractionLogService {
  constructor(
    @InjectRepository(ContractionLog)
    private contractionLogRepository: Repository<ContractionLog>,
    @InjectRepository(ContractionCounter)
    private contractionCounterRepository: Repository<ContractionCounter>,
  ) {}

  /**
   * Create a new contraction log
   * @param createContractionLogDto - Data for creating the contraction log
   * @returns The created contraction log
   */
  async create(
    createContractionLogDto: CreateContractionLogDto,
  ): Promise<ContractionLog> {
    // Verify the counter exists and is active
    const counter = await this.contractionCounterRepository.findOne({
      where: {
        id: createContractionLogDto.counterId,
        status: ContractionCounterStatus.ACTIVE,
      },
    });

    if (!counter) {
      throw new NotFoundException(
        `Active contraction counter with ID ${createContractionLogDto.counterId} not found`,
      );
    }

    // Calculate duration if not provided
    if (!createContractionLogDto.duration) {
      const startTime = new Date(createContractionLogDto.startedAt).getTime();
      const endTime = new Date(createContractionLogDto.endedAt).getTime();
      createContractionLogDto.duration = Math.floor(
        (endTime - startTime) / 1000,
      );
    }

    const contractionLog = this.contractionLogRepository.create({
      ...createContractionLogDto,
      counter,
    });
    return this.contractionLogRepository.save(contractionLog);
  }

  /**
   * Find all contraction logs for a specific counter
   * @param counterId - The ID of the contraction counter
   * @returns Array of contraction logs
   */
  async findByCounterId(counterId: string): Promise<ContractionLog[]> {
    // Verify the counter exists
    const counter = await this.contractionCounterRepository.findOne({
      where: { id: counterId },
    });

    if (!counter) {
      throw new NotFoundException(
        `Contraction counter with ID ${counterId} not found`,
      );
    }

    return this.contractionLogRepository.find({
      where: { counter: { id: counterId } },
      order: { startedAt: 'DESC' },
    });
  }

  /**
   * Find a specific contraction log by ID
   * @param id - The ID of the contraction log
   * @returns The contraction log or null if not found
   */
  async findById(id: string): Promise<ContractionLog | null> {
    return this.contractionLogRepository.findOne({
      where: { id },
      relations: ['counter'],
    });
  }

  /**
   * Delete a contraction log
   * @param id - The ID of the contraction log to delete
   * @returns true if deleted, false otherwise
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.contractionLogRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
