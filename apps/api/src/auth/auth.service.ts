// src/auth/auth.service.ts
import { ConfigService } from '@kuiiksoft/core/config';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isEmail } from 'class-validator';

import {
  IAccessJwtConfig,
  IAuthResult,
  ISingleJwtConfig,
  SLUG_REGEX,
} from '@kuiiksoft/common';

import { CreateUserDto } from '../user';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import {
  IAccessPayload,
  IEmailPayload,
  IRefreshPayload,
} from './auth.interfaces';

@Injectable()
export class AuthService {
  private accessJwtConfig: IAccessJwtConfig;
  private confirmationJwtConfig: ISingleJwtConfig;
  private resetPasswordJwtConfig: ISingleJwtConfig;
  private refreshJwtConfig: ISingleJwtConfig;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    const jwtConfig = this.configService.getApiConfig().auth.jwt;
    this.accessJwtConfig = jwtConfig.access;
    this.confirmationJwtConfig = jwtConfig.confirmation;
    this.resetPasswordJwtConfig = jwtConfig.resetPassword;
    this.refreshJwtConfig = jwtConfig.refresh;
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
    const isPasswordValid = await user.comparePassword(password, user.password);
    if (!isPasswordValid) {
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

  async generateAccessToken(user: UserEntity): Promise<string> {
    const payload: IAccessPayload = { id: user.id };
    return this.jwtService.signAsync(payload, {
      subject: user.id,
      privateKey: this.accessJwtConfig.privateKey,
      secret: undefined,
      algorithm: 'RS256',
      expiresIn: this.accessJwtConfig.time,
    });
  }

  async generateEmailConfirmationToken(user: UserEntity): Promise<string> {
    const payload: IEmailPayload = { id: user.id, version: 1 };
    return this.jwtService.signAsync(payload, {
      subject: user.id,
      secret: this.confirmationJwtConfig.secret,
      algorithm: 'HS256',
      expiresIn: this.confirmationJwtConfig.time,
    });
  }

  async generateResetPasswordToken(user: UserEntity): Promise<string> {
    const payload: IEmailPayload = { id: user.id, version: 1 };
    return this.jwtService.signAsync(payload, {
      subject: user.id,
      secret: this.resetPasswordJwtConfig.secret,
      algorithm: 'HS256',
      expiresIn: this.resetPasswordJwtConfig.time,
    });
  }

  async generateRefreshToken(user: UserEntity): Promise<string> {
    const payload: IRefreshPayload = { id: user.id, tokenId: '1', version: 1 };
    return this.jwtService.signAsync(payload, {
      subject: user.id,
      secret: this.refreshJwtConfig.secret,
      algorithm: 'HS256',
      expiresIn: this.refreshJwtConfig.time,
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
