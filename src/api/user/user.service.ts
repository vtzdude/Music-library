import { Inject, Injectable, Logger } from '@nestjs/common';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { updatePasswordDto, UserAddDto, UserLoginpDto, UserSignupDto } from './dto/user.dto';
import { User } from 'src/database/models/user.model';
import { RESPONSES } from 'src/utils/res-code';
import { RES_MSG } from 'src/utils/response-message';
import { databaseProviders } from 'src/database/database.providers';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import CustomError from 'src/utils/error.custom';
import * as bcrypt from 'bcrypt';
import { JwtAuthService } from 'src/utils/jwt/jwt.service';
import { SessionService } from 'src/api/session/session.service';
@Injectable()
export class UserService {
  constructor(
    @Inject('USER') private readonly userRepository: typeof User, // Inject User repository to interact with the User model
    @Inject(databaseProviders[0].provide) // Inject database provider for database interaction
    private readonly sequelize: Sequelize,
    private readonly jwtAuthService: JwtAuthService, // Inject JWT authentication service
    private readonly sessionService: SessionService, // Inject session management service
  ) {}

  /**
   * Adds a new user to the system
   * @param data - UserAddDto containing the user details
   * @returns PromiseResolve - Success or failure response
   */
  async addUser(data: UserAddDto): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Check if the user already exists by email
      const userExist: User = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (userExist) {
        await transaction.rollback(); // Rollback transaction if user exists
        return {
          error: false,
          status: RESPONSES.CONFLICT,
          data: null,
          message: RES_MSG.USER.ALREADY_EXIST,
        };
      }

      // Create new user
      const createUser: User = await this.userRepository.create({ ...data }, { transaction });
      if (!createUser) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit(); // Commit transaction after successful user creation
      return {
        error: false,
        status: RESPONSES.CREATED,
        message: RES_MSG.USER.CREATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback(); // Rollback transaction in case of error
      Logger.error('error in addUser', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Creates an admin user (if no admin exists in the system)
   * @param data - UserSignupDto containing the user signup details
   * @returns PromiseResolve - Success or failure response
   */
  async createUser(data: UserSignupDto): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Check if an admin already exists
      const userExist: User = await this.userRepository.findOne({
        where: { role: 'ADMIN' },
      });
      if (userExist) {
        await transaction.rollback();
        return {
          error: false,
          status: RESPONSES.BADREQUEST,
          data: null,
          message: RES_MSG.ACTION_NOT_ALLOWED,
        };
      }

      // Create the admin user
      const createUser: User = await this.userRepository.create({ ...data, role: 'ADMIN' }, { transaction });
      if (!createUser) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit(); // Commit transaction after successful admin creation
      return {
        error: false,
        status: RESPONSES.CREATED,
        message: RES_MSG.USER.CREATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback(); // Rollback transaction in case of error
      Logger.error('error in createUser', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Retrieves all users with optional role-based filtering
   * @param limit - Pagination limit
   * @param offset - Pagination offset
   * @param role - Optional role filter (e.g. 'USER', 'ADMIN')
   * @returns PromiseResolve - List of users with pagination details
   */
  async getAllUsers(limit: number, offset: number, role?: string): Promise<PromiseResolve> {
    try {
      const whereCondition = role ? { role } : {}; // Apply role filter if provided

      // Fetch users from the database with pagination
      const users: { rows: User[]; count: number } = await this.userRepository.findAndCountAll({
        where: whereCondition,
        limit: Number(limit),
        offset: Number(offset),
        raw: true,
        attributes: ['email', ['id', 'user_id'], 'created_at', 'role'],
      });

      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.USER.RETRIEVE_SUCCESS,
        data: users,
      };
    } catch (error) {
      Logger.error('error in createUser', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Logs in a user by verifying credentials and generating an access token
   * @param data - UserLoginpDto containing login credentials
   * @returns PromiseResolve - Login success with access token or failure message
   */
  async loginUser(data: UserLoginpDto): Promise<PromiseResolve> {
    try {
      // Find user by email
      const loginUser: User = await this.userRepository.findOne({ where: { email: data.email } });
      if (!loginUser) {
        return {
          error: true,
          message: RES_MSG.USER.NOT_FOUND,
          status: RESPONSES.NOTFOUND,
          data: null,
        };
      }

      // Compare provided password with stored hash
      const comparePassword: boolean = await bcrypt.compare(data.password, loginUser.password);
      if (!comparePassword) {
        return {
          error: true,
          message: RES_MSG.USER.INVALID_CREDENTIALS,
          status: RESPONSES.UN_AUTHORIZED,
          data: null,
        };
      }

      // Generate JWT token
      const accesToken: { token: string } = await this.jwtAuthService.createToken({ userId: loginUser.id, role: loginUser.role });
      const createSession: PromiseResolve = await this.sessionService.createSession(loginUser.id, accesToken.token);
      if (!createSession || createSession.error) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);

      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.USER.LOGIN_SUCCESS,
        data: accesToken,
      };
    } catch (error) {
      Logger.error('error in createUser', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Logs out a user by deleting their session
   * @param userId - The user's ID
   * @param token - The user's current session token
   * @returns PromiseResolve - Logout success or failure message
   */
  async logoutUser(userId: string, token: string): Promise<PromiseResolve> {
    try {
      const delSession: boolean = await this.sessionService.deleteSession(userId, token);
      if (!delSession) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.USER.LOGOUT_SUCCESS,
        data: null,
      };
    } catch (error) {
      Logger.error('error in logoutUser', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Updates a user's password
   * @param data - updatePasswordDto containing old and new passwords
   * @param userId - The user's ID
   * @returns PromiseResolve - Password update success or failure
   */
  async updatePassword(data: updatePasswordDto, userId: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Fetch user details
      const user: User = await this.userRepository.findOne({ where: { id: userId }, raw: true, attributes: ['password'] });

      // Compare old password with stored hash
      const comparePassword: boolean = await bcrypt.compare(data.old_password, user.password);
      if (!comparePassword) {
        await transaction.rollback();
        return {
          error: true,
          message: RES_MSG.USER.OLD_PASS_INCORRECT,
          status: RESPONSES.BADREQUEST,
          data: null,
        };
      }

      // Check if new password is the same as the old password
      if (data.old_password === data.new_password) {
        await transaction.rollback();
        return {
          error: true,
          message: RES_MSG.USER.OLD_NEW_PASS_SAME_ERROR,
          status: RESPONSES.BADREQUEST,
          data: null,
        };
      }

      // Update password
      const updatePassword: [affectedCount: number] = await this.userRepository.update({ password: data.new_password }, { where: { id: userId }, transaction, individualHooks: true });
      if (!updatePassword[0]) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.NOCONTENT,
        message: RES_MSG.USER.PASSWORD_CHANGE_SCUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in updatePassword', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Deletes a user from the system
   * @param user_id - The user's ID
   * @returns PromiseResolve - Deletion success or failure
   */
  async deleteUser(user_id: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const user: User = await this.userRepository.findOne({ where: { id: user_id } });
      if (!user) {
        await transaction.rollback();
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.USER.NOT_FOUND,
          data: null,
        };
      }

      if (user.role === 'ADMIN') {
        await transaction.rollback();
        return {
          error: true,
          status: RESPONSES.BADREQUEST,
          message: RES_MSG.ACTION_NOT_ALLOWED,
          data: null,
        };
      }

      // Delete user
      const deleteUser: number = await this.userRepository.destroy({ where: { id: user_id }, transaction });
      if (!deleteUser) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.NOCONTENT,
        message: RES_MSG.USER.DELETE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in deleteUser', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }
}
