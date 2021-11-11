import { prop, buildSchema } from '@typegoose/typegoose';

export class Shipping {
    @prop({ unique: true, required: true })
    _id!: number;

    @prop({ unique: true, required: true })
    orderId!: string;

    @prop({ required: true })
    plpMaster!: string;

    @prop({ required: true })
    mailTrackingCode!: string;
}

export const ShippingSchema = buildSchema(Shipping)