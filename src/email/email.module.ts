import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { TokensService } from '../auth/tokens.service';

@Module({
    imports: [],
    providers: [
        EmailService,
        TokensService
    ],
    exports: []
})
export class EmailModule { }