import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ContractionCounterStatus } from '../../entities/contraction-counter.entity';

export class CreateContractionCounterDto {
  @ApiPropertyOptional({
    enum: ContractionCounterStatus,
    default: ContractionCounterStatus.ACTIVE,
    description: 'Status of the contraction counter',
  })
  @IsOptional()
  @IsEnum(ContractionCounterStatus)
  status?: ContractionCounterStatus;
}
