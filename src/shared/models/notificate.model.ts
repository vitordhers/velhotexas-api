import { Types } from "mongoose";
import { prop } from "@typegoose/typegoose";

export class Notificate {
    @prop({ required: true, unique: true })
    public notId!: Types.ObjectId;

    @prop({ required: true })
    public read!: boolean;

    @prop({ required: true })
    public date!: Date;

    @prop({ required: true })
    public text!: string;

    @prop()
    public url?: string;
}