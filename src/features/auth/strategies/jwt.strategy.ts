import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
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
            secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey',
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findOne(payload.sub);
        if (!user) {
            return null; // or throw UnauthorizedException
        }
        return {
            userId: payload.sub,
            // email is in user, or we can explictly set it if needed, but spread handles it.
            // If we want payload.email to take precedence, put it AFTER ...user
            ...user,
            email: payload.email, // Ensure email from token is used? Or from DB?
            // Actually, best to just use the user object from DB which should have the email.
        };
    }
}
