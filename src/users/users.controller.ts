import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post, 
  UseGuards,
  Request,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Kullanıcı başarıyla oluşturuldu',
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
  @ApiResponse({ status: 409, description: 'Email adresi zaten kullanılıyor' })
  @ApiResponse({ status: 400, description: 'Geçersiz veri formatı' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm kullanıcıları listele' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kullanıcı listesi başarıyla getirildi',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          fullName: { type: 'string' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kendi profil bilgilerini getir' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profil bilgileri başarıyla getirildi',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ID ile kullanıcı getir' })
  @ApiParam({ name: 'id', description: 'Kullanıcı ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kullanıcı başarıyla getirildi',
  })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  @ApiResponse({ status: 400, description: 'Geçersiz ID formatı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı bilgilerini güncelle' })
  @ApiParam({ name: 'id', description: 'Kullanıcı ID', type: 'string' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Kullanıcı başarıyla güncellendi',
  })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  @ApiResponse({ status: 400, description: 'Geçersiz veri formatı' })
  @ApiResponse({ status: 409, description: 'Email adresi zaten kullanılıyor' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
}