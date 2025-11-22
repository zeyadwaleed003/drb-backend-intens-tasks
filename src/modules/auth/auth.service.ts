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
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  private readonly TRANSLATION_KEYS = {
    EMAIL_EXISTS: 'exceptions.EMAIL_EXISTS',
    INVALID_CREDENTIALS: 'exceptions.INVALID_CREDENTIALS',
    CURRENT_PASSWORD_INCORRECT: 'exceptions.CURRENT_PASSWORD_INCORRECT',
    PASSWORD_SAME_AS_CURRENT: 'exceptions.PASSWORD_SAME_AS_CURRENT',
    PASSWORD_CHANGED: 'messages.PASSWORD_CHANGED',
    LOGGED_OUT: 'messages.LOGGED_OUT',
  };

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private tokenService: TokenService,
    private configService: ConfigService<Env, true>,
    private readonly i18n: I18nService
  ) {}

  // This function is responsible for parsing tokens expiration dates into ms. Ex: 15m -> 15 * 60 * 1000ms
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

    // Specific max age for refreshToken cookie ... same refreshToken age
    if (name === 'refreshToken')
      options.maxAge = this.parseExpiresInMs(
        this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN')
      );

    res.cookie(name, val, options);
  }

  async register(registerDto: RegisterDto): Promise<APIResponse> {
    // Check if a user already exists with this email
    const exist = await this.userModel.exists({ email: registerDto.email });
    if (exist)
      throw new ConflictException(
        this.i18n.t(this.TRANSLATION_KEYS.EMAIL_EXISTS)
      );

    const userDoc = await this.userModel.create(registerDto);

    // Sanitize the document to get rid of the sensitive fields
    const user = userDoc.toJSON();

    const accessToken = await this.tokenService.generateAccessToken(user);
    return {
      data: user,
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<APIResponse> {
    const userDoc = await this.userModel.findOne({ email: loginDto.email });

    // If no user with this email or the given password is not correct ... return an error
    if (!userDoc || !(await userDoc.comparePassword(loginDto.password)))
      throw new UnauthorizedException(
        this.i18n.t(this.TRANSLATION_KEYS.INVALID_CREDENTIALS)
      );

    // sanitize
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
    // The user is already logged in ... no database query needed
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
        new: true, // return the new user after update query
        runValidators: true, // run validators on the updated fields
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
    // Check if the given password is correct
    if (!(await user.comparePassword(changePasswordDto.currentPassword)))
      throw new UnauthorizedException(
        this.i18n.t(this.TRANSLATION_KEYS.CURRENT_PASSWORD_INCORRECT)
      );

    // User must not enter the same password as the old one ... this line of code could also implemented using custom decorator in the dto
    if (changePasswordDto.newPassword === changePasswordDto.currentPassword)
      throw new BadRequestException(
        this.i18n.t(this.TRANSLATION_KEYS.PASSWORD_SAME_AS_CURRENT)
      );

    // Update using the save method to run the pre save hooks (I need them)
    user.password = changePasswordDto.newPassword;
    user.refreshToken = undefined;
    await user.save();

    return {
      message: this.i18n.t(this.TRANSLATION_KEYS.PASSWORD_CHANGED),
    };
  }

  async logout(user: UserDocument): Promise<APIResponse> {
    // revoking the refresh token from the user's document will simply log him out ... need to check the user's refresh token validation in the auth guard
    user.refreshToken = undefined;
    await user.save();

    return {
      message: this.i18n.t(this.TRANSLATION_KEYS.LOGGED_OUT),
    };
  }

  async refresh(token: string): Promise<APIResponse> {
    const verifiedToken = await this.tokenService.verifyRefreshToken(token);

    const user = await this.userModel.findById(verifiedToken._id);

    const accessToken = await this.tokenService.generateAccessToken(
      user!.toJSON()
    );

    // Refresh token rotation
    const refreshToken = await this.tokenService.generateRefreshToken({
      _id: verifiedToken._id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
