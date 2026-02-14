import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'dummy',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'dummy',
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback',
            scope: ['email', 'profile'],
        } as any);
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        try {
            console.log('Google Profile received:', JSON.stringify(profile, null, 2));
            const { name, emails, photos, id } = profile;

            // Robust checks
            const email = emails && emails[0] ? emails[0].value : null;
            const firstName = name ? name.givenName : 'User';
            const lastName = name ? name.familyName : '';
            const picture = photos && photos[0] ? photos[0].value : '';

            if (!email) {
                console.error("No email in Google profile");
                return done(new Error("No email associated with Google account"), false);
            }

            const user = {
                googleId: id,
                email,
                firstName,
                lastName,
                picture,
                accessToken,
            };
            done(null, user);
        } catch (error) {
            console.error("Error in GoogleStrategy validate:", error);
            done(error, false);
        }
    }
}
