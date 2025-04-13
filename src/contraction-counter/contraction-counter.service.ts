import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractionCounter } from '../entities/contraction-counter.entity';

import { CreateContractionCounterDto } from './dto/create-contraction-counter.dto';

@Injectable()
export class ContractionCounterService {
  constructor(
    @InjectRepository(ContractionCounter)
    private contractionCounterRepository: Repository<ContractionCounter>,
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
    const now = new Date();

    const contractionCounter = this.contractionCounterRepository.create({
      userId,
      startedAt: now,
      ...createContractionCounterDto,
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
      order: { startedAt: 'DESC' },
    });
  }

  /**
   * Find a specific contraction counter by ID
   * @param id - The ID of the contraction counter
   * @returns The contraction counter or null if not found
   */
  async findById(id: string): Promise<ContractionCounter | null> {
    return this.contractionCounterRepository.findOneBy({ id });
  }
}
