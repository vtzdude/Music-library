import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'src/config/config';
import { Session } from 'src/database/models/session.model';
import CustomError from 'src/utils/error.custom';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { RESPONSES } from 'src/utils/res-code';
import { RES_MSG } from 'src/utils/response-message';

@Injectable()
export class SessionService {
  constructor(@Inject('SESSION') private readonly sessionRepository: typeof Session) {}

  async createSession(userId: string, token: string): Promise<PromiseResolve> {
    try {
      const sessionCount: number = await this.sessionRepository.count({ where: { user_id: userId } });

      //deleting the last sessions if count exceed the env amount
      if (sessionCount === +CONFIG.allowedSessions) {
        const findSession: Session = await this.sessionRepository.findOne({ where: { user_id: userId } });
        if (!findSession) throw new CustomError(RES_MSG.DATA_FETCH_ERROR, RESPONSES.BADREQUEST);

        await findSession.destroy();
      }

      //creating the new session
      const create: Session = await this.sessionRepository.create({
        user_id: userId,
        token: token,
      });

      if (!create) throw new CustomError(RES_MSG.CREATE_ERROR, RESPONSES.BADREQUEST);

      return {
        status: RESPONSES.SUCCESS,
        error: false,
        message: RES_MSG.DATA_SUCCESS,
      };
    } catch (error: any) {
      Logger.error(error, 'Error in createSession');

      return {
        status: RESPONSES.BADREQUEST,
        error: true,
        message: error.message || RES_MSG.SMTH_WRNG,
      };
    }
  }

  async validateSession(userId: string, token: string): Promise<boolean> {
    try {
      //finding sessions
      const findSession: Session = await this.sessionRepository.findOne({ where: { user_id: userId, token: token } });
      if (findSession) return true;
      return false;
    } catch (error: any) {
      Logger.error(error, 'error in validateSessions');
      return false;
    }
  }

  async deleteSession(userId: string, token: string): Promise<boolean> {
    try {
      //deleting session
      const delSession: number = await this.sessionRepository.destroy({ where: { user_id: userId, token: token } });
      if (delSession) return true;
      return false;
    } catch (error: any) {
      Logger.error(error, 'Error in deleteSession');
      return false;
    }
  }

  async deleteAllSessions(userId: string): Promise<boolean> {
    try {
      const sessions: number = await this.sessionRepository.destroy({ where: { user_id: userId } });
      if (!sessions) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      return true;
    } catch (error) {
      Logger.error(error, 'error in getAllSessions');
      return false;
    }
  }
}
