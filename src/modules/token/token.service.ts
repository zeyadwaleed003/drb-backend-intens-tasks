import { createHash } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { Env } from 'src/config/env.validation';
import { RefreshTokenPayload } from './token.types';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly i18n: I18nService
  ) {}

  private I18N = {
    ACCESS_TOKEN_INVALID: 'exceptions.ACCESS_TOKEN_INVALID',
    REFRESH_TOKEN_INVALID: 'exceptions.REFRESH_TOKEN_INVALID',
  };

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private compareHashedToken(
    token: string,
    hashedToken: string | undefined
  ): boolean {
    return this.hashToken(token) === hashedToken;
  }

  private async generateToken<T extends object>(
    payload: T,
    secret: string,
    expiresIn: string
  ) {
    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    } as JwtSignOptions);
  }

  async generateAccessToken(payload: object) {
    return await this.generateToken<object>(
      payload,
      this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN')
    );
  }

  async generateRefreshToken(payload: RefreshTokenPayload) {
    const refreshToken = await this.generateToken<RefreshTokenPayload>(
      payload,
      this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN')
    );

    await this.userModel.updateOne(
      { _id: payload._id },
      { refreshToken: this.hashToken(refreshToken) }
    );

    return refreshToken;
  }

  async verifyToken<T extends object>(
    token: string,
    secret: string
  ): Promise<T> {
    return await this.jwtService.verifyAsync(token, {
      secret,
    });
  }

  async verifyAccessToken(token: string) {
    try {
      return await this.verifyToken<UserDocument>(
        token,
        this.configService.get<string>('ACCESS_TOKEN_SECRET')
      );
    } catch {
      throw new UnauthorizedException(
        this.i18n.t(this.I18N.ACCESS_TOKEN_INVALID)
      );
    }
  }

  async verifyRefreshToken(
    token: string,
    userRefreshToken?: string | undefined
  ) {
    try {
      const verifiedRefreshToken = await this.verifyToken<RefreshTokenPayload>(
        token,
        this.configService.get<string>('REFRESH_TOKEN_SECRET')
      );

      if (!userRefreshToken)
        userRefreshToken = (
          await this.userModel
            .findById(verifiedRefreshToken._id)
            .select('+refreshToken')
            .lean()
        )?.refreshToken;

      const isValid = this.compareHashedToken(token, userRefreshToken);
      if (!isValid)
        throw new UnauthorizedException(
          this.i18n.t(this.I18N.REFRESH_TOKEN_INVALID)
        );

      return verifiedRefreshToken;
    } catch {
      throw new UnauthorizedException(
        this.i18n.t(this.I18N.REFRESH_TOKEN_INVALID)
      );
    }
  }
}
