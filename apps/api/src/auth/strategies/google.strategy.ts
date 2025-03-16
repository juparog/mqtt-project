import { ConfigService } from '@kuiiksoft/core/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { IGoogleUserProfile } from '../auth.interfaces';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService
  ) {
    const googleConfig = configService.getApiConfig().auth.provider.google;
    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      authorizationURL: googleConfig.authorizationURL,
      tokenURL: googleConfig.tokenURL,
      userProfileURL: googleConfig.userProfileURL,
      callbackURL: googleConfig.callbackURL,
      scope: googleConfig.scope,
      passReqToCallback: true,
      // state: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: IGoogleUserProfile,
    done: VerifyCallback
  ) {
    try {
      const user = await this.authService.validateOAuthLogin({
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avatar: profile.photos[0].value,
      });
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
