import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { TokenService } from '../auth/token.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterUserDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.userModel.exists({ email }))
      throw new ConflictException('Usuario ya existe');
    await this.userModel.create({
      email,
      password: await bcrypt.hash(dto.password, 10),
    });
    return { message: 'Usuario registrado' };
  }

  async login(dto: LoginUserDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const legacyPassword = !user.password.startsWith('$2');
    const matches = legacyPassword
      ? dto.password === user.password
      : await bcrypt.compare(dto.password, user.password);
    if (!matches) throw new UnauthorizedException('Credenciales incorrectas');

    if (legacyPassword) {
      user.password = await bcrypt.hash(dto.password, 10);
      await user.save();
    }

    const role = user.role ?? 'customer';
    const safeUser = { _id: user.id, email: user.email, role };
    return {
      message: 'Login exitoso',
      user: safeUser,
      accessToken: this.tokenService.sign({
        sub: user.id,
        email: user.email,
        role,
      }),
    };
  }
}
