import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePeriodDto {
  @ApiProperty({
    description: 'Period in hours that the counter should work for',
    example: 2,
    minimum: 1,
    maximum: 24,
  })
  @IsInt()
  @Min(1)
  @Max(24)
  @Type(() => Number)
  period: number;
}
