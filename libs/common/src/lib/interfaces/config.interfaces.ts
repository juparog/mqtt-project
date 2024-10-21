export interface IConfig {
  id: string;
  edgeAgent: IEdgeAgentConfig;
  broker: IBrokerConfig;
  db: IDatabaseConfig;
  api: IApiConfig;
  email: IEmailConfig;
}

export interface IEdgeAgentConfig {
  broker: {
    url: string;
  };
  client: {
    id: string;
    token: string;

    qos: number;
  };
}

export interface IBrokerConfig {
  port: number;
  id: string;
  transport: string;
  concurrency: number;
  queueLimit: number;
  maxClientsIdLength: number;
  connectTimeout: number;
  heartbeatInterval: number;
  http: {
    port: number;
  };
}

export interface IDatabaseConfig {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  synchronize: boolean;
  logging: boolean;
  ssl: boolean;
}

export interface ISingleJwtConfig {
  secret: string;
  time: string;
}

export interface IAccessJwtConfig {
  publicKey: string;
  privateKey: string;
  time: string;
}

export interface IJwtConfig {
  access: IAccessJwtConfig;
  confirmation: ISingleJwtConfig;
  resetPassword: ISingleJwtConfig;
  refresh: ISingleJwtConfig;
}

export interface IAuthBaseOAuth2ProviderConfig {
  clientId: string;
  clientSecret: string;
  authorizationURL: string;
  tokenURL: string;
  userProfileURL: string;
  callbackURL: string;
  scope: string[];
}

export interface IAuthConfig {
  jwt: IJwtConfig;
  provider: {
    google: IAuthBaseOAuth2ProviderConfig;
    clerk: IAuthBaseOAuth2ProviderConfig;
  };
}

export interface IApiConfig {
  host: string;
  port: number;
  globalPrefix: string;
  auth: IAuthConfig;
}

interface IEmailAuthConfig {
  user: string;
  pass: string;
}

export interface IEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: IEmailAuthConfig;
}
