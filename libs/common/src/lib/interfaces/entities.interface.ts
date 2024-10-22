export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface IBaseUser extends IBaseEntity {
  firstName: string;
  lastName?: string;
  email: string;
  password?: string;
  needsPasswordReset: boolean;
  confirmed: boolean;
}

export interface IUser extends IBaseUser {
  username?: string;
  avatar?: string;
}

export interface IAgent extends IBaseEntity {
  name: string;
  description: string;
  token: string;
  userId: string;
  devices?: IDevice[];
}

export interface IDevice extends IBaseEntity {
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  agentId: string;
  metadata: Record<string, unknown>;
}
