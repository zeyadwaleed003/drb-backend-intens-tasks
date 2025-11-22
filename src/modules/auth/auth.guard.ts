import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../token/token.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractTokenFromHeader(req);

    if (!accessToken)
      throw new UnauthorizedException('Access token is missing or invalid');

    try {
      // Access token verification and checking if a user existed with this access token
      const payload = await this.tokenService.verifyAccessToken(accessToken);

      const user = await this.userModel.findById(payload._id);
      if (!user)
        throw new UnauthorizedException('Access token is invalid or expired');

      // refresh token verification and checking if the same user with the access token had the same provided refresh token
      const { refreshToken } = req.cookies;
      if (!refreshToken)
        throw new UnauthorizedException('Refresh token is invalid or expired');

      await this.tokenService.verifyRefreshToken(
        refreshToken,
        user.refreshToken
      );

      req.user = user;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof UnauthorizedException) throw err;

      throw new UnauthorizedException(
        'Access/Refresh token is invalid or expired'
      );
    }

    return true;
  }
}
