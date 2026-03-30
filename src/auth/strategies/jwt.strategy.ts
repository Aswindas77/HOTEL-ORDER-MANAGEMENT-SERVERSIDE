import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {

    const user = await this.usersService.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not valid');
    }

    return {
      userId: user._id,
      role: user.role,
      name: user.name,
      hotelId: user.hotelId?.toString(),
      branchId: user.branchId?.toString(),
    };
  }
}
