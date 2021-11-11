import { createParamDecorator } from "@nestjs/common";
import { User } from "../../shared/models/user.model";

export const GetUser = createParamDecorator((_, req): User => {
    return req.user;
});