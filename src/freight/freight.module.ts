import { HttpModule, Module } from '@nestjs/common';
import { FreightController } from './freight.controller';
import { FreightService } from './freight.service';
import { LoggerService } from '../log/logger.service';
import { Validator } from 'class-validator';
import { TypegooseModule } from 'nestjs-typegoose';
import { Shipping } from './models/shipping.model';
import { MelhorEnvioModule } from 'src/melhorenvio/melhor-envio.module';
import { MelhorEnvioService } from 'src/melhorenvio/melhor-envio.service';
import { Product } from '../products/models/product.model';

@Module({
    imports: [
        TypegooseModule.forFeature([Product, Shipping]),
        MelhorEnvioModule,
        HttpModule
    ],
    controllers: [FreightController],
    providers: [
        FreightService,
        MelhorEnvioService,
        LoggerService,
        Validator
    ],
})
export class FreightModule { }