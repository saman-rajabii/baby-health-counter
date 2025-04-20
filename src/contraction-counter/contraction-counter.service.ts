import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ContractionCounter,
  ContractionCounterStatus,
} from '../entities/contraction-counter.entity';
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

    return this.contractionCounterRepository.save(counter);
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
