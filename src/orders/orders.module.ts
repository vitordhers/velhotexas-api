import { Module, HttpModule } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JunoModule } from 'src/juno/juno.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypegooseModule } from 'nestjs-typegoose';
import { MelhorEnvioModule } from '../melhorenvio/melhor-envio.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { EmailService } from '../email/email.service';
import { TokensService } from '../auth/tokens.service';
import { ProductsService } from '../products/products.service';
import { FreightService } from '../freight/freight.service';
import { LoggerService } from '../log/logger.service';
import { JunoService } from 'src/juno/juno.service';
import { MelhorEnvioService } from 'src/melhorenvio/melhor-envio.service';
import { Validator } from 'class-validator';
import { AccessTokenStrategy } from '../auth/guards/access-token.guard';
import { LowAccessTokenStrategy } from '../auth/guards/low-access-token.guard';
import { AdminStrategy } from '../auth/guards/admin.guard';
import { User } from '../shared/models/user.model';
import { Product } from 'src/products/models/product.model';
import { Shipping } from 'src/freight/models/shipping.model';
import { Category } from 'src/products/models/category.model';

@Module({
    imports: [
        TypegooseModule.forFeature([User, Product, Shipping, Category]),
        AuthModule,
        JunoModule,
        HttpModule,
        MelhorEnvioModule,
        ScheduleModule.forRoot()
    ],
    controllers: [OrdersController],
    providers: [
        OrdersService,
        ProductsService,
        FreightService,
        JunoService,
        MelhorEnvioService,
        EmailService,
        TokensService,
        LoggerService,
        Validator,
        AccessTokenStrategy,
        LowAccessTokenStrategy,
        AdminStrategy
    ],
})
export class OrdersModule { }