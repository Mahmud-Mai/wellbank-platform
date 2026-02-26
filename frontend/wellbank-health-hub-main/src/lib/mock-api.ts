import type {
  User,
  PatientProfile,
  WalletInfo,
  Consultation,
  Transaction,
  Notification,
  WellPointsBalance,
  WellPointsTransaction,
  WellPointsReward,
  WellPointsEarningRule,
  WellPointsMilestone,
  DoctorProfile,
} from "./types";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

const mockUser: User = {
  id: "u-001",
  email: "john.doe@email.com",
  roles: ["patient"],
  activeRole: "patient",
  firstName: "John",
  lastName: "Doe",
  isVerified: true,
  isKycVerified: true,
  kycLevel: 3,
  mfaEnabled: false,
};

const mockPatient: PatientProfile = {
  id: "p-001",
  userId: "u-001",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1990-01-15",
  gender: "male",
  phoneNumber: "+2348012345678",
  email: "john.doe@email.com",
  nationality: "Nigerian",
  lga: "Eti-Osa",
  profilePhoto: undefined,
  nextOfKin: { name: "Ngozi Doe", phoneNumber: "+2348012345679", relationship: "spouse" },
  identificationType: "NIN",
  identificationNumber: "12345678901",
  nin: "12345678901",
  bvn: "12345678901",
  kycLevel: 3,
  isKycVerified: true,
  bloodType: "O+",
  genotype: "AA",
  currentMedications: ["Vitamin D"],
  allergies: ["Penicillin"],
  chronicConditions: [],
  address: {
    street: "12 Ozumba Mbadiwe Ave",
    city: "Victoria Island",
    state: "Lagos",
    lga: "Eti-Osa",
    country: "Nigeria",
    postalCode: "10001",
  },
  emergencyContacts: [
    { name: "Ngozi Doe", relationship: "spouse", phoneNumber: "+2348012345679" },
  ],
  insurancePolicy: {
    provider: "AXA Mansard",
    policyNumber: "POL-98761",
    isActive: true,
  },
  createdAt: "2024-06-01T00:00:00Z",
};

const mockWallet: WalletInfo = {
  id: "w-001",
  balance: 75000,
  currency: "NGN",
  isActive: true,
};

const mockConsultations: Consultation[] = [
  {
    id: "c-001",
    doctorId: "d-001",
    doctorName: "Dr. Sarah Adeyemi",
    type: "telehealth",
    status: "scheduled",
    reason: "Follow-up on blood pressure",
    symptoms: ["headache", "dizziness"],
    scheduledAt: "2026-02-19T09:00:00Z",
    fee: 5000,
    createdAt: "2026-02-17T10:00:00Z",
  },
  {
    id: "c-002",
    doctorId: "d-002",
    doctorName: "Dr. Emeka Okafor",
    type: "in_person",
    status: "completed",
    reason: "Annual physical checkup",
    symptoms: ["general checkup"],
    diagnosis: "Healthy – no abnormalities found",
    notes: "Patient in good health. Recommended annual blood work.",
    prescriptions: [
      { id: "rx-001", medicationName: "Vitamin D3", dosage: "1000 IU", frequency: "once daily", duration: "90 days" },
    ],
    labOrders: [
      { id: "lo-001", testName: "Complete Blood Count", status: "completed" },
    ],
    scheduledAt: "2026-02-10T14:00:00Z",
    fee: 7500,
    insuranceCoverage: 5000,
    patientResponsibility: 2500,
    createdAt: "2026-02-08T09:00:00Z",
  },
  {
    id: "c-003",
    doctorId: "d-003",
    doctorName: "Dr. Amina Bello",
    type: "telehealth",
    status: "confirmed",
    reason: "Skin rash consultation",
    symptoms: ["rash", "itching"],
    scheduledAt: "2026-02-20T11:00:00Z",
    fee: 4000,
    createdAt: "2026-02-16T08:00:00Z",
  },
  {
    id: "c-004",
    doctorId: "d-004",
    doctorName: "Dr. Chidi Nwankwo",
    type: "in_person",
    status: "cancelled",
    reason: "Knee pain evaluation",
    symptoms: ["knee pain", "swelling"],
    scheduledAt: "2026-02-05T10:00:00Z",
    fee: 6000,
    createdAt: "2026-02-01T12:00:00Z",
  },
  {
    id: "c-005",
    doctorId: "d-002",
    doctorName: "Dr. Emeka Okafor",
    type: "telehealth",
    status: "completed",
    reason: "Migraine follow-up",
    symptoms: ["migraine", "nausea"],
    diagnosis: "Chronic migraine – adjusted medication",
    prescriptions: [
      { id: "rx-002", medicationName: "Sumatriptan", dosage: "50mg", frequency: "as needed", duration: "30 days" },
    ],
    scheduledAt: "2026-01-28T15:00:00Z",
    fee: 5000,
    createdAt: "2026-01-25T10:00:00Z",
  },
];

