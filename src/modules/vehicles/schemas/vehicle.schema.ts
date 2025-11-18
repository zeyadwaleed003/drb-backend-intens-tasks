import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { VehicleType } from '../vehicles.enums';

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Vehicle {
  @Prop({
    required: [true, 'A vehicle must have a plate number'],
    unique: true,
    trim: true,
  })
  plateNumber: string;

  @Prop({ trim: true, required: [true, 'A vehicle must have a model'] })
  model: string;

  @Prop({ trim: true, required: [true, 'A vehicle must have a manufacturer'] })
  manufacturer: string;

  @Prop({
    min: [1900, 'Year must be 1900 or later'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    required: [true, 'A vehicle must have a year'],
  })
  year: number;

  @Prop({ enum: VehicleType, required: [true, 'A vehicle must have a type'] })
  type: VehicleType;

  @Prop({ trim: true })
  simNumber: string;

  @Prop({ trim: true })
  deviceId: string; // GPS device

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  driverId: MongooseSchema.Types.ObjectId | null;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

VehicleSchema.virtual('driver', {
  ref: 'User',
  localField: 'driverId',
  foreignField: '_id',
  justOne: true, // Don't return an array ... only a single object
});
