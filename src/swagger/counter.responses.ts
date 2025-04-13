import { ApiProperty } from '@nestjs/swagger';

export class KickCounterDto {
  @ApiProperty({
    description: 'Unique ID of the kick counter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the user who owns this counter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'When the counting session was started',
    example: '2025-04-12T20:30:00.000Z',
  })
  startedAt: Date;

  @ApiProperty({
    description: 'When the counting session was finished (null if ongoing)',
    example: '2025-04-12T21:30:00.000Z',
    required: false,
    nullable: true,
  })
  finishedAt: Date | null;

  @ApiProperty({
    description: 'Period in hours that the counter should work for',
    example: 2,
    minimum: 1,
    maximum: 24,
  })
  period: number;

  @ApiProperty({
    description: 'When the record was created',
    example: '2025-04-12T20:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the record was last updated',
    example: '2025-04-12T21:30:00.000Z',
  })
  updatedAt: Date;
}

export class KickLogDto {
  @ApiProperty({
    description: 'Unique ID of the kick log',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the kick counter this log belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  counterId: string;

  @ApiProperty({
    description: 'When the kick happened',
    example: '2025-04-12T20:35:00.000Z',
  })
  happenedAt: Date;

  @ApiProperty({
    description: 'When the record was created',
    example: '2025-04-12T20:35:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the record was last updated',
    example: '2025-04-12T20:35:00.000Z',
  })
  updatedAt: Date;
}

export class ContractionCounterDto {
  @ApiProperty({
    description: 'Unique ID of the contraction counter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the user who owns this counter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'When the counting session was started',
    example: '2025-04-12T20:30:00.000Z',
  })
  startedAt: Date;

  @ApiProperty({
    description: 'When the counting session was finished (null if ongoing)',
    example: '2025-04-12T21:30:00.000Z',
    required: false,
    nullable: true,
  })
  finishedAt: Date | null;

  @ApiProperty({
    description: 'When the record was created',
    example: '2025-04-12T20:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the record was last updated',
    example: '2025-04-12T21:30:00.000Z',
  })
  updatedAt: Date;
}

export class ContractionStatisticsDto {
  @ApiProperty({
    description: 'ID of the contraction counter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  counterId: string;

  @ApiProperty({
    description: 'Total time of the session in minutes',
    example: 60,
  })
  totalTime: number;

  @ApiProperty({
    description: 'Current status of the contraction counter',
    example: 'in-progress',
    enum: ['in-progress', 'completed'],
  })
  status: string;
}

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Success indicator',
    example: true,
  })
  success: boolean;
}
