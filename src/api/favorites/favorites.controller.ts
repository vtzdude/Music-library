import { Body, Controller, Delete, Get, Logger, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { failResponse, successResponse } from 'src/utils/response';
import { RES_MSG } from 'src/utils/response-message';
import { RESPONSES } from 'src/utils/res-code';
import { CONFIG } from 'src/config/config';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { JwtAuthGuard } from 'src/utils/jwt/jwt.guard';

import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/favorite.dto';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/add-favorite')
  async addFavorite(@Req() req: any, @Res() res: any, @Body() data: AddFavoriteDto): Promise<any> {
    try {
      const userId: string = req.user.userId;
      const newFavroite: PromiseResolve = await this.favoritesService.addFavorite(data, userId);
      if (newFavroite.error) return failResponse(true, newFavroite.message, res, newFavroite.status);
      return successResponse(newFavroite.message, newFavroite.data, res, newFavroite.status);
    } catch (error) {
      Logger.error(error.message, 'error in addFavorite');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getFavorite(@Req() req: any, @Res() res: any, @Query('category') category: string, @Query('limit') limit = CONFIG.pageLimit, @Query('offset') offset = 0) {
    try {
      const userId: string = req.user.userId;
      if (category != 'artist' && category != 'album' && category != 'track') return failResponse(true, RES_MSG.BAD_REQUEST('invalid category type'), res, RESPONSES.BADREQUEST);
      const favorite: PromiseResolve = await this.favoritesService.getFavorite(category.toLowerCase(), +limit, +offset, userId);
      if (favorite.error) return failResponse(true, favorite.message, res, favorite.status);
      return successResponse(favorite.message, favorite.data, res, favorite.status);
    } catch (error) {
      Logger.error(error.message, 'error in getFavorite');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/remove-favorite/:favorite_id')
  async deleteFavorite(@Req() req: any, @Res() response: any, @Param('favorite_id') favorite_id: string): Promise<any> {
    try {
      const deleteFavorite: PromiseResolve = await this.favoritesService.deleteFavorite(favorite_id);
      if (deleteFavorite.error) return failResponse(true, deleteFavorite.message, response, deleteFavorite.status);
      return successResponse(deleteFavorite.message, deleteFavorite.data, response, RESPONSES.SUCCESS);
    } catch (error: any) {
      Logger.error(error.message, 'Error in deleteFavorite');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }
}
