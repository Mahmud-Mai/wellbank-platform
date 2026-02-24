// ─── User Roles (4 total) ───
export type UserRole = "patient" | "doctor" | "provider_admin" | "wellbank_admin";

// ─── Organization ───
export type OrganizationType =
  | "hospital"
  | "laboratory"
  | "pharmacy"
  | "clinic"
  | "insurance"
  | "emergency"
  | "logistics";

export type OrgMemberRole =
  | "admin"
  | "doctor"
  | "pharmacist"
  | "lab_tech"
  | "nurse"
  | "receptionist"
  | "staff";

// ─── Auth ───
export interface User {
  id: string;
  email: string;
  roles: UserRole[];
  activeRole: UserRole;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  isKycVerified: boolean;
  kycLevel: number;
  mfaEnabled: boolean;
  needsOnboarding?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── Address ───
export interface Address {
  street: string;
  city: string;
  state: string;
  lga?: string;
  country: string;
  postalCode?: string;
}

// ─── Emergency Contact ───
export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

// ─── Next of Kin ───
export interface NextOfKin {
  name: string;
  phoneNumber: string;
  relationship: string;
}

// ─── Patient Profile ───
export type IdentificationType = "NIN" | "BVN" | "VOTER_CARD" | "DRIVERS_LICENSE" | "PASSPORT";

export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  phoneNumber: string;
  email: string;
  nationality?: string;
  lga?: string;
  profilePhoto?: string;
  nextOfKin?: NextOfKin;
  identificationType?: IdentificationType;
  identificationNumber?: string;
  nin?: string;
  bvn?: string;
  kycLevel: number;
  isKycVerified: boolean;
  bloodType?: string;
  genotype?: string;
  currentMedications?: string[];
  allergies: string[];
  chronicConditions: string[];
  address: Address;
  emergencyContacts: EmergencyContact[];
  insurancePolicy?: {
    provider: string;
    policyNumber: string;
    isActive: boolean;
  };
  createdAt: string;
  verificationStatus?: VerificationStatusType;
}

// ─── Wallet ───
export interface WalletInfo {
  id: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  status: string;
  description: string;
  reference?: string;
  createdAt: string;
}

// ─── Consultation ───
export interface Consultation {
  id: string;
  doctorName: string;
  doctorId?: string;
  patientId?: string;
  type: "telehealth" | "in_person";
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  reason?: string;
  symptoms?: string[];
  diagnosis?: string;
  notes?: string;
  prescriptions?: { id: string; medicationName: string; dosage: string; frequency?: string; duration?: string }[];
  labOrders?: { id: string; testName: string; status: string }[];
  fee: number;
  insuranceCoverage?: number;
  patientResponsibility?: number;
  scheduledAt: string;
  createdAt?: string;
}

// ─── Notification ───
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

// ─── WellPoints ───
export interface WellPointsBalance {
  balance: number;
  tier: string;
  lifetimeEarned: number;
  lifetimeRedeemed?: number;
  expiringPoints: number;
  expiryDate: string;
}

export interface WellPointsTransaction {
  id: string;
  type: "earn" | "redeem";
  points: number;
  description: string;
  createdAt: string;
}

export interface WellPointsReward {
  id: string;
  name: string;
  pointsCost: number;
  discountType: "fixed" | "percentage";
  value: number;
  stock: number;
  expiresAt?: string;
}

export interface WellPointsEarningRule {
  activity: string;
  points: number;
  description: string;
}

export interface WellPointsMilestone {
  points: number;
  tier: string;
  bonus: number;
}

// ─── Doctor (search/profile) ───
export interface DoctorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  bio?: string;
  specialties: string[];
  qualifications?: { degree: string; institution: string; year: number }[];
  yearsExperience: number;
  consultationFee: number;
  licenseNumber?: string;
  mdcnLicenseNumber?: string;
  mdcnExpiryDate?: string;
  rating: number;
  reviewCount: number;
  acceptsInsurance: boolean;
  languages: string[];
  availability?: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[];
  providerStatus: string;
  location?: { city: string; state: string };
}

