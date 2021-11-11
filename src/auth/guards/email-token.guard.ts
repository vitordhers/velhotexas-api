import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { User } from '../../shared/models/user.model';
import { EmailJwtPayload } from '../interfaces/email-jwt-payload.interface';
import { ReturnModelType } from '@typegoose/typegoose';
import { UserStatus } from 'src/shared/enums/user-status.enum';

@Injectable()
export class EmailTokenStrategy extends PassportStrategy(Strategy, 'EmailToken') {
    constructor(
        @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
            secretOrKey: process.env.EMAIL_TOKEN_SECRET,
            passReqToCallback: true,
            ignoreExpiration: true
        })
    }

    async validate(req: any, payload: EmailJwtPayload) {
        const { email, exp, o } = payload;
        let token;
        if (!req.query.token || (req._parsedUrl.pathname !== '/auth/' + o && req._parsedUrl.pathname !== '/auth/validate')) {
            throw new UnauthorizedException();
        } else {
            token = req.query.token;
        }
        const user = await this.userModel.aggregate(
            [
                {
                    $match: {
                        email,
                        status: { $ne: UserStatus.DISABLED },
                        blackListEmailTokens: { $nin: [token] }
                    }
                },
                {
                    $project: {
                        email: 1,
                        status: 1,
                        password: 1
                    }
                }
            ]
        ).exec();
        if (!user.length || (parseInt(exp) * 1000) < new Date().getTime()) {
            throw new UnauthorizedException('Token expirado ou já utilizado.');
        }

        return user;
    }
}