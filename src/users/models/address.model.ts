import { Types } from "mongoose";

export class Address {
    constructor(
        public addressId: Types.ObjectId,
        public postalCode: string,
        public street: string,
        public no: number,
        public city: string,
        public state: string,
        public defaultAddress: boolean,
        public addInfo: string = null
    ) { }

}
