import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsStrictBoolean, Trim } from 'src/utils/decorators/decorator';

export class AddAlbumDto {
  @Transform(({ value }) => value?.toLowerCase())
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Trim()
  @IsNumber()
  @IsNotEmpty()
  year: number;

  @Trim()
  @IsStrictBoolean()
  @IsNotEmpty()
  hidden: boolean;

  @Trim()
  @IsString()
  @IsNotEmpty()
  artist_id: string;
}

export class UpdateAlbumDto {
  @Transform(({ value }) => value?.toLowerCase())
  @Trim()
  @IsString()
  @IsOptional()
  name: string;

  @Trim()
  @IsNumber()
  @IsOptional()
  year: number;

  @Trim()
  @IsStrictBoolean()
  @IsOptional()
  hidden: boolean;

  @Trim()
  @IsString()
  @IsOptional()
  artist_id: string;
}
