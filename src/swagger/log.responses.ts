import { ApiProperty } from '@nestjs/swagger';

export class KickLogDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '2025-04-12T20:30:00.000Z' })
  happenedAt: Date;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  counterId: string;

  @ApiProperty({ example: '2025-04-12T20:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-04-12T20:30:00.000Z' })
  updatedAt: Date;
}
