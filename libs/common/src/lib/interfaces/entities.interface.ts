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
  id: string;
  userId: string;
  metadata: Record<string, unknown>;
  token: string;
}

export interface IDevice extends IBaseEntity {
  id: string;
  agentId: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  configuration: Record<string, unknown>;
}
