import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from "@nestjs/common";
import { CreateProductDto } from "./dtos/create-product.dto";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import { Product } from "./models/product.model";
import { Category } from "./models/category.model";
import { EditProductSkuDto } from "./dtos/edit-product-sku.dto";
import { GetProductsDto } from "./dtos/get-products.dto";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { PRODUCT_PROJECTION } from "./constants/product-projection.constant";
import { PRODUCT_IN_DISPLAY_PROJECTION } from "./constants/product-in-display-projection.constant";
import { Types } from "mongoose";
import { DiscountDto } from "./dtos/discount.dto";
import AvailabilityReponse from "./interfaces/availability-response.interface";
import CartItem from "./models/cartitem.model";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: ReturnModelType<typeof Product>,
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>
  ) {}

  public async createProduct(
    createProductDto: CreateProductDto
  ): Promise<boolean> {
    const {
      _id,
      category_id,
      title,
      unit,
      tags,
      price,
      brand,
      netWeight,
      shippingWeight,
      description,
      skus,
      whlSize,
    } = createProductDto;

    const newProduct = new this.productModel({
      _id,
      category_id,
      stockIndex: skus.length,
      title,
      unit,
      tags,
      price,
      brand,
      netWeight,
      shippingWeight,
      description,
      skus,
      suspenseSkus: [],
      dateCreated: new Date(),
      itemsSold: 0,
      whlSize,
    });

    const result = await newProduct.save((err, res) => {
      // console.log(res);
      if (err) {
        console.log(err);
        return false;
      }
    });
    if (result) {
      return true;
    }
  }

  public async discount(operation: "add" | "remove", discount: DiscountDto) {
    const { _id, price, onSale } = discount;
    let result;
    if (price) {
      if (operation === "add") {
        result = await this.productModel
          .findOneAndUpdate({ _id }, { $set: { price, onSale } }, { new: true })
          .exec();
      } else {
        result = await this.productModel
          .findOneAndUpdate(
            { _id },
            { $set: { price }, $unset: { onSale: "" } },
            { new: true }
          )
          .exec();
      }
    } else {
      const document = await this.productModel
        .findById({ _id }, { price: 1, onSale: 1 })
        .exec();
      if (operation === "add") {
        let newPrice = document.price * (1 - onSale);
        newPrice = Math.round((newPrice + Number.EPSILON) * 100) / 100;
        result = await this.productModel
          .findOneAndUpdate(
            { _id },
            { $set: { price: newPrice, onSale } },
            { new: true }
          )
          .exec();
      } else {
        let newPrice = document.price / (1 - document.onSale);
        newPrice = Math.round((newPrice + Number.EPSILON) * 100) / 100;
        result = await this.productModel
          .findOneAndUpdate(
            { _id },
            { $set: { price: newPrice }, $unset: { onSale: "" } },
            { new: true }
          )
          .exec();
      }
    }
    return result;
  }

  public async editProductSku(
    editProductSkuDto: EditProductSkuDto,
    mode: "increase" | "decrease" | "suspend"
  ): Promise<string[]> {
    const { _id, quantity } = editProductSkuDto;

    const document = await this.productModel
      .findById({ _id }, { stockIndex: 1, skus: 1 })
      .exec();
    if (document) {
      let result;
      let difference;
      let newSkus: string | string[] = [];
      if (mode === "increase") {
        for (let index = 1; index <= quantity; index++) {
          let newIndex = index + document.stockIndex;
          newSkus.push(`${_id}${newIndex}`);
        }
        result = await this.productModel
          .findOneAndUpdate(
            { _id },
            { $push: { skus: newSkus }, $inc: { stockIndex: quantity } },
            { new: true }
          )
          .exec();
        difference = result.skus.filter((sku) => newSkus.includes(sku));
      } else if (mode === "decrease") {
        newSkus = document.skus.slice(quantity);
        result = await this.productModel
          .findOneAndUpdate(
            { _id },
            { $set: { skus: newSkus }, $inc: { itemsSold: quantity } },
            { new: true }
          )
          .exec();
        difference = document.skus.filter((sku) => !newSkus.includes(sku));
      } else if (mode === "suspend") {
        newSkus = document.skus.slice(quantity);
        difference = document.skus.filter((sku) => !newSkus.includes(sku));
        result = await this.productModel
          .findOneAndUpdate(
            { _id },
            { $set: { skus: newSkus }, $push: { suspenseSkus: difference } },
            { new: true }
          )
          .exec();
      }

      if (result && difference) {
        return difference;
      } else {
        throw new InternalServerErrorException();
      }
    } else {
      throw new NotFoundException();
    }
  }

  public async unsuspendSkus(
    _id: string,
    skus: string[],
    paid: boolean
  ): Promise<boolean> {
    const document = await this.productModel
      .findById({ _id }, { skus: 1, suspenseSkus: 1 })
      .exec();
    const unsuspendSkus = document.suspenseSkus.filter((sku) =>
      skus.includes(sku)
    );
    unsuspendSkus.forEach((sku) => {
      document.skus.push(sku);
    });

    document.skus.sort(
      (skuA, skuB) =>
        parseInt(skuA.replace(_id, ""), 10) -
        parseInt(skuB.replace(_id, ""), 10)
    );

    const result = await this.productModel.findOneAndUpdate(
      { _id },
      {
        $set: { skus: document.skus },
        $pull: { suspenseSkus: { $in: unsuspendSkus } },
        $inc: { itemsSold: paid ? skus.length : 0 },
      },
      { new: true }
    );
    return document.suspenseSkus.length - result.suspenseSkus.length ===
      skus.length
      ? true
      : false;
  }

  public async productOnSale(_id: string, onSale: boolean) {
    const result = await this.productModel.findOneAndUpdate(
      { _id },
      {
        $set: { onSale },
      },
      { new: true }
    );
    return result ? true : false;
  }

  public async quickSearch($search: string) {
    return await this.productModel
      .aggregate([
        {
          $match: {
            $and: [{ $text: { $search } }, { "skus.0": { $exists: true } }],
          },
        },
        {
          $facet: {
            products: [
              {
                $addFields: {
                  sorter: { $meta: "textScore" },
                },
              },
              { $sort: { sorter: -1, title: 1 } },
              { $limit: 5 },
              {
                $project: {
                  title: 1,
                  brand: 1,
                  price: 1,
                },
              },
            ],
            total: [{ $count: "total" }],
          },
        },
      ])
      .exec();
  }

  public async getProductsQuery(query: GetProductsDto) {
    let $sort;
    if (query.sort === "smaller") {
      $sort = { price: 1, sorter: -1, title: 1 };
    } else if (query.sort === "bigger") {
      $sort = { price: -1, sorter: -1, title: 1 };
    } else {
      $sort = { sorter: -1, title: 1 };
    }

    let $facet;
    $facet = {
      products: [
        {
          $addFields: {
            sorter: query.search ? { $meta: "textScore" } : { $size: "$skus" },
          },
        },
        { $sort },
        { $skip: query.skip ? parseInt(query.skip, 10) : 0 },
        { $limit: parseInt(query.limit, 10) },
        { $project: PRODUCT_PROJECTION },
      ],
    };
    if (query.skip === "0") {
      $facet = {
        ...$facet,
        categories: [
          {
            $group: {
              _id: "$category_id",
              total: { $sum: 1 },
            },
          },
        ],
        prices: [
          {
            $group: {
              _id: null,
              max: { $max: "$price" },
              min: { $min: "$price" },
            },
          },
        ],
        brands: [
          {
            $group: {
              _id: "$brand",
              total: { $sum: 1 },
            },
          },
        ],
        tags: [
          { $unwind: { path: "$tags", includeArrayIndex: "arrayIndex" } },
          {
            $group: {
              _id: {
                category_id: "$category_id",
                tags: "$tags",
                index: "$arrayIndex",
              },
              total: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              category: "$_id.category_id",
              tag: "$_id.tags",
              total: 1,
              index: "$_id.index",
            },
          },
        ],
      };
    }
    const result = await this.productModel
      .aggregate([
        {
          $match: {
            $and: [
              query.search ? { $text: { $search: query.search } } : {},
              query.categories
                ? { category_id: { $in: query.categories } }
                : {},
              query.brands ? { brand: { $in: query.brands } } : {},
              query.tags ? { tags: { $all: query.tags } } : {},
              query.prices
                ? {
                    price: {
                      $gte: parseFloat(query.prices[0]),
                      $lte: parseFloat(query.prices[1]),
                    },
                  }
                : {},
              { "skus.0": { $exists: true } },
            ],
          },
        },
        {
          $facet,
        },
      ])
      .exec();

    if (result) {
      return result[0];
    } else {
      return [];
    }
  }

  public async getProduct(_id: string) {
    const product = await this.productModel
      .aggregate([
        { $match: { _id } },
        { $project: { ...PRODUCT_PROJECTION, metadata: 1 } },
      ])
      .exec();
    let related;
    if (product && product.length) {
      related = await this.productModel
        .aggregate([
          { $match: { $text: { $search: product[0].metadata } } },
          { $addFields: { sorter: { $meta: "textScore" } } },
          { $sort: { sorter: -1 } },
          { $skip: 1 },
          { $limit: 6 },
          { $project: PRODUCT_IN_DISPLAY_PROJECTION },
        ])
        .exec();
    }

    return { product: product[0], related };
  }

  public async getHomeProducts() {
    const result = await this.productModel
      .aggregate([
        {
          $match: {
            "skus.0": { $exists: true },
          },
        },
        {
          $facet: {
            mostSold: [
              { $sort: { itemsSold: -1 } },
              { $limit: 9 },
              {
                $project: PRODUCT_IN_DISPLAY_PROJECTION,
              },
            ],
            onSale: [
              { $match: { onSale: { $exists: true } } },
              { $limit: 9 },
              {
                $project: PRODUCT_IN_DISPLAY_PROJECTION,
              },
            ],
            new: [
              { $sort: { dateCreated: 1 } },
              { $limit: 9 },
              {
                $project: PRODUCT_IN_DISPLAY_PROJECTION,
              },
            ],
          },
        },
      ])
      .exec();
    return result[0];
  }

  public async getItensAvailabilityAndVolumes(
    cartItems: CartItem[]
  ): Promise<AvailabilityReponse> {
    let itemsIds = [];
    cartItems.forEach((product) => {
      itemsIds.push(product.id);
    });

    const products = await this.productModel
      .find(
        { _id: { $in: itemsIds } },
        { skus: 1, price: 1, shippingWeight: 1, whlSize: 1 }
      )
      .exec();

    let result: AvailabilityReponse = {};
    products.forEach((product) => {
      result = {
        ...result,
        [product._id]: {
          price: product.price,
          quantity: product.skus.length,
          shippingWeight: product.shippingWeight,
          whlSize: product.whlSize,
        },
      };
    });
    return result;
  }

  public async getCategories(categories?: string[]): Promise<Category[]> {
    let result;
    if (categories) {
      result = await this.categoryModel
        .aggregate([
          {
            $match: {
              _id: { $in: categories },
            },
          },
        ])
        .exec();
    } else {
      result = await this.categoryModel
        .find({}, { _id: 1, categoryName: 1 })
        .exec();
    }
    if (result) {
      return result;
    } else {
      throw new NotFoundException();
    }
  }

  public async getAvailableBrandsTotal() {
    const result = await this.productModel
      .aggregate([
        {
          $group: {
            _id: "$brand",
            total: { $sum: 1 },
          },
        },
      ])
      .exec();
    if (result) {
      return result;
    } else {
      throw new NotFoundException();
    }
  }

  public async getCategory(_id) {
    const result = await this.categoryModel.findById(_id).exec();
    if (result) {
      return result;
    } else {
      throw new NotFoundException();
    }
  }

  public async createCategory(createCategoryDto: CreateCategoryDto) {
    const { _id, categoryName, tags } = createCategoryDto;

    const newCategory = new this.categoryModel({
      _id,
      categoryName,
      tags,
    });

    const result = newCategory.save((err) => {
      if (err) {
        console.log(err);
        return false;
      }
    });

    if (result) {
      return true;
    } else {
      throw new InternalServerErrorException();
    }
  }
}
