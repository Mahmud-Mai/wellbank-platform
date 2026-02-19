# WellBank — Lovable Analysis & Corrections

**Date:** 2026-02-19

---

## Part 1: What's Working (Lovable Did Well)

| Area | Status | Notes |
|------|--------|-------|
| **Tech Stack** | ✅ | Next.js 14, Tailwind, Radix UI/shadcn, Lucide, React Hook Form + Zod |
| **Patient Registration** | ✅ | 4-step flow: Account → Personal → Health → Insurance |
| **Mock API** | ✅ | Realistic mock data with proper delays |
| **Dashboard** | ✅ | Quick actions, wallet card, consultations, transactions, WellPoints |
| **Nigeria-Centric** | ✅ | Phone +234, Regions, Currency ₦ |
| **Types** | ✅ | Comprehensive types.ts covering Patient, Wallet, Consultations, etc. |

---

## Part 2: Gaps vs PRD & Final Decisions

### Critical Gaps

| # | Issue | Current | Expected (PRD) | Action |
|---|-------|---------|----------------|--------|
| **1** | **Registration Flow** | 4 steps (Account → Personal → Health → Insurance) | **10 steps**: Splash → Welcome → Signup → OTP → Password → Personal → **Subscription** → Payment → Success → Login | ADD: Steps 1-3 (Splash, Welcome, OTP), Steps 7-8 (Subscription + Payment) |
| **2** | **OTP Verification** | NOT implemented in frontend | OTP step after phone entry, verify via code | ADD OTP flow |
| **3** | **Subscription** | NOT implemented | Step 7: Plan selection, Step 8: Payment | ADD subscription selection + payment |
| **4** | **User Roles** | Single role only | Multi-role hybrid model | Update types and mock API |
| **5** | **Patient Profile Fields** | Missing: nationality, LGA | Add: nationality, LGA (from PRD Patient Section A) | ADD fields |
| **6** | **Organizations/Hospital** | NOT implemented | Hospital as Organization entity with members | ADD organization types and mock endpoints |

### Medium Gaps

| # | Issue | Current | Expected | Action |
|---|-------|---------|----------|--------|
| **7** | **Provider Onboarding** | NOT implemented | 4-step: Basic → Professional → Regulatory → Banking | ADD provider registration flows |
| **8** | **Provider Roles** | 8 roles in types.ts | But no onboarding UI | ADD for Doctor, Lab, Pharmacy, Hospital, Emergency |
| **9** | **Bank Accounts** | NOT in types | For provider payouts (PRD Banking Section) | ADD BankAccount type |
| **10** | **Ledger/Double-Entry** | Simple transactions | Full double-entry for financial tracking | ADD ledger entry types (future) |
| **11** | **Role Switcher** | NOT implemented | Multi-role users need role switcher in UI | ADD role switcher |
| **12** | **Splash/Welcome** | NOT implemented | First 3 screens of onboarding | ADD splash and welcome slides |

---

## Part 3: Context for Copy-Paste to Lovable

### Updated User Roles (Multi-Role Model)

```typescript
// User roles - SIMPLIFIED (3 roles + wellbank_admin)
export type UserRole =
  | "patient"                    // Seeks healthcare services
  | "doctor"                     // Provides consultations (can be independent)
  | "provider_admin"              // Creates organizations (hospital/lab/pharmacy/etc)
  | "wellbank_admin";            // Platform admin (seeded, created by super admin)

// Organization types - ALL provider types are organizations
export type OrganizationType =
  | "hospital"
  | "laboratory" 
  | "pharmacy"
  | "clinic"
  | "insurance"
  | "emergency"
  | "logistics";

// Roles within an organization (scoped to org, not global)
export type OrganizationMemberRole =
  | "admin"            // Manages org, invites members
  | "doctor"           // Works at org
  | "pharmacist"        // Works at pharmacy org
  | "lab_tech"          // Works at lab org
  | "nurse"
  | "receptionist"
  | "staff";
```

### Updated Patient Profile (PRD Fields)

```typescript
export interface PatientProfile {
  // ... existing fields
  nationality: string;          // NEW: from PRD
  lga: string;                  // NEW: Local Government Area (Nigeria)
  nextOfKin: {                  // NEW: distinct from emergency contact
    name: string;
    phoneNumber: string;
    relationship: string;
  };
  // Selfie for verification - NEW
  profilePhoto?: string;
}
```

### Subscription Model (NEW)

```typescript
export interface SubscriptionPlan {
  id: string;
  name: string;               // "Basic", "Standard", "Premium"
  price: number;               // Monthly price in NGN
  billingCycle: "monthly" | "yearly";
  features: string[];
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  renewalDate: string;
  paymentMethod: "wallet" | "card" | "bank_transfer";
}
```

### Updated Auth Flow (10 Steps per PRD)

```
1. Splash Screen          → App opening
2. Welcome (3 slides)    → Platform introduction
3. Sign Up               → Email/Phone + Password
4. OTP Verification       → Verify phone/email
5. Create Password       → (if not set in step 3)
6. Personal Details      → Name, DOB, Gender, Address, Emergency Contact
7. Subscription Plan     → NEW: Select plan
8. Payment               → NEW: Pay for subscription
9. Success               → Account created
10. Login               → Sign in
```

