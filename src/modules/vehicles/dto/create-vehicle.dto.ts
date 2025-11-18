import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { VehicleType } from '../vehicles.enums';
import { Schema } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle plate number',
    example: 'ABC-1234',
  })
  @IsString({ message: 'plateNumber must be a string' })
  @IsNotEmpty({ message: 'plateNumber is cannot be empty' })
  plateNumber: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Corolla',
  })
  @IsString({ message: 'model must be a string' })
  @IsNotEmpty({ message: 'model is cannot be empty' })
  model: string;

  @ApiProperty({
    description: 'Vehicle manufacturer',
    example: 'Toyota',
  })
  @IsString({ message: 'manufacturer must be a string' })
  @IsNotEmpty({ message: 'manufacturer is cannot be empty' })
  manufacturer: string;

  @ApiProperty({
    description: 'Vehicle manufacturing year',
    example: 2023,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
  })
  @IsNumber({}, { message: 'year must be a number' })
  @IsNotEmpty({ message: 'year is cannot be empty' })
  @Min(1900, {
    message: 'year must be 1900 or later',
  })
  @Max(new Date().getFullYear() + 1, {
    message: 'year cannot be in the future',
  })
  year: number;

  @ApiProperty({
    description: 'Type of vehicle',
    enum: VehicleType,
    example: VehicleType.CAR,
  })
  @IsEnum(VehicleType, { message: 'Invalid vehicle type' })
  @IsNotEmpty({ message: 'type is cannot be empty' })
  type: VehicleType;

  @ApiPropertyOptional({
    description: 'SIM card number for vehicle tracking',
    example: '89014104271490001234',
  })
  @IsString({ message: 'simNumber must be a string' })
  @IsOptional()
  simNumber?: string;

  @ApiPropertyOptional({
    description: 'GPS device ID',
    example: 'GPS-TOY-001',
  })
  @IsString({ message: 'deviceId must be a string' })
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'MongoDB ObjectId of the assigned driver',
    example: '674b1234567890abcdef0001',
  })
  @IsMongoId({ message: 'driverId must be a valid MongoDB ObjectId' })
  @IsOptional()
  driverId?: Schema.Types.ObjectId;
}
