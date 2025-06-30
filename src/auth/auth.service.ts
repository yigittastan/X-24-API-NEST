import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { WorkspaceService } from '../workspace/workspace.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private workspaceService: WorkspaceService,
  ) {}

  async register(dto: CreateUserDto) {
    let workspace;
    if (dto.inviteCode) {
      // Davet kodu ile workspace'e katılım
      workspace = await this.workspaceService.findByInviteCode(dto.inviteCode);
      if (!workspace) throw new BadRequestException('Geçersiz davet kodu.');
    } else {
      // Yeni workspace oluşturulacaksa, companyName zorunlu
      if (!dto.companyName) {
        throw new BadRequestException('Company name is required.');
      }
      const inviteCode = uuidv4();
      workspace = await this.workspaceService.create({
        name: dto.companyName,
        inviteCode,
      });
    }

    const role = dto.inviteCode ? 'Member' : 'SuperAdmin';
    const user = await this.usersService.create({
      ...dto,
      workspace: workspace._id,
      role,
    });

    // ObjectId'yi string'e dönüştür
    await this.workspaceService.addMember(workspace._id, user._id.toString());
    return user;
  }

  async login(dtoOrUser: LoginDto | any, direct = false) {
    let user;
    if (!direct) {
      const dto = dtoOrUser;
      user = dto.email
        ? await this.usersService.findByEmail(dto.email)
        : await this.usersService.findByPhone(dto.phone);

      if (!user || !user.password) {
        throw new UnauthorizedException('Kullanıcı bulunamadı.');
      }

      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) throw new UnauthorizedException('Şifre hatalı.');

      const expiresIn = dto.rememberMe ? '7d' : '1d';
      return this._signToken(user, expiresIn);
    } else {
      return this._signToken(dtoOrUser, '1d');
    }
  }

  async validateOAuthLogin(email: string, name: string) {
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        email,
        name,
        password: '',
        provider: 'google',
      });
    }
    return this._signToken(user, '7d');
  }

  private _signToken(user: UserDocument, expiresIn: string) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
      user,
    };
  }
}