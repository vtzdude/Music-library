import { IsNotEmpty, IsString } from 'class-validator';

export class SessionDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
