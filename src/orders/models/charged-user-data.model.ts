import { Address } from "src/users/models/address.model";
import { Types } from "mongoose";

export default class ChargedUserData {
  _id: Types.ObjectId;
  name: string;
  status: string;
  addresses: Address[];
  numberOfOrders: number;
  email: string;
  celphoneNumber?: string;
  token?: string;
}
