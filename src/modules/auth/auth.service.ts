import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import { APIResponse } from 'src/common/types/api.types';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private tokenService: TokenService
  ) {}

  async register(registerDto: RegisterDto): Promise<APIResponse> {
    const exist = await this.userModel.exists({ email: registerDto.email });
    if (exist)
      throw new ConflictException('An account with this email already exists');

    const userDoc = await this.userModel.create(registerDto);
    const user = userDoc.toJSON();

    const accessToken = await this.tokenService.generateAccessToken(user);
    return {
      data: user,
      accessToken,
    };
  }
}
