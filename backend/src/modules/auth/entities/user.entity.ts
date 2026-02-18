import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { UserRole, KycLevel, ProviderStatus } from '@wellbank/shared';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isKycVerified: boolean;

  @Column({ type: 'int', default: KycLevel.LEVEL_0 })
  kycLevel: KycLevel;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true, type: 'varchar' })
  mfaSecret: string | null;

  @Column({ nullable: true, type: 'enum', enum: ProviderStatus })
  providerStatus: ProviderStatus;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: false })
  ndprConsent: boolean;

  @Column({ default: false })
  dataProcessingConsent: boolean;

  @Column({ default: false })
  marketingConsent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
