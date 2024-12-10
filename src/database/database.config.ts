import { CONFIG } from 'src/config/config';
import { IDatabaseConfig } from './dbConfig.intefaces';

export const databaseConfig: IDatabaseConfig = {
  dev: {
    username: CONFIG.database.username,
    password: CONFIG.database.password,
    database: CONFIG.database.database,
    host: CONFIG.database.host,
    port: CONFIG.database.port,
    dialect: CONFIG.database.dialect,
    logging: CONFIG.database.logging,
    ssl: CONFIG.database.ssl,
  },
  stage: {
    username: CONFIG.database.username,
    password: CONFIG.database.password,
    database: CONFIG.database.database,
    host: CONFIG.database.host,
    port: CONFIG.database.port,
    dialect: CONFIG.database.dialect,
    ssl: CONFIG.database.ssl,
  },
  prod: {
    username: CONFIG.database.username,
    password: CONFIG.database.password,
    database: CONFIG.database.database,
    host: CONFIG.database.host,
    port: CONFIG.database.port,
    dialect: CONFIG.database.dialect,
    ssl: CONFIG.database.ssl,
  },
};
