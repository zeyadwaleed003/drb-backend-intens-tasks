import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AssignDriverDto {
  @ApiPropertyOptional({
    description: 'MongoDB ObjectId of the assigned driver',
    example: '674b1234567890abcdef0001',
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.IS_MONGODB_ID', {
      property: 'driverId',
    }),
  })
  driverId: ObjectId;
}
