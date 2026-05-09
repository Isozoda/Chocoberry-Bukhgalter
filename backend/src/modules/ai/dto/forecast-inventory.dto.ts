import { IsIn } from 'class-validator';

export class ForecastInventoryDto {
  @IsIn([7, 14, 30])
  daysAhead: 7 | 14 | 30;
}
