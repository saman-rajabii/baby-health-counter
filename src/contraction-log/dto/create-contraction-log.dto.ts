import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractionLogDto {
  @ApiProperty({
    description: 'The ID of the contraction counter this log belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  counterId: string;

  @ApiProperty({
    description: 'When the contraction started',
    example: '2023-05-15T14:30:00.000Z',
    required: true,
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startedAt: Date;

  @ApiProperty({
    description: 'When the contraction ended',
    example: '2023-05-15T14:31:30.000Z',
    required: true,
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endedAt: Date;

  @ApiProperty({
    description: 'Duration of the contraction in seconds',
    example: 90,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;
}
