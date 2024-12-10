import { Inject, Injectable, Logger } from '@nestjs/common';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { RESPONSES } from 'src/utils/res-code';
import { RES_MSG } from 'src/utils/response-message';
import { databaseProviders } from 'src/database/database.providers';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import CustomError from 'src/utils/error.custom';
import { AddArtistDto, UpdateArtistDto } from './dto/artists.dto';
import { Artist } from 'src/database/models/artist.model';

@Injectable()
export class ArtistsService {
  constructor(
    @Inject('ARTIST') private readonly artistRepository: typeof Artist, // Inject artist model for CRUD operations
    @Inject(databaseProviders[0].provide)
    private readonly sequelize: Sequelize, // Inject Sequelize for database transactions
  ) {}

  /**
   * Adds a new artist to the database.
   *
   * @param data - The data required to create a new artist (AddArtistDto).
   * @returns PromiseResolve - Result indicating the success or failure of the operation.
   */
  async addArtist(data: AddArtistDto): Promise<PromiseResolve> {
    // Start a transaction for safe database operations
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Create a new artist entry in the database
      const createArtist: Artist = await this.artistRepository.create({ ...data }, { transaction });
      if (!createArtist) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);

      // Commit the transaction after successful creation
      await transaction.commit();

      return {
        error: false,
        status: RESPONSES.CREATED,
        message: RES_MSG.ARTIST.CREATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      // Rollback transaction if any error occurs
      await transaction.rollback();
      Logger.error('error in addArtist', error); // Log the error for debugging
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Retrieves all artists with optional filters for Grammy awards and hidden status.
   *
   * @param limit - The number of artists to retrieve (for pagination).
   * @param offset - The offset for pagination.
   * @param grammy - Optional filter to search for artists with Grammy awards.
   * @param hidden - Optional filter for visibility status of the artist.
   * @returns PromiseResolve - List of artists with pagination info.
   */
  async getAllArtists(limit: number, offset: number, grammy?: number, hidden?: boolean): Promise<PromiseResolve> {
    try {
      const whereCondition: any = {};

      // Apply filters based on optional parameters
      if (!!grammy) {
        whereCondition.grammy = +grammy; // Convert Grammy value to number
      }

      if (!!hidden) {
        whereCondition.hidden = hidden; // Filter based on hidden status
      }

      // Fetch artists with the applied filters, pagination, and selected attributes
      const artists: { rows: Artist[]; count: number } = await this.artistRepository.findAndCountAll({
        where: whereCondition, // Apply the condition to query
        limit: Number(limit),
        offset: Number(offset),
        attributes: ['name', ['id', 'artist_id'], 'grammy', 'hidden'],
      });

      // This is done to cast hidden to boolean from tinyint (Sequelize stores booleans as tinyint)
      const transformedRows = artists.rows.map((artist) => artist.toJSON());

      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ARTIST.FETCH_SUCCESS,
        data: {
          rows: transformedRows,
          count: artists.count,
        },
      };
    } catch (error) {
      Logger.error('error in getAllArtists', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Retrieves a specific artist by their ID.
   *
   * @param artist_id - The ID of the artist to retrieve.
   * @returns PromiseResolve - The artist data or an error if not found.
   */
  async getArtist(artist_id: string): Promise<PromiseResolve> {
    try {
      // Fetch artist by ID with selected attributes
      const artist: Artist = await this.artistRepository.findOne({
        where: { id: artist_id },
        attributes: ['name', ['id', 'artist_id'], 'grammy', 'hidden'],
      });

      // Return error if the artist is not found
      if (!artist) {
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ARTIST.NOT_FOUND,
          data: null,
        };
      }

      // Return success response with artist data
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ARTIST.RETRIEVE_SUCCESS,
        data: artist.toJSON(), // Cast to JSON to handle 'hidden' as boolean
      };
    } catch (error) {
      Logger.error('error in getArtist', error); // Log error
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Updates an existing artist's information.
   *
   * @param data - The data to update the artist (UpdateArtistDto).
   * @param artist_id - The ID of the artist to update.
   * @returns PromiseResolve - Result indicating the success or failure of the update operation.
   */
  async updateArtist(data: UpdateArtistDto, artist_id: string): Promise<PromiseResolve> {
    // Start a transaction for safe database operations
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Check if the artist exists
      const artist: Artist = await this.artistRepository.findOne({ where: { id: artist_id }, raw: true });
      if (!artist) {
        await transaction.rollback(); // Rollback if artist not found
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ARTIST.NOT_FOUND,
          data: null,
        };
      }

      // Update the artist's details
      const updateArtist: [affectedCount: number] = await this.artistRepository.update({ ...data }, { where: { id: artist_id } });
      if (!updateArtist[0]) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);

      // Commit the transaction after successful update
      await transaction.commit();

      return {
        error: false,
        status: RESPONSES.NOCONTENT,
        message: RES_MSG.ARTIST.UPDATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      Logger.error('error in updateArtist', error); // Log error
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Deletes an artist from the database by their ID.
   *
   * @param artist_id - The ID of the artist to delete.
   * @returns PromiseResolve - Result indicating the success or failure of the delete operation.
   */
  async deleteArtist(artist_id: string): Promise<PromiseResolve> {
    // Start a transaction for safe database operations
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Check if the artist exists before attempting deletion
      const artist: Artist = await this.artistRepository.findOne({ where: { id: artist_id }, raw: true });
      if (!artist) {
        await transaction.rollback(); // Rollback if artist not found
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ARTIST.NOT_FOUND,
          data: null,
        };
      }

      // Delete the artist from the database
      const deleteArtist: number = await this.artistRepository.destroy({ where: { id: artist_id }, transaction });
      if (!deleteArtist) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);

      // Commit the transaction after successful deletion
      await transaction.commit();

      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ARTIST.DELETE_SUCCESS(artist.name),
        data: { artist_id: artist.id },
      };
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      Logger.error('error in deleteArtist', error); // Log error
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }
}
