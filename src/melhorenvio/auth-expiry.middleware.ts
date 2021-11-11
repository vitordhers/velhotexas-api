import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { MelhorEnvioService } from './melhor-envio.service';

@Injectable()
export class AuthExpiry implements NestMiddleware {
    constructor(private melhorenvioService: MelhorEnvioService) {

    }
    use(req: Request, res: Response, next: Function) {
        this.melhorenvioService.checkExpiryDate();
        next();
    }
}
