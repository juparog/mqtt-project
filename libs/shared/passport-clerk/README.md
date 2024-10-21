# Clerk Passport Strategy

[![npm version](https://badge.fury.io/js/passport-clerk.svg)](https://badge.fury.io/js/passport-clerk)
[![license](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/licenses/MIT)

This library provides a generic OAuth2 Passport strategy for authenticating users with Clerk. It can be used in various Node.js frameworks, including NestJS and Express.

## Features

- Full support for OAuth2.0 authentication using Clerk.
- Easily integrates with Passport.js.
- Handles user profile retrieval and formatting for Clerk's API.
- Supports passing requests to the verify callback.

## Installation

Install the package via npm:

```bash
npm install passport-clerk
```

Or with yarn:

```bash
npm install passport-clerk
```

## ClerkUserProfile Format
The user profile returned from Clerk is formatted as follows:

```typescript
{
  object: string;
  instanceId: string;
  email: string;
  emailVerified: boolean;
  familyName: string;
  givenName: string;
  name: string;
  username: string;
  picture?: string;
  userId: string;
  publicMetadata?: object;
  privateMetadata?: object;
  unsafeMetadata?: object;
}
```

## Create Clerk OAuth Application

[Use Clerk as an OAuth 2 Provider](https://clerk.com/docs/advanced-usage/clerk-idp)

## API
### ClerkStrategy
* ClerkStrategy(options: ClerkStrategyOptions, verify: VerifyFunction)
  * options: Configuration options for OAuth2 authentication.
  * verify: A verification function that receives the authenticated user's profile.
### ClerkStrategyOptions
* clientID: The client ID from Clerk.
* clientSecret: The client secret from Clerk.
* authorizeUrl: URL for Clerk's OAuth2 authorization.
* tokenFetchUrl: URL to fetch tokens from Clerk.
* callbackURL: URL to handle OAuth2 callbacks.
* userInfoUrl: URL to fetch user information from Clerk.
* scope: The OAuth2 scopes to request (default: ['profile', 'email']).
* passReqToCallback: Whether to pass the request to the verify function.

## Contributing
Feel free to open issues or submit pull requests if you find any bugs or want to add new features.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.
