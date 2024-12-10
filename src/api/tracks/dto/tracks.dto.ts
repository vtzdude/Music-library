import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsStrictBoolean, Trim } from 'src/utils/decorators/decorator';

export class AddTrackDto {
  @Transform(({ value }) => value?.toLowerCase())
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Trim()
  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @Trim()
  @IsStrictBoolean()
  @IsNotEmpty()
  hidden: boolean;

  @Trim()
  @IsString()
  @IsNotEmpty()
  artist_id: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  album_id: string;
}

export class UpdateTrackDto {
  @Transform(({ value }) => value?.toLowerCase())
  @Trim()
  @IsString()
  @IsOptional()
  name: string;

  @Trim()
  @IsNumber()
  @IsOptional()
  duration: number;

  @Trim()
  @IsStrictBoolean()
  @IsOptional()
  hidden: boolean;

  @Trim()
  @IsString()
  @IsOptional()
  artist_id: string;

  @Trim()
  @IsString()
  @IsOptional()
  album_id: string;
}
