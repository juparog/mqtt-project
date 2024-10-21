import { IUser } from './entities.interface';

export interface IAuthResult {
  user: Pick<IUser, 'id' | 'email' | 'firstName' | 'lastName' | 'avatar'>;
  accessToken: string;
  refreshToken: string;
}