const mockTransactions: Transaction[] = [
  { id: "t-001", type: "credit", amount: 50000, balanceAfter: 75000, status: "completed", description: "Wallet Top-up", reference: "WB-TXN-001", createdAt: "2026-02-15T10:00:00Z" },
  { id: "t-002", type: "debit", amount: 5000, balanceAfter: 70000, status: "completed", description: "Consultation – Dr. Adeyemi", reference: "WB-TXN-002", createdAt: "2026-02-14T14:00:00Z" },
  { id: "t-003", type: "debit", amount: 3500, balanceAfter: 66500, status: "completed", description: "Lab Test – CBC", reference: "WB-TXN-003", createdAt: "2026-02-12T09:00:00Z" },
  { id: "t-004", type: "credit", amount: 25000, balanceAfter: 91500, status: "completed", description: "Wallet Top-up via Card", reference: "WB-TXN-004", createdAt: "2026-02-10T08:00:00Z" },
  { id: "t-005", type: "debit", amount: 7500, balanceAfter: 84000, status: "completed", description: "Consultation – Dr. Okafor", reference: "WB-TXN-005", createdAt: "2026-02-08T16:00:00Z" },
  { id: "t-006", type: "debit", amount: 1500, balanceAfter: 82500, status: "completed", description: "Pharmacy – Vitamin D3", reference: "WB-TXN-006", createdAt: "2026-02-06T11:00:00Z" },
  { id: "t-007", type: "credit", amount: 10000, balanceAfter: 92500, status: "completed", description: "Insurance Refund", reference: "WB-TXN-007", createdAt: "2026-02-04T09:00:00Z" },
  { id: "t-008", type: "debit", amount: 2000, balanceAfter: 90500, status: "completed", description: "Lab Home Collection Fee", reference: "WB-TXN-008", createdAt: "2026-02-02T14:00:00Z" },
];

const mockNotifications: Notification[] = [
  { id: "n-001", type: "appointment_reminder", title: "Appointment Tomorrow", message: "Your appointment with Dr. Adeyemi is tomorrow at 9:00 AM", priority: "high", isRead: false, createdAt: "2026-02-18T08:00:00Z" },
  { id: "n-002", type: "lab_result", title: "Lab Results Ready", message: "Your CBC test results are now available", priority: "normal", isRead: false, createdAt: "2026-02-18T06:00:00Z" },
  { id: "n-003", type: "wellpoints", title: "Points Earned!", message: "You earned 100 WellPoints for attending your appointment", priority: "low", isRead: true, createdAt: "2026-02-17T15:00:00Z" },
  { id: "n-004", type: "payment", title: "Payment Successful", message: "₦5,000 paid for consultation with Dr. Adeyemi", priority: "normal", isRead: true, createdAt: "2026-02-17T10:00:00Z" },
  { id: "n-005", type: "prescription", title: "New Prescription", message: "Dr. Okafor issued a prescription for Vitamin D3", priority: "normal", isRead: true, createdAt: "2026-02-16T14:00:00Z" },
  { id: "n-006", type: "appointment_reminder", title: "Appointment Confirmed", message: "Your skin rash consultation with Dr. Bello is confirmed for Feb 20", priority: "normal", isRead: false, createdAt: "2026-02-16T09:00:00Z" },
  { id: "n-007", type: "wellpoints", title: "Tier Upgrade!", message: "Congratulations! You've reached Gold tier", priority: "high", isRead: true, createdAt: "2026-02-14T12:00:00Z" },
  { id: "n-008", type: "medication_reminder", title: "Medication Reminder", message: "Time to take your Vitamin D3 supplement", priority: "low", isRead: true, createdAt: "2026-02-14T08:00:00Z" },
];

