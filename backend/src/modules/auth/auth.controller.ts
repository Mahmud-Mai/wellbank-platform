import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, RefreshTokenDto, EnableMfaDto, RequestPasswordResetDto, ResetPasswordDto, VerifyEmailDto, SendOtpDto, VerifyOtpDto, CompleteRegistrationDto } from './dto/auth.dto';

/**
 * Authentication Controller
 * 
 * USER ROLES (3 + admin):
 * - patient: Seeks healthcare services
 * - doctor: Provides consultations (can be independent or org-affiliated)
 * - provider_admin: Creates organizations (hospital/lab/pharmacy/etc)
 * - wellbank_admin: Platform admin (seeded, see below)
 * 
 * ADMIN SEEDING:
 * - Super admin bootstrapped on server deployment (seeded if not exists)
 * - Super admin can create other admins via admin dashboard
 * - Admins use separate credentials (company email)
 * - Same login endpoint, returns wellbank_admin role
 * 
 * @see UserRole enum in shared/src/enums.ts
 * @see OrganizationType for organization types
 * @see OrganizationMemberRole for roles within organizations
 */
@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // OTP-based registration flow
  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP to phone or email' })
  @ApiResponse({ status: 200, description: 'OTP sent' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    const result = await this.authService.sendOtp(sendOtpDto);
    return {
      status: 'success',
      message: `OTP sent to ${sendOtpDto.destination}`,
      data: result,
    };
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and get verification token' })
  @ApiResponse({ status: 200, description: 'OTP verified' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(verifyOtpDto);
    return {
      status: 'success',
      message: 'OTP verified',
      data: result,
    };
  }

  @Post('register/complete')
  @ApiOperation({ summary: 'Complete registration after OTP verification' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  async completeRegistration(@Body() completeRegistrationDto: CompleteRegistrationDto) {
    const user = await this.authService.completeRegistration(completeRegistrationDto);
    return {
      status: 'success',
      message: 'Registration successful',
      data: user,
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account (legacy flow)' })
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

  // Registration state management
  @Post('register/save-step')
  @ApiOperation({ summary: 'Save registration step data' })
  @ApiResponse({ status: 200, description: 'Registration step saved' })
  async saveRegistrationStep(
    @Body() body: { email: string; step: number; data: Record<string, unknown> },
  ) {
    const result = await this.authService.saveRegistrationStep(
      body.email,
      body.step,
      body.data,
    );
    return {
      status: 'success',
      data: result,
    };
  }

  @Post('register/state')
  @ApiOperation({ summary: 'Get registration state by email' })
  @ApiResponse({ status: 200, description: 'Registration state returned' })
  @ApiResponse({ status: 404, description: 'No registration state found' })
  async getRegistrationState(
    @Body() body: { email: string; token: string },
  ) {
    const result = await this.authService.getRegistrationState(body.email, body.token);
    if (!result) {
      return {
        status: 'error',
        message: 'No registration state found or token expired',
      };
    }
    return {
      status: 'success',
      data: result,
    };
  }

  @Post('register/resume')
  @ApiOperation({ summary: 'Resume registration by email' })
  @ApiResponse({ status: 200, description: 'Registration state returned' })
  @ApiResponse({ status: 404, description: 'No registration to resume' })
  async resumeRegistration(@Body() body: { email: string }) {
    const result = await this.authService.resumeRegistrationByEmail(body.email);
    if (!result) {
      return {
        status: 'error',
        message: 'No registration to resume',
      };
    }
    return {
      status: 'success',
      data: result,
    };
  }

  @Post('register/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear registration state' })
  @ApiResponse({ status: 200, description: 'Registration state cleared' })
  async clearRegistrationState(@Body() body: { email: string }) {
    await this.authService.clearRegistrationState(body.email);
    return {
      status: 'success',
      message: 'Registration state cleared',
    };
  }
}
