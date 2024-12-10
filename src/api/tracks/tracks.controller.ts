import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, Req, Res, Response, UseGuards } from '@nestjs/common';
import { failResponse, successResponse } from 'src/utils/response';
import { RES_MSG } from 'src/utils/response-message';
import { RESPONSES } from 'src/utils/res-code';
import { CONFIG } from 'src/config/config';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { JwtAuthGuard, JwtRolesGuard } from 'src/utils/jwt/jwt.guard';
import { Roles } from 'src/utils/decorators/decorator';
import { TracksService } from './tracks.service';
import { AddTrackDto, UpdateTrackDto } from './dto/tracks.dto';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Post('/add-track')
  async addTrack(@Req() req: any, @Res() res: any, @Body() data: AddTrackDto): Promise<any> {
    try {
      const newTrack: PromiseResolve = await this.tracksService.addTrack(data);
      if (newTrack.error) return failResponse(true, newTrack.message, res, newTrack.status);
      return successResponse(newTrack.message, newTrack.data, res, newTrack.status);
    } catch (error) {
      Logger.error(error.message, 'error in addTrack');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllTracks(@Req() req: any, @Res() res: any, @Query('limit') limit = CONFIG.pageLimit, @Query('offset') offset = 0, @Query('artist_id') artist_id?: string, @Query('album_id') album_id?: string, @Query('hidden') hidden?: boolean) {
    try {
      const tracks: PromiseResolve = await this.tracksService.getAllTracks(limit, offset, artist_id, album_id, hidden);
      if (tracks.error) return failResponse(true, tracks.message, res, tracks.status);
      return successResponse(tracks.message, tracks.data, res, tracks.status);
    } catch (error) {
      Logger.error(error.message, 'error in getAllTracks');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:track_id')
  async getTrack(@Req() req: any, @Res() res: any, @Param('track_id') track_id: string) {
    try {
      const track: PromiseResolve = await this.tracksService.getTrack(track_id);
      if (track.error) return failResponse(true, track.message, res, track.status);
      return successResponse(track.message, track.data, res, track.status);
    } catch (error) {
      Logger.error(error.message, 'error in getTrack');
      return failResponse(true, RES_MSG.SMTH_WRNG, res, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Put('/:track_id')
  //API to update artists
  public async updateTrack(@Req() req: any, @Res() response: any, @Body() data: UpdateTrackDto, @Param('track_id') track_id: string): Promise<any> {
    try {
      const updateTrack: PromiseResolve = await this.tracksService.updateTrack(data, track_id);
      if (updateTrack.error) return failResponse(true, updateTrack.message, response, updateTrack.status);
      return successResponse(updateTrack.message, updateTrack.data, response, RESPONSES.SUCCESS);
    } catch (error: any) {
      Logger.error(error.message, 'Error in updateTrack');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }

  @UseGuards(JwtRolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Delete('/:track_id')
  async deleteTrack(@Req() req: any, @Res() response: any, @Param('track_id') track_id: string): Promise<any> {
    try {
      const deleteTrack: PromiseResolve = await this.tracksService.deleteTrack(track_id);
      if (deleteTrack.error) return failResponse(true, deleteTrack.message, response, deleteTrack.status);
      return successResponse(deleteTrack.message, deleteTrack.data, response, RESPONSES.SUCCESS);
    } catch (error: any) {
      Logger.error(error.message, 'Error in deleteTrack');
      return failResponse(true, RES_MSG.SMTH_WRNG, response, RESPONSES.BADREQUEST);
    }
  }
}
