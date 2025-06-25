import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/users.schema';

export interface JwtPayload {
  email: string;
  sub: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.usersService.validateUser(email, password);
      if (user) {
        // Şifreyi çıkar
        const { password, ...result } = user.toObject();
        return result;
      }
      return null;
    } catch (error) {
      // UsersService'den gelen hataları yakala
      if (error instanceof UnauthorizedException) {
        return null;
      }
      throw error;
    }
  }

  async login(user: any): Promise<LoginResponse> {
    if (!user) {
      throw new UnauthorizedException('Geçersiz kullanıcı');
    }

    const payload: JwtPayload = { 
      email: user.email, 
      sub: user._id.toString() 
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Geçersiz token');
    }
  }
}