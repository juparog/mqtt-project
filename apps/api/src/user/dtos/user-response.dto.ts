import { IUser, ResponseBaseDto } from '@kuiiksoft/common';

export class UserResponseDto
  extends ResponseBaseDto
  implements Omit<IUser, 'password' | 'createdAt' | 'updatedAt'>
{
  constructor(user: Omit<IUser, 'password'>) {
    super({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    Object.assign(this, user);
  }
  firstName: string;
  lastName?: string;
  username?: string;
  email: string;
  needsPasswordReset: boolean;
  confirmed: boolean;
  clerkId?: string;
  avatar?: string;
  isActive: boolean;
}
