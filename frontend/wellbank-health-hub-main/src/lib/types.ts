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
