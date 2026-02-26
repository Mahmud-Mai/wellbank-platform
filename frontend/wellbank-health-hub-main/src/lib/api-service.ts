import {
  authApi,
  patientsApi,
  doctorsApi,
  organizationsApi,
  bankAccountsApi,
  documentsApi,
} from "./api-client";
import { mockApi } from "./mock-api";

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === "true";

export const apiService = {
  auth: USE_REAL_API ? authApi : mockApi.auth,
  patients: USE_REAL_API ? patientsApi : mockApi.patients,
  doctors: USE_REAL_API ? doctorsApi : mockApi.doctors,
  organizations: {
    ...mockApi.organizations, // Fallback for list/getById if not in real
    ...(USE_REAL_API ? organizationsApi : {}),
  },
  bankAccounts: USE_REAL_API
    ? bankAccountsApi
    : {
        // Mock for bank accounts since it's missing in mock-api.ts
        create: async (data: any) => ({
          status: "success",
          message: "Bank account created",
          data,
        }),
        getAll: async () => ({ status: "success", data: [] }),
        getById: async (id: string) => ({ status: "success", data: null }),
        delete: async (id: string) => ({
          status: "success",
          message: "Deleted",
        }),
        setPrimary: async (id: string) => ({
          status: "success",
          message: "Set primary",
        }),
      },
  documents: USE_REAL_API ? documentsApi : mockApi.patients, // patients has uploadDocument in mock

  // These are only in mock for now
  wallet: mockApi.wallet,
  consultations: mockApi.consultations,
  notifications: mockApi.notifications,
  wellpoints: mockApi.wellpoints,
  bookConsultation: mockApi.bookConsultation,
  kyc: mockApi.kyc,
  payment: mockApi.payment,
  sms: mockApi.sms,
  users: mockApi.users,
};

export default apiService;
