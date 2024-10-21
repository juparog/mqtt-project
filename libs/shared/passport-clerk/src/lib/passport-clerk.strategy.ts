import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy as OAuth2Strategy,
  VerifyFunction,
  VerifyFunctionWithRequest,
} from 'passport-oauth2';
import { promisify } from 'util';
import {
  ClerkUserInfoRaw,
  ClerkUserProfile,
  StrategyOptions,
  StrategyOptionsWithRequest,
} from './passport-clerk.interfaces';

/**
 * @class Strategy
 * @extends {PassportStrategy}
 *
 * A Passport strategy for authenticating with Clerk using OAuth 2.0.
 *
 * @param {StrategyOptions} options - Configuration options for the strategy.
 * @param {VerifyFunction} verify - Verification function to call when authentication is successful.
 *
 * @method userProfile
 * @async
 * @override
 * Fetches the user profile from Clerk using the provided access token.
 *
 * @param {string} accessToken - The access token to use for fetching the user profile.
 * @param {function} done - Callback function to call with the user profile or an error.
 *
 * @private
 * @method formatProfile
 * Formats the raw user info data from Clerk into a structured profile object.
 *
 * @param {ClerkUserInfoRaw} data - The raw user info data from Clerk.
 * @returns {ClerkUserProfile} - The formatted user profile.
 */
export class Strategy extends PassportStrategy(OAuth2Strategy, 'clerk') {
  /**
   * @constructor
   * @param {StrategyOptions | StrategyOptionsWithRequest} options - Configuration options for the strategy.
   * @param {VerifyFunction | VerifyFunctionWithRequest} verify - Verification function to call when authentication is successful.
   */
  constructor(
    options: StrategyOptionsWithRequest,
    verify: VerifyFunctionWithRequest
  );
  constructor(options: StrategyOptions, verify: VerifyFunction);
  constructor(
    private options: StrategyOptions | StrategyOptionsWithRequest,
    verify: VerifyFunction | VerifyFunctionWithRequest
  ) {
    super(
      {
        clientID: options.clientID,
        clientSecret: options.clientSecret,
        authorizationURL: options.authorizeUrl,
        tokenURL: options.tokenFetchUrl,
        callbackURL: options.callbackURL,
        scope: options.scope || ['profile', 'email'],
        passReqToCallback: options.passReqToCallback,
      },
      verify
    );
    this.name = 'clerk';
  }

  /**
   * Overrides the userProfile method to fetch and parse the user profile using the provided access token.
   *
   * @param accessToken - The access token used to fetch the user profile.
   * @param done - A callback function to be called with the error (if any) or the parsed user profile.
   * @returns A promise that resolves when the user profile has been fetched and parsed.
   *
   * @throws Will throw an error if fetching or parsing the user profile fails.
   */
  override async userProfile(
    accessToken: string,
    done: (err?: unknown, profile?: unknown) => void
  ): Promise<void> {
    this._oauth2.useAuthorizationHeaderforGET(true);
    const getAsync = promisify(this._oauth2.get).bind(this._oauth2);
    try {
      const body = await getAsync(this.options.userInfoUrl, accessToken);
      const json = JSON.parse(body as string);
      const profile = this.formatProfile(json as ClerkUserInfoRaw);
      done(null, profile);
    } catch (err) {
      console.error('Failed to fetch or parse user profile', err);
      done(new Error('Failed to fetch or parse user profile'));
    }
  }

  /**
   * Formats the raw Clerk user information into a structured user profile.
   *
   * @param data - The raw user information received from Clerk.
   * @returns A structured user profile object.
   */
  private formatProfile(data: ClerkUserInfoRaw): ClerkUserProfile {
    return {
      object: data.object,
      instanceId: data.instance_id,
      email: data.email,
      emailVerified: data.email_verified,
      familyName: data.family_name,
      givenName: data.given_name,
      name: data.name,
      username: data.username,
      picture: data.picture,
      userId: data.user_id,
      publicMetadata: data.public_metadata,
      privateMetadata: data.private_metadata,
      unsafeMetadata: data.unsafe_metadata,
    };
  }
}
