import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { APIResponse, QueryString } from 'src/common/types/api.types';
import ApiFeatures from 'src/common/utils/ApiFeatures';
import { VehicleStatus } from './vehicles.enums';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';

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

  async find(q: QueryString): Promise<APIResponse> {
    const { status, ...qs } = q;

    let queryFilter: FilterQuery<VehicleDocument> = {};
    if (status === VehicleStatus.ASSIGNED)
      queryFilter = { driverId: { $ne: null } };
    else if (status === VehicleStatus.UNASSIGNED)
      queryFilter = { driverId: null };

    const vehicles = await new ApiFeatures<VehicleDocument>(
      this.vehicleModel.find(queryFilter),
      qs
    )
      .sort()
      .limitFields()
      .paginate()
      .filter()
      .exec();

    return {
      size: vehicles.length,
      data: vehicles,
    };
  }

  async findById(id: ObjectId): Promise<APIResponse> {
    const vehicle = await this.vehicleModel.findById(id).populate('driver');
    if (!vehicle) throw new NotFoundException('No vehicle found with that id');

    return {
      data: vehicle,
    };
  }

  async update(
    id: ObjectId,
    updateVehicleDto: UpdateVehicleDto
  ): Promise<APIResponse> {
    // If driver id was provided ... need to check if the driver existed
    if (
      updateVehicleDto.driverId &&
      !(await this.userModel.exists({ _id: updateVehicleDto.driverId }))
    )
      throw new NotFoundException(
        `Driver with ID ${updateVehicleDto.driverId} not found`
      );

    const vehicle = await this.vehicleModel.findByIdAndUpdate(
      id,
      updateVehicleDto,
      {
        new: true,
        runValidators: true,
      }
    );
    // Need to make sure the provided vehicle id is correct
    if (!vehicle) throw new NotFoundException('No vehicle found with that id');

    return {
      data: vehicle,
    };
  }

  async delete(id: ObjectId): Promise<APIResponse> {
    await this.vehicleModel.findByIdAndDelete(id);

    return {
      message: 'Vehicle deleted successfully',
    };
  }

  async assignDriverToVehicle(
    vehicleId: ObjectId,
    dto: AssignDriverDto
  ): Promise<APIResponse> {
    // Check if the driver existed
    if (!(await this.userModel.exists({ _id: dto.driverId })))
      throw new NotFoundException(`Driver with ID ${dto.driverId} not found`);

    // Check if the driver is already assigned to another vehicle
    if (await this.vehicleModel.exists({ driverId: dto.driverId }))
      throw new ConflictException(
        `Driver with ID ${dto.driverId} is already assigned to another vehicle`
      );

    const vehicle = await this.vehicleModel
      .findByIdAndUpdate(vehicleId, dto, { new: true, runValidators: true })
      .lean();

    // Check if no vehicle with the provided vehicle id
    if (!vehicle) throw new NotFoundException('No vehicle found with that id');

    return {
      data: vehicle,
    };
  }

  async unassignDriverFromVehicle(vehicleId: ObjectId): Promise<APIResponse> {
    const vehicle = await this.vehicleModel.findById(vehicleId);

    // Check if vehicle existed
    if (!vehicle) throw new NotFoundException('No vehicle found with that id');

    // Check if no driver assigned to that vehicle
    if (!vehicle.driverId)
      throw new ConflictException(
        'No driver is currently assigned to this vehicle'
      );

    // Unassigned = update the driver id to be null
    vehicle.driverId = null;
    await vehicle.save();

    return {
      data: vehicle,
    };
  }
}
