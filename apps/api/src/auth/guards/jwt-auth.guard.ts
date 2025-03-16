import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../decorators';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const guards = this.reflector.getAllAndMerge(GUARDS_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (guards) {
      const haveAuthGuard = guards.some(
        (guard) =>
          guard === GoogleAuthGuard ||
          guard === ClerkAuthGuard ||
          guard === LocalAuthGuard
      );
      if (haveAuthGuard) {
        return true;
      }
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, _info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
