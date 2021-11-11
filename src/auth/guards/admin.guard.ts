import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.ACCESS_TOKEN_SECRET,
        })
    }

    async validate(payload: JwtPayload) {
        const { id, role } = payload;
        if (role !== 'admin') {
            throw new UnauthorizedException();
        }
        return id;
    }
}