import { ConfigService } from '@kuiiksoft/core/config';
import {
  ClerkUserProfile,
  Strategy,
  VerifyCallback,
} from '@kuiiksoft/passport-clerk';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService
  ) {
    const clerkConfig = configService.getApiConfig().auth.provider.clerk;
    super({
      clientID: clerkConfig.clientId,
      clientSecret: clerkConfig.clientSecret,
      authorizeUrl: clerkConfig.authorizationURL,
      tokenFetchUrl: clerkConfig.tokenURL,
      userInfoUrl: clerkConfig.userProfileURL,
      callbackURL: clerkConfig.callbackURL,
      scope: clerkConfig.scope,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: ClerkUserProfile,
    done: VerifyCallback
  ) {
    try {
      const user = await this.authService.validateOAuthLogin({
        email: profile.email,
        firstName: profile.givenName,
        lastName: profile.familyName,
        avatar: profile.picture,
      });
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
