import { Module, HttpModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { PassportModule } from '@nestjs/passport'
import { TypegooseModule } from 'nestjs-typegoose';
import { User } from '../shared/models/user.model';
import { Validator } from 'class-validator';
import { GoogleRecaptchaV3Constraint } from '../shared/constaints/google-recaptcha-v3.constraint';
import { AccessTokenStrategy } from './guards/access-token.guard';
import { RefreshTokenStrategy } from "./guards/refresh-token.guard";
import { EmailTokenStrategy } from './guards/email-token.guard';
import { LowAccessTokenStrategy } from './guards/low-access-token.guard';
import { GoogleStrategy } from './guards/google-strategy.guard';
import { FacebookStrategy } from './guards/facebook-strategy.guard';


@Module({
    imports: [
        TypegooseModule.forFeature([User]),
        PassportModule.register({
            defaultStrategy: ['accessToken', 'refreshToken', 'confirmEmailToken']
        }),
        HttpModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        TokensService,
        UsersService,
        EmailService,
        Validator,
        GoogleRecaptchaV3Constraint,
        AccessTokenStrategy,
        RefreshTokenStrategy,
        GoogleStrategy,
        FacebookStrategy,
        EmailTokenStrategy,
        LowAccessTokenStrategy
    ],
    exports: [
        PassportModule,
        AuthService,
    ]
})
export class AuthModule { }