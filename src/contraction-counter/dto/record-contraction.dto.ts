import { IsUUID, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RecordContractionDto {
  @ApiProperty({
    description: 'ID of the contraction counter session',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'counterId must be a valid UUID' })
  @IsNotEmpty({ message: 'counterId is required' })
  counterId: string;

  @ApiProperty({
    description: 'Start time of the contraction (defaults to current time)',
    example: '2025-04-12T20:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startTime?: Date;

  @ApiProperty({
    description: 'End time of the contraction',
    example: '2025-04-12T20:31:30.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endTime?: Date;
}