### Bank Account (for Provider Settlements)

```typescript
export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bvn: string;
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt: string;
}
```

---

## Part 4: Prompt for Lovable — Corrections & Next Tasks

Copy and paste this into Lovable:

---

### CORRECTIONS NEEDED (Do First)

**1. Add Splash & Welcome Screens**
- Create Splash screen (2-3 seconds, logo)
- Create Welcome carousel (3 slides explaining the app)

**2. Add OTP Verification Step**
- After user enters email/phone in registration, show OTP input screen
- Mock OTP verification (accept any 6-digit code)
- Move to password creation after OTP verified

**3. Add Subscription Selection (NEW Step 7)**
- Show 3 plans: Basic (₦X/mo), Standard (₦Y/mo), Premium (₦Z/mo)
- Allow selection
- Mock payment (simulate successful payment)

**4. Update Patient Profile Type**
- Add fields: `nationality`, `lga`, `nextOfKin`, `profilePhoto`
- Update Registration form to collect these

**5. Add Role Switcher**
- In user dropdown/menu, show "Switch Role" if user has multiple roles
- Updates `activeRole` in context
- Changes dashboard content based on active role

---

### CRITICAL: Patient Onboarding - ADD Missing Field

**Current Medications** is MISSING from the registration form!

Add this field to Step 3 (Health Info):
```typescript
currentMedications: z.string().optional(),  // Add this
```

And update PatientProfile type:
```typescript
currentMedications: string[],  // NEW - current medications
```

---

### NEW TASKS (Do After Corrections)

**Task A: Provider Registration Flows**

Create registration for each provider type per the PRD (4 sections each):

#### Doctor Registration (4 Steps):
- **Step 1: Account** - email, password, phone
- **Step 2: Professional** - specialty, subspecialty, yearsExperience, consultationFee, hospitalAffiliation(s), availability
- **Step 3: Regulatory Documents** - MBBS Certificate, MDCN License (number + expiry), Annual Practicing License, NYSC Certificate, Medical Indemnity Insurance (optional), Government ID, Live Selfie
- **Step 4: Banking** - bankName, accountName, accountNumber, BVN

#### Laboratory Registration (4 Steps):
- **Step 1: Account** - email, password, phone
- **Step 2: Business Info** - Lab Name, CAC Number, Contact Person, Phone, Email, Tests Offered (list), Home Collection (yes/no), Operating Hours
- **Step 3: Regulatory Documents** - MLSCN License, Practice License, CAC Certificate, TIN, Environmental/Health Permit (optional), ISO 15189 (optional), Chief Lab Scientist Name + MLSCN Number
- **Step 4: Banking** - bankName, accountName, accountNumber, BVN

#### Pharmacy Registration (4 Steps):
- **Step 1: Account** - email, password, phone
- **Step 2: Business Info** - Pharmacy Name, CAC Number, Superintendent Pharmacist Name, Delivery Available (yes/no), Cold-chain (yes/no), Operating Hours
- **Step 3: Regulatory Documents** - PCN License, Superintendent Pharmacist License, Annual Premises License, CAC Certificate, TIN, Controlled Drugs Declaration
- **Step 4: Banking** - bankName, accountName, accountNumber, BVN

#### Hospital Registration:
- Hospital is an ORGANIZATION, created via /organizations endpoint
- Has additional fields: bed capacity, departments, services, branches, etc.
- Medical Director Name + MDCN Number

#### Emergency Provider Registration:
- Similar 4-step flow with fleet details, ambulance types (BLS/ALS), GPS, response time

**Task B: Organization & Members**

- Add types for Organization, OrganizationMember
- Mock API for organization endpoints
- Provider admin can view/manage organization members

**Task C: Ledger/Double-Entry Types (Future)**

- Add LedgerEntry type for financial tracking
- For now, just add to types.ts for future implementation

**Task D: Update Mock API**

Add these new endpoints to mock-api.ts:
- `auth.verifyOtp` - already exists, ensure works
- `auth.sendOtp` - send OTP to phone/email
- `auth.registerWithOtp` - new flow: send OTP → verify → create account
- `subscription.plans` - list available plans
- `subscription.subscribe` - select and pay for plan
- `organizations.list` - list user's organizations
- `organizations.members` - list members of org
- `bankAccounts.list` - list user's bank accounts
- `bankAccounts.add` - add bank account for payouts

---

### CONTEXT: Final Architecture Decisions

**User Roles (3 Initial + Add More):**
- `patient` - Seeks healthcare services
- `doctor` - Provides consultations (can be independent or affiliated to organization)
- `provider_admin` - Manages an organization (hospital/lab/pharmacy)
- Users can ADD more roles later (e.g., patient adds doctor role)

**NOTE: Deviation from PRD**
The PRD specifies users register directly as lab, pharmacy, hospital. 
We simplified to: users register as patient/doctor/provider_admin, then:
- provider_admin creates ORGANIZATIONS (lab, pharmacy, hospital)
- Users are INVITED to organizations with roles (doctor, staff, pharmacist, lab_tech)

