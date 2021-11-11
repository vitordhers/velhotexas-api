import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import { EmailService } from "src/email/email.service";
import { ProductsService } from "src/products/products.service";
import { OrderStatus } from "./enums/order-status.enum";
import { UserStatus } from "src/shared/enums/user-status.enum";
import { User } from "src/shared/models/user.model";
import CartItem from "../products/models/cartitem.model";
import Payment from "../shared/models/payment.model";
import Charge from "../shared/models/charge.model";
import ChargedUserData from "./models/charged-user-data.model";
import { Order } from "./models/order.model";
import { UpdateShippingDto } from "./dtos/update-shipping.dto";
import { UpdateDeliveryDto } from "./dtos/update-delivery.dto";
import { Cron } from "@nestjs/schedule";
import { Types } from "mongoose";
import { JunoService } from "src/juno/juno.service";
import { LoggerService } from "src/log/logger.service";
import { MelhorEnvioService } from "src/melhorenvio/melhor-envio.service";
import { forkJoin, Observable, of } from "rxjs";
import { mergeMap, switchMap } from "rxjs/operators";
import { Address } from "src/users/models/address.model";
import InsertCartResponse from "./interfaces/insert-cart-response.interface";
import CheckoutReponse from "./interfaces/checkout-reponse.interface";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    private productsService: ProductsService,
    private emailService: EmailService,
    private junoService: JunoService,
    private melhorEnvioService: MelhorEnvioService,
    private loggerService: LoggerService
  ) {}

  public async getUserOrders(_id: string, skip: string) {
    const user = await this.userModel
      .aggregate([
        {
          $match: { _id: Types.ObjectId(_id) },
        },
        {
          $project: {
            _id: 0,
            orders: 1,
          },
        },
        { $unwind: "$orders" },
        { $sort: { "orders.orderNo": -1 } },
        { $skip: parseInt(skip, 10) },
        { $limit: 10 },
      ])
      .exec();

    if (!user) {
      return [];
    }
    const orders = [];

    user.forEach((result) => {
      orders.push(result.orders);
    });

    return orders;
  }

  public async getOrder(
    _id: string,
    orderNo: string
  ): Promise<{ name: string; status: UserStatus; orders: Order[] }> {
    const result = await this.userModel.aggregate([
      {
        $match: { _id: Types.ObjectId(_id) },
      },
      {
        $project: {
          _id: 0,
          orders: {
            $filter: {
              input: "$orders",
              as: "order",
              cond: { $eq: ["$$order.orderNo", parseInt(orderNo, 10)] },
            },
          },
        },
      },
    ]);
    if (!result) {
      throw new NotFoundException();
    }
    return result[0].orders[0];
  }

  public async getOfflineOrder(
    _id: string,
    orderId: string
  ): Promise<{ name: string; status: UserStatus; orders: Order[] }> {
    const result = await this.userModel.aggregate([
      {
        $match: { _id: Types.ObjectId(_id) },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          status: 1,
          orders: {
            $filter: {
              input: "$orders",
              as: "order",
              cond: { $eq: ["$$order.orderId", Types.ObjectId(orderId)] },
            },
          },
        },
      },
    ]);
    if (!result) {
      throw new NotFoundException();
    }
    return result[0];
  }

  public async validateAndGetTotals(products: CartItem[]) {
    let totals = { weight: 0, amount: 0, shippingCost: 0, description: "" };

    const availableProducts = await this.productsService.getItensAvailabilityAndVolumes(
      products
    );

    if (totals.description.length >= 400) {
      totals.description = totals.description.substr(0, 397) + "...";
    } else {
      totals.description = totals.description + ".";
    }

    products.forEach((product, index, array) => {
      if (availableProducts.hasOwnProperty(product.id)) {
        if (availableProducts[product.id].price === product.price) {
          totals.weight += (product.quantity * product.shippingWeight) / 1000;
          totals.amount += product.quantity * product.price;
          product.shippingWeight = availableProducts[product.id].shippingWeight;
          product.whlSize = availableProducts[product.id].whlSize;

          if (array.length === 1) {
            totals.description += `${product.quantity} ${
              product.quantity === 1
                ? String(product.unit[0])
                : String(product.unit[1])
            } de ${product.title}`;
          } else {
            if (index === 0) {
              totals.description += `${product.quantity} ${
                product.quantity === 1
                  ? String(product.unit[0])
                  : String(product.unit[1])
              } de ${product.title}`;
            } else {
              totals.description += `, ${product.quantity} ${
                product.quantity === 1
                  ? String(product.unit[0])
                  : String(product.unit[1])
              } de ${product.title}`;
            }
          }
        } else {
          throw new ConflictException(
            `Preço do produto ${product.title} discrepante.`
          );
        }
      } else {
        throw new ConflictException(
          `Preço do produto ${product.title} discrepante.`
        );
      }
    });

    return { totals, products };
  }

  public async placeOrder(
    orderNo: number,
    user: {
      userId: Types.ObjectId;
      name: string;
      email: string;
      phone: string;
      document: string;
      address: Address;
    },
    products: CartItem[],
    totals: {
      shippingWeight: number;
      description: string;
      totalShippment: number;
      totalProducts: number;
    },
    freightCompanyId: number,
    charge: Charge,
    paymentMethod: "boleto" | "creditCard",
    creditCardHash
  ): Promise<Types.ObjectId> {
    let observable: Observable<{ success: boolean; payment?: Payment }>;

    if (paymentMethod === "boleto") {
      observable = of({ success: true });
    } else if (paymentMethod === "creditCard") {
      observable = this.junoService.createCreditCardPayment(
        charge.id,
        user.email,
        user.address.street,
        user.address.postalCode,
        String(user.address.no),
        user.address.city,
        user.address.state,
        creditCardHash
      );
    }

    try {
      const fork = await observable
        .pipe(
          switchMap((result) => {
            let observables: Promise<string[]>[];
            if (result.success) {
              observables = products.map(async (product) => {
                const productSkus = await this.productsService.editProductSku(
                  { _id: product.id, quantity: product.quantity },
                  paymentMethod === "boleto" ? "suspend" : "decrease"
                );
                return productSkus;
              });
            }

            return forkJoin(observables).pipe(
              mergeMap((joined) => {
                return of({ result, joined });
              })
            );
          })
        )
        .toPromise();
      const orderSkus: string[] = [].concat.apply(fork.joined);

      const orderData: Order = new Order(
        Types.ObjectId(),
        orderNo,
        !!fork.result.payment
          ? OrderStatus.PENDING_SHIPPING_LABELS
          : OrderStatus.PENDING_PAYMENT,
        totals.description,
        new Date(),
        {
          address: user.address,
          freightCompanyId,
          shippingWeight: totals.shippingWeight,
          labelsIds: [],
        },
        user.document,
        products,
        orderSkus,
        {
          paymentMethod,
          totalProducts: totals.totalProducts,
          totalShipment: totals.totalShippment,
          charge,
        },
        fork.result.payment || null
      );

      const result = await this.userModel.findOneAndUpdate(
        { _id: user.userId },
        {
          $push: {
            orders: orderData,
          },
        },
        { new: true }
      );

      if (result) {
        const lastOrder = (result.orders as Order[]).pop();
        if (result.email) {
          this.emailService.newOrderEmail(
            result._id,
            result.email,
            result.status === UserStatus.REGISTERED_BY_ORDER ? true : false,
            lastOrder,
            result.status === UserStatus.REGISTERED_BY_ORDER ? true : false
          );
        }

        return lastOrder.orderId;
      } else {
        throw new InternalServerErrorException();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async cancelOrder(
    _id: string,
    orderId: string,
    regret: boolean
  ): Promise<{ chargeId: string; cancelDate: Date; notice: string }> {
    const result: { orders: Order[] }[] = await this.userModel.aggregate([
      {
        $match: {
          _id: Types.ObjectId(_id),
        },
      },
      {
        $project: {
          _id: 0,
          orders: {
            $filter: {
              input: "$orders",
              as: "order",
              cond: {
                $eq: ["$$order.orderId", Types.ObjectId(orderId)],
              },
            },
          },
        },
      },
    ]);
    if (!result[0].orders.length) {
      throw new NotFoundException();
    }

    const canceledOrder = result[0].orders[0];
    const cancelDate = new Date();
    let transactionId;
    let status: OrderStatus;
    let notice: string;
    if (canceledOrder.status === OrderStatus.PENDING_PAYMENT) {
      const junoCancelation = await this.junoService.cancelCharge(
        canceledOrder.charges.charge.id
      );
      if (junoCancelation.status === 204) {
        status = OrderStatus.CANCELED;
        notice = "Pedido cancelado com sucesso, Roy! 😉";
      } else {
        throw new ConflictException(
          "Não foi possível cancelar a cobrança. Tente novamente mais tarde."
        );
      }
    } else if (canceledOrder.status === OrderStatus.FINISHED) {
      const diffTime = Math.abs(
        cancelDate.getTime() - canceledOrder.freight.deliveryDate.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 7) {
        throw new UnauthorizedException(
          "O pedido já chegou há mais de 7 dias, não cabendo mais arrependimento."
        );
      } else {
        // SOLICITAR CUPOM DE LOGÍSTICA REVERSA DOS CORREIOS
        // ENVIAR EMAIL COM DIRETRIZES
        notice =
          "Cheque seu e-mail para receber diretrizes para devolução dos produtos 📧";
      }
    } else {
      const junoCancelation = await this.junoService.refundCreditCardCharge(
        canceledOrder.charges.charge.id
      );
      if (junoCancelation.status === 200) {
        transactionId = junoCancelation.data.transactionId;
        notice = "Pedido cancelado e pagamento estornado com sucesso! 💳";
      } else {
        //LOGGER
        throw new ConflictException(
          "Não foi possível reembolsar o pagamento no cartão. Entre em contato com dina@velho-texas.com"
        );
      }
      if (canceledOrder.status !== OrderStatus.PENDING_SHIPPING) {
        // SOLICITAR AOS CORREIOS O CANCELAMENTO DA ENTREGA
      }
      status = OrderStatus.CANCELED;
    }

    const cancelResult = await this.userModel.updateOne(
      {
        _id,
        orders: {
          $elemMatch: {
            orderId: Types.ObjectId(orderId),
          },
        },
      },
      {
        $set: {
          "orders.$.status": status,
          "orders.$.cancel": { cancelDate, transactionId },
        },
      }
    );

    return {
      chargeId: result[0].orders[0].charges.charge.id,
      cancelDate,
      notice,
    };
  }

  async updateShippingOrder(update: UpdateShippingDto) {
    const { mode, userId, orderId, mailTrackingCode, date } = update;
    const status = {
      "orders.$.status":
        mode === "delivery"
          ? OrderStatus.FINISHED
          : OrderStatus.PENDING_DELIVERY,
    };

    let $set;
    if (mode === "shipping") {
      $set = {
        ...status,
        "orders.$.freight.mailTrakingCode": mailTrackingCode,
        "orders.$.freight.shippingDate": new Date(date),
      };
    } else {
      $set = {
        ...status,
        "orders.$.freight.deliveryDate": new Date(date),
      };
    }
    const result = await this.userModel.updateOne(
      {
        _id: Types.ObjectId(userId),
        orders: {
          $elemMatch: {
            orderId: Types.ObjectId(orderId),
            status:
              mode === "delivery"
                ? OrderStatus.PENDING_DELIVERY
                : OrderStatus.PENDING_SHIPPING,
          },
        },
      },
      {
        $set,
      }
    );
    if (result && result.nModified === 1) {
      return true;
    } else {
      return false;
    }
  }

  async createShippingOrders() {
    const result = await this.userModel.aggregate([
      {
        $match: {
          "orders.status": OrderStatus.PENDING_SHIPPING,
          "freight.mailTrakingCode": { $exists: false },
          "freight.plpId": { $exists: false },
        },
      },
      {
        $unwind: "$orders",
      },
      {
        $match: {
          "orders.status": OrderStatus.PENDING_SHIPPING,
          "freight.mailTrakingCode": { $exists: false },
          "freight.plpId": { $exists: false },
        },
      },
      {
        $project: {
          orders: 1,
          name: 1,
          email: 1,
        },
      },
    ]);

    // result.forEach(async (user) => {
    //   const deliveryCodes = await this.freightService.fechaPlpVariosServicos(
    //     user.orders,
    //     user
    //   );
    //   try {
    //     await this.userModel.updateOne(
    //         {
    //             _id: Types.ObjectId(user._id),
    //             "orders.orderId": user.orders.orderId
    //         },
    //         {
    //             $set: {
    //                 "orders.$.freight.mailTrakingCode": deliveryCodes.mailTrackingCode,
    //                 "orders.$.freight.plpId": deliveryCodes.plpId
    //             }
    //         }
    //     );
    //   } catch (e) {
    //     this.loggerService.errorLogger(
    //       e,
    //       "createShippingOrders",
    //       "ordersService"
    //     );
    //   }
    // });

    return;
  }

  async getUserChargeData(
    _id: string,
    addressId: string
  ): Promise<ChargedUserData> {
    const result = await this.userModel
      .aggregate([
        {
          $match: { _id: Types.ObjectId(_id) },
        },
        {
          $project: {
            addresses: {
              $filter: {
                input: "$addresses",
                as: "addr",
                cond: { $eq: ["$$addr.addressId", Types.ObjectId(addressId)] },
              },
            },
            name: 1,
            status: 1,
            email: 1,
            numberOfOrders: {
              $cond: {
                if: { $isArray: "$orders" },
                then: { $size: "$orders" },
                else: "0",
              },
            },
            celphoneNumber: 1,
          },
        },
      ])
      .exec();
    if (!result) {
      throw new NotFoundException();
    }

    return result[0];
  }

  async getOfflineUserChargeData(email: string) {
    const result = await this.userModel
      .aggregate([
        {
          $match: { email },
        },
        {
          $project: {
            name: 1,
            status: 1,
            email: 1,
            numberOfOrders: {
              $cond: {
                if: { $isArray: "$orders" },
                then: { $size: "$orders" },
                else: "0",
              },
            },
            celphoneNumber: 1,
          },
        },
      ])
      .exec();
    if (!result) {
      return false;
    }
    return result[0];
  }

  // PATTERN 0 0 7,8,9,10,11,12,13,14,15,16,17,18,19 ? * MON,TUE,WED,THU,FRI,SAT *

  // @Cron('*/2 * * * *')
  // @Cron("* * * * *")
  async checkShippingLabels() {
    console.log("checking shipping labels");
    const result = await this.userModel
      .aggregate([
        {
          $match: {
            "orders.status": OrderStatus.PENDING_SHIPPING_LABELS,
          },
        },
        {
          $unwind: "$orders",
        },
        {
          $project: {
            orders: 1,
            name: 1,
            email: 1,
            celphoneNumber: 1,
          },
        },
        {
          $match: {
            "orders.status": OrderStatus.PENDING_SHIPPING_LABELS,
          },
        },
      ])
      .exec();

    if (result.length) {
      let cartResults: InsertCartResponse[][] = [];

      for (const user of result) {
        try {
          const insertCart = await this.melhorEnvioService.insertCartFreight(
            {
              userId: user._id,
              name: user.name,
              email: user.email,
              phone: user.celphoneNumber || null,
              document: (user.orders as Order).document,
              address: (user.orders as Order).freight.address,
            },
            (user.orders as Order).orderId,
            (user.orders as Order).orderNo,
            (user.orders as Order).products,
            (user.orders as Order).freight.freightCompanyId
          );

          cartResults.push(insertCart as InsertCartResponse[]);
        } catch (e) {
          console.log("melhorEnvio InsertCartFreight Error", e);
        }
      }

      let checkoutResults: CheckoutReponse[] = [];

      for (const cartResult of cartResults) {
        let labelIds: string[] = [];
        if (cartResult.length > 1) {
          cartResult.forEach((cartResult) => {
            labelIds.push(cartResult.id);
          });
        } else {
          labelIds.push(cartResult[0].id);
        }
        
        try {
          const checkoutResult = await this.melhorEnvioService.checkout(
            labelIds
          );

          const generateResult = await this.melhorEnvioService.generate(
            labelIds
          );

          console.log("GENERATE RESULT", generateResult);
          checkoutResults.push(checkoutResult);
        } catch (e) {
          console.log("melhorEnvio Checkout Error", e);
        }
      }

      let updateLogs = [];

      for (const checkoutResult of checkoutResults) {
        for (const order of checkoutResult.purchase.orders) {
          const tag = order.tags[0].tag.split("_");

          const updateLog = await this.userModel
            .updateOne(
              {
                _id: Types.ObjectId(tag[0]),
                orders: {
                  $elemMatch: {
                    orderId: Types.ObjectId(tag[1]),
                  },
                },
              },
              {
                $set: {
                  "orders.$.status": OrderStatus.PENDING_SHIPPING,
                  "orders.$.freight.estimatedDeliveryDate": [
                    new Date().getHours() >= 15
                      ? Math.floor(Date.now() / 1000) +
                        (order.delivery_min + 1) * 86400 -
                        10800
                      : Math.floor(Date.now() / 1000) +
                        order.delivery_min * 86400 -
                        10800,
                    new Date().getHours() >= 15
                      ? Math.floor(Date.now() / 1000) +
                        (order.delivery_max + 1) * 86400 -
                        10800
                      : Math.floor(Date.now() / 1000) +
                        order.delivery_max * 86400 -
                        10800,
                  ],
                },
                $push: {
                  "orders.$.freight.labelsIds": order.id,
                },
              }
            )
            .exec();

          updateLogs.push(updateLog);
        }
      }

      // console.log("UPDATE LOGS", updateLogs);
    }
  }

  // @Cron('0/15 * * * * *')
  async checkShipping() {
    const result = await this.userModel.aggregate([
      {
        $match: {
          orders: {
            $elemMatch: {
              status: OrderStatus.PENDING_SHIPPING,
              "freight.mailTrakingCode": { $exists: true },
            },
          },
        },
      },
      {
        $project: {
          orders: 1,
        },
      },
      {
        $unwind: "$orders",
      },
      {
        $match: {
          "orders.status": OrderStatus.PENDING_SHIPPING,
        },
      },
    ]);
  }

  // @Cron('0/15 * * * * *')
  async checkDelivery() {
    const result = await this.userModel.aggregate([
      {
        $match: {
          orders: {
            $elemMatch: {
              status: OrderStatus.PENDING_DELIVERY,
              "freight.shippingDate": { $exists: true },
            },
          },
        },
      },
      {
        $project: {
          orders: 1,
        },
      },
      {
        $unwind: "$orders",
      },
      {
        $match: {
          "orders.status": OrderStatus.PENDING_DELIVERY,
        },
      },
    ]);
  }
}
