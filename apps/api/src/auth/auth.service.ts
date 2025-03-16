import {
  generateCode,
  generateCodeChallenge,
  IAccessJwtConfig,
  IAuthResult,
  ISingleJwtConfig,
  SLUG_REGEX,
} from '@kuiiksoft/common';
import { ConfigService } from '@kuiiksoft/core/config';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isEmail } from 'class-validator';
import { CreateUserDto, UserEntity, UserService } from '../user';
import {
  IAccessPayload,
  IEmailPayload,
  IRefreshPayload,
} from './auth.interfaces';
import { ChangePasswordDto } from './dtos';

@Injectable()
export class AuthService {
  private accessJwtConfig: IAccessJwtConfig;
  private confirmationJwtConfig: ISingleJwtConfig;
  private resetPasswordJwtConfig: ISingleJwtConfig;
  private refreshJwtConfig: ISingleJwtConfig;
  private utilityJwtConfig: ISingleJwtConfig;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    const jwtConfig = this.configService.getApiConfig().auth.jwt;
    this.accessJwtConfig = jwtConfig.access;
    this.confirmationJwtConfig = jwtConfig.confirmation;
    this.resetPasswordJwtConfig = jwtConfig.resetPassword;
    this.refreshJwtConfig = jwtConfig.refresh;
    this.utilityJwtConfig = jwtConfig.utility;
  }

  async register(createUserDto: CreateUserDto): Promise<true> {
    const user = await this.userService.create(createUserDto);
    const emailConfirmationToken = await this.generateEmailConfirmationToken(
      user
    );
    // TODO: send email with confirmation token
    return true;
  }

  async validateOAuthLogin(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userService.findOrCreate(
      createUserDto.email,
      UserEntity.create({
        ...createUserDto,
        confirmed: true,
        needsPasswordReset: false,
        password: null,
      })
    );
    return user;
  }

  async validateLocalLogin(
    emailOrUsername: string,
    password: string
  ): Promise<UserEntity> {
    const user = await this.userByEmailOrUsername(emailOrUsername);

    if (
      !user.password ||
      !(await user.comparePassword(password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.confirmed) {
      const confirmationToken = await this.generateEmailConfirmationToken(user);
      // TODO: send email confirmation token
      throw new UnauthorizedException(
        'Please confirm your email, a new email has been sent'
      );
    }
    return user;
  }

  async login(user: UserEntity): Promise<IAuthResult> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    };
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.validateEmailConfirmationToken(token);
    return this.userService.updateConfirmed(user.id);
  }

  async sendResetPasswordLink(email: string): Promise<true> {
    const user = await this.userService.findByEmail(email);
    const resetPasswordToken = await this.generateResetPasswordToken(user);
    // TODO: send email with reset password token
    return true;
  }

  async changePassword(
    token: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<IAuthResult> {
    const user = await this.validateResetPasswordToken(token);
    const { password1, password2, password } = changePasswordDto;
    this.comparePasswords(password1, password2);
    await this.userService.updatePassword(user.id, password, password1);
    return this.login(user);
  }

  async refreshToken(token: string): Promise<IAuthResult> {
    const user = await this.validateRefreshToken(token);
    return this.login(user);
  }

  async generateAccessToken(user: UserEntity): Promise<string> {
    const payload: IAccessPayload = { id: user.id };
    return this.generateToken(payload, this.accessJwtConfig, 'RS256', user.id);
  }

  async generateEmailConfirmationToken(user: UserEntity): Promise<string> {
    const payload: IEmailPayload = { id: user.id, version: 1 };
    return this.generateToken(
      payload,
      this.confirmationJwtConfig,
      'HS256',
      user.id
    );
  }

  async generateResetPasswordToken(user: UserEntity): Promise<string> {
    const payload: IEmailPayload = { id: user.id, version: 1 };
    return this.generateToken(
      payload,
      this.resetPasswordJwtConfig,
      'HS256',
      user.id
    );
  }

  async generateRefreshToken(user: UserEntity): Promise<string> {
    const payload: IRefreshPayload = { id: user.id, tokenId: '1', version: 1 };
    return this.generateToken(payload, this.refreshJwtConfig, 'HS256', user.id);
  }

  generateUtilityToken<T extends object>(payload: T): string {
    return this.jwtService.sign(payload, {
      secret: this.utilityJwtConfig.secret,
      algorithm: 'HS256',
      expiresIn: this.utilityJwtConfig.time,
    });
  }

  async validateRefreshToken(token: string): Promise<UserEntity> {
    const payload = await this.jwtService.verifyAsync<IRefreshPayload>(token, {
      secret: this.refreshJwtConfig.secret,
    });
    const user = await this.userService.findById(payload.id);
    if (user.id !== payload.id) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }

  async validateEmailConfirmationToken(token: string): Promise<UserEntity> {
    const payload = await this.jwtService.verifyAsync<IEmailPayload>(token, {
      secret: this.confirmationJwtConfig.secret,
    });
    const user = await this.userService.findById(payload.id);
    if (user.confirmed) {
      throw new BadRequestException('User already confirmed');
    }
    return user;
  }

  async validateResetPasswordToken(token: string): Promise<UserEntity> {
    const payload = await this.jwtService.verifyAsync<IEmailPayload>(token, {
      secret: this.resetPasswordJwtConfig.secret,
    });
    const user = await this.userService.findById(payload.id);
    if (user.needsPasswordReset) {
      throw new BadRequestException('User already reset password');
    }
    return user;
  }

  async validateUtilityToken<T extends object>(token: string): Promise<T> {
    const payload = await this.jwtService.verifyAsync<T>(token, {
      secret: this.utilityJwtConfig.secret,
    });
    return payload;
  }

  async generateAuthorizationCode(
    userId: string,
    state: string
  ): Promise<string> {
    const codeChallenge = await this.cacheManager.get(`auth_code:${state}`);
    this.cacheManager.del(`auth_code:${state}`);
    const authorizationCode = generateCode('ac_');
    this.cacheManager.set(`auth_code:${authorizationCode}`, codeChallenge);
    this.cacheManager.set(`auth_user:${authorizationCode}`, userId);
    return authorizationCode;
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<IAuthResult> {
    const storedCodeChallenge = await this.cacheManager.get(
      `auth_code:${code}`
    );

    if (!storedCodeChallenge) {
      throw new UnauthorizedException('Invalid or expired authorization code');
    }

    const computedCodeChallenge = await generateCodeChallenge(codeVerifier);
    console.log('codeVerifier', codeVerifier);
    console.log('storedCodeChallenge', storedCodeChallenge);
    console.log('computedCodeChallenge', computedCodeChallenge);

    if (computedCodeChallenge !== storedCodeChallenge) {
      throw new UnauthorizedException('Invalid code verifier');
    }

    this.cacheManager.del(`auth_code:${code}`);
    const userId = await this.cacheManager.get<string>(`auth_user:${code}`);
    return this.login(await this.userService.findById(userId));
  }

  private async generateToken(
    payload: object | Buffer,
    config: ISingleJwtConfig | IAccessJwtConfig,
    algorithm: 'HS256' | 'RS256',
    subject?: string
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      subject,
      secret: config['secret'],
      privateKey: config['privateKey'],
      algorithm,
      expiresIn: config.time,
    });
  }

  private comparePasswords(password1: string, password2: string): void {
    if (password1 !== password2) {
      throw new BadRequestException('Passwords do not match');
    }
  }

  private async userByEmailOrUsername(
    emailOrUsername: string
  ): Promise<UserEntity> {
    if (emailOrUsername.includes('@')) {
      if (!isEmail(emailOrUsername)) {
        throw new BadRequestException('Invalid email');
      }

      return this.userService.findByEmail(emailOrUsername, true);
    }

    if (
      emailOrUsername.length < 3 ||
      emailOrUsername.length > 106 ||
      !SLUG_REGEX.test(emailOrUsername)
    ) {
      throw new BadRequestException('Invalid username');
    }

    return this.userService.findByEmailOrUsername(emailOrUsername, true);
  }
}
