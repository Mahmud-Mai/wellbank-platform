import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Gender, VerificationStatus, ProviderStatus, ConsultationType } from '@wellbank/shared';
import { User } from '../../auth/entities/user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  profilePhotoUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'simple-array', nullable: true })
  specialties: string[];

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  subSpecialty: string;

  @Column({ type: 'jsonb', nullable: true })
  qualifications: Array<{
    degree?: string;
    institution?: string;
    year?: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  availability: Array<{
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    isAvailable?: boolean;
  }>;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  mdcnLicenseNumber: string;

  @Column({ type: 'date', nullable: true })
  mdcnExpiryDate: Date;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING
  })
  licenseVerificationStatus: VerificationStatus;

  @Column({ type: 'date', nullable: true })
  licenseExpiryDate: Date;

  @Column({ nullable: true })
  nin: string;

  @Column({ nullable: true })
  bvn: string;

  @Column({
    type: 'enum',
    enum: ProviderStatus,
    default: ProviderStatus.PENDING
  })
  providerStatus: ProviderStatus;

  @Column({ nullable: true })
  suspensionReason: string;

  @Column({ type: 'int', default: 0 })
  yearsExperience: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  consultationFee: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ default: false })
  hasAmbulance: boolean;

  @Column({ default: false })
  acceptsInsurance: boolean;

  @Column({ type: 'simple-array', nullable: true })
  languages: string[];

  @Column({
    type: 'simple-array',
    nullable: true
  })
  consultationTypes: ConsultationType[];

  @Column({ type: 'jsonb', nullable: true })
  hospitalAffiliations: Array<{
    hospitalName?: string;
    position?: string;
    startDate?: Date;
    endDate?: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street?: string;
    city?: string;
    state?: string;
    lga?: string;
    country?: string;
    postalCode?: string;
    coordinates?: { lat: number; lng: number };
  };

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true
  })
  gender: Gender;

  @Column({ default: false })
  ndprConsent: boolean;

  @Column({ default: false })
  dataProcessingConsent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
