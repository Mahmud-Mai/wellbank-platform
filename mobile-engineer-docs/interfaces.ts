/**
 * Shared interfaces for WellBank platform
 */

import {
  UserRole,
  Gender,
  IdentificationType,
  VerificationStatus,
  DocumentVerificationStatus,
  ConsultationType,
  ConsultationStatus,
  RecordType,
  LabOrderStatus,
  CollectionType,
  MedicationForm,
  DeliveryType,
  OrderStatus,
  TransactionType,
  TransactionStatus,
  DocumentType,
  CoverageType,
  ClaimStatus,
  EmergencyType,
  EmergencyStatus,
  ProviderType,
  OnboardingStepType,
  StepStatus,
  JobType,
  JobStatus,
  NotificationType,
  NotificationChannel,
  KycLevel,
  ProviderStatus as ProviderStatusEnum
} from './enums';

// Common types
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface EncryptedData {
  ciphertext: string;
  keyId: string;
  iv: string;
  authTag: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  timestamp: Date;
  purpose: string;
  ipAddress?: string;
}

// Nigerian Regulatory Fields (Universal Compliance)
export interface NigerianRegulatoryFields {
  nin?: string;
  bvn?: string;
  cac_number?: string;
  cac_document_url?: string;
  mdcn_license_number?: string;
  mdcn_expiry_date?: Date;
  pcn_license_number?: string;
  pcn_expiry_date?: Date;
  mlscn_license_number?: string;
  mlscn_expiry_date?: Date;
}

// NDPR Compliance Flags
export interface NdprCompliance {
  ndprConsent: boolean;
  dataProcessingConsent: boolean;
  marketingConsent?: boolean;
  consentDate?: Date;
  withdrawalDate?: Date;
}

// Document Management
export interface Document {
  id: string;
  ownerId: string;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  verificationStatus: DocumentVerificationStatus;
  expiryDate?: Date;
  issuedDate?: Date;
  issuingAuthority?: string;
  documentNumber?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export { DocumentType } from './enums';

// Universal Compliance Profile
export interface UniversalComplianceProfile {
  userId: string;
  kycLevel: KycLevel;
  ninVerified: boolean;
  bvnVerified: boolean;
  regulatoryVerified: boolean;
  providerStatus: ProviderStatusEnum;
  suspensionReason?: string;
  suspendedAt?: Date;
  suspendedBy?: string;
  reactivations?: Array<{
    reactivatedAt: Date;
    reactivatedBy: string;
    reason: string;
  }>;
}

// User and Authentication
export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isKycVerified: boolean;
  kycLevel: KycLevel;
  mfaEnabled: boolean;
  providerStatus?: ProviderStatusEnum;
  ndprConsent: boolean;
  dataProcessingConsent: boolean;
  marketingConsent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

// Patient Profile
export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  phoneNumber: string;
  email?: string;
  identificationNumber: string;
  identificationType: IdentificationType;
  nin?: string;
  bvn?: string;
  kycLevel: KycLevel;
  isKycVerified: boolean;
  address: Address;
  emergencyContacts: EmergencyContact[];
  allergies: string[];
  chronicConditions: string[];
  bloodType?: string;
  ndprConsent: boolean;
  dataProcessingConsent: boolean;
  marketingConsent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId: string;
  type: RecordType;
  data: EncryptedData;
  createdAt: Date;
  accessLog: AccessLog[];
}

// Doctor Profile
export interface Specialty {
  id: string;
  name: string;
  description: string;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  bio?: string;
  specialties: Specialty[];
  qualifications: Qualification[];
  availability: AvailabilitySlot[];
  licenseNumber: string;
  mdcnLicenseNumber?: string;
  mdcnExpiryDate?: Date;
  licenseVerificationStatus: VerificationStatus;
  licenseExpiryDate?: Date;
  nin?: string;
  bvn?: string;
  providerStatus: ProviderStatusEnum;
  suspensionReason?: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  hasAmbulance: boolean;
  acceptsInsurance: boolean;
  languages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Consultation
export interface Prescription {
  id: string;
  consultationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  createdAt: Date;
}

export interface LabOrder {
  id: string;
  patientId: string;
  doctorId: string;
  labId: string;
  tests: LabTest[];
  status: LabOrderStatus;
  collectionType: CollectionType;
  scheduledAt?: Date;
  results?: LabResult[];
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  type: ConsultationType;
  status: ConsultationStatus;
  scheduledAt: Date;
  duration: number;
  fee: number;
  notes?: string;
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  createdAt: Date;
  updatedAt: Date;
}

// Laboratory
export interface LabTest {
  id: string;
  name: string;
  code: string;
  description: string;
  cost: number;
  preparationInstructions: string;
  turnaroundTime: number;
}

export interface LabResult {
  id: string;
  labOrderId: string;
  testId: string;
  result: EncryptedData;
  normalRange?: string;
  unit?: string;
  isAbnormal: boolean;
  completedAt: Date;
}

// Pharmacy
export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: MedicationForm;
  manufacturer: string;
  price: number;
  inStock: boolean;
}

export interface OrderedMedication {
  medicationId: string;
  quantity: number;
  price: number;
  instructions: string;
}

