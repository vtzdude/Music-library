import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, Req, Res, Response, UseGuards } from '@nestjs/common';
import { failResponse, successResponse } from 'src/utils/response';
import { RES_MSG } from 'src/utils/response-message';
import { RESPONSES } from 'src/utils/res-code';
import { CONFIG } from 'src/config/config';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { JwtAuthGuard, JwtRolesGuard } from 'src/utils/jwt/jwt.guard';
import { Roles } from 'src/utils/decorators/decorator';
import { AlbumsService } from './albums.service';
import { AddAlbumDto, UpdateAlbumDto } from './dto/albums.dto';

//Albums controller for managuing CRUD operations on Albums
@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Post('/add-album')
  async addAlbum(@Req() req: any, @Res() res: any, @Body() data: AddAlbumDto): Promise<any> {
    try {
      const newAlbum: PromiseResolve = await this.albumsService.addAlbum(data);
      if (newAlbum.error) return failResponse(true, newAlbum.message, res, newAlbum.status);
      return successResponse(newAlbum.message, newAlbum.data, res, newAlbum.status);
    } catch (error) {
      Logger.error(error.message, 'error in addAlbum');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllAlbums(@Req() req: any, @Res() res: any, @Query('limit') limit = CONFIG.pageLimit, @Query('offset') offset = 0, @Query('artist_id') artist_id?: string, @Query('hidden') hidden?: boolean) {
    try {
      const albums: PromiseResolve = await this.albumsService.getAllAlbums(limit, offset, artist_id, hidden);
      if (albums.error) return failResponse(true, albums.message, res, albums.status);
      return successResponse(albums.message, albums.data, res, albums.status);
    } catch (error) {
      Logger.error(error.message, 'error in getAllAlbums');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:album_id')
  async getAlbum(@Req() req: any, @Res() res: any, @Param('album_id') album_id: string) {
    try {
      const album: PromiseResolve = await this.albumsService.getAlbum(album_id);
      if (album.error) return failResponse(true, album.message, res, album.status);
      return successResponse(album.message, album.data, res, album.status);
    } catch (error) {
      Logger.error(error.message, 'error in getArtist');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Put('/:album_id')
  //API to update artists
  public async updateAlbum(@Req() req: any, @Res() response: any, @Body() data: UpdateAlbumDto, @Param('album_id') album_id: string): Promise<any> {
    try {
      const updateAlbum: PromiseResolve = await this.albumsService.updateAlbum(data, album_id);
      if (updateAlbum.error) return failResponse(true, updateAlbum.message, response, updateAlbum.status);
      return successResponse(updateAlbum.message, updateAlbum.data, response, RESPONSES.SUCCESS);
    } catch (error: any) {
      Logger.error(error.message, 'Error in updateAlbum');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Delete('/:album_id')
  async deleteAlbum(@Req() req: any, @Res() response: any, @Param('album_id') album_id: string): Promise<any> {
    try {
      const deleteAlbum: PromiseResolve = await this.albumsService.deleteAlbum(album_id);
      if (deleteAlbum.error) return failResponse(true, deleteAlbum.message, response, deleteAlbum.status);
      return successResponse(deleteAlbum.message, deleteAlbum.data, response, RESPONSES.SUCCESS);
    } catch (error: any) {
      Logger.error(error.message, 'Error in deleteAlbum');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }
}
