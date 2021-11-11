export const PRODUCT_IN_DISPLAY_PROJECTION = {
    title: 1,
    unit: 1,
    brand: 1,
    description: 1,
    tags: 1,
    onSale: 1,
    shippingWeight: 1,
    price: 1,
    quantity: { $size: "$skus" }
};
