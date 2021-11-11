import { prop, buildSchema, modelOptions } from '@typegoose/typegoose';
import { Severity } from "@typegoose/typegoose";
import { UserStatus } from '../enums/user-status.enum';
import { Exclude, Transform } from 'class-transformer';
import { Address } from 'src/users/models/address.model';
import { Order } from 'src/orders/models/order.model';
import { Types } from 'mongoose';
import { Notificate } from './notificate.model';

@modelOptions({
    schemaOptions: {
        toObject: {
            transform: function (doc, ret, options) {
                Object.setPrototypeOf(ret, Object.getPrototypeOf(new User()));
            }
        },
    },
    options: {
        allowMixed: Severity.ALLOW,
    },
})

export class User {
    @prop({ required: true })
    public name!: string;

    @prop({ required: true, enum: UserStatus })
    public status!: UserStatus;

    @Transform((value) => value.toString(), { toPlainOnly: true })
    public _id?: Types.ObjectId;

    @prop({ unique: true, required: false, sparse: true })
    public email?: string;

    @prop({ unique: true, required: false, sparse: true })
    public googleUserId?: string;

    @prop({ unique: true, required: false, sparse: true })
    public facebookUserId?: string;

    @Transform((value) => !!value, { toPlainOnly: true })
    @prop({ required: false })
    public password?: string;

    @Exclude({ toPlainOnly: true })
    @prop({ required: false })
    public salt?: string;

    @prop({ required: false })
    public birthday?: Date;

    @prop({ required: false })
    public celphoneNumber?: string;

    @prop({ required: false })
    public whatsapp?: boolean;

    @prop({ required: false })
    public communication?: { mailcomm: boolean, wppcomm: boolean };

    @prop({ required: true })
    public addresses!: Address[]

    @prop({ required: true })
    public orders!: Order[] | Order

    @prop({ required: true })
    public notifications!: Notificate[]

    @prop({ required: true })
    public blackListEmailTokens: string[]

}

export const UserSchema = buildSchema(User)