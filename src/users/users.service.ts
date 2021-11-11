import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { InjectModel } from 'nestjs-typegoose';
import { User } from '../shared/models/user.model';
import { ReturnModelType } from "@typegoose/typegoose";
import { addAddressDto } from './dtos/add-address.dto';
import { Types } from "mongoose";
import { Address } from "./models/address.model";
// import ItemList from "./models/itemlist.model";
// import { ProductsService } from "src/products/products.service";
// import { Order } from "./models/order.model";
// import { OrderStatus } from './enums/order-status.enum';
// import CorreiosErrorResult from './models/correios-error-result.model';
// import CorreiosSuccessResult from './models/correios-success-result.model';
// import { isArray } from 'lodash';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    ) { }

    //GET USER METHODS

    async findUserById(id: string): Promise<false | User> {
        const user = await this.userModel.findById({ id }).exec();
        if (!user) {
            return false;
        }
        return user;
    }

    async findUserByEmail(email: string) {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            return false;
        }
        return true;
    }

    async getUsers() {
        return await this.userModel.find().exec() as User[];
    }

    // GET USERS DATA METHODS

    async getUserStartData(_id: string): Promise<User> {
        const user = await this.userModel.findById(
            {
                _id
            },
            {
                email: 1,
                password: 1,
                name: 1,
                communication: 1,
                celphoneNumber: 1,
                status: 1,
                addresses: {
                    $elemMatch: {
                        defaultAddress: true
                    }
                }
            }
        );
        if (!user) {
            throw new NotFoundException();
        }
        return user;
    }


    // ADDRESSES METHODS

    // GET

    async getUserAddress(_id: string, addressId: string): Promise<Address> {
        const result = await this.userModel.aggregate(
            [
                {
                    $match: { _id: Types.ObjectId(_id) }
                },
                {
                    $project: {
                        _id: 0,
                        addresses: {
                            $filter: {
                                input: "$addresses", as: "addr", cond: { $eq: ["$$addr.addressId", Types.ObjectId(addressId)] }
                            }
                        }
                    }
                }
            ]
        )
        if (!result) {
            throw new NotFoundException();
        }
        // return user.addresses[0];
        return result[0].addresses[0];
    }

    async getUserAddresses(_id: string) {
        const user = await this.userModel.findOne(
            {
                _id
            },
            {
                _id: 0,
                addresses: 1
            }
        );
        if (!user) {
            return [];
        }
        return user.addresses;
    }

    async getDefaultAddress(_id) {
        const user = await this.userModel.findOne(
            {
                _id,
                "address.defaultAddress": true
            }
        )
        if (!user) {
            throw new NotFoundException();
        }
        return user.addresses[0];
    }


    // POST

    async addAddress(_id: string, addAddressDto: addAddressDto): Promise<{ addressId: Types.ObjectId, defaultAddress: boolean }> {
        const { postalCode, street, no, city, state, addInfo } = addAddressDto;
        const userAddresses = await this.getUserAddresses(_id);
        let defaultAddress: boolean;
        if (userAddresses.length === 0) {
            defaultAddress = true;
        } else if (5 <= userAddresses.length) {
            throw new ForbiddenException();
        } else {
            defaultAddress = false;
        }

        const result = await this.userModel.findOneAndUpdate(
            { _id },
            {
                $push: {
                    addresses: {
                        addressId: Types.ObjectId(),
                        postalCode,
                        street,
                        no,
                        city,
                        state,
                        addInfo,
                        defaultAddress
                    }
                }
            },
            { new: true }
        ).exec();

        if (result) {
            const partial = result.addresses.pop();
            return { addressId: partial.addressId, defaultAddress: partial.defaultAddress };
        } else {
            throw new BadRequestException();
        }
    }

    // PUT

    async updateAddress(_id: string, addAddressDto: addAddressDto) {
        const { postalCode, street, no, city, state, addInfo, addressId } = addAddressDto;
        const prevAddress = await this.getUserAddress(_id, addressId);
        const result = await this.userModel.updateOne(
            {
                _id,
                addresses: {
                    $elemMatch: {
                        addressId: Types.ObjectId(addressId)
                    }
                }
            },
            {
                $set: {
                    "addresses.$": {
                        addressId: Types.ObjectId(addressId),
                        postalCode,
                        street,
                        no,
                        city,
                        state,
                        addInfo,
                        defaultAddress: prevAddress.defaultAddress
                    }
                }
            }
        )

        if (!result) {
            throw new InternalServerErrorException();
        }
        if (result.nModified === 1) {
            return true;
        } else {
            return false;
        }
    }

    async updateDefaultAddress(_id: string, addressId: string): Promise<boolean> {
        const result1 = await this.userModel.updateOne(
            {
                _id: Types.ObjectId(_id)
            },
            {
                $set: {
                    "addresses.$[].defaultAddress": false
                }
            }
        ).exec();

        const result2 = await this.userModel.updateOne(
            {
                _id,
                "addresses.addressId": Types.ObjectId(addressId)
            },
            {
                $set: {
                    "addresses.$.defaultAddress": true
                }
            }
        ).exec();

        if (result1.nModified === 1 && result2.nModified === 1) {
            return true;
        } else {
            return false;
        }
    }


    // DELETE

    async deactivateAddress(_id: string, addressId: string): Promise<boolean> {
        const prevAddresses = await this.getUserAddresses(_id);
        if (prevAddresses.length <= 1) {
            throw new UnauthorizedException();
        } else {
            const result = await this.userModel.updateOne(
                {
                    _id
                },
                {
                    $pull: {
                        addresses: {
                            addressId: Types.ObjectId(addressId),
                            defaultAddress: false
                        }
                    }
                },
            )

            if (!result) {
                throw new InternalServerErrorException();
            } else {
                if (result.nModified === 1) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    // ADDRESSES METHODS

    // GET


    // COMMUNICATION METHODS

    // PATCH

    async unsubscribeAll(_id: string) {
        const result = await this.userModel.updateOne(
            {
                _id,
            },
            {
                $set: {
                    communication: { mailcomm: false, wppcomm: false }
                }
            },
        )

        if (!result) {
            throw new InternalServerErrorException();
        } else {
            if (result.nModified === 1) {
                return true;
            } else {
                return false;
            }
        }
    }

    async getNotifications(_id: string, start: string) {
        const result = await this.userModel.aggregate([
            { $unwind: "$notifications" },
            { $sort: { "notifications.date": -1 } },
            { $group: { _id: '$_id', 'notifications': { $push: '$notifications' } } },
            {
                $project: {
                    _id: 0,
                    notifications: { $slice: ['$notifications', parseInt(start, 10), 10] }
                }
            }
        ]).exec();

        const update = await this.userModel.findOneAndUpdate(
            { _id },
            {
                $set: {
                    "notifications.$[].read": true
                }
            }
        ).exec();

        if (result && result[0].notifications) {
            return result[0].notifications;
        } else {
            throw new NotFoundException();
        }
    }

    async notify(_id: string, text: string, url: string) {
        console.log(_id);
        const result = await this.userModel.updateOne({
            _id: Types.ObjectId(_id)
        }, {
            $push: {
                "notifications": {
                    notId: Types.ObjectId(),
                    read: false,
                    date: new Date(),
                    text,
                    url
                }
            }
        }).exec();
        if (result) {
            console.log(result);
        }
    }
}

