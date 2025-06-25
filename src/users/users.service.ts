import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Email kontrolü
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new ConflictException('Bu email adresi zaten kullanılıyor');
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const createdUser = new this.userModel({
      ...dto,
      password: hashedPassword,
    });

    const savedUser = await createdUser.save();

    // `lean()` kullanarak düz JavaScript objesi al
    const userObject = await this.userModel
      .findById(savedUser._id)
      .lean()
      .exec();

    // Tip dönüşümü ile `password` hariç döndürüyoruz
    return userObject as Omit<User, 'password'>;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userModel.find().select('-password').exec();
    return users;
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Geçersiz kullanıcı ID formatı');
    }

    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Geçersiz kullanıcı ID formatı');
    }

    // Eğer email güncelleniyor ise, başka kullanıcıda aynı email var mı kontrol et
    if (dto.email) {
      const existingUser = await this.userModel.findOne({
        email: dto.email,
        _id: { $ne: id },
      });
      if (existingUser) {
        throw new ConflictException('Bu email adresi zaten kullanılıyor');
      }
    }

    // Eğer şifre güncelleniyor ise hashle
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, dto, {
        new: true,
        runValidators: true,
      })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    return updatedUser;
  }

  // Auth için kullanılacak metod - şifre dahil user döndürür
  async validateUser(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new BadRequestException('Email ve şifre gereklidir');
    }

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    return user;
  }

  // Register metodu - create ile aynı işlevi görüyor, tekrardan kaçınmak için create'i kullan
  async register(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    return this.create(dto);
  }

  // JWT strategy için kullanılacak metod
  async findById(id: string): Promise<Omit<User, 'password'>> {
    return this.findOne(id);
  }

  // Email ile kullanıcı bulma (auth için)
  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }
    return this.userModel.findOne({ email }).exec();
  }
}
