import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicles.dto';
import { VehiclesService } from './vehicles.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../users/user.enums';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post('/')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.FM)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new vehicle',
    description:
      'Create a new vehicle in the system. **Requires authentication and ADMIN or FLEET_MANAGER role.**',
  })
  @ApiBody({ type: CreateVehicleDto })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return await this.vehiclesService.create(createVehicleDto);
  }
}
