import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { CommonProviders } from 'src/database/common.provider';

@Module({
  providers: [SessionService, ...CommonProviders],
  exports: [SessionService],
})
export class SessionModule {}
