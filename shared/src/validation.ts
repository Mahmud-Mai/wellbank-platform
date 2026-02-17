/**
 * Shared validation schemas using Zod
 */

import { z } from "zod";
import { UserRole, Gender, IdentificationType } from "./enums";

// Common validation schemas
export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1)
});

export const gpsLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  timestamp: z.date()
});

export const emergencyContactSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  email: z.string().email().optional()
});

// Authentication validation
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  mfaCode: z.string().length(6).optional()
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  role: z.nativeEnum(UserRole),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional()
});

export const passwordResetSchema = z.object({
  email: z.string().email()
});

export const passwordUpdateSchema = z.object({
  token: z.string(),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
});

// Patient profile validation
export const patientProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.date(),
  gender: z.nativeEnum(Gender),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  identificationNumber: z.string().min(1),
  identificationType: z.nativeEnum(IdentificationType),
  address: addressSchema,
  emergencyContacts: z.array(emergencyContactSchema).min(1),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([])
});

// Consultation validation
export const consultationBookingSchema = z.object({
  doctorId: z.string().uuid(),
  type: z.enum(["telehealth", "in_person"]),
  scheduledAt: z.date(),
  notes: z.string().optional()
});

// Wallet validation
export const walletDepositSchema = z.object({
  amount: z.number().positive(),
  paymentMethodId: z.string()
});

export const walletWithdrawalSchema = z.object({
  amount: z.number().positive(),
  bankAccountId: z.string()
});

// Emergency validation
export const emergencyRequestSchema = z.object({
  location: gpsLocationSchema,
  type: z.enum([
    "medical",
    "accident",
    "cardiac",
    "respiratory",
    "trauma",
    "other"
  ]),
  notes: z.string().optional()
});

// Pagination
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
