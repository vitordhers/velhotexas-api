import { Controller, Get, Post, Body, UseFilters, Req, UseGuards, Res, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { TokensService } from "./tokens.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { AuthCredentialsDto } from "./dtos/auth-credentials.dto";
import { PasswordFromOrderDto } from "./dtos/password-from-order.dto";
import { MongoFilter } from "src/shared/filters/exception/mongo.filter-exception";
import { BadRequestFilter } from "src/shared/filters/exception/bad-request-exception.filter"
import { AuthGuard } from "@nestjs/passport";
import { Providers } from './enums/providers.enum';
import { UserStatus } from '../shared/enums/user-status.enum';
import { GetDataFromRefreshToken } from "./decorators/get-data-from-refresh-token.decorator";
import { Credentials } from "./interfaces/credentials.interface";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { PasswordFromEmailDto } from "./dtos/password-from-email.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { EmailTokenRequest } from "./interfaces/request-email-token";
import { GetUserStatusDto } from "./dtos/get-user-status.dto";

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly tokensService: TokensService
    ) { }

    @Post()
    @UseFilters(BadRequestFilter, MongoFilter)
    async signUp(
        @Body() createUserDto: CreateUserDto
    ) {
        const credentials = await this.authService.signUp(createUserDto);
        return { credentials, notifications: { new: 1 } };
    }

    @Post('signin')
    @UseFilters(BadRequestFilter)
    async signIn(@Body() AuthCredentialsDto: AuthCredentialsDto): Promise<{ credentials: Credentials; notifications: { new: number; }; }> {
        return await this.authService.signIn(AuthCredentialsDto);
    }

    @Get('token')
    @UseGuards(AuthGuard('refreshToken'))
    async refreshToken(
        @GetDataFromRefreshToken() data: { id: string, refreshToken: string }
    ) {
        const payload: JwtPayload = {
            id: data.id,
            role: 'user',
            access: 'full'
        };
        let credentials: Credentials = await this.tokensService.createAccessToken(payload);
        credentials = { ...credentials, refreshToken: data.refreshToken };
        const notifications = await this.authService.getUserNewNotifications(payload.id);
        return { credentials, notifications };
    }

    @Get('resend')
    @UseGuards(AuthGuard('accessToken'))
    async resendConfirmationPassword(
        @Req() req
    ) {
        return this.authService.resendConfirmationEmail(req.user);
    }

    @Post('confirm')
    @UseGuards(AuthGuard('EmailToken'))
    async confirmUserEmail(
        @Req() req: EmailTokenRequest,
        @Body() passwordFromEmailDto: PasswordFromEmailDto
    ) {
        if (req.user.status === UserStatus.REGISTERED ||
            req.user.status === UserStatus.REGISTERED_BY_ORDER ||
            req.user.status === UserStatus.OAUTHREGISTERED) {
            if (req.user.password) {
                const result = await this.authService.confirmUserEmail(req.user._id, req.query.token);
                return { ...result, confirmation: true, password: true };
            } else {
                if (passwordFromEmailDto.hasOwnProperty('passwords')) {
                    const result = await this.authService.confirmUserEmail(req.user._id, req.query.token, passwordFromEmailDto)
                    return { ...result, confirmation: true, password: true };
                } else {
                    return { email: req.user.email, status: req.user.status, confirmation: false, password: false };
                }
            }
        } else if (req.user.status === UserStatus.REGISTERED_AND_CONFIRMED) {
            return { email: req.user.email, status: req.user.status, confirmation: true, password: true };
        } else {
            throw new BadRequestException('Não foi possível confirmar seu e-mail.');
        }
    }

    @Post('passwordfromorder')
    @UseGuards(AuthGuard('lowAccessToken'))
    async passwordFromOrder(
        @Req() req,
        @Body() passwordFromOrderDto: PasswordFromOrderDto
    ) {
        return await this.authService.passwordFromOrder(req.user, passwordFromOrderDto);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() {
        // initiates the Google OAuth2 login flow
    }

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleLoginCallback(
        @Req() req,
        @Res() res
    ) {
        const credentials: Credentials = await this.authService.signUpOAuthLogin(req.user, Providers.GOOGLE);
        const uri = Object.keys(credentials).map(function (k) {
            return encodeURIComponent(k) + "=" + encodeURIComponent(credentials[k]);
        }).join('&')
        res.redirect(`${process.env.APP_URL}entrar?${uri}`);
    }

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookLogin(@Req() req) {
        const credentials: Credentials = await this.authService.signUpOAuthLogin(req.user, Providers.FACEBOOK);
        return credentials;
    }

    @Get('facebook/redirect')
    @UseGuards(AuthGuard('facebook'))
    facebookLoginCallback(@Req() req, @Res() res) {
        const jwt: string = req.user.jwt;
        if (jwt)
            res.redirect('http://localhost:4200/login/succes/' + jwt);
        else
            res.redirect('http://localhost:4200/login/failure');
    }

    @Post('forgotpassword')
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto
    ) {
        return await this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @Get('validate')
    @UseGuards(AuthGuard('EmailToken'))
    validateEmailToken(
        @Req() req: EmailTokenRequest
    ) {
        return { valid: true };
    }

    @Post('redefine')
    @UseGuards(AuthGuard('EmailToken'))
    async redefinePassword(
        @Req() req: EmailTokenRequest,
        @Body() PasswordFromEmailDto: PasswordFromEmailDto
    ) {
        return await this.authService.redefinePassword(req.user._id, PasswordFromEmailDto, req.query.token);
    }

    @Post('resendoffline/')
    async getUserStatus(
        @Body() getUserStatusDto: GetUserStatusDto
    ) {
        return await this.authService.resendConfirmationEmailOffline(getUserStatusDto.email);
    }

}
