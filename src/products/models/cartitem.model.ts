import BasicProduct from "../interfaces/basic-product.interface";
export default class CartItem implements BasicProduct {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly brand: string,
    public readonly unit: [string, string],
    public price: number,
    public quantity: number,
    public shippingWeight: number,
    public whlSize: [number, number, number]
  ) {}
}
