import {
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  UseFilters,
  Headers,
  Body,
  Req,
  Res,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthService } from '../auth/auth.service';
import { JunoService } from '../juno/juno.service';
import { TokensService } from '../auth/tokens.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { verify } from 'jsonwebtoken';
import { PlaceOrderDto } from './dtos/place-order.dto';
import { UpdateShippingDto } from './dtos/update-shipping.dto';
import { MongoFilter } from '../shared/filters/exception/mongo.filter-exception';
import { UserStatus } from 'src/shared/enums/user-status.enum';
import { Order } from './models/order.model';
import ChargedUserData from './models/charged-user-data.model';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { MelhorEnvioService } from 'src/melhorenvio/melhor-envio.service';
import CalculateReponse from 'src/melhorenvio/interfaces/calculate.interface';
import { Types } from 'mongoose';
import { Address } from 'src/users/models/address.model';

@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    private tokensService: TokensService,
    private junoService: JunoService,
    private melhorEnvioService: MelhorEnvioService,
  ) { }

  @Get('shippingorders')
  async createShippingOrders() {
    return await this.ordersService.createShippingOrders();
  }

  @Get('order/:orderNo')
  @UseGuards(AuthGuard('accessToken'))
  @UseFilters(MongoFilter)
  async getOrder(
    @Req() req: { user: string },
    @Param('orderNo') orderNo: string,
  ): Promise<{ name: string; status: UserStatus; orders: Order[] }> {
    return await this.ordersService.getOrder(req.user, orderNo);
  }

  @Get('offlineorder/:orderId')
  @UseGuards(AuthGuard('lowAccessToken'))
  @UseFilters(MongoFilter)
  async getOfflineOrder(
    @Req() req: { user: string },
    @Param('orderId') orderId: string,
  ): Promise<{ name: string; status: UserStatus; orders: Order[] }> {
    return await this.ordersService.getOfflineOrder(req.user, orderId);
  }

  @Get('testjuno')
  testJuno() {
    return process.env.JUNO_ACCESS_TOKEN;
  }

  @Get(':skip')
  @UseGuards(AuthGuard('accessToken'))
  @UseFilters(MongoFilter)
  async getOrders(@Req() req: { user: string }, @Param('skip') skip: string) {
    return await this.ordersService.getUserOrders(req.user, skip);
  }

  @Patch('cancel/:orderId')
  @UseGuards(AuthGuard('lowAccessToken'))
  @UseFilters(MongoFilter)
  async cancelOrder(
    @Req() req: { user: string },
    @Param('orderId') orderId: string,
  ) {
    return await this.ordersService.cancelOrder(req.user, orderId, false);
  }

  @Patch('regret/:orderId')
  @UseFilters(MongoFilter)
  async regretOrder(
    @Req() req: { user: string },
    @Res() res,
    @Param('orderId') orderId: string,
  ) { }
  // PENDING_PAYMENT => EXPIRED_BANK_SLIP
  @Patch('expire/:orderId')
  async expireOrder(
    @Req() req: { user: string },
    @Res() res,
    @Param('orderId') orderId: string,
  ) { }

  // PENDING_SHIPPING => PENDING_DELIVERY
  // PENDING_DELIVERY => FINISHED
  @Patch('shipping/')
  @UseFilters(MongoFilter)
  async updateShippingOrder(@Body() updateShippingDto: UpdateShippingDto) {
    return this.ordersService.updateShippingOrder(updateShippingDto);
  }

  // FINISHED => REFUNDED_PAYMENT
  @Patch('refund/:orderId')
  async refundOrder(
    @Req() req: { user: string },
    @Param('orderId') orderId: string,
  ) {
    return await this.ordersService.cancelOrder(req.user, orderId, true);
  }

  @Post()
  @UseFilters(MongoFilter)
  async prepareOrder(
    @Headers() headers: { authorization?: string },
    @Body() placeOrderDto: PlaceOrderDto,
    @Req() req: { user: string },
    @Res() res: Response,
  ) {
    // Validar quantidade de produtos e cria descricoes
    let validated = await this.ordersService.validateAndGetTotals(
      placeOrderDto.products,
    );
    // Definir se o pedido foi feito com usuario logado ou nao logado

    // Gerar os dados de cobranca baseado nos dados (inseridos ou ja constantes) do usuario

    let chargeData: ChargedUserData;
    let token: string;

    if (headers.authorization) {
      const token = headers.authorization.split('Bearer ');
      try {
        const jwt = verify(
          token[1],
          process.env.ACCESS_TOKEN_PUBLIC,
        ) as JwtPayload;

        if (jwt.exp < Date.now() / 1000 && jwt.access !== 'full') {
          throw new ForbiddenException();
        }
        chargeData = await this.ordersService.getUserChargeData(
          jwt.id,
          placeOrderDto.addressId,
        );
      } catch (e) {
        throw new ForbiddenException();
      }
    } else {
      const result = await this.ordersService.getOfflineUserChargeData(
        placeOrderDto.offlineAddress.email,
      );
      if (result) {
        chargeData = {
          ...result,
          addresses: [
            new Address(
              Types.ObjectId(),
              placeOrderDto.offlineAddress.postalCode,
              placeOrderDto.offlineAddress.street,
              placeOrderDto.offlineAddress.no,
              placeOrderDto.offlineAddress.city,
              placeOrderDto.offlineAddress.state,
              false,
              placeOrderDto.offlineAddress.addInfo)
          ],
        };
        const credential = await this.tokensService.createAccessToken({
          id: result._id,
          role: 'user',
          access: 'low',
        });
        token = credential.accessToken;
      } else {
        const result = await this.authService.signUpOrder(
          placeOrderDto.offlineAddress.email,
          placeOrderDto.offlineAddress.name,
          {
            postalCode: placeOrderDto.offlineAddress.postalCode,
            street: placeOrderDto.offlineAddress.street,
            no: placeOrderDto.offlineAddress.no,
            city: placeOrderDto.offlineAddress.city,
            state: placeOrderDto.offlineAddress.state,
            addInfo: placeOrderDto.offlineAddress.addInfo,
          },
        );

        chargeData = result;
        token = result.token;
      }
    }

    // Calcular frete com informacoes da base de dados

    try {
      const calculateResponse: CalculateReponse[] = await this.melhorEnvioService.calculate(
        {
          items: validated.products,
          postalCode: chargeData.addresses[0].postalCode,
        },
      );

      const freight = calculateResponse.find(
        (mode) => mode.id === placeOrderDto.freightMode,
      );

      if (freight && !freight.error) {
        validated.totals.shippingCost = parseFloat(
          freight.price.replace(',', '.'),
        );
        try {
          // Criar cobranca para os valores dos produtos e do Frete
          const charge = await this.junoService.createCharge(
            validated.totals.amount + validated.totals.shippingCost,
            chargeData.name,
            placeOrderDto.cpf.replace(/\D/g, ''),
            chargeData.email,
            validated.totals.description,
          );

          if (charge) {
            try {
              const placeOrderResult = await this.ordersService.placeOrder(
                chargeData.numberOfOrders + 1,
                {
                  userId: chargeData._id,
                  name: chargeData.name,
                  document: placeOrderDto.cpf,
                  email: chargeData.email,
                  phone: chargeData.celphoneNumber,
                  address: chargeData.addresses[0],
                },
                validated.products,
                {
                  shippingWeight: validated.totals.weight,
                  description: validated.totals.description,
                  totalProducts: validated.totals.amount,
                  totalShippment: validated.totals.shippingCost,
                },
                placeOrderDto.freightMode,
                charge,
                placeOrderDto.paymentMethod,
                placeOrderDto.cardHash,
              );

              if (placeOrderResult) {
                const result = {
                  orderId: placeOrderResult,
                  code: 201,
                  message:
                    placeOrderDto.paymentMethod === 'boleto'
                      ? `Boleto criado com sucesso!`
                      : `Pedido criado e pago com sucesso!`,
                  link:
                    placeOrderDto.paymentMethod === 'boleto'
                      ? charge.link
                      : null,
                  token,
                };
                res.status(HttpStatus.CREATED).send(result);
              } else {
                throw new InternalServerErrorException();
              }
            } catch (error) {
              console.log(error);
              res.status(HttpStatus.PAYMENT_REQUIRED).send(error);
            }
          }
        } catch (e) {
          console.log(e);
          res.status(HttpStatus.BAD_REQUEST).send({
            code: 400,
            message: e.response.data.details[0].message,
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).send({
          code: 406,
          message: freight?.error ?? 'A modalidade de frete está indisponível',
        });
      }
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }
}
