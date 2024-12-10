import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from 'src/utils/decorators/decorator';
export enum Category {
  album = 'album',
  artist = 'artist',
  track = 'track',
}
export class AddFavoriteDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  item_id: string;

  @IsEnum(Category)
  @Transform(({ value }) => value?.toLowerCase())
  @Trim()
  @IsString()
  @IsNotEmpty()
  category: string;
}
