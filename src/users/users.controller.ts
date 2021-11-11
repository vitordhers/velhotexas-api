import {
    Controller,
    Get,
    UseGuards,
    Req,
    UseInterceptors,
    Post,
    Body,
    UseFilters,
    Delete,
    Param,
    Patch,
    NotFoundException,
    Put,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { MongoFilter } from "../shared/filters/exception/mongo.filter-exception";
import { AuthGuard } from "@nestjs/passport";
import { ServeUserInterceptor } from "./interceptors/serve-user.interceptor";
import { User } from "src/shared/models/user.model";
import { addAddressDto } from "./dtos/add-address.dto";


@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get('/')
    @UseGuards(AuthGuard('accessToken'))
    @UseInterceptors(ServeUserInterceptor)
    async getUser(@Req() req: { user: string }): Promise<User> {
        const result = await this.usersService.getUserStartData(req.user);
        if (!result) {
            throw new NotFoundException();
        }
        return result;
    }

    @Get('checkemail/:email')
    async checkUserEmail(
        @Param('email') email: string
    ) {
        const r = await this.usersService.findUserByEmail(email);
        if (!r) {
            throw new NotFoundException('E-mail não consta na base de dados.');
        }
        return true;
    }

    @Get('/addresses')
    @UseGuards(AuthGuard('accessToken'))
    async getAddresses(@Req() req: { user: string }) {
        const result = await this.usersService.getUserAddresses(req.user);
        if (!result) {
            throw new NotFoundException();
        }
        return result;
    }

    @Post('/address')
    @UseGuards(AuthGuard('accessToken'))
    @UseFilters(MongoFilter)
    async addAddress(
        @Req() req: { user: string },
        @Body() addAddressDto: addAddressDto
    ) {
        return await this.usersService.addAddress(req.user, addAddressDto);
    }

    @Put('/address')
    @UseGuards(AuthGuard('accessToken'))
    @UseFilters(MongoFilter)
    async updateAddress(
        @Req() req: { user: string },
        @Body() updateAddressDto: addAddressDto
    ) {
        return await this.usersService.updateAddress(req.user, updateAddressDto);
    }

    @Put('/defaultaddress/')
    @UseGuards(AuthGuard('accessToken'))
    @UseFilters(MongoFilter)
    async updateDefaultAddress(
        @Req() req: { user: string },
        @Body() body: { addressId: string }
    ) {
        return await this.usersService.updateDefaultAddress(req.user, body.addressId);
    }

    @Delete('/address/:addressId')
    @UseGuards(AuthGuard('accessToken'))
    @UseFilters(MongoFilter)
    async deactivateAddress(
        @Req() req: { user: string },
        @Param('addressId') addressId: string
    ): Promise<boolean> {
        return await this.usersService.deactivateAddress(req.user, addressId);
    }

    @Get('/unsubscribe')
    @UseGuards(AuthGuard('accessToken'))
    @UseFilters(MongoFilter)
    async unsubscribeAll(
        @Req() req: { user: string }
    ) {
        return await this.usersService.unsubscribeAll(req.user);
    }

    @Get('/notifications/:start')
    @UseGuards(AuthGuard('accessToken'))
    async getNotifications(
        @Req() req: { user: string },
        @Param('start') start: string
    ) {
        return await this.usersService.getNotifications(req.user, start);
    }

    @Post('/notifications')
    async notify(
        @Body() body: {
            userId: string,
            text: string,
            url: string
        }
    ) {
        return this.usersService.notify(body.userId, body.text, body.url);
    }

}