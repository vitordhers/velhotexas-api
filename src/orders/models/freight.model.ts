import { Address } from "../../users/models/address.model";

export default class Freight {
  public address: Address;
  public freightCompanyId: number;
  public shippingWeight: number;
  public labelsIds?: string[];
  public protocol?: string;
  public shippingDate?: Date;
  public mailTrakingCode?: string;
  public deliveryDate?: Date;
  public estimatedDeliveryDate?: [number, number];
}
