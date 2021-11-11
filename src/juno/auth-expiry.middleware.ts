import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { JunoService } from './juno.service';

@Injectable()
export class AuthExpiry implements NestMiddleware {
  constructor(private junoService: JunoService) {}
  async use(req: Request, res: Response, next: Function) {
    await this.junoService.checkExpiryDate();
    console.log('MIDDLEWARE INSTANCE LOG', this.junoService);
    next();
  }
}
