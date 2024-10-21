/**
 * Options for configuring the Clerk authentication strategy.
 *
 * @interface StrategyOptions
 *
 * @property {string} clientID - The client ID provided by the authentication provider.
 * @property {string} clientSecret - The client secret provided by the authentication provider.
 * @property {string} authorizeUrl - The URL used to obtain authorization from the user.
 * @property {string} tokenFetchUrl - The URL used to obtain an access token.
 * @property {string} userInfoURL - The URL used to obtain user information.
 * @property {string} callbackURL - The URL to which the authentication provider will redirect after authentication.
 * @property {('profile' | 'email' | 'public_metadata' | 'private_metadata')[]} [scope] - The scope of access requested from the user. Defaults to ['email', 'profile'].
 */
export interface StrategyOptionsBase {
  clientID: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenFetchUrl: string;
  userInfoUrl: string;
  callbackURL: string;
  scope?: ('profile' | 'email' | 'public_metadata' | 'private_metadata')[];
}

/**
 * Interface representing the options for the Clerk strategy.
 *
 * @extends StrategyOptionsBase
 *
 * @property {false | undefined} [passReqToCallback] - Optional property indicating whether to pass the request to the callback.
 */
export interface StrategyOptions extends StrategyOptionsBase {
  passReqToCallback?: false | undefined;
}

/**
 * Interface representing the options for the Clerk strategy that includes the request.
 *
 * @extends StrategyOptionsBase
 *
 * @property {true} passReqToCallback - Indicates that the request object should be passed to the callback.
 */
export interface StrategyOptionsWithRequest extends StrategyOptionsBase {
  passReqToCallback: true;
}

/**
 * Represents the raw user information retrieved from Clerk.
 *
 * @interface ClerkUserInfoRaw
 *
 * @property {string} object - The type of object, typically "user".
 * @property {string} instance_id - The instance ID associated with the user.
 * @property {string} email - The user's email address.
 * @property {boolean} email_verified - Indicates if the user's email has been verified.
 * @property {string} family_name - The user's family name (last name).
 * @property {string} given_name - The user's given name (first name).
 * @property {string} name - The user's full name.
 * @property {string} username - The user's username.
 * @property {string} picture - URL to the user's profile picture.
 * @property {string} user_id - The unique identifier for the user.
 * @property {Record<string, unknown>} public_metadata - Public metadata associated with the user.
 * @property {Record<string, unknown>} private_metadata - Private metadata associated with the user.
 * @property {Record<string, unknown>} unsafe_metadata - Metadata that is considered unsafe or sensitive.
 */
export interface ClerkUserInfoRaw {
  object: string;
  instance_id: string;
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  name: string;
  username: string;
  picture: string;
  user_id: string;
  public_metadata: Record<string, unknown>;
  private_metadata: Record<string, unknown>;
  unsafe_metadata: Record<string, unknown>;
}

/**
 * Represents a user profile in the Clerk system.
 *
 * @interface ClerkUserProfile
 *
 * @property {string} object - The type of object, typically 'user'.
 * @property {string} instanceId - The unique identifier for the instance.
 * @property {string} email - The user's email address.
 * @property {boolean} emailVerified - Indicates if the user's email has been verified.
 * @property {string} familyName - The user's family name (last name).
 * @property {string} givenName - The user's given name (first name).
 * @property {string} name - The full name of the user.
 * @property {string} username - The user's username.
 * @property {string} picture - URL to the user's profile picture.
 * @property {string} userId - The unique identifier for the user.
 * @property {Record<string, unknown>} publicMetadata - Public metadata associated with the user.
 * @property {Record<string, unknown>} privateMetadata - Private metadata associated with the user.
 * @property {Record<string, unknown>} unsafeMetadata - Metadata that is not safe for public exposure.
 */
export interface ClerkUserProfile {
  object: string;
  instanceId: string;
  email: string;
  emailVerified: boolean;
  familyName: string;
  givenName: string;
  name: string;
  username: string;
  picture: string;
  userId: string;
  publicMetadata: Record<string, unknown>;
  privateMetadata: Record<string, unknown>;
  unsafeMetadata: Record<string, unknown>;
}

/**
 * A callback function used to verify user authentication.
 *
 * @callback VerifyCallback
 * @param {Error | null | unknown} [err] - An error object if an error occurred, or null/unknown if no error.
 * @param {Express.User | false} [user] - The authenticated user object if authentication was successful, or false if it failed.
 * @param {object} [info] - Additional information about the authentication process.
 */
export type VerifyCallback = (
  err?: Error | null | unknown,
  user?: Express.User | false,
  info?: object
) => void;
