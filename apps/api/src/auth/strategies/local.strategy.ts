// src/auth/strategies/local.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { UserEntity } from '../../user';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'emailOrUsername',
    });
  }

  async validate(
    emailOrUsername: string,
    password: string
  ): Promise<UserEntity> {
    const user = await this.authService.validateLocalLogin(
      emailOrUsername,
      password
    );
    return user;
  }
}
