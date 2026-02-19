export type UserRole =
  | "patient"
  | "doctor"
  | "lab"
  | "pharmacy"
  | "insurance_provider"
  | "emergency_provider"
  | "wellbank_admin"
  | "provider_admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isKycVerified: boolean;
  kycLevel: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  nin?: string;
  bvn?: string;
  kycLevel: number;
  isKycVerified: boolean;
  bloodType?: string;
  genotype?: string;
  address: Address;
  emergencyContacts: EmergencyContact[];
  allergies: string[];
  chronicConditions: string[];
  insurancePolicy?: {
    provider: string;
    policyNumber: string;
    isActive: boolean;
  };
  createdAt: string;
}

export interface WalletInfo {
  id: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface Consultation {
  id: string;
  doctorName: string;
  doctorId?: string;
  type: "telehealth" | "in_person";
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  reason?: string;
  symptoms?: string[];
  diagnosis?: string;
  notes?: string;
  prescriptions?: { id: string; medicationName: string; dosage: string; frequency: string; duration: string }[];
  labOrders?: { id: string; testName: string; status: string }[];
  fee: number;
  insuranceCoverage?: number;
  patientResponsibility?: number;
  scheduledAt: string;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  status: string;
  description: string;
  reference: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

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
