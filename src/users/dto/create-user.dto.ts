import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ali Veli' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'GüçlüParola123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
