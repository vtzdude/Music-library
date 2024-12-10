import { Module } from '@nestjs/common';
import { CommonProviders } from 'src/database/common.provider';
import { DatabaseModule } from 'src/database/database.module';
import { JwtAuthModule } from 'src/utils/jwt/jwt.module';
import { SessionModule } from 'src/api/session/session.module';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';

@Module({
  imports: [DatabaseModule, JwtAuthModule, SessionModule],
  controllers: [ArtistsController],
  providers: [ArtistsService, ...CommonProviders],
  exports: [],
})
export class ArtistModule {}
