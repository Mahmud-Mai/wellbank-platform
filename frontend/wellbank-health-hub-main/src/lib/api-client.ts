const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:35432/api/v1';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ status: string; message?: string; data?: T; meta?: unknown }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  get<T>(endpoint: string): Promise<{ status: string; message?: string; data?: T; meta?: unknown }> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown): Promise<{ status: string; message?: string; data?: T; meta?: unknown }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<{ status: string; message?: string; data?: T; meta?: unknown }> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<{ status: string; message?: string; data?: T; meta?: unknown }> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth endpoints
export const authApi = {
  sendOtp: (data: { type: 'phone' | 'email'; destination: string }) =>
    api.post('/auth/otp/send', { type: data.type, destination: data.destination }),

  verifyOtp: (data: { otpId: string; code: string }) =>
    api.post('/auth/otp/verify', { otpId: data.otpId, code: data.code }),

  completeRegistration: (data: {
    verificationToken: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'patient' | 'doctor' | 'provider_admin';
  }) => api.post('/auth/register/complete', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', { email: data.email, password: data.password }),

  logout: () => api.post('/auth/logout'),

  refreshToken: (data: { refreshToken: string }) =>
    api.post('/auth/refresh', { refreshToken: data.refreshToken }),

  getProfile: () => api.get('/auth/me'),

  switchRole: (data: { activeRole: string }) =>
    api.post('/auth/role/switch', { activeRole: data.activeRole }),

  addRole: (data: { role: string }) =>
    api.post('/auth/role/add', { role: data.role }),
};

// Patient endpoints
export const patientsApi = {
  getProfile: () => api.get('/patients/profile'),

  completeProfile: (data: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    phoneNumber?: string;
    email?: string;
    nationality?: string;
    lga?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      lga?: string;
      country?: string;
      postalCode?: string;
    };
    nextOfKin?: {
      name?: string;
      phoneNumber?: string;
      relationship?: string;
    };
    bloodType?: string;
    genotype?: string;
    allergies?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
    emergencyContacts?: Array<{
      name?: string;
      phoneNumber?: string;
      relationship?: string;
    }>;
    insurance?: {
      provider?: string;
      policyNumber?: string;
      expiryDate?: string;
      cardPhotoUrl?: string;
    };
  }) => api.post('/patients/complete-profile', data),

  updateProfile: (data: unknown) => api.patch('/patients/profile', data),
};

// Doctor endpoints
export const doctorsApi = {
  search: (params?: {
    specialty?: string;
    location?: string;
    minRating?: number;
    maxFee?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get(`/doctors/search${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => api.get(`/doctors/${id}`),

  getMyProfile: () => api.get('/doctors/profile/me'),

  completeProfile: (data: unknown) => api.post('/doctors/complete-profile', data),

  updateProfile: (data: unknown) => api.patch('/doctors/profile', data),
};

// Organization endpoints
export const organizationsApi = {
  create: (data: {
    name: string;
    type: 'hospital' | 'laboratory' | 'pharmacy' | 'clinic' | 'insurance' | 'emergency' | 'logistics';
    description?: string;
    email?: string;
    phoneNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      lga?: string;
      country?: string;
    };
  }) => api.post('/organizations', data),

  getAll: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get(`/organizations${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => api.get(`/organizations/${id}`),

  update: (id: string, data: unknown) => api.patch(`/organizations/${id}`, data),

  addMember: (orgId: string, data: { userId: string; roleInOrg: string; department?: string }) =>
    api.post(`/organizations/${orgId}/members`, data),

  getMembers: (orgId: string) => api.get(`/organizations/${orgId}/members`),

  removeMember: (orgId: string, memberId: string) =>
    api.delete(`/organizations/${orgId}/members/${memberId}`),
};

// Bank Account endpoints
export const bankAccountsApi = {
  create: (data: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    bvn?: string;
    isPrimary?: boolean;
  }) => api.post('/bank-accounts', data),

  getAll: () => api.get('/bank-accounts'),

  getById: (id: string) => api.get(`/bank-accounts/${id}`),

  delete: (id: string) => api.delete(`/bank-accounts/${id}`),

  setPrimary: (id: string) => api.post(`/bank-accounts/${id}/set-primary`),
};

// Document endpoints
export const documentsApi = {
  create: (data: {
    documentType: string;
    documentNumber?: string;
    fileUrl?: string;
    issueDate?: string;
    expiryDate?: string;
  }) => api.post('/documents', data),

  getAll: (type?: string) => api.get(`/documents${type ? `?type=${type}` : ''}`),

  getById: (id: string) => api.get(`/documents/${id}`),

  delete: (id: string) => api.delete(`/documents/${id}`),
};
