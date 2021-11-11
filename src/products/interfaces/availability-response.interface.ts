export default interface AvailabilityReponse {
  [key: string]: {
    price: number;
    quantity: number;
    shippingWeight: number;
    whlSize: [number, number, number];
  };
}