This is cleaner because:
1. Fewer user roles to manage
2. Organizations are distinct entities (can have branches)
3. Staff roles are scoped to organizations, not global
4. Easier to add new organization types later

**Organizations:**
- Created by users with `provider_admin` role
- Types: hospital, lab, pharmacy (with branches support)
- Members invited with roles: doctor, staff, pharmacist, lab_tech, receptionist

**Independent Doctors:**
- Register as `doctor` role directly
- Can later be invited to organizations
- Don't need to create an organization

**Full Onboarding (10 steps):**
- Splash → Welcome → Signup → OTP → Password → Personal → Subscription → Payment → Success → Login

**Financial Ledger:**
- Double-entry bookkeeping for all transactions
- Tracks debits/credits for reconciliation

**Third-Party Integrations:**
- ALL deferred until core app is built
- Stubs for: KYC (Dojah), Payments (BudPay), SMS, Video, Logistics

---

## PART 5: REST API PAYLOADS (For Lovable)

Copy this section specifically to Lovable - these are the actual API contracts:

### Auth Endpoints

```typescript
// POST /auth/otp/send
// Send OTP to phone/email
{ type: "phone" | "email", destination: string }
→ { otpId: uuid, expiresAt: ISO }

// POST /auth/otp/verify  
// Verify OTP, returns temp token
{ otpId: uuid, code: string }
→ { verificationToken: string }

// POST /auth/register/complete
// Complete registration after OTP
{ 
  verificationToken: string,
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  role: "patient" | "doctor" | "lab" | "pharmacy" | "insurance_provider" | "emergency_provider"
}
→ { userId: uuid, roles: string[], activeRole: string, needsOnboarding: boolean }

// POST /auth/login
{ email: string, password: string, mfaCode?: string }
→ { 
  accessToken: string, 
  refreshToken: string, 
  user: { 
    id: uuid, 
    email: string, 
    roles: string[],      // MULTI-ROLE
    activeRole: string,  // CURRENT CONTEXT
    isVerified: boolean,
    isKycVerified: boolean 
  } 
}

// POST /auth/refresh
{ refreshToken: string }
→ { accessToken: string, refreshToken: string }
```

### Patient Profile Endpoints

```typescript
// GET /patients/profile
→ { 
  id: uuid, firstName, lastName, dateOfBirth, gender,
  nationality: string,       // NEW
  lga: string,               // NEW  
  profilePhoto: string,     // NEW
  nextOfKin: { name, phoneNumber, relationship },  // NEW
  genotype: string,          // NEW (AA, AS, SS, AC)
  bloodType, allergies, chronicConditions,
  address: { street, city, state, lga, country, postalCode },
  emergencyContacts: [],
  nin, bvn, kycLevel, isKycVerified,
  identificationType: "NIN" | "BVN" | "VOTER_CARD" | "DRIVERS_LICENSE" | "PASSPORT"  // EXPANDED
}

// PATCH /patients/profile
// All fields optional
{ nationality?, lga?, firstName?, lastName?, dateOfBirth?, gender?, 
  profilePhoto?, nextOfKin?, genotype?, bloodType?, allergies?, chronicConditions?,
  address?, emergencyContacts? }
```

### Organization Endpoints (Hospitals, Labs, Pharmacies)

```typescript
// POST /organizations (provider_admin only)
{ 
  name: string,
  type: "hospital" | "lab_chain" | "pharmacy_chain" | "clinic",
  address: { street, city, state, country },
  phoneNumber: string,
  email: string
}
→ { id: uuid, status: "pending" }

// GET /organizations
→ { organizations: [{ id, name, type, roleInOrg, status }] }

// POST /organizations/:id/members
{ userId: uuid, roleInOrg: "admin" | "doctor" | "pharmacist" | "lab_tech" | "receptionist", department?: string }
```

### Subscription Endpoints

```typescript
// GET /subscriptions/plans
→ { plans: [{ id, name, price, billingCycle, features: [] }] }

// POST /subscriptions
{ planId: uuid, paymentMethod: "wallet" | "card" | "bank_transfer" }
→ { subscriptionId, planId, status: "active", startDate, renewalDate }
```

### Bank Accounts (for Provider Payouts)

```typescript
// GET /bank-accounts
→ { accounts: [{ id, bankName, accountName, accountNumber, verificationStatus }] }

// POST /bank-accounts
{ bankName: string, accountName: string, accountNumber: string, bvn: string }
```

---

### FILES TO UPDATE

1. `src/lib/types.ts` - Add new types above
2. `src/lib/mock-api.ts` - Add new endpoints
3. `src/pages/auth/Register.tsx` - Add OTP, Subscription, Welcome screens
4. `src/pages/Landing.tsx` - Add role-based routing after login
5. `src/lib/auth-context.tsx` - Support multi-role

---

### INTEGRATIONS TO STUB (Not Build)

These should return mock/success responses only:
- KYC verification (Dojah) - return mock verified
- Payment (BudPay) - return mock success
- SMS (OTP delivery) - return mock sent
- Video consultation - return mock URL
- Logistics/delivery - return mock tracking

---

