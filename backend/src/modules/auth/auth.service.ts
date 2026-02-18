import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto, EnableMfaDto } from './dto/auth.dto';
import { UserRole } from '@wellbank/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
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
      role: registerDto.role,
      phoneNumber: registerDto.phoneNumber,
      ndprConsent: false,
      dataProcessingConsent: false,
      marketingConsent: false,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
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
      role: user.role,
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
        role: user.role,
        isKycVerified: user.isKycVerified,
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
}
