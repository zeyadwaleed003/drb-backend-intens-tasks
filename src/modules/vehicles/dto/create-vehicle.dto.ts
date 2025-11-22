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
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle plate number',
    example: 'ABC-1234',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  plateNumber: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Corolla',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  model: string;

  @ApiProperty({
    description: 'Vehicle manufacturer',
    example: 'Toyota',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  manufacturer: string;

  @ApiProperty({
    description: 'Vehicle manufacturing year',
    example: 2023,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.IS_NUMBER'),
    }
  )
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @Min(1900, {
    message: i18nValidationMessage('validation.MIN_YEAR', {
      property: 1900,
    }),
  })
  @Max(new Date().getFullYear() + 1, {
    message: i18nValidationMessage('validation.MAX_YEAR'),
  })
  year: number;

  @ApiProperty({
    description: 'Type of vehicle',
    enum: VehicleType,
    example: VehicleType.CAR,
  })
  @IsEnum(VehicleType, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  type: VehicleType;

  @ApiPropertyOptional({
    description: 'SIM card number for vehicle tracking',
    example: '89014104271490001234',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  simNumber?: string;

  @ApiPropertyOptional({
    description: 'GPS device ID',
    example: 'GPS-TOY-001',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'MongoDB ObjectId of the assigned driver',
    example: '674b1234567890abcdef0001',
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.IS_MONGODB_ID'),
  })
  @IsOptional()
  driverId?: Schema.Types.ObjectId;
}
