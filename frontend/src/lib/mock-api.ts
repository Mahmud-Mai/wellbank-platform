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
} from "./types";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

const mockUser: User = {
  id: "u-001",
  email: "john.doe@email.com",
  role: "patient",
  firstName: "John",
  lastName: "Doe",
  isKycVerified: true,
  kycLevel: 3,
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
  nin: "12345678901",
  bvn: "12345678901",
  kycLevel: 3,
  isKycVerified: true,
  bloodType: "O+",
  genotype: "AA",
  address: {
    street: "12 Ozumba Mbadiwe Ave",
    city: "Victoria Island",
    state: "Lagos",
    country: "Nigeria",
    postalCode: "10001",
  },
  emergencyContacts: [
    { name: "Ngozi Doe", relationship: "spouse", phoneNumber: "+2348012345679" },
  ],
  allergies: ["Penicillin"],
  chronicConditions: [],
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
  {
    id: "t-001",
    type: "credit",
    amount: 50000,
    balanceAfter: 75000,
    status: "completed",
    description: "Wallet Top-up",
    reference: "WB-TXN-001",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "t-002",
    type: "debit",
    amount: 5000,
    balanceAfter: 70000,
    status: "completed",
    description: "Consultation – Dr. Adeyemi",
    reference: "WB-TXN-002",
    createdAt: "2026-02-14T14:00:00Z",
  },
  {
    id: "t-003",
    type: "debit",
    amount: 3500,
    balanceAfter: 66500,
    status: "completed",
    description: "Lab Test – CBC",
    reference: "WB-TXN-003",
    createdAt: "2026-02-12T09:00:00Z",
  },
  {
    id: "t-004",
    type: "credit",
    amount: 25000,
    balanceAfter: 91500,
    status: "completed",
    description: "Wallet Top-up via Card",
    reference: "WB-TXN-004",
    createdAt: "2026-02-10T08:00:00Z",
  },
  {
    id: "t-005",
    type: "debit",
    amount: 7500,
    balanceAfter: 84000,
    status: "completed",
    description: "Consultation – Dr. Okafor",
    reference: "WB-TXN-005",
    createdAt: "2026-02-08T16:00:00Z",
  },
  {
    id: "t-006",
    type: "debit",
    amount: 1500,
    balanceAfter: 82500,
    status: "completed",
    description: "Pharmacy – Vitamin D3",
    reference: "WB-TXN-006",
    createdAt: "2026-02-06T11:00:00Z",
  },
  {
    id: "t-007",
    type: "credit",
    amount: 10000,
    balanceAfter: 92500,
    status: "completed",
    description: "Insurance Refund",
    reference: "WB-TXN-007",
    createdAt: "2026-02-04T09:00:00Z",
  },
  {
    id: "t-008",
    type: "debit",
    amount: 2000,
    balanceAfter: 90500,
    status: "completed",
    description: "Lab Home Collection Fee",
    reference: "WB-TXN-008",
    createdAt: "2026-02-02T14:00:00Z",
  },
];

const mockNotifications: Notification[] = [
  {
    id: "n-001",
    type: "appointment_reminder",
    title: "Appointment Tomorrow",
    message: "Your appointment with Dr. Adeyemi is tomorrow at 9:00 AM",
    priority: "high",
    isRead: false,
    createdAt: "2026-02-18T08:00:00Z",
  },
  {
    id: "n-002",
    type: "lab_result",
    title: "Lab Results Ready",
    message: "Your CBC test results are now available",
    priority: "normal",
    isRead: false,
    createdAt: "2026-02-18T06:00:00Z",
  },
  {
    id: "n-003",
    type: "wellpoints",
    title: "Points Earned!",
    message: "You earned 100 WellPoints for attending your appointment",
    priority: "low",
    isRead: true,
    createdAt: "2026-02-17T15:00:00Z",
  },
  {
    id: "n-004",
    type: "payment",
    title: "Payment Successful",
    message: "₦5,000 paid for consultation with Dr. Adeyemi",
    priority: "normal",
    isRead: true,
    createdAt: "2026-02-17T10:00:00Z",
  },
  {
    id: "n-005",
    type: "prescription",
    title: "New Prescription",
    message: "Dr. Okafor issued a prescription for Vitamin D3",
    priority: "normal",
    isRead: true,
    createdAt: "2026-02-16T14:00:00Z",
  },
  {
    id: "n-006",
    type: "appointment_reminder",
    title: "Appointment Confirmed",
    message: "Your skin rash consultation with Dr. Bello is confirmed for Feb 20",
    priority: "normal",
    isRead: false,
    createdAt: "2026-02-16T09:00:00Z",
  },
  {
    id: "n-007",
    type: "wellpoints",
    title: "Tier Upgrade!",
    message: "Congratulations! You've reached Gold tier",
    priority: "high",
    isRead: true,
    createdAt: "2026-02-14T12:00:00Z",
  },
  {
    id: "n-008",
    type: "medication_reminder",
    title: "Medication Reminder",
    message: "Time to take your Vitamin D3 supplement",
    priority: "low",
    isRead: true,
    createdAt: "2026-02-14T08:00:00Z",
  },
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

// Pagination helper
function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);
  return { data, meta: { pagination: { total, page, perPage, totalPages } } };
}

