import { createParamDecorator } from "@nestjs/common";

export const GetDataFromRefreshToken = createParamDecorator((a, req) => {
    return { id: req.args[0].user.id, refreshToken: req.args[0].headers['x-refresh-token'] };
});