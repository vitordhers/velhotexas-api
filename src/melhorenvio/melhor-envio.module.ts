import { Module, HttpModule, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { Product } from '../products/models/product.model';
import { AuthExpiry } from './auth-expiry.middleware';
import { MelhorEnvioService } from './melhor-envio.service';

@Module({
    imports: [
        HttpModule,
        TypegooseModule.forFeature([Product])
    ],
    controllers: [],
    providers: [
        MelhorEnvioService
    ],
    exports: [
        MelhorEnvioService
    ]
})
export class MelhorEnvioModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthExpiry)
            .forRoutes({ path: 'freight', method: RequestMethod.POST });
    }

}