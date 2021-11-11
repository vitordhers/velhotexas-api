import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { Product } from './models/product.model';
import { Validator } from 'class-validator';
import { ProductsController } from './products.controller';
import { Category } from './models/category.model';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from '../auth/guards/access-token.guard';

@Module({
    imports: [
        TypegooseModule.forFeature([Product, Category])
        // PassportModule.register({
        //     defaultStrategy: ['accessToken']
        // }),
        // HttpModule
    ],
    controllers: [ProductsController],
    providers: [
        ProductsService,
        Validator,
        // AccessTokenStrategy
    ],
    exports: [
        ProductsService
    ]
})
export class ProductsModule { }