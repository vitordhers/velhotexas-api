import { prop, buildSchema, index, modelOptions, Severity } from '@typegoose/typegoose';

@index({ title: 'text', metadata: "text" }, { default_language: "portuguese", weights: { title: 3, metadata: 1 } })
@modelOptions({

    options: {
        allowMixed: Severity.ALLOW,
    },
})
export class Product {

    @prop({ unique: true, required: true })
    _id: string;

    @prop({ required: true })
    metadata: string;

    @prop({ required: true })
    category_id: string;

    @prop({ required: true })
    stockIndex: number;

    @prop({ required: true })
    dateCreated: Date;

    @prop()
    dateEdited: Date;

    @prop({ unique: true, required: true })
    title: string;

    @prop({ required: true })
    unit: [string, string];

    @prop({ required: true })
    shippingWeight: number;

    @prop({ required: true })
    price: number;

    @prop({ required: true })
    skus: string[];

    @prop({ required: true })
    suspenseSkus: string[];

    @prop({ required: true })
    brand: string;

    @prop({ required: true })
    tags: string[];

    @prop({ required: true })
    netWeight: number;

    @prop({ required: true })
    description: string;

    @prop({ required: true })
    itemsSold: number;

    @prop({ required: true })
    whlSize: [number, number, number]

    @prop({ required: false })
    onSale: number;
}

export const ProductSchema = buildSchema(Product)