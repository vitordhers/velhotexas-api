import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dtos/create-product.dto";
import { EditProductSkuDto } from "./dtos/edit-product-sku.dto";

import { QueryResults } from "./interfaces/query-results.interface";
import { GetProductsDto } from "./dtos/get-products.dto";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { Category } from "./models/category.model";
import { DiscountDto } from "./dtos/discount.dto";
import CartItem from "./models/cartitem.model";

@Controller("products")
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Patch("/increase")
  async increaseProductSku(
    @Body() increaseProductSkuDto: EditProductSkuDto
  ): Promise<string[]> {
    return await this.productsService.editProductSku(
      increaseProductSkuDto,
      "increase"
    );
  }

  @Patch("/decrease")
  async decreaseProductSku(
    @Body() decreaseProductSkuDto: EditProductSkuDto
  ): Promise<string[]> {
    return await this.productsService.editProductSku(
      decreaseProductSkuDto,
      "decrease"
    );
  }

  @Get("quick/:search")
  async quickSearch(@Param("search") search: string) {
    const result = await this.productsService.quickSearch(search);
    return result[0];
  }

  @Post("/availability")
  async getItensAvailability(@Body() body: { products: CartItem[] }) {
    return await this.productsService.getItensAvailabilityAndVolumes(
      body.products
    );
  }

  @Get("category/:categoryId")
  async getCategory(@Param("categoryId") categoryId: string) {
    return await this.productsService.getCategory(categoryId);
  }

  @Get("/home")
  async homeData() {
    let data;
    let categories = await this.getCategories();
    let brands = await this.getAvailableBrandsTotal();
    let products = await this.productsService.getHomeProducts();
    data = { categories, brands, products };
    return data;
  }

  @Get("/categories")
  async getCategories(
    @Query() query?: { categories: string[] }
  ): Promise<Category[]> {
    return (await query)
      ? this.productsService.getCategories(query.categories)
      : this.productsService.getCategories();
  }

  @Get("/brands")
  async getAvailableBrandsTotal() {
    return await this.productsService.getAvailableBrandsTotal();
  }

  @Post("/category")
  async createCategory(
    @Body() createCategorytDto: CreateCategoryDto
  ): Promise<boolean> {
    return await this.productsService.createCategory(createCategorytDto);
  }

  @Post("/")
  async createProduct(
    @Body() createProductDto: CreateProductDto
  ): Promise<boolean> {
    return await this.productsService.createProduct(createProductDto);
  }

  @Post("/discount/:operation")
  async discount(
    @Param("operation") operaion: "add" | "remove",
    @Body() discountDto: DiscountDto
  ): Promise<boolean> {
    return await this.productsService.discount(operaion, discountDto);
  }

  @Get("/")
  async getProducts(@Query() query: GetProductsDto): Promise<QueryResults> {
    let result: QueryResults = await this.productsService.getProductsQuery(
      query
    );
    if (result.categories && query.skip === "0") {
      let categories = [];
      result.categories.forEach((category) => {
        categories.push(category._id);
      });
      const template = await this.productsService.getCategories(categories);
      result = { ...result, template };
    }

    return result;
  }

  @Get(":productId")
  async getProduct(@Param("productId") productId: string) {
    return await this.productsService.getProduct(productId);
  }
}
