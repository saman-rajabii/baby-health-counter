import { IsOptional, IsDate, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKickCounterDto {
  @ApiProperty({
    description: 'Optional timestamp when the counting session was started',
    example: '2025-04-12T21:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startedAt?: Date;

  @ApiProperty({
    description: 'Period in hours that the counter should work for',
    example: 2,
    default: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  @Type(() => Number)
  period?: number;
}
