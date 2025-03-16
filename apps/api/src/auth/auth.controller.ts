import { MessageDto } from '@kuiiksoft/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { CreateUserDto, UserEntity } from '../user';
import { IStatusPayload } from './auth.interfaces';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from './decorators';
import {
  ChangePasswordDto,
  EmailDto,
  ExchangeCodeDto,
  LoginDto,
  RefreshTokenDto,
} from './dtos';
import { ClerkAuthGuard, GoogleAuthGuard, LocalAuthGuard } from './guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<MessageDto> {
    const created = await this.authService.register(createUserDto);
    return created
      ? { message: 'User successfully registered' }
      : { message: 'Registration failed' };
  }

  @ApiBody({
    type: LoginDto,
  })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // start the google authentication flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req,
    @Query('state') state: string,
    @Res() res
  ) {
    const statusData =
      await this.authService.validateUtilityToken<IStatusPayload>(state);

    if (statusData.callbackUrl) {
      const authorizationCode =
        await this.authService.generateAuthorizationCode(req.user.id, state);
      return res.redirect(
        `${statusData.callbackUrl}?code=${authorizationCode}&redirectUrl=${statusData.redirectUrl}`
      );
    }

    const loginData = await this.authService.login(req.user);
    return loginData;
  }

  @Get('clerk')
  @UseGuards(ClerkAuthGuard)
  async clerkAuth() {
    // start the clerk authentication flow
  }

  @Get('clerk/callback')
  @UseGuards(ClerkAuthGuard)
  async clerkAuthRedirect(@Req() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('exchange-code')
  async exchangeCode(@Body() exchangeCodeDto: ExchangeCodeDto) {
    return this.authService.exchangeCode(
      exchangeCodeDto.code,
      exchangeCodeDto.codeVerifier
    );
  }

  @Get('profile')
  getProfile(@CurrentUser() user: UserEntity) {
    return user;
  }

  @ApiQuery({
    name: 'token',
    description: 'Email confirmation token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEzZjQ5ZjIwLWYzZTktNGI2Zi1hYjUyLWQwM2IzYzY3ZjI5ZiIsImlhdCI6MTYxNzI2NzI2M30.5Gt9j1F1bW2b1X6v3z1ZI6XvqKQ9WQXKo7y5v3J5KQ',
    required: true,
    type: String,
  })
  @Get('verify-email')
  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('reset-password')
  async requestResetPassword(@Body() emailDto: EmailDto): Promise<MessageDto> {
    const sendEmail = this.authService.sendResetPasswordLink(emailDto.email);
    return sendEmail
      ? { message: 'Email sent with reset password instructions' }
      : { message: 'Failed to send email' };
  }

  @ApiQuery({
    name: 'token',
    description: 'Reset token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEzZjQ5ZjIwLWYzZTktNGI2Zi1hYjUyLWQwM2IzYzY3ZjI5ZiIsImlhdCI6MTYxNzI2NzI2M30.5Gt9j1F1bW2b1X6v3z1ZI6XvqKQ9WQXKo7y5v3J5KQ',
    required: true,
    type: String,
  })
  @Post('change-password')
  async resetPassword(
    @Query('token') token: string,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.authService.changePassword(token, changePasswordDto);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.token);
  }
}