// Mock API functions
export const mockApi = {
  auth: {
    register: async (data: {
      email: string;
      password: string;
      role: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    }) => {
      await delay();
      return {
        status: "success" as const,
        message: "Registration successful",
        data: { userId: "u-new-001", email: data.email, role: data.role },
      };
    },
    login: async (_email: string, _password: string) => {
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
    verifyOtp: async (_code: string) => {
      await delay(600);
      return { status: "success" as const, message: "OTP verified" };
    },
  },
  patients: {
    getProfile: async () => {
      await delay();
      return {
        status: "success" as const,
        message: "Profile retrieved",
        data: mockPatient,
      };
    },
    updateProfile: async (data: Partial<PatientProfile>) => {
      await delay();
      return {
        status: "success" as const,
        message: "Profile updated",
        data: { ...mockPatient, ...data },
      };
    },
  },
  wallet: {
    get: async () => {
      await delay(300);
      return {
        status: "success" as const,
        message: "Wallet retrieved",
        data: mockWallet,
      };
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
      return {
        status: "success" as const,
        message: "Transactions retrieved",
        data: { transactions: data },
        meta,
      };
    },
    fund: async (amount: number, _paymentMethod: string) => {
      await delay(800);
      return {
        status: "success" as const,
        message: "Funding initiated",
        data: {
          paymentUrl: "https://payment-gateway...",
          reference: `WB-${Date.now()}`,
          expiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
        },
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
      return {
        status: "success" as const,
        message: "Consultations retrieved",
        data: { consultations: data },
        meta,
      };
    },
    getById: async (id: string) => {
      await delay();
      const consultation = mockConsultations.find((c) => c.id === id);
      if (!consultation) {
        return { status: "fail" as const, message: "Not found", data: null };
      }
      return {
        status: "success" as const,
        message: "Consultation retrieved",
        data: consultation,
      };
    },
    cancel: async (_id: string) => {
      await delay(600);
      return {
        status: "success" as const,
        message: "Consultation cancelled",
        data: { refundAmount: 4500, cancellationFee: 500 },
      };
    },
    startVideo: async (_id: string) => {
      await delay(400);
      return {
        status: "success" as const,
        message: "Video session started",
        data: { videoUrl: "https://video-call-url...", token: "mock-jwt-video" },
      };
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
        data: {
          notifications: data,
          meta: { ...meta, unreadCount: mockNotifications.filter((n) => !n.isRead).length },
        },
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
      return {
        status: "success" as const,
        message: "WellPoints retrieved",
        data: mockWellPoints,
      };
    },
    getTransactions: async (params?: { page?: number; perPage?: number }) => {
      await delay();
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 10;
      const { data, meta } = paginate(mockWellPointsTransactions, page, perPage);
      return {
        status: "success" as const,
        message: "Transactions retrieved",
        data: { transactions: data },
        meta,
      };
    },
    getEarningRules: async () => {
      await delay(300);
      return {
        status: "success" as const,
        message: "Earning rules retrieved",
        data: { rules: mockEarningRules, milestones: mockMilestones },
      };
    },
    getMarketplace: async () => {
      await delay(400);
      return {
        status: "success" as const,
        message: "Marketplace retrieved",
        data: { rewards: mockRewards },
      };
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
};