// ─── Organization ───
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  address?: Address;
  phoneNumber?: string;
  email?: string;
  status: "pending" | "active" | "suspended";
  roleInOrg?: OrgMemberRole;
  verificationStatus?: VerificationStatusType;
}

// ─── Subscription ───
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  features: string[];
}

// ─── Bank Account ───
export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  verificationStatus: "pending" | "verified" | "failed";
}

// ─── API Response ───
export interface ApiResponse<T> {
  status: "success" | "error" | "fail";
  message: string;
  data: T;
  errors?: { code: string; field?: string; message: string }[];
  meta?: {
    pagination?: {
      total: number;
      page: number;
      perPage: number;
      totalPages: number;
    };
  };
}

// ─── Verification Status ───
export type VerificationStatusType = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

// ─── Document Upload ───
export interface DocumentUpload {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: VerificationStatusType;
  uploadedAt: string;
}

// ─── Patient Onboarding ───
export interface PatientOnboardingData {
  // Personal
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  nationality: string;
  nin?: string;
  address: Address;
  // Next of Kin
  nextOfKin: NextOfKin;
  // Health
  bloodType?: string;
  genotype?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  // Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  // KYC
  idType?: IdentificationType;
}

// ─── Doctor Onboarding ───
export interface DoctorOnboardingData {
  // Personal
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  address: Address;
  // Professional
  specialty: string;
  subSpecialty?: string;
  yearsExperience: number;
  consultationTypes: string[];
  hospitalAffiliations: string[];
  consultationFee: number;
  bio: string;
  // Certifications
  mdcnLicenseNumber: string;
  practicingLicenseExpiry: string;
  // Banking
  bankName: string;
  accountName: string;
  accountNumber: string;
  bvn: string;
  // KYC
  governmentIdType?: IdentificationType;
}

// ─── Organization Data ───
export interface OrganizationData {
  // Common
  name: string;
  type: OrganizationType;
  description: string;
  email: string;
  phoneNumber: string;
  contactPerson: string;
  address: Address;
  cacNumber: string;
  tin: string;
  // Banking
  bankName: string;
  accountName: string;
  accountNumber: string;
  bvn: string;
  settlementFrequency: "daily" | "weekly";
  // Compliance
  dataPrivacyAgreed: boolean;
  termsAccepted: boolean;
  antiFraudDeclared: boolean;
  slaAccepted: boolean;
  // Type-specific (optional)
  ownershipType?: string;
  yearEstablished?: number;
  facilityType?: string;
  bedCapacity?: number;
  consultingRooms?: number;
  hasOperatingTheatre?: boolean;
  hasICU?: boolean;
  hasPharmacy?: boolean;
  hasLaboratory?: boolean;
  hasAmbulance?: boolean;
  hasEmergencyRoom?: boolean;
  is24Hours?: boolean;
  services?: string[];
  departments?: string[];
  averagePatientVolumeDaily?: number;
  consultationFeeRange?: string;
  acceptsInsurance?: boolean;
  hmosAccepted?: string[];
  nhiaNumber?: string;
  medicalDirectorName?: string;
  medicalDirectorMdcn?: string;
  // Lab
  homeSampleCollection?: boolean;
  chiefLabScientistName?: string;
  chiefLabScientistMlsn?: string;
  // Pharmacy
  superintendentPharmacistName?: string;
  superintendentPharmacistLicense?: string;
  deliveryAvailable?: boolean;
  coldChainCapability?: boolean;
  handlesControlledDrugs?: boolean;
  // Insurance
  naicomNumber?: string;
  productTypes?: string[];
  coverageScope?: string;
  apiEnabled?: boolean;
  claimsTurnaroundDays?: number;
  // Emergency
  coverageArea?: string;
  ambulanceCount?: number;
  ambulanceTypes?: string[];
  gpsTracking?: boolean;
  averageResponseTime?: string;
  // Logistics
  vehicleTypes?: string[];
  coldChainDelivery?: boolean;
  sameDayDelivery?: boolean;
}

// ─── Bank Account Input ───
export interface BankAccountInput {
  bankName: string;
  accountName: string;
  accountNumber: string;
  bvn: string;
}
