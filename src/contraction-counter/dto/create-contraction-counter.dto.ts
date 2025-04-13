import { IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContractionCounterDto {
  @ApiProperty({
    description: 'No properties needed as user ID comes from JWT token',
    type: 'object',
    properties: {},
    additionalProperties: false,
    default: {},
  })
  // No properties needed, userId will come from the authenticated user
  @ApiProperty({
    description: 'Optional timestamp when the counting session was startedAt',
    example: '2025-04-12T21:30:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  startedAt: Date;

  @ApiProperty({
    description: 'Optional timestamp when the counting session was finished',
    example: '2025-04-12T21:30:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  finishedAt: Date;
}
