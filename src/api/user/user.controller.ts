import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, Req, Res, Response, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { updatePasswordDto, UserAddDto, UserLoginpDto, UserSignupDto } from './dto/user.dto';
import { failResponse, successResponse } from 'src/utils/response';
import { RES_MSG } from 'src/utils/response-message';
import { RESPONSES } from 'src/utils/res-code';
import { CONFIG } from 'src/config/config';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { JwtAuthGuard, JwtRolesGuard } from 'src/utils/jwt/jwt.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/utils/decorators/decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async createUser(@Req() req: any, @Res() res: any, @Body() data: UserSignupDto): Promise<any> {
    try {
      const newUser: PromiseResolve = await this.userService.createUser(data);
      if (newUser.error) return failResponse(true, newUser.message, res, newUser.status);
      return successResponse(newUser.message, newUser.data, res, newUser.status);
    } catch (error) {
      Logger.error(error.message, 'error in createUser');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN')
  @Post('add-user')
  async addUser(@Req() req: any, @Res() res: any, @Body() data: UserAddDto): Promise<any> {
    try {
      const newUser: PromiseResolve = await this.userService.addUser(data);
      if (newUser.error) return failResponse(true, newUser.message, res, newUser.status);
      return successResponse(newUser.message, newUser.data, res, newUser.status);
    } catch (error) {
      Logger.error(error.message, 'error in addUser');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN')
  @Get()
  async getAllUsers(@Req() req: any, @Res() res: any, @Query('limit') limit = CONFIG.pageLimit, @Query('offset') offset = 0, @Query('role') role?: string) {
    try {
      const users: PromiseResolve = await this.userService.getAllUsers(limit, offset, role);
      if (users.error) return failResponse(true, users.message, res, users.status);
      return successResponse(users.message, users.data, res, users.status);
    } catch (error) {
      Logger.error(error.message, 'error in getAllUsers');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @Post('/login')
  //API for user login
  public async loginUser(@Body() data: UserLoginpDto, @Res() response: any): Promise<any> {
    try {
      const userLogin: PromiseResolve = await this.userService.loginUser(data);
      if (userLogin.error) return failResponse(true, userLogin.message, response, userLogin.status);
      return successResponse(userLogin.message, userLogin.data, response, userLogin.status);
    } catch (error) {
      Logger.error(error.message, 'error in login');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/logout')
  //API to logout the user
  public async logOut(@Req() req: any, @Res() response: any): Promise<any> {
    try {
      //fetching the token fromm request header
      const token: string = req.headers['authorization']?.split(' ')[1];
      const userId: string = req.user.userId;
      const userLogout: PromiseResolve = await this.userService.logoutUser(userId, token);
      if (userLogout.error) return failResponse(true, userLogout.message, response, userLogout.status);
      return successResponse(RES_MSG.USER.LOGOUT_SUCCESS, userLogout.data, response, RESPONSES.SUCCESS);
    } catch (error: any) {
      Logger.error(error.message, 'Error in logout');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update-password')
  //API to logout the user
  public async changePassword(@Req() req: any, @Res() response: any, @Body() data: updatePasswordDto): Promise<any> {
    try {
      //fetching the token fromm request header
      const token: string = req.headers['authorization']?.split(' ')[1];
      const userId: string = req.user.userId;
      const updatePassword: PromiseResolve = await this.userService.updatePassword(data, userId);
      if (updatePassword.error) return failResponse(true, updatePassword.message, response, updatePassword.status);
      return successResponse(updatePassword.message, updatePassword.data, response, updatePassword.status);
    } catch (error: any) {
      Logger.error(error.message, 'Error in logout');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN')
  @Delete('/:user_id')
  async deleteUser(@Req() req: any, @Res() response: any, @Param('user_id') user_id: string): Promise<any> {
    try {
      const deleteUser: PromiseResolve = await this.userService.deleteUser(user_id);
      if (deleteUser.error) return failResponse(true, deleteUser.message, response, deleteUser.status);
      return successResponse(deleteUser.message, deleteUser.data, response, RESPONSES.SUCCESS);
    } catch (error: any) {
      Logger.error(error.message, 'Error in deleteUser');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }
}
