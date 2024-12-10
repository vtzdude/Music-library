import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Trim } from 'src/utils/decorators/decorator';

export enum Role {
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}
export class UserSignupDto {
  @Transform(({ value }) => value?.toLowerCase())
  @Trim()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*_+<>/=-])[\S]{8,16}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be 8-16 characters long without spaces',
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserAddDto {
  @Transform(({ value }) => value?.toLowerCase())
  @Trim()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*_+<>/=-])[\S]{8,16}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be 8-16 characters long without spaces',
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  @Transform(({ value }) => value?.toUpperCase())
  @Trim()
  @IsString()
  @IsNotEmpty()
  role: string;
}

export class UserLoginpDto {
  @Transform(({ value }) => value?.toLowerCase())
  @Trim()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*_+<>/=-])[\S]{8,16}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be 8-16 characters long without spaces',
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class updatePasswordDto {
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*_+<>/=-])[\S]{8,16}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be 8-16 characters long without spaces',
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  new_password: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*_+<>/=-])[\S]{8,16}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be 8-16 characters long without spaces',
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  old_password: string;
}
