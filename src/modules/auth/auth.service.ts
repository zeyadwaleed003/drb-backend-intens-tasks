import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import { APIResponse } from 'src/common/types/api.types';
import { TokenService } from '../token/token.service';
import { LoginDto } from './dto/login.dto';
import { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.validation';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private tokenService: TokenService,
    private configService: ConfigService<Env, true>
  ) {}

  private parseExpiresInMs(expiresIn: string) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid expiresIn format: ${expiresIn}`);

    const value = parseInt(match[1]!, 10);
    const unit = match[2]!;

    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * units[unit]!;
  }

  sendCookie(res: Response, name: string, val: string) {
    const options: CookieOptions = {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: this.configService.get<string>('NODE_ENV') === 'production', // In production cookie will be sent only via HTTPs - encrypted
      maxAge: 7 * 24 * 60 * 60 * 100, // default max age of 7 days
    };

    if (name === 'refreshToken')
      options.maxAge = this.parseExpiresInMs(
        this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN')!
      );

    res.cookie(name, val, options);
  }

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

  async login(loginDto: LoginDto): Promise<APIResponse> {
    const userDoc = await this.userModel.findOne({ email: loginDto.email });

    if (!userDoc || !(await userDoc.comparePassword(loginDto.password)))
      throw new UnauthorizedException('Invalid email or password');

    const user = userDoc.toJSON();

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken({
      _id: user._id as unknown as string,
    });

    return {
      data: user,
      refreshToken,
      accessToken,
    };
  }

  async getCurrentUserProfile(user: UserDocument): Promise<APIResponse> {
    return {
      data: user.toJSON(),
    };
  }

  async updateCurrentUser(
    userId: string,
    updateUserDto: UpdateUserDto
  ): Promise<APIResponse> {
    const user = (await this.userModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      {
        new: true,
        runValidators: true,
      }
    ))!;

    return {
      data: user.toJSON(),
    };
  }

  async changePassword(
    user: UserDocument,
    changePasswordDto: ChangePasswordDto
  ): Promise<APIResponse> {
    if (!(await user.comparePassword(changePasswordDto.currentPassword)))
      throw new UnauthorizedException('Current password is incorrect');

    if (changePasswordDto.newPassword === changePasswordDto.currentPassword)
      throw new BadRequestException(
        'New password must be different from the current password'
      );

    user.password = changePasswordDto.newPassword;
    user.refreshToken = undefined;
    await user.save();

    return {
      message: 'Password Changed Successfully',
    };
  }

  async logout(user: UserDocument): Promise<APIResponse> {
    user.refreshToken = undefined;
    await user.save();

    return {
      message: 'Logged out successfully',
    };
  }
}
