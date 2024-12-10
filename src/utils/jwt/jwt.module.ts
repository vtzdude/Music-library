import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CONFIG } from 'src/config/config';
import { JwtAuthService } from './jwt.service';
import { SessionModule } from 'src/api/session/session.module';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: CONFIG.jwtSecret,
      signOptions: {
        expiresIn: CONFIG.jwtExpiry,
      },
    }),
    SessionModule,
  ],
  providers: [JwtAuthService],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}
