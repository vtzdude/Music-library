import { Module } from '@nestjs/common';
import { CommonProviders } from 'src/database/common.provider';
import { DatabaseModule } from 'src/database/database.module';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { JwtAuthModule } from 'src/utils/jwt/jwt.module';

@Module({
  imports: [DatabaseModule, JwtAuthModule],
  controllers: [FavoritesController],
  providers: [FavoritesService, ...CommonProviders],
  exports: [],
})
export class FavoritesModule {}
