import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/infrastructure/enums/role.enums';
import { RegisterDto } from './dto/register.dto';


@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {

  const { name, email, password } = registerDto;

  const existingUser = await this.usersService.findByEmailWithPassword(email);

  if (existingUser) {
    throw new BadRequestException('Email already exists');
  }

  const user = await this.usersService.create({
    name,
    email,
    password,
    role: Role.MANAGER,
  });

  // create token
  const payload = {
    userId: user._id,
    role: user.role,
  };

  const accessToken = this.jwtService.sign(payload);

  return {
    message: 'Registration successful',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  };
}

  async login(loginDto: LoginDto) {

    const { email, password } = loginDto;
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user._id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
