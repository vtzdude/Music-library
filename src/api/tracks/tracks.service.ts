import { Inject, Injectable, Logger } from '@nestjs/common';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { RESPONSES } from 'src/utils/res-code';
import { RES_MSG } from 'src/utils/response-message';
import { databaseProviders } from 'src/database/database.providers';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import CustomError from 'src/utils/error.custom';
import { JwtAuthService } from 'src/utils/jwt/jwt.service';
import { Artist } from 'src/database/models/artist.model';
import { Track } from 'src/database/models/track.model';
import { Album } from 'src/database/models/album.model';
import { AddTrackDto, UpdateTrackDto } from './dto/tracks.dto';
@Injectable()
export class TracksService {
  constructor(
    @Inject('ARTIST') private readonly artistRepository: typeof Artist,
    @Inject('TRACK') private readonly tracksRepository: typeof Track,
    @Inject('ALBUM') private readonly albumRepository: typeof Album,

    @Inject(databaseProviders[0].provide)
    private readonly sequelize: Sequelize,
  ) {}

  async addTrack(data: AddTrackDto): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const getAlbum: Album = await this.albumRepository.findOne({ where: { id: data.album_id, artist_id: data.artist_id } });
      if (!getAlbum) {
        await transaction.rollback();
        return {
          error: true,
          message: RES_MSG.TRACK.NOT_FOUND,
          status: RESPONSES.NOTFOUND,
          data: null,
        };
      }
      const getTrack: Track = await this.tracksRepository.findOne({ where: { album_id: data.album_id, name: data.name } });
      if (getTrack) {
        await transaction.rollback();
        return {
          error: true,
          message: RES_MSG.TRACK.ALREADY_EXISTS,
          status: RESPONSES.CONFLICT,
          data: null,
        };
      }
      const createTrack: Track = await this.tracksRepository.create({ ...data }, { transaction });
      if (!createTrack) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.CREATED,
        message: RES_MSG.TRACK.CREATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in addTrack', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async getAllTracks(limit: number, offset: number, artist_id?: string, album_id?: string, hidden?: boolean): Promise<PromiseResolve> {
    try {
      const whereCondition: any = {};

      if (!!artist_id) {
        whereCondition.artist_id = artist_id;
      }
      if (!!album_id) {
        whereCondition.album_id = album_id;
      }

      if (!!hidden) {
        whereCondition.hidden = hidden;
      }

      const tracks: { rows: Track[]; count: number } = await this.tracksRepository.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Artist,
            attributes: [],
          },
          {
            model: Album,
            attributes: [],
          },
        ],
        limit: Number(limit),
        offset: Number(offset),
        attributes: ['name', ['id', 'track_id'], 'duration', 'hidden', [Sequelize.col('artist.name'), 'artist_name'], [Sequelize.col('album.name'), 'album_name']],
      });

      //This is done to cast hidden to boolean from tinyint as sequelize stores boolean datatypes as tinynt
      const transformedRows = tracks.rows.map((track) => track.toJSON());
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.TRACK.FETCH_SUCCESS,
        data: { rows: transformedRows, count: tracks.count },
      };
    } catch (error) {
      Logger.error('error in getAllTracks', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async getTrack(track_id: string): Promise<PromiseResolve> {
    try {
      const track: Track = await this.tracksRepository.findOne({
        where: { id: track_id },
        include: [
          {
            model: Artist,
            attributes: [],
          },
          {
            model: Album,
            attributes: [],
          },
        ],
        attributes: ['name', ['id', 'track_id'], 'duration', 'hidden', [Sequelize.col('artist.name'), 'artist_name'], [Sequelize.col('album.name'), 'album_name']],
      });
      if (!track) {
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.TRACK.NOT_FOUND,
          data: null,
        };
      }
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.TRACK.RETRIEVE_SUCCESS,
        data: track.toJSON(),
      };
    } catch (error) {
      Logger.error('error in getTrack', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async updateTrack(data: UpdateTrackDto, track_id: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const track: Track = await this.tracksRepository.findOne({ where: { id: track_id }, raw: true });
      if (!track) {
        await transaction.rollback();
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.TRACK.NOT_FOUND,
          data: null,
        };
      }
      if (!!data.artist_id && !!data.album_id) {
        const getAlbum: Album = await this.albumRepository.findOne({ where: { id: data.album_id, artist_id: data.artist_id } });
        if (!getAlbum) {
          await transaction.rollback();
          return {
            error: true,
            message: RES_MSG.BAD_REQUEST('Artist and album are not associated with each other'),
            status: RESPONSES.BADREQUEST,
            data: null,
          };
        }
      }
      if (!!data.artist_id) {
        const getAlbum: Album = await this.albumRepository.findOne({ where: { id: track.album_id, artist_id: data.artist_id } });
        if (!getAlbum) {
          await transaction.rollback();
          return {
            error: true,
            message: RES_MSG.BAD_REQUEST('Artist and album are not associated with each other'),
            status: RESPONSES.BADREQUEST,
            data: null,
          };
        }
      }

      if (!!data.album_id) {
        const getAlbum: Album = await this.albumRepository.findOne({ where: { id: data.album_id, artist_id: track.artist_id } });
        if (!getAlbum) {
          await transaction.rollback();
          return {
            error: true,
            message: RES_MSG.BAD_REQUEST('Artist and album are not associated with each other'),
            status: RESPONSES.BADREQUEST,
            data: null,
          };
        }
      }

      const updateTrack: [affectedCount: number] = await this.tracksRepository.update({ ...data }, { where: { id: track_id } });
      if (!updateTrack[0]) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.TRACK.UPDATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in updateTrack', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async deleteTrack(track_id: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const track: Track = await this.tracksRepository.findOne({ where: { id: track_id }, raw: true });
      if (!track) {
        await transaction.rollback();
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.TRACK.NOT_FOUND,
          data: null,
        };
      }

      const deleteTrack: number = await this.tracksRepository.destroy({ where: { id: track_id }, transaction });
      if (!deleteTrack) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.TRACK.DELETE_SUCCESS(track.name),
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in deleteTrack', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }
}
