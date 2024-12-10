import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import CustomError from '../error.custom';
import { RES_MSG } from '../response-message';
import { RESPONSES } from '../res-code';
import { JwtAuthService } from './jwt.service';
import { Reflector } from '@nestjs/core';
import { userInfo } from 'os';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const user = await this.jwtAuthService.validate(request);

      if (!user) throw new CustomError(RES_MSG.UNAUTHORIZED, RESPONSES.UN_AUTHORIZED);
      return user; // Allow the request if validation passes
    } catch (error) {
      throw new HttpException({ message: RES_MSG.UNAUTHORIZED, status: RESPONSES.UN_AUTHORIZED, error: true }, RESPONSES.UN_AUTHORIZED);
    }
  }
}

@Injectable()
export class JwtRolesGuard implements CanActivate {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly reflector: Reflector, // To access metadata
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler()); // Retrieve roles from metadata
    const request = context.switchToHttp().getRequest();

    try {
      const user = await this.jwtAuthService.validate(request);

      if (!user) {
        throw new CustomError(RES_MSG.UNAUTHORIZED, RESPONSES.UN_AUTHORIZED);
      }

      // If roles are specified, check if the user's role is allowed
      if (roles && !roles.includes(user.role)) {
        throw new CustomError(RES_MSG.FORIBIDDEN, RESPONSES.FORBIDDEN);
      }

      return true; // Allow request if user is valid and has an allowed role
    } catch (error) {
      throw new HttpException({ message: error.message || RES_MSG.UNAUTHORIZED, status: error.status || RESPONSES.UN_AUTHORIZED, error: true }, error.status || RESPONSES.UN_AUTHORIZED);
    }
  }
}
