import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpStatus,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { FreightService } from './freight.service';
import { FreightDto } from './dtos/calculate-freight.dto';
import { MelhorEnvioService } from '../melhorenvio/melhor-envio.service';
import { CalculateDto } from '../melhorenvio/dtos/calculate.dto';

@Controller('freight')
export class FreightController {
  constructor(
    private freightService: FreightService,
    private melhorEnvioService: MelhorEnvioService,
  ) {}

  @Post('/calculate')
  async calculate(@Body() freightData: CalculateDto) {
    try {
      return await this.melhorEnvioService.calculate(freightData);
    } catch (e) {
      console.log(e);
    }
  }

  // @Get('testsoap')
  // async testSoap() {
  //     return await this.freightService.buscaCliente()
  // }

  // @Get('getlabels')
  // async getLabels() {
  //     const etiquetas = await this.freightService.solicitaEtiqueta();
  //     return etiquetas;
  // }

  // @Get('logrev')
  // async reverseLogistics() {
  //     return await this.freightService.solicitarPostagemReversa();
  // }

  // @Get('consultacep')
  // async consultaCep() {
  //     // return await this.freightService.consultaCep();
  // }

  // @Get('buscaeventos')
  // async buscaEventos() {
  //     //DM404188435BR
  //     //OJ190230373BR
  //     return await this.freightService.buscaEventos('DM404188435BR', 'P');
  // }

  // ADMIN

  @Get('authorize')
  authorizeMelhorEnvio(@Res() res: Response) {
    const url = this.melhorEnvioService.authorize();
    res.redirect(url);
  }

  @Get('tokens')
  async getTokens(@Query() query: { code: string }) {
    try {
      await this.melhorEnvioService.getTokens(query.code);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  @Get('info')
  async listInfo() {
    try {
      const result = await this.melhorEnvioService.listInfo();
      return result;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
