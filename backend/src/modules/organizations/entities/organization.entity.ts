import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrganizationType, ProviderStatus } from '@wellbank/shared';
import { OrganizationMember } from './organization-member.entity';

/**
 * Organization Entity
 * 
 * Represents healthcare organizations: hospitals, labs, pharmacies, clinics, etc.
 * Created by users with provider_admin role.
 * 
 * @see OrganizationType enum in shared/src/enums.ts
 */
@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: OrganizationType,
    default: OrganizationType.HOSPITAL
  })
  type: OrganizationType;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

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

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  cacNumber: string;

  @Column({ nullable: true })
  tin: string;

  @Column({
    type: 'enum',
    enum: ProviderStatus,
    default: ProviderStatus.PENDING
  })
  status: ProviderStatus;

  // Hospital-specific fields
  @Column({ nullable: true })
  bedCapacity: number;

  @Column({ type: 'simple-array', nullable: true })
  departments: string[];

  @Column({ type: 'simple-array', nullable: true })
  services: string[];

  @Column({ default: false })
  hasAmbulance: boolean;

  @Column({ default: false })
  hasPharmacy: boolean;

  @Column({ default: false })
  hasLaboratory: boolean;

  @Column({ default: false })
  hasEmergencyRoom: boolean;

  @Column({ default: false })
  is24Hours: boolean;

  @Column({ type: 'jsonb', nullable: true })
  operatingHours: Record<string, { open: string; close: string }>;

  @Column({ nullable: true })
  createdById: string;

  @Column({ nullable: true })
  verifiedById: string;

  @Column({ nullable: true })
  verifiedAt: Date;

  @OneToMany(() => OrganizationMember, (member) => member.organization)
  members: OrganizationMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