export interface PharmacyOrder {
  id: string;
  patientId: string;
  pharmacyId: string;
  prescriptionId: string;
  medications: OrderedMedication[];
  deliveryType: DeliveryType;
  deliveryAddress?: Address;
  status: OrderStatus;
  totalCost: number;
  pickupInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Wallet and Payments
export interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  reference: string;
  createdAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  createdAt: Date;
  updatedAt: Date;
}

// Insurance
export interface InsurancePolicy {
  id: string;
  patientId: string;
  providerId: string;
  policyNumber: string;
  coverageType: CoverageType;
  coverageLimit: number;
  deductible: number;
  copayment: number;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Claim {
  id: string;
  policyId: string;
  serviceId: string;
  amount: number;
  status: ClaimStatus;
  submittedAt: Date;
  processedAt?: Date;
  approvedAmount?: number;
  denialReason?: string;
}

// Emergency Services
export interface EmergencyRequest {
  id: string;
  patientId: string;
  location: GPSLocation;
  type: EmergencyType;
  status: EmergencyStatus;
  assignedProviderId?: string;
  dispatchedAt?: Date;
  arrivedAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyProvider {
  id: string;
  name: string;
  type: ProviderType;
  location: GPSLocation;
  isAvailable: boolean;
  responseTime: number;
  equipment: string[];
  phoneNumber: string;
}

// Hospital Profile (Role-Specific)
export interface HospitalProfile {
  id: string;
  userId: string;
  name: string;
  logo?: string;
  description?: string;
  phoneNumber: string;
  email: string;
  website?: string;
  address: Address;
  bedCapacity: number;
  occupiedBeds?: number;
  icuBeds?: number;
  emergencyBeds?: number;
  departments: string[];
  hasAmbulance: boolean;
  ambulanceCount?: number;
  hasEmergencyRoom: boolean;
  hasPharmacy: boolean;
  hasLaboratory: boolean;
  hasRadiology: boolean;
  accreditations: string[];
  operatingHours: OperatingHours;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperatingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

// Pharmacy Profile (Role-Specific)
export interface PharmacyProfile {
  id: string;
  userId: string;
  name: string;
  logo?: string;
  description?: string;
  phoneNumber: string;
  email: string;
  address: Address;
  hasColdChain: boolean;
  offersDelivery: boolean;
  deliveryFee?: number;
  deliveryRadius?: number;
  averageDeliveryTime: number;
  minimumOrderValue?: number;
  operatingHours: OperatingHours;
  licenseNumber: string;
  pcnLicenseNumber?: string;
  pcnExpiryDate?: Date;
  cacNumber?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Laboratory Profile (Role-Specific)
export interface LaboratoryProfile {
  id: string;
  userId: string;
  name: string;
  logo?: string;
  description?: string;
  phoneNumber: string;
  email: string;
  address: Address;
  offersHomeCollection: boolean;
  homeCollectionFee?: number;
  averageTurnaroundTime: number;
  testCategories: string[];
  accreditations: string[];
  mlscnLicenseNumber?: string;
  mlscnExpiryDate?: Date;
  cacNumber?: string;
  operatingHours: OperatingHours;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Insurance Provider Profile
export interface InsuranceProviderProfile {
  id: string;
  userId: string;
  name: string;
  logo?: string;
  description?: string;
  phoneNumber: string;
  email: string;
  website?: string;
  address: Address;
  coverageTypes: CoverageType[];
  policyTypes: string[];
  claimProcess: string;
  customerSupportHours: string;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Emergency Provider Profile
export interface EmergencyProviderProfile {
  id: string;
  userId: string;
  name: string;
  logo?: string;
  description?: string;
  phoneNumber: string;
  email: string;
  address: Address;
  serviceTypes: string[];
  coverageAreas: string[];
  ambulanceCount: number;
  averageResponseTime: number;
  hasAdvancedLifeSupport: boolean;
  hasBasicLifeSupport: boolean;
  operatingHours: OperatingHours;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Provider Verification
export interface ProviderVerification {
  id: string;
  providerId: string;
  providerType: ProviderType;
  licenseNumber: string;
  licenseDocument: string;
  verificationStatus: VerificationStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderOnboarding {
  id: string;
  userId: string;
  currentStep: OnboardingStepType;
  completedSteps: OnboardingStepType[];
  status: ProviderStatusEnum;
  startedAt: Date;
  completedAt?: Date;
  suspendedAt?: Date;
  suspensionReason?: string;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingStep {
  id: string;
  providerId: string;
  stepType: OnboardingStepType;
  status: StepStatus;
  data: any;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Background Jobs
export interface BackgroundJob {
  id: string;
  type: JobType;
  data: any;
  status: JobStatus;
  attempts: number;
  scheduledAt?: Date;
  completedAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  data: any;
  occurredAt: Date;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  isRead: boolean;
  data?: any;
  createdAt: Date;
  readAt?: Date;
}

// WellPoints
export interface WellPointsBalance {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WellPointsTransaction {
  id: string;
  balanceId: string;
  type: "earn" | "redeem" | "expire";
  points: number;
  description: string;
  expiresAt?: Date;
  createdAt: Date;
}
