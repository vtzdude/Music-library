import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsStrictBoolean, Trim } from 'src/utils/decorators/decorator';

export class AddArtistDto {
  @Transform(({ value }) => value?.toLowerCase())
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Trim()
  @IsNumber()
  @IsNotEmpty()
  grammy: number;

  @Trim()
  @IsStrictBoolean()
  @IsNotEmpty()
  hidden: boolean;
}

export class UpdateArtistDto {
  @Transform(({ value }) => value?.toLowerCase())
  @Trim()
  @IsString()
  @IsOptional()
  name: string;

  @Trim()
  @IsNumber()
  @IsOptional()
  grammy: number;

  @Trim()
  @IsStrictBoolean()
  @IsOptional()
  hidden: boolean;
}
