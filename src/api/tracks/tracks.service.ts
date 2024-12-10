import { Inject, Injectable, Logger } from '@nestjs/common';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { RESPONSES } from 'src/utils/res-code';
import { RES_MSG } from 'src/utils/response-message';
import { databaseProviders } from 'src/database/database.providers';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import CustomError from 'src/utils/error.custom';
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

  /**
   * Adds a new track to the database after verifying the associated album exists.
   * Rolls back the transaction if any validation fails.
   * @param data AddTrackDto - Data for the track to be added.
   * @returns PromiseResolve - The result of the track creation process.
   */
  async addTrack(data: AddTrackDto): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Verifying if the album exists for the given artist and album ID
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

      // Checking if the track already exists in the specified album
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

      // Creating the track in the database
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

  /**
   * Fetches all tracks with the option to filter by artist, album, or visibility (hidden status).
   * Supports pagination with limit and offset parameters.
   * @param limit number - The number of tracks to fetch.
   * @param offset number - The offset to fetch tracks from.
   * @param artist_id string - Optional filter for artist ID.
   * @param album_id string - Optional filter for album ID.
   * @param hidden boolean - Optional filter for visibility (hidden or not).
   * @returns PromiseResolve - The result of the track fetch operation with paginated data.
   */
  async getAllTracks(limit: number, offset: number, artist_id?: string, album_id?: string, hidden?: boolean): Promise<PromiseResolve> {
    try {
      const whereCondition: any = {};

      // Adding filter conditions based on optional parameters
      if (!!artist_id) {
        whereCondition.artist_id = artist_id;
      }
      if (!!album_id) {
        whereCondition.album_id = album_id;
      }
      if (!!hidden) {
        whereCondition.hidden = hidden;
      }

      // Fetching tracks with pagination and filter conditions
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

      // Casting hidden field from tinyint to boolean
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

  /**
   * Retrieves a single track by its ID.
   * @param track_id string - The ID of the track to fetch.
   * @returns PromiseResolve - The result of fetching the track.
   */
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

  /**
   * Updates an existing track's information after verifying the associated artist and album.
   * Rolls back the transaction if any validation fails.
   * @param data UpdateTrackDto - Data to update the track.
   * @param track_id string - The ID of the track to be updated.
   * @returns PromiseResolve - The result of the track update operation.
   */
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

      // Verifying if the artist and album are associated
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

      // Updating the track information in the database
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

  /**
   * Deletes a track by its ID.
   * Rolls back the transaction if any error occurs during the deletion.
   * @param track_id string - The ID of the track to be deleted.
   * @returns PromiseResolve - The result of the track deletion operation.
   */
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

      // Deleting the track from the database
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
