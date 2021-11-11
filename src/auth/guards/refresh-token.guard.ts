import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refreshToken') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromHeader('x-refresh-token'),
            secretOrKey: process.env.REFRESH_TOKEN_PUBLIC,
        })
    }

    async validate(payload: JwtPayload) {
        return payload;
    }
}