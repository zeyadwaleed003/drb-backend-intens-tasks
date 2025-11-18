import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicles.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { APIResponse } from 'src/common/types/api.types';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(dto: CreateVehicleDto): Promise<APIResponse> {
    // Check if a vehicle with this plate number already existed
    const exists = await this.vehicleModel.exists({
      plateNumber: dto.plateNumber,
    });
    if (exists)
      throw new ConflictException(
        `Vehicle with plate number ${dto.plateNumber} already exists`
      );

    // If assigned to a driver ... check if the driver existed
    if (dto.driverId && !(await this.userModel.exists({ _id: dto.driverId })))
      throw new NotFoundException(`Driver with ID ${dto.driverId} not found`);

    const vehicle = await this.vehicleModel.create(dto);
    return {
      message: 'Vehicle created successfully',
      data: vehicle,
    };
  }
}
