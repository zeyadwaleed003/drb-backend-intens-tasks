import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import type { ObjectId } from 'mongoose';

export class AssignDriverDto {
  @ApiPropertyOptional({
    description: 'MongoDB ObjectId of the assigned driver',
    example: '674b1234567890abcdef0001',
  })
  @IsMongoId({ message: 'driverId must be a valid MongoDB ObjectId' })
  driverId: ObjectId;
}
