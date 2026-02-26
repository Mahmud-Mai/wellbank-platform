import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Gender, IdentificationType, KycLevel } from '@wellbank/shared';
import { User } from '../../auth/entities/user.entity';

@Entity('patients')
export class Patient {
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

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true
  })
  gender: Gender;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  lga: string;

  @Column({ nullable: true })
  profilePhotoUrl: string;

  @Column({
    type: 'enum',
    enum: IdentificationType,
    nullable: true
  })
  identificationType: IdentificationType;

  @Column({ nullable: true })
  identificationNumber: string;

  @Column({ nullable: true })
  nin: string;

  @Column({ nullable: true })
  bvn: string;

  @Column({
    type: 'int',
    default: KycLevel.LEVEL_0
  })
  kycLevel: KycLevel;

  @Column({ default: false })
  isKycVerified: boolean;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street?: string;
    city?: string;
    state?: string;
    lga?: string;
    country?: string;
    postalCode?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  nextOfKin: {
    name?: string;
    phoneNumber?: string;
    relationship?: string;
  };

  @Column({ type: 'simple-array', nullable: true })
  allergies: string[];

  @Column({ type: 'simple-array', nullable: true })
  chronicConditions: string[];

  @Column({ type: 'simple-array', nullable: true })
  currentMedications: string[];

  @Column({ nullable: true })
  bloodType: string;

  @Column({ nullable: true })
  genotype: string;

  @Column({ type: 'jsonb', nullable: true })
  emergencyContacts: Array<{
    name?: string;
    phoneNumber?: string;
    relationship?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  insurancePolicy: {
    provider?: string;
    policyNumber?: string;
    expiryDate?: Date;
    cardPhotoUrl?: string;
    isActive?: boolean;
  };

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
