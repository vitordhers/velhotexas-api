import { Module, HttpModule } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../shared/models/user.model';
import { Validator } from 'class-validator';
import { AccessTokenStrategy } from '../auth/guards/access-token.guard';
// import { EmailService } from 'src/email/email.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypegooseModule } from 'nestjs-typegoose';

@Module({
    imports: [
        AuthModule,
        TypegooseModule.forFeature([User]),
        HttpModule,
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        Validator,
        AccessTokenStrategy,
        // EmailService,
    ]
})
export class UsersModule { }