const mockWellPoints: WellPointsBalance = {
  balance: 2500,
  tier: "gold",
  lifetimeEarned: 5000,
  lifetimeRedeemed: 2500,
  expiringPoints: 500,
  expiryDate: "2026-03-01",
};

const mockWellPointsTransactions: WellPointsTransaction[] = [
  { id: "wpt-001", type: "earn", points: 100, description: "Attended consultation with Dr. Adeyemi", createdAt: "2026-02-17T15:00:00Z" },
  { id: "wpt-002", type: "earn", points: 50, description: "Completed lab test – CBC", createdAt: "2026-02-12T10:00:00Z" },
  { id: "wpt-003", type: "redeem", points: 500, description: "Redeemed ₦500 discount voucher", createdAt: "2026-02-10T09:00:00Z" },
  { id: "wpt-004", type: "earn", points: 100, description: "Attended consultation with Dr. Okafor", createdAt: "2026-02-08T17:00:00Z" },
  { id: "wpt-005", type: "earn", points: 10, description: "Daily medication adherence", createdAt: "2026-02-07T08:00:00Z" },
  { id: "wpt-006", type: "earn", points: 10, description: "Daily medication adherence", createdAt: "2026-02-06T08:00:00Z" },
  { id: "wpt-007", type: "redeem", points: 300, description: "Redeemed 10% consultation discount", createdAt: "2026-02-05T14:00:00Z" },
  { id: "wpt-008", type: "earn", points: 500, description: "Gold tier milestone bonus", createdAt: "2026-02-04T12:00:00Z" },
];

const mockRewards: WellPointsReward[] = [
  { id: "rw-001", name: "₦500 Discount", pointsCost: 500, discountType: "fixed", value: 500, stock: 100, expiresAt: "2026-12-31" },
  { id: "rw-002", name: "10% Off Consultation", pointsCost: 300, discountType: "percentage", value: 10, stock: 50 },
  { id: "rw-003", name: "₦1,000 Pharmacy Credit", pointsCost: 1000, discountType: "fixed", value: 1000, stock: 30 },
  { id: "rw-004", name: "Free Home Collection", pointsCost: 200, discountType: "fixed", value: 2000, stock: 75 },
];

const mockEarningRules: WellPointsEarningRule[] = [
  { activity: "consultation_attended", points: 100, description: "Earn points for attending consultations" },
  { activity: "lab_test_completed", points: 50, description: "Complete lab tests" },
  { activity: "medication_adherence", points: 10, description: "Log medication daily" },
  { activity: "health_check", points: 75, description: "Complete a health check" },
  { activity: "referral", points: 500, description: "Refer a friend who signs up" },
];

const mockMilestones: WellPointsMilestone[] = [
  { points: 500, tier: "bronze", bonus: 50 },
  { points: 1000, tier: "silver", bonus: 100 },
  { points: 2500, tier: "gold", bonus: 500 },
  { points: 5000, tier: "platinum", bonus: 1000 },
];

