import { Inject, Injectable, Logger } from '@nestjs/common';
import { PromiseResolve } from 'src/utils/interfaces/promise-resolve.interface';
import { RESPONSES } from 'src/utils/res-code';
import { RES_MSG } from 'src/utils/response-message';
import { databaseProviders } from 'src/database/database.providers';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import CustomError from 'src/utils/error.custom';
import { AddFavoriteDto } from './dto/favorite.dto';
import { Album } from 'src/database/models/album.model';
import { Artist } from 'src/database/models/artist.model';
import { Track } from 'src/database/models/track.model';
import { Favorite } from 'src/database/models/favorites.model';
import { error } from 'console';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject('ALBUM') private readonly albumRepository: typeof Album,
    @Inject('ARTIST') private readonly artistRepository: typeof Artist,
    @Inject('TRACK') private readonly trackRepository: typeof Track,
    @Inject('FAVORITE') private readonly favoriteRepository: typeof Favorite,
    @Inject(databaseProviders[0].provide)
    private readonly sequelize: Sequelize,
  ) {}
  private repositoryMap = {
    album: this.albumRepository,
    artist: this.artistRepository,
    track: this.trackRepository,
  };
  async addFavorite(data: AddFavoriteDto, userId: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const repository = this.repositoryMap[data.category];

      const getItem: Album = await repository.findOne({ where: { id: data.item_id } });
      if (!getItem) {
        await transaction.rollback();
        return {
          error: true,
          message: RES_MSG.TRACK.NOT_FOUND,
          status: RESPONSES.NOTFOUND,
          data: null,
        };
      }

      const getFavorite: Favorite = await this.favoriteRepository.findOne({ where: { item_id: data.item_id, user_id: userId } });
      if (getFavorite) {
        await transaction.rollback();
        return {
          error: true,
          message: RES_MSG.FAVORITE.ALREADY_EXISTS,
          status: RESPONSES.CONFLICT,
          data: null,
        };
      }

      const addFavorite: Favorite = await this.favoriteRepository.create({ item_id: data.item_id, category: data.category, user_id: userId }, { transaction });
      if (!addFavorite) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        message: RES_MSG.FAVORITE.CREATE_SUCCESS,
        data: null,
        status: RESPONSES.CREATED,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in addFavorite', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async getFavorite(category: string, limit: number, offset: number, userId: string): Promise<PromiseResolve> {
    try {
      const categoryModelMap = {
        album: Album,
        artist: Artist,
        track: Track,
      };
      const favorite: { rows: Favorite[]; count: number } = await this.favoriteRepository.findAndCountAll({
        where: { category, user_id: userId },
        include: [
          {
            model: categoryModelMap[category],
            attributes: [],
          },
        ],
        raw: true,
        limit,
        offset,
        attributes: [['id', 'favorite_id'], 'category', 'created_at', 'item_id', [Sequelize.col(`${category.toLowerCase()}.name`), `${category.toLowerCase()}_name`]],
      });
      if (!favorite) {
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.FAVORITE.NOT_FOUND,
          data: null,
        };
      }
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.FAVORITE.FETCH_SUCCESS,
        data: favorite,
      };
    } catch (error) {
      Logger.error('error in getFavorite', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  async deleteFavorite(favorite_id: string): Promise<PromiseResolve> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const favorite: Favorite = await this.favoriteRepository.findOne({ where: { id: favorite_id }, raw: true });
      if (!favorite) {
        await transaction.rollback();
        return {
          error: true,
          status: RESPONSES.NOTFOUND,
          message: RES_MSG.FAVORITE.NOT_FOUND,
          data: null,
        };
      }

      const deleteFavorite: number = await this.favoriteRepository.destroy({ where: { id: favorite_id }, transaction });
      if (!deleteFavorite) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.FAVORITE.DELETE_SUCCESS,
        data: null,
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('error in deleteFavorite', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }
}
