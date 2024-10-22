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
    const userId = await this.validateResetPasswordToken(token);
    const { password1, password2, password } = changePasswordDto;
    this.comparePasswords(password1, password2);
    const user = await this.userService.updatePassword(
      userId,
      password,
      password1
    );
    return this.login(user);
  }

  async refreshToken(token: string): Promise<IAuthResult> {
    const userId = await this.validateRefreshToken(token);
    const user = await this.userService.findById(userId);
    return this.login(user);
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

  async validateRefreshToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync<IRefreshPayload>(token, {
      secret: this.refreshJwtConfig.secret,
    });
    return payload.id;
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

  async validateResetPasswordToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync<IEmailPayload>(token, {
      secret: this.resetPasswordJwtConfig.secret,
    });
    return payload.id;
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
