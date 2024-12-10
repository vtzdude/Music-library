import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { CONFIG } from '../../config/config';
import CustomError from '../error.custom';
import { RES_MSG } from '../response-message';
import { RESPONSES } from '../res-code';
import { Session } from 'src/database/models/session.model';
import { SessionService } from 'src/api/session/session.service';

const expireTime = CONFIG.tokenExpiry;

@Injectable()
export class JwtAuthService extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwtService: JwtService,
    private readonly session: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: CONFIG.jwtSecret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  /*
   * @desc: create token
   * @param: {id}
   * @return: {token}
   */
  async createToken(tokenPayload: object, expiresIn = expireTime): Promise<{ token: string }> {
    try {
      const secret = CONFIG.jwtSecret;
      const token = await this.jwtService.signAsync(tokenPayload, {
        secret,
        expiresIn,
      });

      return {
        token: token,
      };
    } catch (error: any) {
      Logger.error(error, 'error in createToken');
      throw new CustomError(error.message, error.status);
    }
  }

  /**
   * @description verify token and assign user to req
   * @param token
   * @returns {}
   */
  async validate(req: Request & { user: {} }): Promise<any> {
    try {
      const token: string = req.headers['authorization']?.split(' ')[1];
      if (token) {
        const user: { userId: string; role: string } = await this.jwtService.verifyAsync(token);
        if (user) {
          const validateSession: boolean = await this.session.validateSession(user.userId, token);
          if (!validateSession) {
            throw new CustomError(RES_MSG.UNAUTHORIZED, RESPONSES.UN_AUTHORIZED);
          }
        }
        req.user = user;
      }

      return req.user;
    } catch (error: any) {
      throw new CustomError(RES_MSG.UNAUTHORIZED, RESPONSES.UN_AUTHORIZED);
    }
  }
}
