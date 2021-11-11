import { Injectable } from '@nestjs/common';
import { LoggerService } from '../log/logger.service';
import { InjectModel } from 'nestjs-typegoose';
import { Shipping } from 'src/freight/models/shipping.model';
import { ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';

@Injectable()
export class FreightService {
  constructor(
    private loggerService: LoggerService,
    @InjectModel(Shipping)
    private readonly shippingModel: ReturnModelType<typeof Shipping>,
  ) {}

  async newShippingOrder(
    _id: number,
    orderId: Types.ObjectId,
    plpMaster: string,
    mailTrackingCode: string,
  ) {
    const newShipping = new this.shippingModel({
      _id,
      orderId,
      plpMaster,
      mailTrackingCode,
    });

    return await newShipping.save();
  }
}
