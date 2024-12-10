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

  // Mapping category names to respective repositories (Album, Artist, Track)
  private repositoryMap = {
    album: this.albumRepository,
    artist: this.artistRepository,
    track: this.trackRepository,
  };

  /**
   * Service function to add a favorite item (album, artist, or track) for a user.
   * @param data AddFavoriteDto - The data containing the favorite item details (item_id, category).
   * @param userId string - The ID of the user adding the favorite.
   * @returns PromiseResolve - The result of the operation, either success or failure.
   */
  async addFavorite(data: AddFavoriteDto, userId: string): Promise<PromiseResolve> {
    // Begin transaction
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const repository = this.repositoryMap[data.category]; // Choose the repository based on the category (album/artist/track)

      // Check if the item exists in the chosen repository
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

      // Check if the item is already marked as a favorite for the user
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

      // Add the favorite to the database
      const addFavorite: Favorite = await this.favoriteRepository.create({ item_id: data.item_id, category: data.category, user_id: userId }, { transaction });
      if (!addFavorite) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);

      // Commit the transaction after success
      await transaction.commit();
      return {
        error: false,
        message: RES_MSG.FAVORITE.CREATE_SUCCESS,
        data: null,
        status: RESPONSES.CREATED,
      };
    } catch (error) {
      // Rollback transaction if any error occurs
      await transaction.rollback();
      Logger.error('error in addFavorite', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }

  /**
   * Service function to fetch a list of favorites for a user based on category (album/artist/track).
   * @param category string - The category of favorites to fetch (album, artist, or track).
   * @param limit number - The number of favorites to fetch per page.
   * @param offset number - The offset (starting point) for pagination.
   * @param userId string - The ID of the user whose favorites are being fetched.
   * @returns PromiseResolve - The result of the operation with a list of favorites.
   */
  async getFavorite(category: string, limit: number, offset: number, userId: string): Promise<PromiseResolve> {
    try {
      // Map the category to the respective model (Album, Artist, or Track)
      const categoryModelMap = {
        album: Album,
        artist: Artist,
        track: Track,
      };

      // Fetch the favorites list for the user based on the category
      const favorite: { rows: Favorite[]; count: number } = await this.favoriteRepository.findAndCountAll({
        where: { category, user_id: userId },
        include: [
          {
            model: categoryModelMap[category], // Include the related item (album, artist, or track)
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

  /**
   * Service function to delete a user's favorite item.
   * @param favorite_id string - The ID of the favorite item to be deleted.
   * @returns PromiseResolve - The result of the operation, either success or failure.
   */
  async deleteFavorite(favorite_id: string): Promise<PromiseResolve> {
    // Begin transaction
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Fetch the favorite record from the database
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

      // Delete the favorite record
      const deleteFavorite: number = await this.favoriteRepository.destroy({ where: { id: favorite_id }, transaction });
      if (!deleteFavorite) throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);

      // Commit the transaction after success
      await transaction.commit();
      return {
        error: false,
        status: RESPONSES.SUCCESS,
        message: RES_MSG.FAVORITE.DELETE_SUCCESS,
        data: null,
      };
    } catch (error) {
      // Rollback transaction if any error occurs
      await transaction.rollback();
      Logger.error('error in deleteFavorite', error);
      throw new CustomError(RES_MSG.SMTH_WRNG, RESPONSES.BADREQUEST);
    }
  }
}
