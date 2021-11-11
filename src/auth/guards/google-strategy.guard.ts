import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google')
{

    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/google/redirect',
            passReqToCallback: true,
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ]
        })
    }


    async validate(
        request: any,
        accessToken: string,
        refreshToken: string,
        profile: { id: string, displayName: string, emails: { value: string, verified: boolean }[] },
        done: Function
    ) {
        try {
            const user = {
                googleUserId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                terms: true,
            }

            done(null, user);
        }
        catch (err) {
            done(err, false);
        }
    }

}