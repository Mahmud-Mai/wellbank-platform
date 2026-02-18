import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, RefreshTokenDto, EnableMfaDto, RequestPasswordResetDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      status: 'success',
      message: 'Registration successful. Please check your email for verification.',
      data: user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive access tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);
    return {
      status: 'success',
      data: tokens,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return {
      status: 'success',
      data: tokens,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req: any) {
    // TODO: Invalidate tokens in Redis
    return {
      status: 'success',
      message: 'Logged out successfully',
    };
  }

  @Post('mfa/enable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable MFA for user account' })
  @ApiResponse({ status: 200, description: 'MFA enabled' })
  async enableMfa(@Request() req: any) {
    const result = await this.authService.enableMfa(req.user.id);
    return {
      status: 'success',
      data: result,
      message: 'MFA enabled successfully',
    };
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify MFA code' })
  @ApiResponse({ status: 200, description: 'MFA verified' })
  async verifyMfa(@Body() enableMfaDto: EnableMfaDto, @Request() req: any) {
    const isValid = await this.authService.verifyMfa(req.user.id, enableMfaDto.code);
    return {
      status: isValid ? 'success' : 'fail',
      message: isValid ? 'MFA verified' : 'Invalid MFA code',
    };
  }

  @Post('mfa/disable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA for user account' })
  @ApiResponse({ status: 200, description: 'MFA disabled' })
  async disableMfa(@Request() req: any) {
    await this.authService.disableMfa(req.user.id);
    return {
      status: 'success',
      message: 'MFA disabled successfully',
    };
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    const result = await this.authService.requestPasswordReset(requestPasswordResetDto.email);
    return {
      status: 'success',
      ...result,
    };
  }

  @Post('password-reset/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    return {
      status: 'success',
      ...result,
    };
  }

  @Post('verify-email/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(verifyEmailDto.token);
    return {
      status: 'success',
      ...result,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  async getProfile(@Request() req: any) {
    return {
      status: 'success',
      data: req.user,
    };
  }
}
