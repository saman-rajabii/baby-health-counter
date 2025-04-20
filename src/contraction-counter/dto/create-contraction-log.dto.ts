import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateContractionLogDto {
  @IsNotEmpty()
  @IsDateString()
  startedAt: Date;

  @IsNotEmpty()
  @IsDateString()
  finishedAt: Date;
}