const mockDoctors: DoctorProfile[] = [
  {
    id: "d-001", userId: "u-d01", firstName: "Sarah", lastName: "Adeyemi",
    profilePhoto: undefined, bio: "Experienced cardiologist with over 12 years of practice in Lagos. Passionate about preventive cardiology and patient education.",
    specialties: ["Cardiology", "Internal Medicine"], qualifications: [{ degree: "MBBS", institution: "University of Lagos", year: 2010 }, { degree: "FMCP", institution: "NPMCN", year: 2016 }],
    yearsExperience: 12, consultationFee: 5000, licenseNumber: "MDCN-001234", mdcnLicenseNumber: "MDCN-001234", mdcnExpiryDate: "2027-12-31",
    rating: 4.8, reviewCount: 156, acceptsInsurance: true, languages: ["English", "Yoruba"],
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isAvailable: true },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isAvailable: true },
      { dayOfWeek: 3, startTime: "09:00", endTime: "13:00", isAvailable: true },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isAvailable: true },
      { dayOfWeek: 5, startTime: "09:00", endTime: "15:00", isAvailable: true },
    ],
    providerStatus: "active", location: { city: "Victoria Island", state: "Lagos" },
  },
  {
    id: "d-002", userId: "u-d02", firstName: "Emeka", lastName: "Okafor",
    profilePhoto: undefined, bio: "General practitioner dedicated to holistic family medicine. Specializes in chronic disease management and preventive care.",
    specialties: ["General Practice", "Family Medicine"], qualifications: [{ degree: "MBBS", institution: "University of Nigeria", year: 2012 }],
    yearsExperience: 10, consultationFee: 7500, licenseNumber: "MDCN-002345",
    rating: 4.6, reviewCount: 98, acceptsInsurance: true, languages: ["English", "Igbo"],
    availability: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "16:00", isAvailable: true },
      { dayOfWeek: 2, startTime: "08:00", endTime: "16:00", isAvailable: true },
      { dayOfWeek: 3, startTime: "08:00", endTime: "16:00", isAvailable: true },
      { dayOfWeek: 4, startTime: "08:00", endTime: "12:00", isAvailable: true },
      { dayOfWeek: 5, startTime: "08:00", endTime: "16:00", isAvailable: true },
    ],
    providerStatus: "active", location: { city: "Ikeja", state: "Lagos" },
  },
  {
    id: "d-003", userId: "u-d03", firstName: "Amina", lastName: "Bello",
    profilePhoto: undefined, bio: "Board-certified dermatologist focused on skin conditions affecting African skin types. Expert in eczema, acne, and hyperpigmentation.",
    specialties: ["Dermatology"], qualifications: [{ degree: "MBBS", institution: "Ahmadu Bello University", year: 2013 }, { degree: "FWACP", institution: "WACS", year: 2019 }],
    yearsExperience: 8, consultationFee: 4000, licenseNumber: "MDCN-003456",
    rating: 4.9, reviewCount: 210, acceptsInsurance: false, languages: ["English", "Hausa"],
    availability: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "18:00", isAvailable: true },
      { dayOfWeek: 3, startTime: "10:00", endTime: "18:00", isAvailable: true },
      { dayOfWeek: 5, startTime: "10:00", endTime: "16:00", isAvailable: true },
    ],
    providerStatus: "active", location: { city: "Lekki", state: "Lagos" },
  },
  {
    id: "d-004", userId: "u-d04", firstName: "Chidi", lastName: "Nwankwo",
    profilePhoto: undefined, bio: "Orthopedic surgeon specializing in sports injuries and joint replacement. Former team doctor for several Nigerian sports teams.",
    specialties: ["Orthopedics", "Sports Medicine"], qualifications: [{ degree: "MBBS", institution: "University of Ibadan", year: 2008 }, { degree: "FWACS", institution: "WACS", year: 2015 }],
    yearsExperience: 15, consultationFee: 6000, licenseNumber: "MDCN-004567",
    rating: 4.7, reviewCount: 87, acceptsInsurance: true, languages: ["English", "Igbo", "Yoruba"],
    availability: [
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isAvailable: true },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isAvailable: true },
    ],
    providerStatus: "active", location: { city: "Surulere", state: "Lagos" },
  },
  {
    id: "d-005", userId: "u-d05", firstName: "Funke", lastName: "Adekunle",
    profilePhoto: undefined, bio: "Pediatrician with a special interest in neonatal care and childhood nutrition. Runs a popular child wellness program.",
    specialties: ["Pediatrics", "Neonatology"], qualifications: [{ degree: "MBBS", institution: "Lagos State University", year: 2011 }, { degree: "FMCPaed", institution: "NPMCN", year: 2018 }],
    yearsExperience: 11, consultationFee: 4500, licenseNumber: "MDCN-005678",
    rating: 4.9, reviewCount: 320, acceptsInsurance: true, languages: ["English", "Yoruba"],
    availability: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "14:00", isAvailable: true },
      { dayOfWeek: 2, startTime: "08:00", endTime: "14:00", isAvailable: true },
      { dayOfWeek: 3, startTime: "08:00", endTime: "14:00", isAvailable: true },
      { dayOfWeek: 4, startTime: "08:00", endTime: "14:00", isAvailable: true },
      { dayOfWeek: 5, startTime: "08:00", endTime: "14:00", isAvailable: true },
    ],
    providerStatus: "active", location: { city: "Yaba", state: "Lagos" },
  },
  {
    id: "d-006", userId: "u-d06", firstName: "Oluwaseun", lastName: "Bakare",
    profilePhoto: undefined, bio: "Psychiatrist experienced in anxiety, depression, and trauma recovery. Advocate for mental health awareness in Nigeria.",
    specialties: ["Psychiatry"], qualifications: [{ degree: "MBBS", institution: "Obafemi Awolowo University", year: 2014 }],
    yearsExperience: 9, consultationFee: 8000, licenseNumber: "MDCN-006789",
    rating: 4.5, reviewCount: 64, acceptsInsurance: false, languages: ["English", "Yoruba"],
    availability: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "16:00", isAvailable: true },
      { dayOfWeek: 3, startTime: "10:00", endTime: "16:00", isAvailable: true },
      { dayOfWeek: 5, startTime: "10:00", endTime: "14:00", isAvailable: true },
    ],
    providerStatus: "active", location: { city: "Ikoyi", state: "Lagos" },
  },
];

