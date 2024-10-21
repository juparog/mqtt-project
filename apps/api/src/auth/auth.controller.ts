import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { MessageDto } from '@kuiiksoft/common';

import { CreateUserDto } from '../user';
import { UserEntity } from '../user/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from './decorators';
import { LoginDto } from './dtos';
import { ClerkAuthGuard, GoogleAuthGuard, LocalAuthGuard } from './guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async googleAuthRedirect(@Req() req) {
    return this.authService.login(req.user);
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

  @Get('profile')
  getProfile(@CurrentUser() user: UserEntity) {
    return user;
  }

  // @Post('request-reset-password')
  // async requestResetPassword(@Body() requestResetDto: RequestResetDto) {
  //   return this.authService.sendResetPasswordLink(requestResetDto.email);
  // }

  // @Post('reset-password')
  // async resetPassword(
  //   @Query('token') token: string,
  //   @Body() resetPasswordDto: ResetPasswordDto
  // ) {
  //   return this.authService.resetPassword(token, resetPasswordDto.newPassword);
  // }
}
