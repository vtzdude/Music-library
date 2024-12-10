import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DatabaseModule } from 'src/database/database.module';
import { ArtistModule } from './artists/artists.module';
import { AlbumModule } from './albums/albums.module';
import { TracksModule } from './tracks/tracks.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [UserModule, DatabaseModule, ArtistModule, AlbumModule, TracksModule, FavoritesModule],
  providers: [],
})
export class ApiModule {}
