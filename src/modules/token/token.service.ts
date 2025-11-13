import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Env } from 'src/config/env.validation';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>
  ) {}

  private async generateToken(
    payload: object,
    secret: string,
    expiresIn: string
  ) {
    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    } as JwtSignOptions);
  }

  async generateAccessToken(payload: object) {
    return await this.generateToken(
      payload,
      this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN')
    );
  }
}
