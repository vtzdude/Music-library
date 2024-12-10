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
   *
   * @param data AddAlbumDto
   * @returns PrimiseResolve
   * Service fucntion to add albums
   */
  async addAlbum(data: AddAlbumDto): Promise<PromiseResolve> {
    //Initialize sequelize transaction
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      //Check existing artist
      const getArtist: Artist = await this.artistRepository.findOne({ where: { id: data.artist_id } });
      if (!getArtist) {
        await transaction.rollback();
        return {
          error: true,
          message: RES_MSG.ALBUM.NOT_FOUND,
          status: RESPONSES.NOTFOUND,
          data: null,
        };
      }

      //Check existing album
      const getAlbum: Album = await this.albumRepository.findOne({ where: { artist_id: data.artist_id, name: data.name, year: data.year } });
      if (getAlbum) {
        await transaction.rollback();
        return {
          error: true,
          message: RES_MSG.ALBUM.ALREADY_EXISTS,
          status: RESPONSES.CONFLICT,
          data: null,
        };
      }
      const createAlbum: Album = await this.albumRepository.create({ ...data }, { transaction });
      if (!createAlbum) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.CREATED,
        message: RES_MSG.ALBUM.CREATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in addAlbum', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async getAllAlbums(limit: number, offset: number, artist_id?: string, hidden?: boolean): Promise<PromiseResolve> {
    try {
      const whereCondition: any = {};

      if (!!artist_id) {
        whereCondition.artist_id = artist_id;
      }

      if (!!hidden) {
        whereCondition.hidden = hidden;
      }

      const albums: { rows: Album[]; count: number } = await this.albumRepository.findAndCountAll({
        where: whereCondition,
        include: {
          model: Artist,
          attributes: [],
        },
        limit: Number(limit),
        offset: Number(offset),
        attributes: ['name', ['id', 'album_id'], 'year', 'hidden', [Sequelize.col('artist.name'), 'artist_name']],
      });

      //This is done to cast hidden to boolean from tinyint as sequelize stores boolean datatypes as tinynt
      const transformedRows = albums.rows.map((album) => album.toJSON());
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ALBUM.FETCH_SUCCESS,
        data: { rows: transformedRows, count: albums.count },
      };
    } catch (error) {
      Logger.error('error in getAllAlbums', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async getAlbum(album_id: string): Promise<PromiseResolve> {
    try {
      const album: Album = await this.albumRepository.findOne({
        where: { id: album_id },
        include: {
          model: Artist,
          attributes: [],
        },
        attributes: ['name', ['id', 'album_id'], 'year', 'hidden', [Sequelize.col('artist.name'), 'artist_name']],
      });
      if (!album) {
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ALBUM.NOT_FOUND,
          data: null,
        };
      }
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ALBUM.RETRIEVE_SUCCESS,
        data: album.toJSON(),
      };
    } catch (error) {
      Logger.error('error in getAlbum', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async updateAlbum(data: UpdateAlbumDto, album_id: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const album: Album = await this.albumRepository.findOne({ where: { id: album_id }, raw: true });
      if (!album) {
        await transaction.rollback();
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ALBUM.NOT_FOUND,
          data: null,
        };
      }

      if (!!data.artist_id) {
        const artist: Artist = await this.artistRepository.findOne({ where: { id: data.artist_id }, raw: true });
        if (!artist) {
          await transaction.rollback();
          return {
            error: true,
            status: RESPONSES.NOTFOUND,
            message: RES_MSG.ARTIST.NOT_FOUND,
            data: null,
          };
        }
      }
      const updateAlbum: [affectedCount: number] = await this.albumRepository.update({ ...data }, { where: { id: album_id } });
      if (!updateAlbum[0]) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ALBUM.UPDATE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in updateAlbum', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async deleteAlbum(album_id: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const album: Album = await this.albumRepository.findOne({ where: { id: album_id }, raw: true });
      if (!album) {
        await transaction.rollback();
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.ALBUM.NOT_FOUND,
          data: null,
        };
      }

      const deleteAlbum: number = await this.albumRepository.destroy({ where: { id: album_id }, transaction });
      if (!deleteAlbum) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.ALBUM.DELETE_SUCCESS(album.name),
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in deleteAlbum', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }
}
