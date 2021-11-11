import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-facebook";


@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook')
{

    constructor() {
        super({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            // callbackURL : 'http://localhost:3000/users/facebook/redirect',
        })
    }


    async validate(request: any, accessToken: string, refreshToken: string, profile, done: Function) {
        try {
            console.log(profile);

            const user =
            {
                profile
            }

            done(null, user);
        }
        catch (err) {
            done(err, false);
        }
    }

}