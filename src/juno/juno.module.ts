import {
  Module,
  HttpModule,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { JunoService } from './juno.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [JunoService],
  exports: [JunoService],
})
export class JunoModule implements NestModule {
  constructor(private junoService: JunoService) {}

  async configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(async (req: Request, res: Response, next: Function) => {
        const expired = this.junoService.checkExpiryDate();
        console.log(expired);
        if (expired) {
          await this.junoService.renewAccessToken();
        }
        next();
      })
      .forRoutes({ path: '/orders', method: RequestMethod.POST });
  }
}
