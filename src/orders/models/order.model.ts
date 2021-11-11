import { Types } from "mongoose";
import CartItem from "../../products/models/cartitem.model";
import Payment from "../../shared/models/payment.model";
import { OrderStatus } from "../enums/order-status.enum";
import Charge from "../../shared/models/charge.model";
import Freight from "./freight.model";

export class Order {
  constructor(
    public orderId: Types.ObjectId,
    public orderNo: number,
    public status: OrderStatus,
    public description: string,
    public date: Date,
    public freight: Freight,
    public document: string,
    public products: CartItem[],
    public skus: string[],
    public charges: {
      paymentMethod: string;
      totalProducts: number;
      totalShipment: number;
      charge: Charge;
    },
    public payment?: Payment,
    public nfe?: string,
    public cancel?: { canceledDate: Date; transactionId?: string },
    public refund?: {
      refundRequestId: Types.ObjectId;
      refundRequestDate: Date;
      refundDate: Date;
    }
  ) { }
}
