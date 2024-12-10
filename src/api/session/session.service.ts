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

  /**
   * Service function to create a new session for the user. If the number of sessions exceeds the allowed limit,
   * it deletes the oldest session.
   * @param userId string - The ID of the user creating the session.
   * @param token string - The token associated with the session.
   * @returns PromiseResolve - The result of the operation, either success or failure.
   */
  async createSession(userId: string, token: string): Promise<PromiseResolve> {
    try {
      // Count the current number of sessions for the user
      const sessionCount: number = await this.sessionRepository.count({ where: { user_id: userId } });

      // If the number of sessions exceeds the allowed amount, delete the oldest session
      if (sessionCount === +CONFIG.allowedSessions) {
        const findSession: Session = await this.sessionRepository.findOne({ where: { user_id: userId } });
        if (!findSession) throw new CustomError(RES_MSG.DATA_FETCH_ERROR, RESPONSES.BADREQUEST);

        await findSession.destroy(); // Delete the oldest session
      }

      // Create the new session for the user
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
      // Log the error and return a failure response
      Logger.error(error, 'Error in createSession');

      return {
        status: RESPONSES.BADREQUEST,
        error: true,
        message: error.message || RES_MSG.SMTH_WRNG,
      };
    }
  }

  /**
   * Service function to validate if the provided session token is valid for the user.
   * @param userId string - The ID of the user.
   * @param token string - The session token to be validated.
   * @returns boolean - Returns true if the session is valid, false otherwise.
   */
  async validateSession(userId: string, token: string): Promise<boolean> {
    try {
      // Search for the session in the database with the given userId and token
      const findSession: Session = await this.sessionRepository.findOne({ where: { user_id: userId, token: token } });
      if (findSession) return true; // Session found, valid
      return false; // Session not found, invalid
    } catch (error: any) {
      // Log the error and return false for invalid session
      Logger.error(error, 'error in validateSessions');
      return false;
    }
  }

  /**
   * Service function to delete a specific session based on the userId and token.
   * @param userId string - The ID of the user.
   * @param token string - The session token to be deleted.
   * @returns boolean - Returns true if the session is successfully deleted, false otherwise.
   */
  async deleteSession(userId: string, token: string): Promise<boolean> {
    try {
      // Delete the session matching the userId and token
      const delSession: number = await this.sessionRepository.destroy({ where: { user_id: userId, token: token } });
      if (delSession) return true; // Session deleted successfully
      return false; // Session not found or could not be deleted
    } catch (error: any) {
      // Log the error and return false for failure to delete
      Logger.error(error, 'Error in deleteSession');
      return false;
    }
  }

  /**
   * Service function to delete all sessions for a given user.
   * @param userId string - The ID of the user whose sessions need to be deleted.
   * @returns boolean - Returns true if all sessions are successfully deleted, false otherwise.
   */
  async deleteAllSessions(userId: string): Promise<boolean> {
    try {
      // Delete all sessions for the user
      const sessions: number = await this.sessionRepository.destroy({ where: { user_id: userId } });
      if (!sessions) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      return true; // All sessions deleted successfully
    } catch (error) {
      // Log the error and return false if sessions could not be deleted
      Logger.error(error, 'error in getAllSessions');
      return false;
    }
  }
}
