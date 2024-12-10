import { Inject, Injectable, Logger } from '@nestjs/common';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { RESPONSES } from 'src/utils/res-code';
import { RES_MSG } from 'src/utils/response-message';
import { databaseProviders } from 'src/database/database.providers';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import CustomError from 'src/utils/error.custom';
import { JwtAuthService } from 'src/utils/jwt/jwt.service';
import { AddArtistDto, UpdateArtistDto } from './dto/artists.dto';
import { Artist } from 'src/database/models/artist.model';
import { BOOLEAN } from 'sequelize';
@Injectable()
export class ArtistsService {
  constructor(
    @Inject('ARTIST') private readonly artistRepository: typeof Artist,
    @Inject(databaseProviders[0].provide)
    private readonly sequelize: Sequelize,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async addArtist(data: AddArtistDto): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const createArtist: Artist = await this.artistRepository.create({ ...data }, { transaction });
      if (!createArtist) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.CREATED,
        message: RES_MSG.ARTIST.CREATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in addArtist', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async getAllArtists(limit: number, offset: number, grammy?: number, hidden?: boolean): Promise<PromiseResolve> {
    try {
      const whereCondition: any = {};

      if (!!grammy) {
        whereCondition.grammy = +grammy;
      }

      if (!!hidden) {
        whereCondition.hidden = hidden;
      }

      const artists: { rows: Artist[]; count: number } = await this.artistRepository.findAndCountAll({
        where: whereCondition,
        limit: Number(limit),
        offset: Number(offset),
        attributes: ['name', ['id', 'artist_id'], 'grammy', 'hidden'],
      });

      //This is done to cast hidden to boolean from tinyint as sequelize stores boolean datatypes as tinynt
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

  async getArtist(artist_id: string): Promise<PromiseResolve> {
    try {
      const artist: Artist = await this.artistRepository.findOne({
        where: { id: artist_id },
        attributes: ['name', ['id', 'artist_id'], 'grammy', 'hidden'],
      });
      if (!artist) {
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ARTIST.NOT_FOUND,
          data: null,
        };
      }
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ARTIST.RETRIEVE_SUCCESS,
        data: artist.toJSON(), //This is done to cast hidden to boolean from tinyint as sequelize stores boolean datatypes as tinynt
      };
    } catch (error) {
      Logger.error('error in getArtist', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async updateArtist(data: UpdateArtistDto, artist_id: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const artist: Artist = await this.artistRepository.findOne({ where: { id: artist_id }, raw: true });
      if (!artist) {
        await transaction.rollback();
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ARTIST.NOT_FOUND,
          data: null,
        };
      }
      const updateArtist: [affectedCount: number] = await this.artistRepository.update({ ...data }, { where: { id: artist_id } });
      if (!updateArtist[0]) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.NOCONTENT,
        message: RES_MSG.ARTIST.UPDATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in updateArtist', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async deleteArtist(artist_id: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const artist: Artist = await this.artistRepository.findOne({ where: { id: artist_id }, raw: true });
      if (!artist) {
        await transaction.rollback();
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ARTIST.NOT_FOUND,
          data: null,
        };
      }

      const deleteArtist: number = await this.artistRepository.destroy({ where: { id: artist_id }, transaction });
      if (!deleteArtist) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ARTIST.DELETE_SUCCESS(artist.name),
        data: { artist_id: artist.id },
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in deleteArtist', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }
}
