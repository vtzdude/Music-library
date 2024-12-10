import { CONFIG } from 'src/config/config';
import { Environment, SEQUELIZE } from 'src/constants/app.contant';
import { databaseConfig } from './database.config';
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/user.model';
import { Track } from './models/track.model';
import { Album } from './models/album.model';
import { Favorite } from './models/favorites.model';
import { Artist } from './models/artist.model';
import { Session } from './models/session.model';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;

      switch (CONFIG.nodeEnv) {
        case Environment.DEVELOPMENT:
          config = databaseConfig.dev;
          break;
        case Environment.STAGING:
          config = databaseConfig.stage;
          break;
        case Environment.PRODUCTION:
          config = databaseConfig.prod;
          break;
        default:
          config = databaseConfig.dev;
      }
      const sequelize = new Sequelize({
        ...config,
        ssl: { rejectUnauthorized: false },
      });
      sequelize.addModels([User, Track, Album, Favorite, Artist, Session]);
      await sequelize.sync({ alter: true });

      return sequelize;
    },
  },
];
