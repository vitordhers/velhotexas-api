import { Product } from "../models/product.model";
import { Category } from "../models/category.model";

export interface QueryResults {
    products: Product[];
    prices?: { _id: null, max: number, min: number }[];
    brands?: { _id: string, total: number }[];
    tags?: { _id: string, total: number }[];
    categories?: { _id: string }[];
    template?: Category[]
}
