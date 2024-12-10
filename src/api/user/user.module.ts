import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CommonProviders } from 'src/database/common.provider';
import { DatabaseModule } from 'src/database/database.module';
import { JwtAuthModule } from 'src/utils/jwt/jwt.module';
import { SessionModule } from 'src/api/session/session.module';

@Module({
  imports: [DatabaseModule, JwtAuthModule, SessionModule],
  controllers: [UserController],
  providers: [UserService, ...CommonProviders],
  exports: [],
})
export class UserModule {}
