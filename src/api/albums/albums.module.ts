import { Module } from '@nestjs/common';
import { CommonProviders } from 'src/database/common.provider';
import { DatabaseModule } from 'src/database/database.module';
import { JwtAuthModule } from 'src/utils/jwt/jwt.module';
import { SessionModule } from 'src/api/session/session.module';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';

@Module({
  imports: [DatabaseModule, JwtAuthModule, SessionModule],
  controllers: [AlbumsController],
  providers: [AlbumsService, ...CommonProviders],
  exports: [],
})
export class AlbumModule {}
