import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  companyName?: string;
}
