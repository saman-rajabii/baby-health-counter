import { IsUUID, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKickLogDto {
  @ApiProperty({
    description: 'ID of the kick counter to log a kick for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'counterId must be a valid UUID' })
  @IsNotEmpty({ message: 'counterId is required' })
  counterId: string;

  @ApiProperty({
    description: 'Timestamp when the kick happened (defaults to current time)',
    example: '2025-04-12T20:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  happenedAt?: Date;
}
