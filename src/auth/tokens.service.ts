import { Injectable } from "@nestjs/common";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { Credentials } from "./interfaces/credentials.interface";
import { Algorithms } from "./enums/algorithms.enum";
import { sign } from 'jsonwebtoken';

@Injectable()
export class TokensService {
    constructor() { }

    public async createTokens(payload: JwtPayload): Promise<Credentials> {
        const accessToken = this.createAccessToken(payload);
        const refreshToken = { refreshToken: await sign({ id: payload.id, role: payload.role }, process.env.REFRESH_TOKEN_SECRET, { algorithm: Algorithms.ES512, expiresIn: '30d' }) };
        return Promise.all([accessToken, refreshToken]).then((values) => {
            return { ...values[0], ...values[1] }
        });
    }

    public async createAccessToken(payload: JwtPayload): Promise<Credentials> {
        const { id, role, access } = payload;
        let accessToken;

        if (access === 'full') {
            accessToken = {
                localId: payload.id,
                accessToken: await sign(payload, process.env.ACCESS_TOKEN_SECRET, { algorithm: Algorithms.ES384, expiresIn: '10m' }),
                expiresIn: new Date().getTime() + (1000 * 10 * 60)
            }
        } else {
            accessToken = {
                accessToken: await sign(payload, process.env.ACCESS_TOKEN_SECRET, { algorithm: Algorithms.ES256 })
            }
        }
        return accessToken;
    }

    public async createEmailConfirmationToken(email: string, o: string) {
        return await sign({ email, o }, process.env.EMAIL_TOKEN_SECRET, { algorithm: Algorithms.HS256, expiresIn: '1d' });
    }
}