// Pagination helper
function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);
  return { data, meta: { pagination: { total, page, perPage, totalPages } } };
}

// Mock API
export const mockApi = {
  auth: {
    sendOtp: async (data: { type: "phone" | "email"; destination: string }) => {
      await delay(600);
      return {
        status: "success" as const,
        message: "OTP sent",
        data: { otpId: "otp-" + Date.now(), expiresAt: new Date(Date.now() + 5 * 60000).toISOString() },
      };
    },
    verifyOtp: async (data: { otpId: string; code: string }) => {
      await delay(600);
      return {
        status: "success" as const,
        message: "OTP verified",
        data: { verificationToken: "vt-" + Date.now() },
      };
    },
    completeRegistration: async (data: {
      verificationToken: string;
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      role: "patient" | "doctor" | "provider_admin";
    }) => {
      await delay(800);
      return {
        status: "success" as const,
        message: "Registration complete",
        data: {
          userId: "u-new-001",
          roles: [data.role],
          activeRole: data.role,
          needsOnboarding: true,
        },
      };
    },
    login: async (data: { email: string; password: string; mfaCode?: string }) => {
      await delay(800);
      return {
        status: "success" as const,
        message: "Login successful",
        data: {
          accessToken: "mock-jwt-token",
          refreshToken: "mock-refresh-token",
          user: mockUser,
        },
      };
    },
    refresh: async (data: { refreshToken: string }) => {
      await delay(300);
      return {
        status: "success" as const,
        message: "Token refreshed",
        data: { accessToken: "mock-jwt-new", refreshToken: "mock-refresh-new" },
      };
    },
    logout: async () => {
      await delay(200);
      return { status: "success" as const, message: "Logged out", data: null };
    },
    // Registration state management
    saveRegistrationStep: async (data: { email: string; step: number; data: Record<string, unknown> }) => {
      await delay(200);
      return { status: "success" as const, data: { step: data.step, data: data.data } };
    },
    getRegistrationState: async (_data: { email: string; token: string }) => {
      await delay(200);
      return { status: "error" as const, message: "No registration state found" };
    },
    resumeRegistration: async (_data: { email: string }) => {
      await delay(200);
      return { status: "error" as const, message: "No registration to resume" };
    },
    clearRegistrationState: async (_data: { email: string }) => {
      await delay(200);
      return { status: "success" as const, message: "Registration state cleared" };
    },
  },
  users: {
    getMe: async () => {
      await delay(300);
      return { status: "success" as const, message: "User retrieved", data: mockUser };
    },
    updateMe: async (data: Partial<User>) => {
      await delay();
      return { status: "success" as const, message: "Updated", data: { ...mockUser, ...data } };
    },
    addRole: async (data: { role: string }) => {
      await delay();
      const roles = [...mockUser.roles, data.role as User["activeRole"]];
      return { status: "success" as const, message: "Role added", data: { roles, activeRole: mockUser.activeRole } };
    },
    switchRole: async (data: { activeRole: string }) => {
      await delay(300);
      return { status: "success" as const, message: "Role switched", data: { activeRole: data.activeRole } };
    },
  },
  patients: {
    getProfile: async () => {
      await delay();
      return { status: "success" as const, message: "Profile retrieved", data: mockPatient };
    },
    updateProfile: async (data: Partial<PatientProfile>) => {
      await delay();
      return { status: "success" as const, message: "Profile updated", data: { ...mockPatient, ...data } };
    },
    completeProfile: async (_data: any) => {
      await delay(800);
      return { status: "success" as const, message: "Profile completed", data: { verificationStatus: "APPROVED" } };
    },
    uploadDocument: async (_type: string, _file: File) => {
      await delay(600);
      return { status: "success" as const, message: "Document uploaded", data: { id: "doc-" + Date.now(), status: "PENDING" } };
    },
  },
  wallet: {
    get: async () => {
      await delay(300);
      return { status: "success" as const, message: "Wallet retrieved", data: mockWallet };
    },
    getTransactions: async (params?: { type?: string; page?: number; perPage?: number }) => {
      await delay();
      let filtered = mockTransactions;
      if (params?.type && params.type !== "all") {
        filtered = filtered.filter((t) => t.type === params.type);
      }
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 5;
      const { data, meta } = paginate(filtered, page, perPage);
      return { status: "success" as const, message: "Transactions retrieved", data: { transactions: data }, meta };
    },
    fund: async (amount: number, _paymentMethod: string) => {
      await delay(800);
      return {
        status: "success" as const,
        message: "Funding initiated",
        data: { paymentUrl: "https://mock-budpay...", reference: `WB-${Date.now()}`, expiresAt: new Date(Date.now() + 30 * 60000).toISOString() },
      };
    },
  },
  consultations: {
    list: async (params?: { status?: string; search?: string; page?: number; perPage?: number }) => {
      await delay();
      let filtered = mockConsultations;
      if (params?.status && params.status !== "all") {
        filtered = filtered.filter((c) => c.status === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter((c) => c.doctorName.toLowerCase().includes(q));
      }
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 5;
      const { data, meta } = paginate(filtered, page, perPage);
      return { status: "success" as const, message: "Consultations retrieved", data: { consultations: data }, meta };
    },
    getById: async (id: string) => {
      await delay();
      const consultation = mockConsultations.find((c) => c.id === id);
      if (!consultation) return { status: "fail" as const, message: "Not found", data: null };
      return { status: "success" as const, message: "Consultation retrieved", data: consultation };
    },
    cancel: async (_id: string) => {
      await delay(600);
      return { status: "success" as const, message: "Cancelled", data: { refundAmount: 4500, cancellationFee: 500 } };
    },
    startVideo: async (_id: string) => {
      await delay(400);
      return { status: "success" as const, message: "Video started", data: { videoUrl: "https://video-call-url...", token: "mock-jwt-video" } };
    },
  },
  notifications: {
    list: async (params?: { page?: number; perPage?: number }) => {
      await delay();
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 10;
      const { data, meta } = paginate(mockNotifications, page, perPage);
      return {
        status: "success" as const,
        message: "Notifications retrieved",
        data: { notifications: data, meta: { ...meta, unreadCount: mockNotifications.filter((n) => !n.isRead).length } },
      };
    },
    markRead: async (id: string) => {
      await delay(200);
      const n = mockNotifications.find((n) => n.id === id);
      if (n) n.isRead = true;
      return { status: "success" as const, message: "Marked as read", data: { isRead: true } };
    },
    markAllRead: async () => {
      await delay(300);
      mockNotifications.forEach((n) => (n.isRead = true));
      return { status: "success" as const, message: "All read", data: { updatedCount: mockNotifications.length } };
    },
  },
  wellpoints: {
    getBalance: async () => {
      await delay(300);
      return { status: "success" as const, message: "WellPoints retrieved", data: mockWellPoints };
    },
    getTransactions: async (params?: { page?: number; perPage?: number }) => {
      await delay();
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 10;
      const { data, meta } = paginate(mockWellPointsTransactions, page, perPage);
      return { status: "success" as const, message: "Transactions retrieved", data: { transactions: data }, meta };
    },
    getEarningRules: async () => {
      await delay(300);
      return { status: "success" as const, message: "Earning rules retrieved", data: { rules: mockEarningRules, milestones: mockMilestones } };
    },
    getMarketplace: async () => {
      await delay(400);
      return { status: "success" as const, message: "Marketplace retrieved", data: { rewards: mockRewards } };
    },
    redeem: async (_rewardId: string) => {
      await delay(600);
      return {
        status: "success" as const,
        message: "Reward redeemed",
        data: { voucherCode: "WP-" + Math.random().toString(36).slice(2, 8).toUpperCase(), expiresAt: "2026-03-31" },
      };
    },
  },
  doctors: {
    completeProfile: async (_data: any) => {
      await delay(800);
      return { status: "success" as const, message: "Doctor profile submitted", data: { verificationStatus: "PENDING" } };
    },
    uploadDocument: async (_type: string, _file: File) => {
      await delay(600);
      return { status: "success" as const, message: "Document uploaded", data: { id: "doc-" + Date.now(), status: "PENDING" } };
    },
    search: async (params?: { specialty?: string; location?: string; minRating?: number; maxFee?: number; search?: string; page?: number; perPage?: number }) => {
      await delay();
      let filtered = mockDoctors;
      if (params?.specialty) {
        filtered = filtered.filter((d) => d.specialties.some((s) => s.toLowerCase().includes(params.specialty!.toLowerCase())));
      }
      if (params?.location) {
        filtered = filtered.filter((d) => d.location?.state?.toLowerCase().includes(params.location!.toLowerCase()) || d.location?.city?.toLowerCase().includes(params.location!.toLowerCase()));
      }
      if (params?.minRating) {
        filtered = filtered.filter((d) => d.rating >= params.minRating!);
      }
      if (params?.maxFee) {
        filtered = filtered.filter((d) => d.consultationFee <= params.maxFee!);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter((d) => `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) || d.specialties.some((s) => s.toLowerCase().includes(q)));
      }
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 10;
      const { data, meta } = paginate(filtered, page, perPage);
      return { status: "success" as const, message: "Doctors found", data: { doctors: data }, meta };
    },
    getById: async (id: string) => {
      await delay();
      const doctor = mockDoctors.find((d) => d.id === id);
      if (!doctor) return { status: "fail" as const, message: "Not found", data: null };
      return { status: "success" as const, message: "Doctor retrieved", data: doctor };
    },
  },
  bookConsultation: async (data: { doctorId: string; type: "telehealth" | "in_person"; scheduledAt: string; reason?: string; symptoms?: string[]; useInsurance?: boolean }) => {
    await delay(800);
    const doctor = mockDoctors.find((d) => d.id === data.doctorId);
    return {
      status: "success" as const,
      message: "Consultation booked",
      data: { consultationId: "c-new-" + Date.now(), status: "scheduled", fee: doctor?.consultationFee ?? 5000 },
    };
  },
  organizations: {
    create: async (_data: any) => {
      await delay(1000);
      return { status: "success" as const, message: "Organization created", data: { id: "org-" + Date.now(), status: "pending", verificationStatus: "PENDING" } };
    },
    list: async () => {
      await delay();
      return { status: "success" as const, message: "Organizations retrieved", data: { organizations: [] } };
    },
    getById: async (_id: string) => {
      await delay();
      return { status: "success" as const, message: "Organization retrieved", data: null };
    },
  },
  // Stubs for 3rd party integrations
  kyc: {
    verifyNin: async (_nin: string) => {
      await delay();
      return { verified: true, name: "Mock Name", dob: "1990-01-01" };
    },
  },
  payment: {
    initiatePayment: async (_amount: number) => {
      await delay();
      return { paymentUrl: "https://mock-budpay...", reference: "MOCK-" + Date.now() };
    },
  },
  sms: {
    sendSms: async (_phone: string, _message: string) => {
      await delay(200);
      return { success: true, messageId: "MOCK-SMS-" + Date.now() };
    },
  },
};
