import { Module } from '@nestjs/common';
import { CommonProviders } from 'src/database/common.provider';
import { DatabaseModule } from 'src/database/database.module';
import { JwtAuthModule } from 'src/utils/jwt/jwt.module';
import { SessionModule } from 'src/api/session/session.module';
import { TracksController } from './tracks.controller';
import { TracksService } from './tracks.service';

@Module({
  imports: [DatabaseModule, JwtAuthModule, SessionModule],
  controllers: [TracksController],
  providers: [TracksService, ...CommonProviders],
  exports: [],
})
export class TracksModule {}
