import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrganizationType, ProviderStatus, OrganizationOwnershipType, FacilityType, AmbulanceType, SettlementFrequency } from '@wellbank/shared';
import { OrganizationMember } from './organization-member.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  tradingName: string;

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

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ nullable: true })
  contactPersonPosition: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street?: string;
    city?: string;
    state?: string;
    lga?: string;
    country?: string;
    postalCode?: string;
    coordinates?: { lat: number; lng: number };
    landmark?: string;
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

  @Column({ nullable: true })
  verifiedById: string;

  @Column({ nullable: true })
  verifiedAt: Date;

  // Common Business Info
  @Column({
    type: 'enum',
    enum: OrganizationOwnershipType,
    nullable: true
  })
  ownershipType: OrganizationOwnershipType;

  @Column({ type: 'int', nullable: true })
  yearEstablished: number;

  // Hospital-specific fields
  @Column({
    type: 'enum',
    enum: FacilityType,
    nullable: true
  })
  facilityType: FacilityType;

  @Column({ type: 'int', nullable: true })
  bedCapacity: number;

  @Column({ type: 'int', nullable: true })
  consultingRooms: number;

  @Column({ default: false })
  hasOperatingTheatre: boolean;

  @Column({ default: false })
  hasICU: boolean;

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

  @Column({ type: 'int', nullable: true })
  averagePatientVolumeDaily: number;

  @Column({ nullable: true })
  consultationFeeRange: string;

  @Column({ default: false })
  acceptsInsurance: boolean;

  @Column({ type: 'simple-array', nullable: true })
  hmosAccepted: string[];

  @Column({ nullable: true })
  nhiaNumber: string;

  // Hospital Medical Director
  @Column({ nullable: true })
  medicalDirectorName: string;

  @Column({ nullable: true })
  medicalDirectorMdcn: string;

  // Laboratory-specific fields
  @Column({ default: false })
  hasHomeSampleCollection: boolean;

  @Column({ type: 'simple-array', nullable: true })
  testsOffered: string[];

  @Column({ nullable: true })
  chiefLabScientistName: string;

  @Column({ nullable: true })
  chiefLabScientistMlsn: string;

  // Pharmacy-specific fields
  @Column({ nullable: true })
  superintendentPharmacistName: string;

  @Column({ nullable: true })
  superintendentPharmacistLicense: string;

  @Column({ default: false })
  hasDelivery: boolean;

  @Column({ default: false })
  hasColdChain: boolean;

  @Column({ default: false })
  handlesControlledDrugs: boolean;

  // Insurance-specific fields
  @Column({ nullable: true })
  naicomNumber: string;

  @Column({ type: 'simple-array', nullable: true })
  productTypes: string[];

  @Column({ nullable: true })
  coverageScope: string;

  @Column({ default: false })
  hasApiIntegration: boolean;

  @Column({ type: 'int', nullable: true })
  claimsTurnaroundDays: number;

  // Emergency/Ambulance-specific fields
  @Column({ nullable: true })
  coverageArea: string;

  @Column({ type: 'int', nullable: true })
  ambulanceCount: number;

  @Column({ type: 'simple-array', nullable: true })
  ambulanceTypes: AmbulanceType[];

  @Column({ default: false })
  hasGpsTracking: boolean;

  @Column({ nullable: true })
  averageResponseTime: string;

  // Logistics-specific fields
  @Column({ type: 'simple-array', nullable: true })
  vehicleTypes: string[];

  @Column({ default: false })
  hasColdChainDelivery: boolean;

  @Column({ default: false })
  hasGpsTrackingEnabled: boolean;

  @Column({ default: false })
  hasSameDayDelivery: boolean;

  // Banking & Settlement
  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankAccountName: string;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankBvn: string;

  @Column({
    type: 'enum',
    enum: SettlementFrequency,
    nullable: true
  })
  settlementFrequency: SettlementFrequency;

  // Compliance
  @Column({ default: false })
  ndprConsent: boolean;

  @Column({ default: false })
  termsAccepted: boolean;

  @Column({ default: false })
  antiFraudDeclaration: boolean;

  @Column({ default: false })
  slaAccepted: boolean;

  @Column({ nullable: true })
  createdById: string;

  @OneToMany(() => OrganizationMember, (member) => member.organization)
  members: OrganizationMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
