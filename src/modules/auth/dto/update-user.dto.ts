import { PartialType, PickType } from '@nestjs/swagger';
import { RegisterDto } from './register.dto';

// Used swagger stuff here to automatically generate API documentation
export class UpdateUserDto extends PartialType(
  PickType(RegisterDto, ['name', 'email', 'phoneNumber'])
) {}
