import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import { IStatusPayload } from '../auth.interfaces';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = this.getRequest(context);
    const query = request.query;

    if (query?.callbackUrl) {
      if (!query?.codeChallenge) {
        throw new BadRequestException('Missing code challenge');
      }

      const state = this.authService.generateUtilityToken<IStatusPayload>({
        callbackUrl: query?.callbackUrl,
        redirectUrl: query?.redirectUrl,
      });

      this.cacheManager.set(
        `auth_code:${state}`,
        query.codeChallenge,
        /* ttl in ms */ 60000
      );

      return { state };
    }
  }
}
