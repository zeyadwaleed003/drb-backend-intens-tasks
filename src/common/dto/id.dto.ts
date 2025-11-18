import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import type { ObjectId } from 'mongoose';

export class IdDto {
  @ApiProperty({
    description: 'MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
    type: String,
  })
  @IsMongoId({ message: 'Invalid MongoDB ObjectId format' })
  id: ObjectId;
}
