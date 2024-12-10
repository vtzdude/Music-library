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
import { AddAlbumDto, UpdateAlbumDto } from './dto/albums.dto';
import { Album } from 'src/database/models/album.model';

@Injectable()
export class AlbumsService {
  constructor(
    @Inject('ALBUM') private readonly albumRepository: typeof Album,
    @Inject('ARTIST') private readonly artistRepository: typeof Artist,
    @Inject(databaseProviders[0].provide)
    private readonly sequelize: Sequelize,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  /**
   * Service function to add a new album to the database.
   *
   * @param data - The album data for creating the album (AddAlbumDto).
   * @returns PromiseResolve - Result indicating the success or failure of the operation.
   */
  async addAlbum(data: AddAlbumDto): Promise<PromiseResolve> {
    // Initialize Sequelize transaction
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Check if the artist exists in the database
      const getArtist: Artist = await this.artistRepository.findOne({ where: { id: data.artist_id } });
      if (!getArtist) {
        await transaction.rollback(); // Rollback transaction if artist not found
        return {
          error: true,
          message: RES_MSG.ALBUM.NOT_FOUND,
          status: RESPONSES.NOTFOUND,
          data: null,
        };
      }

      // Check if the album already exists for the artist with the same name and year
      const getAlbum: Album = await this.albumRepository.findOne({ where: { artist_id: data.artist_id, name: data.name, year: data.year } });
      if (getAlbum) {
        await transaction.rollback(); // Rollback transaction if album exists
        return {
          error: true,
          message: RES_MSG.ALBUM.ALREADY_EXISTS,
          status: RESPONSES.CONFLICT,
          data: null,
        };
      }

      // Create the new album in the database
      const createAlbum: Album = await this.albumRepository.create({ ...data }, { transaction });
      if (!createAlbum) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);

      // Commit transaction after successful album creation
      await transaction.commit();

      // Return success response
      return {
        error: false,
        status: RESPONSES.CREATED,
        message: RES_MSG.ALBUM.CREATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback(); // Rollback transaction in case of an error
      Logger.error('error in addAlbum', error); // Log the error for debugging
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Retrieves all albums from the database with optional filters for artist_id and hidden status.
   *
   * @param limit - The number of albums to retrieve.
   * @param offset - The offset for pagination.
   * @param artist_id - Optional filter for artist ID.
   * @param hidden - Optional filter for album visibility.
   * @returns PromiseResolve - The albums data including total count and album rows.
   */
  async getAllAlbums(limit: number, offset: number, artist_id?: string, hidden?: boolean): Promise<PromiseResolve> {
    try {
      const whereCondition: any = {};

      // Apply filter for artist_id if provided
      if (!!artist_id) {
        whereCondition.artist_id = artist_id;
      }

      // Apply filter for hidden status if provided
      if (!!hidden) {
        whereCondition.hidden = hidden;
      }

      // Fetch albums from the database
      const albums: { rows: Album[]; count: number } = await this.albumRepository.findAndCountAll({
        where: whereCondition,
        include: {
          model: Artist, // Include artist data in the result
          attributes: [],
        },
        limit: Number(limit),
        offset: Number(offset),
        attributes: ['name', ['id', 'album_id'], 'year', 'hidden', [Sequelize.col('artist.name'), 'artist_name']],
      });

      // Cast hidden field to boolean (Sequelize stores boolean as tinyint)
      const transformedRows = albums.rows.map((album) => album.toJSON());

      // Return success response with transformed data
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ALBUM.FETCH_SUCCESS,
        data: { rows: transformedRows, count: albums.count },
      };
    } catch (error) {
      Logger.error('error in getAllAlbums', error); // Log error
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Retrieves a specific album by its ID from the database.
   *
   * @param album_id - The ID of the album to retrieve.
   * @returns PromiseResolve - The album data or a not found error.
   */
  async getAlbum(album_id: string): Promise<PromiseResolve> {
    try {
      // Fetch album by ID along with artist data
      const album: Album = await this.albumRepository.findOne({
        where: { id: album_id },
        include: {
          model: Artist, // Include artist data in the result
          attributes: [],
        },
        attributes: ['name', ['id', 'album_id'], 'year', 'hidden', [Sequelize.col('artist.name'), 'artist_name']], // Select specific attributes
      });

      // Return error if album not found
      if (!album) {
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ALBUM.NOT_FOUND,
          data: null,
        };
      }

      // Return success response with album data
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ALBUM.RETRIEVE_SUCCESS,
        data: album.toJSON(),
      };
    } catch (error) {
      Logger.error('error in getAlbum', error); // Log error
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Updates an existing album in the database.
   *
   * @param data - The album data to update (UpdateAlbumDto).
   * @param album_id - The ID of the album to update.
   * @returns PromiseResolve - Result indicating the success or failure of the update operation.
   */
  async updateAlbum(data: UpdateAlbumDto, album_id: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Check if the album exists in the database
      const album: Album = await this.albumRepository.findOne({ where: { id: album_id }, raw: true });
      if (!album) {
        await transaction.rollback(); // Rollback transaction if album not found
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ALBUM.NOT_FOUND,
          data: null,
        };
      }

      // If artist_id is provided, verify the artist exists
      if (!!data.artist_id) {
        const artist: Artist = await this.artistRepository.findOne({ where: { id: data.artist_id }, raw: true });
        if (!artist) {
          await transaction.rollback(); // Rollback transaction if artist not found
          return {
            error: true,
            status: RESPONSES.NOTFOUND,
            message: RES_MSG.ARTIST.NOT_FOUND,
            data: null,
          };
        }
      }

      // Update the album details in the database
      const updateAlbum: [affectedCount: number] = await this.albumRepository.update({ ...data }, { where: { id: album_id } });
      if (!updateAlbum[0]) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);

      // Commit the transaction after successful update
      await transaction.commit();

      // Return success response
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ALBUM.UPDATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback(); // Rollback transaction in case of error
      Logger.error('error in updateAlbum', error); // Log error
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Deletes an album from the database by its ID.
   *
   * @param album_id - The ID of the album to delete.
   * @returns PromiseResolve - Result indicating the success or failure of the delete operation.
   */
  async deleteAlbum(album_id: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Check if the album exists in the database
      const album: Album = await this.albumRepository.findOne({ where: { id: album_id }, raw: true });
      if (!album) {
        await transaction.rollback(); // Rollback transaction if album not found
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ALBUM.NOT_FOUND,
          data: null,
        };
      }

      // Delete the album from the database
      const deleteAlbum: number = await this.albumRepository.destroy({ where: { id: album_id }, transaction });
      if (!deleteAlbum) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);

      // Commit transaction after successful deletion
      await transaction.commit();

      // Return success response
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ALBUM.DELETE_SUCCESS(album.name),
        data: null,
      };
    } catch (error) {
      await transaction.rollback(); // Rollback transaction in case of error
      Logger.error('error in deleteAlbum', error); // Log error
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }
}
