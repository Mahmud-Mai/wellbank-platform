/**
 * Shared interfaces for WellBank platform
 */

import {
  UserRole,
  Gender,
  IdentificationType,
  VerificationStatus,
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
  NotificationChannel
} from "./enums";

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

// User and Authentication
export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isKycVerified: boolean;
  mfaEnabled: boolean;
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
  identificationNumber: string;
  identificationType: IdentificationType;
  address: Address;
  emergencyContacts: EmergencyContact[];
  allergies: string[];
  chronicConditions: string[];
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
  licenseNumber: string;
  licenseVerificationStatus: VerificationStatus;
  specialties: Specialty[];
  qualifications: Qualification[];
  availability: AvailabilitySlot[];
  consultationFee: number;
  rating: number;
  reviewCount: number;
  hasAmbulance: boolean;
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
