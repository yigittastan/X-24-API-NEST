import { 
  Body, 
  Controller, 
  Post, 
  HttpCode, 
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Kullanıcı başarıyla kaydedildi',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        fullName: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email adresi zaten kullanılıyor' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Geçersiz veri formatı' 
  })
  async register(@Body() RegisterDto: RegisterDto) {
    if (!RegisterDto.email || !RegisterDto.password || !RegisterDto.fullName) {
      throw new BadRequestException('Tüm alanlar zorunludur');
    }
    
    return this.usersService.register(RegisterDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Başarılı giriş',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            fullName: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Geçersiz email veya şifre' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Geçersiz veri formatı' 
  })
  async login(@Body() LoginDto: LoginDto) {
    if (!LoginDto.email || !LoginDto.password) {
      throw new BadRequestException('Email ve şifre gereklidir');
    }

    const user = await this.authService.validateUser(
      LoginDto.email, 
      LoginDto.password
    );
    
    if (!user) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }
    
    return this.authService.login(user);
  }
}