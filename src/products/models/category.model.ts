import { prop, buildSchema } from '@typegoose/typegoose';

export class Category {

    @prop({ unique: true, required: true })
    _id: string;

    @prop({ unique: true, required: true })
    categoryName: string;

    @prop({ required: true })
    tags: { [key: string]: number };
}

export const CategorySchema = buildSchema(Category)