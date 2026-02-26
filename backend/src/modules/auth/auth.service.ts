import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto, EnableMfaDto, SendOtpDto, VerifyOtpDto, CompleteRegistrationDto } from './dto/auth.dto';
import { UserRole, ProviderStatus } from '@wellbank/shared';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      roles: [registerDto.role],
      activeRole: registerDto.role,
      phoneNumber: registerDto.phoneNumber,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      ndprConsent: false,
      dataProcessingConsent: false,
      marketingConsent: false,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      activeRole: user.activeRole,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.mfaEnabled && !loginDto.mfaCode) {
      throw new BadRequestException('MFA code required');
    }

    // TODO: Validate MFA code if enabled

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    return this.generateTokens(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !user.isActive) {
      return null;
    }

    // Check if user has a password set
    if (!user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  private generateTokens(user: User): AuthResponseDto {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      activeRole: user.activeRole,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        isKycVerified: user.isKycVerified,
        isEmailVerified: user.isEmailVerified,
        mfaEnabled: user.mfaEnabled,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async enableMfa(userId: string): Promise<{ secret: string }> {
    // TODO: Implement actual MFA with QR code
    const secret = 'MOCK_SECRET_FOR_NOW';
    
    await this.userRepository.update(userId, {
      mfaEnabled: true,
      mfaSecret: secret,
    });

    return { secret };
  }

  async verifyMfa(userId: string, code: string): Promise<boolean> {
    // TODO: Implement actual MFA verification
    return code === '123456';
  }

  async disableMfa(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      mfaEnabled: false,
      mfaSecret: null,
    });
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    // Always return success to prevent email enumeration
    return { message: 'If the email exists, a reset link will be sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // TODO: Implement actual password reset with token validation
    return { message: 'Password has been reset successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    // TODO: Implement actual email verification
    return { message: 'Email has been verified successfully' };
  }

  // OTP methods for new registration flow
  async sendOtp(sendOtpDto: SendOtpDto): Promise<{ otpId: string; expiresAt: Date }> {
    const otpId = crypto.randomUUID();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Send OTP via email
    if (sendOtpDto.type === 'email' && sendOtpDto.destination) {
      try {
        await this.emailService.sendOtpEmail(sendOtpDto.destination, otp);
      } catch (error) {
        console.error('Failed to send OTP email:', error);
      }
    }

    // TODO: Store OTP in database/redis for verification
    // For now, we accept any 6-digit code in verifyOtp

    return { otpId, expiresAt };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ verificationToken: string }> {
    // TODO: Implement actual OTP verification
    // For now, accept any 6-digit code
    if (verifyOtpDto.code.length !== 6) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Return a mock verification token
    const verificationToken = crypto.randomUUID();

    return { verificationToken };
  }

  async completeRegistration(completeDto: CompleteRegistrationDto): Promise<Partial<User>> {
    // Check for existing user by email if provided
    if (completeDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: completeDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const passwordHash = await bcrypt.hash(completeDto.password, 12);

    // Design Decision: Patients are auto-approved, Doctors/Provider Admins need admin approval
    const needsApproval = [UserRole.DOCTOR, UserRole.PROVIDER_ADMIN].includes(completeDto.role);
    const initialStatus = needsApproval ? ProviderStatus.PENDING : ProviderStatus.ACTIVE;

    const user = this.userRepository.create({
      email: completeDto.email || undefined,
      passwordHash,
      roles: [completeDto.role],
      activeRole: completeDto.role,
      phoneNumber: completeDto.phoneNumber,
      firstName: completeDto.firstName,
      lastName: completeDto.lastName,
      isEmailVerified: !!completeDto.email,
      providerStatus: initialStatus,
      ndprConsent: false,
      dataProcessingConsent: false,
      marketingConsent: false,
    });

    await this.userRepository.save(user);

    // TODO: Send notification email to admin for approval if role needs approval

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      activeRole: user.activeRole,
      providerStatus: user.providerStatus,
    };
  }

  // Registration state management
  async saveRegistrationStep(
    email: string,
    step: number,
    data: Record<string, unknown>,
  ): Promise<{ step: number; data: Record<string, unknown> }> {
    const registrationToken = crypto.randomUUID();
    const ttlDays = this.configService.get<number>('registration.tokenTtlDays') ?? 7;
    const tokenExpires = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    let user = await this.userRepository.findOne({ where: { email } });

    // Create user if doesn't exist (for early registration steps before password is set)
    // passwordHash will be set when user completes registration in Step 4
    if (!user) {
      user = this.userRepository.create({
        email,
        registrationStep: step,
        registrationData: data,
        registrationToken,
        registrationTokenExpires: tokenExpires,
      });
    } else {
      user.registrationStep = step;
      user.registrationData = data;
      user.registrationToken = registrationToken;
      user.registrationTokenExpires = tokenExpires;
    }

    await this.userRepository.save(user);

    return { step: user.registrationStep, data: user.registrationData || {} };
  }

  async getRegistrationState(
    email: string,
    token: string,
  ): Promise<{ step: number; data: Record<string, unknown> } | null> {
    const user = await this.userRepository.findOne({
      where: { email, registrationToken: token },
    });

    if (!user) {
      return null;
    }

    // Check if token is expired
    if (user.registrationTokenExpires && user.registrationTokenExpires < new Date()) {
      return null;
    }

    return {
      step: user.registrationStep || 0,
      data: user.registrationData || {},
    };
  }

  async resumeRegistrationByEmail(
    email: string,
  ): Promise<{ step: number; data: Record<string, unknown> } | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    // Only return state if user hasn't completed registration
    // (i.e., no password set yet)
    if (!user || user.passwordHash) {
      return null;
    }

    // Check if token is expired
    if (user.registrationTokenExpires && user.registrationTokenExpires < new Date()) {
      return null;
    }

    return {
      step: user.registrationStep || 0,
      data: user.registrationData || {},
    };
  }

  async clearRegistrationState(email: string): Promise<void> {
    await this.userRepository.update(
      { email },
      {
        registrationStep: 0,
        registrationData: undefined,
        registrationToken: undefined,
        registrationTokenExpires: undefined,
      },
    );
  }
}
