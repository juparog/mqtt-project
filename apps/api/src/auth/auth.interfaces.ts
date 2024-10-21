export interface ITokenBase {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  sub: string;
}

export interface IAccessPayload {
  id: string;
}

export interface IAccessToken extends IAccessPayload, ITokenBase {}

export interface IEmailPayload extends IAccessPayload {
  version: number;
}

export interface IEmailToken extends IEmailPayload, ITokenBase {}

export interface IRefreshPayload extends IEmailPayload {
  tokenId: string;
}

export interface IRefreshToken extends IRefreshPayload, ITokenBase {}

export interface IGoogleUserProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: { value: string; verified: boolean }[];
  photos: { value: string }[];
}
