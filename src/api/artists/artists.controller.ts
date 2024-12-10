import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { failResponse, successResponse } from 'src/utils/response';
import { RES_MSG } from 'src/utils/response-message';
import { RESPONSES } from 'src/utils/res-code';
import { CONFIG } from 'src/config/config';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { JwtAuthGuard, JwtRolesGuard } from 'src/utils/jwt/jwt.guard';
import { Roles } from 'src/utils/decorators/decorator';
import { ArtistsService } from './artists.service';
import { AddArtistDto, UpdateArtistDto } from './dto/artists.dto';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistService: ArtistsService) {}

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Post('/add-artist')
  async addArtist(@Req() req: any, @Res() res: any, @Body() data: AddArtistDto): Promise<any> {
    try {
      const newArtist: PromiseResolve = await this.artistService.addArtist(data);
      if (newArtist.error) return failResponse(true, newArtist.message, res, newArtist.status);
      return successResponse(newArtist.message, newArtist.data, res, newArtist.status);
    } catch (error) {
      Logger.error(error.message, 'error in addArtist');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllArtists(@Req() req: any, @Res() res: any, @Query('limit') limit = CONFIG.pageLimit, @Query('offset') offset = 0, @Query('grammy') grammy?: number, @Query('hidden') hidden?: boolean) {
    try {
      const artists: PromiseResolve = await this.artistService.getAllArtists(limit, offset, grammy, hidden);
      if (artists.error) return failResponse(true, artists.message, res, artists.status);
      return successResponse(artists.message, artists.data, res, artists.status);
    } catch (error) {
      Logger.error(error.message, 'error in getAllArtists');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:artist_id')
  async getArtist(@Req() req: any, @Res() res: any, @Param('artist_id') artist_id: string) {
    try {
      const artist: PromiseResolve = await this.artistService.getArtist(artist_id);
      if (artist.error) return failResponse(true, artist.message, res, artist.status);
      return successResponse(artist.message, artist.data, res, artist.status);
    } catch (error) {
      Logger.error(error.message, 'error in getArtist');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Put('/:artist_id')
  //API to update artists
  public async updateArtist(@Req() req: any, @Res() response: any, @Body() data: UpdateArtistDto, @Param('artist_id') artist_id: string): Promise<any> {
    try {
      const updateArtist: PromiseResolve = await this.artistService.updateArtist(data, artist_id);
      if (updateArtist.error) return failResponse(true, updateArtist.message, response, updateArtist.status);
      return successResponse(updateArtist.message, updateArtist.data, response, updateArtist.status);
    } catch (error: any) {
      Logger.error(error.message, 'Error in updateArtist');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Delete('/:artist_id')
  async deleteArtist(@Req() req: any, @Res() response: any, @Param('artist_id') artist_id: string): Promise<any> {
    try {
      const deleteArtist: PromiseResolve = await this.artistService.deleteArtist(artist_id);
      if (deleteArtist.error) return failResponse(true, deleteArtist.message, response, deleteArtist.status);
      return successResponse(deleteArtist.message, deleteArtist.data, response, RESPONSES.SUCCESS);
    } catch (error: any) {
      Logger.error(error.message, 'Error in deleteArtist');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }
}
