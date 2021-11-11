export const PRODUCT_PROJECTION = {
    unit: 1,
    tags: 1,
    title: 1,
    brand: 1,
    netWeight: 1,
    shippingWeight: 1,
    description: 1,
    onSale: 1,
    price: 1,
    quantity: { $size: "$skus" }
};
