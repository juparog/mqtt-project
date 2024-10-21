import { ConfigService } from '@kuiiksoft/core/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtDynamicStrategy extends PassportStrategy(
  Strategy,
  'jwt-dynamic'
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true, // Esto permite pasar el request a la validación del token
    });
  }

  async validate(req: Request, payload: any): Promise<any> {
    const tokenType = req.headers['x-token-type'] || 'access'; // Tomamos el tipo de token de los headers o lo seteamos a 'access'

    let publicKey;
    switch (tokenType) {
      case 'access':
        publicKey = this.configService.getApiConfig().auth.jwt.access.publicKey;
        break;
      case 'refresh':
        publicKey = this.configService.getApiConfig().auth.jwt.refresh.secret;
        break;
      default:
        throw new UnauthorizedException('Invalid token type');
    }

    // Aquí puedes implementar validaciones adicionales dependiendo del tipo de token
    const isTokenValid = this.verifyToken(req, publicKey);
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid token');
    }

    return payload; // Devolvemos el payload que es lo que normalmente se inyecta como req.user
  }

  private verifyToken(req: Request, publicKey: string): boolean {
    // Aquí puedes agregar la lógica de verificación del token usando la clave pública
    // Deberías validar el token contra el publicKey usando alguna librería como jsonwebtoken o hacerlo internamente
    // Por ejemplo, usando jsonwebtoken:
    // jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => { ... });

    // Por ahora retornamos true como si fuera válido.
    return true;
  }
}
