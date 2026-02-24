import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsArray, ValidateNested, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, IdentificationType, OrganizationType, OrganizationOwnershipType, FacilityType, AmbulanceType, SettlementFrequency } from '@wellbank/shared';

export class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  lga?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  landmark?: string;
}

export class NextOfKinDto {
  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  relationship: string;
}

export class InsuranceDto {
  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  cardPhotoUrl?: string;
}

export class EmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  relationship: string;

  @IsString()
  phoneNumber: string;
}

export class CompletePatientProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  nin?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NextOfKinDto)
  nextOfKin?: NextOfKinDto;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  genotype?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronicConditions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentMedications?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => InsuranceDto)
  insurance?: InsuranceDto;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];

  @IsOptional()
  @IsString()
  idType?: IdentificationType;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsString()
  selfiePhotoUrl?: string;

  @IsOptional()
  @IsString()
  idPhotoFrontUrl?: string;

  @IsOptional()
  @IsString()
  idPhotoBackUrl?: string;
}

export class QualificationDto {
  @IsString()
  degree: string;

  @IsString()
  institution: string;

  @IsNumber()
  year: number;
}

export class HospitalAffiliationDto {
  @IsString()
  hospitalName: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class AvailabilitySlotDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsBoolean()
  isAvailable: boolean;
}

export class CompleteDoctorProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  subSpecialty?: string;

  @IsOptional()
  @IsNumber()
  yearsExperience?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  consultationTypes?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HospitalAffiliationDto)
  hospitalAffiliations?: HospitalAffiliationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  availabilitySchedule?: AvailabilitySlotDto[];

  @IsOptional()
  @IsNumber()
  consultationFee?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  mdcnLicenseNumber?: string;

  @IsOptional()
  @IsDateString()
  mdcnExpiryDate?: string;

  @IsOptional()
  @IsString()
  practicingLicenseNumber?: string;

  @IsOptional()
  @IsDateString()
  practicingLicenseExpiry?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  qualifications?: QualificationDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsBoolean()
  acceptsInsurance?: boolean;

  @IsOptional()
  @IsString()
  idType?: IdentificationType;

  @IsOptional()
  @IsString()
  governmentIdNumber?: string;

  @IsOptional()
  @IsString()
  selfiePhotoUrl?: string;

  @IsOptional()
  @IsString()
  governmentIdPhotoUrl?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bvn?: string;
}

export class RiderDto {
  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  driverLicenseNumber: string;

  @IsString()
  nationalIdNumber: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  vehicleRegistration?: string;
}

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  tradingName?: string;

  @IsEnum(OrganizationType)
  type: OrganizationType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  contactPersonPosition?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsString()
  cacNumber?: string;

  @IsOptional()
  @IsString()
  tin?: string;

  @IsOptional()
  @IsEnum(OrganizationOwnershipType)
  ownershipType?: OrganizationOwnershipType;

  @IsOptional()
  @IsNumber()
  yearEstablished?: number;

  @IsOptional()
  @IsEnum(FacilityType)
  facilityType?: FacilityType;

  @IsOptional()
  @IsNumber()
  bedCapacity?: number;

  @IsOptional()
  @IsNumber()
  consultingRooms?: number;

  @IsOptional()
  @IsBoolean()
  hasOperatingTheatre?: boolean;

  @IsOptional()
  @IsBoolean()
  hasICU?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @IsOptional()
  @IsBoolean()
  hasAmbulance?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPharmacy?: boolean;

  @IsOptional()
  @IsBoolean()
  hasLaboratory?: boolean;

  @IsOptional()
  @IsBoolean()
  hasEmergencyRoom?: boolean;

  @IsOptional()
  @IsBoolean()
  is24Hours?: boolean;

  @IsOptional()
  @IsNumber()
  averagePatientVolumeDaily?: number;

  @IsOptional()
  @IsString()
  consultationFeeRange?: string;

  @IsOptional()
  @IsBoolean()
  acceptsInsurance?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hmosAccepted?: string[];

  @IsOptional()
  @IsString()
  nhiaNumber?: string;

  @IsOptional()
  @IsString()
  medicalDirectorName?: string;

  @IsOptional()
  @IsString()
  medicalDirectorMdcn?: string;

  @IsOptional()
  @IsBoolean()
  hasHomeSampleCollection?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testsOffered?: string[];

  @IsOptional()
  @IsString()
  chiefLabScientistName?: string;

  @IsOptional()
  @IsString()
  chiefLabScientistMlsn?: string;

  @IsOptional()
  @IsString()
  superintendentPharmacistName?: string;

  @IsOptional()
  @IsString()
  superintendentPharmacistLicense?: string;

  @IsOptional()
  @IsBoolean()
  hasDelivery?: boolean;

  @IsOptional()
  @IsBoolean()
  hasColdChain?: boolean;

  @IsOptional()
  @IsBoolean()
  handlesControlledDrugs?: boolean;

  @IsOptional()
  @IsString()
  naicomNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productTypes?: string[];

  @IsOptional()
  @IsString()
  coverageScope?: string;

  @IsOptional()
  @IsBoolean()
  hasApiIntegration?: boolean;

  @IsOptional()
  @IsNumber()
  claimsTurnaroundDays?: number;

  @IsOptional()
  @IsString()
  coverageArea?: string;

  @IsOptional()
  @IsNumber()
  ambulanceCount?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(AmbulanceType, { each: true })
  ambulanceTypes?: AmbulanceType[];

  @IsOptional()
  @IsBoolean()
  hasGpsTracking?: boolean;

  @IsOptional()
  @IsString()
  averageResponseTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicleTypes?: string[];

  @IsOptional()
  @IsBoolean()
  hasColdChainDelivery?: boolean;

  @IsOptional()
  @IsBoolean()
  hasGpsTrackingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  hasSameDayDelivery?: boolean;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankBvn?: string;

  @IsOptional()
  @IsEnum(SettlementFrequency)
  settlementFrequency?: SettlementFrequency;

  @IsOptional()
  @IsBoolean()
  ndprConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  antiFraudDeclaration?: boolean;

  @IsOptional()
  @IsBoolean()
  slaAccepted?: boolean;
}

export class AddRoleDto {
  @IsString()
  role: string;
}

export class SwitchRoleDto {
  @IsString()
  activeRole: string;
}

export class UploadDocumentDto {
  @IsString()
  documentType: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class AddBankAccountDto {
  @IsString()
  bankName: string;

  @IsString()
  accountName: string;

  @IsString()
  accountNumber: string;

  @IsOptional()
  @IsString()
  bvn?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsEnum(SettlementFrequency)
  settlementFrequency?: SettlementFrequency;
}
