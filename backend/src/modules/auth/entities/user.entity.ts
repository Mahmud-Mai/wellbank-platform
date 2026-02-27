import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole, KycLevel, ProviderStatus } from '@wellbank/shared';

/**
 * User Entity
 * 
 * DESIGN DECISION - DEVIATION FROM PRD (see DD-001 in .kiro/specs/design-decisions.md):
 * 
 * PRD specifies user roles: patient, doctor, lab, pharmacy, insurance, emergency, admin
 * 
 * Our implementation:
 * - User roles: patient, doctor, provider_admin, wellbank_admin
 * - Labs, Pharmacies, Hospitals, Insurance, Emergency, Logistics = ORGANIZATIONS
 * - provider_admin users create organizations and invite members
 * - wellbank_admin is seeded (not self-registered) for security
 * 
 * Why:
 * 1. Cleaner separation: people = users, businesses = organizations
 * 2. Organizations can have branches
 * 3. Staff roles scoped to organizations, not global
 * 4. Simpler authentication - everyone logs in as a user
 * 5. Security: admins are seeded, not self-registered
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({
    type: 'simple-array',
    default: UserRole.PATIENT
  })
  roles: UserRole[];

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT
  })
  activeRole: UserRole;

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

  @Column({ type: 'int', default: 0 })
  registrationStep: number;

  @Column({ type: 'jsonb', nullable: true })
  registrationData: Record<string, unknown> | null;

  @Column({ type: 'varchar', nullable: true })
  registrationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  registrationTokenExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
