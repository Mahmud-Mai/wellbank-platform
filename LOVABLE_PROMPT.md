# WellBank Frontend Prompt for Lovable

## Project Overview

WellBank is a mobile-first healthcare coordination platform for Nigeria connecting patients to doctors, labs, pharmacies, emergency services, and insurers via a unified digital wallet.

## Tech Stack (STRICT)

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS (dark mode default)
- **Components**: Radix UI / shadcn (ARIA-compliant) - DO NOT use basic HTML elements
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation (MANDATORY for all forms)
- **Data Display**: shadcn DataTable for lists, Cards for directories
- **Feedback**: sonner or shadcn toast notifications (NEVER use alert())
- **Mock**: Create `src/lib/mock-api.ts` to intercept calls - DO NOT call real API yet

- **Auth**: Bearer token in Authorization header

## Base URL

`http://localhost:35432/api/v1`

## API Response Standard

```json
{
  "status": "success" | "error" | "fail",
  "message": "Human-readable message",
  "data": { ... },
  "errors": [{ "code": "CODE", "message": "..." }],
  "meta": { "pagination": { "total": 150, "page": 1, "perPage": 20, "totalPages": 8 } }
}
```

---

## Implementation Guardrails

### Mock API Setup

Create `src/lib/mock-api.ts` that intercepts ALL fetch calls to the Base URL. Return realistic mock data matching the schemas below. Once UI is stable, I will provide instructions to switch to real fetch calls.

### Nigeria-Centric UI (Expandable to Africa)

- **Currency**: Default to `₦` (NGN) using `Intl.NumberFormat('en-NG')` but design currency display as a configurable utility - allow easy switching to KES, GHS, ZAR, XOF, etc. based on country selection
- **Phone Numbers**: Default input prefix to `+234` (Nigeria) but build as `+{countryCode}` where countryCode is derived from selected country in address
- **Date Format**: Use `DD/MM/YYYY` for display
- **States/Regions**: Dynamically load based on selected country (Nigeria: Lagos, Abuja; Kenya: Nairobi, Mombasa; Ghana: Accra, Kumasi)

### Atomic Instructions

| Component Type | Use This                                              |
| -------------- | ----------------------------------------------------- |
| Forms          | react-hook-form + zod                                 |
| Tables         | shadcn DataTable                                      |
| Cards          | shadcn Card                                           |
| Dialogs        | shadcn Dialog                                         |
| Feedback       | shadcn Toast / Sonner                                 |
| Navigation     | Bottom nav (mobile), Sidebar (desktop)                |
| Loading        | shadcn Skeleton                                       |
| Empty States   | Custom illustrations for empty wallets, notifications |

### Dashboard Layout

- Patient Dashboard: "Quick Actions" bento grid (Ambulance, Book Doctor, Top-up) above "Recent Activities" list
- Provider Dashboard: Today's appointments prominent, earnings widget
- Admin Dashboard: Metrics cards at top, data tables below

## API Response Standard

```json
{
  "status": "success" | "error" | "fail",
  "message": "Human-readable message",
  "data": { ... } || [] ,
  "errors": [{ "code": "CODE", "message": "..." }],
  "meta": { "pagination": { "total": 150, "page": 1, "perPage": 20, "totalPages": 8 } }
}
```

---

## User Roles

1. **Patient** - Seeks healthcare services
2. **Doctor** - Provides consultations
3. **Laboratory** - Diagnostic tests
4. **Pharmacy** - Medication dispensing
5. **Insurance Provider** - Health coverage
6. **Emergency Provider** - Ambulance/services
7. **Hospital** - Multi-department facility
8. **WellBank Admin** - Platform management

---

## CRITICAL: 4-Step Provider Onboarding

All providers (Doctor, Lab, Pharmacy, Hospital, Emergency, Insurance) MUST complete:

### Step 1: Basic Information

- `email`, `password`, `firstName`, `lastName`, `phoneNumber`, `role`

### Step 2: Professional/Business Info

**Doctor**: specialty, subspecialty, yearsExperience, consultationFee, hospitalAffiliation, availability
**Lab**: labName, cacNumber, contactPerson, testCategories[], homeCollection, operatingHours
**Pharmacy**: pharmacyName, cacNumber, superintendentPharmacist, deliveryAvailable, coldChain
**Hospital**: hospitalName, bedCapacity, departments[], hasAmbulance, hasICU, hasPharmacy
**Emergency**: companyName, coverageArea, ambulanceCount, alsAvailable, averageResponseTime
**Insurance**: companyName, naicomNumber, coverageTypes[], apiEnabled

### Step 3: Regulatory Verification (NIGERIA)

| Role     | Field                                        | Description              |
| -------- | -------------------------------------------- | ------------------------ |
| All      | `nin`                                        | National ID              |
| All      | `bvn`                                        | Bank Verification Number |
| Doctor   | `mdcn_license_number` + `mdcn_expiry_date`   | Medical Council          |
| Lab      | `mlscn_license_number` + `mlscn_expiry_date` | Lab Council              |
| Pharmacy | `pcn_license_number` + `pcn_expiry_date`     | Pharmacists Council      |
| Org      | `cac_number` + `cac_document_url`            | Corporate Affairs        |
| Hospital | `state_license_number`                       | State Ministry of Health |

### Step 4: Banking & Settlement

- `bankName`, `accountName`, `accountNumber`, `bvn`

### Document Upload Requirements

All documents need: `fileUrl`, `documentNumber`, `expiryDate`, `verificationStatus`

---

## Profile Response Schemas (Updated)

### Patient Profile

```json
{
  "id": "uuid", "firstName": "string", "lastName": "string",
  "dateOfBirth": "ISO8601", "gender": "male|female|other",
  "phoneNumber": "string", "email": "string",
  "identificationType": "NIN|BVN", "identificationNumber": "string",
  "nin": "string", "bvn": "string",
  "kycLevel": 0-4, "isKycVerified": true,
  "bloodType": "A+|...",
  "address": { "street", "city", "state", "country", "postalCode" },
  "emergencyContacts": [{ "name", "relationship", "phoneNumber" }],
  "allergies": ["string"], "chronicConditions": ["string"],
  "ndprConsent": true, "dataProcessingConsent": true, "marketingConsent": false,
  "createdAt": "ISO8601"
}
```

### Doctor Profile

```json
{
  "id": "uuid", "firstName": "string", "lastName": "string",
  "profilePhoto": "url", "bio": "string",
  "specialties": ["string"], "qualifications": [{ "degree", "institution", "year" }],
  "licenseNumber": "string",
  "mdcn_license_number": "string", "mdcn_expiry_date": "ISO8601",
  "licenseVerificationStatus": "pending|approved|rejected",
  "license_expiry_date": "ISO8601",
  "providerStatus": "pending|under_review|active|suspended|deactivated",
  "nin": "string", "bvn": "string",
  "consultationFee": 5000, "rating": 4.5, "reviewCount": 120,
  "hasAmbulance": false, "acceptsInsurance": true,
  "languages": ["English", "Yoruba"],
  "ndprConsent": true, "dataProcessingConsent": true
}
```

### Lab Profile

```json
{
  "id": "uuid", "name": "string", "logo": "url",
  "address": { "street", "city", "state" },
  "phoneNumber", "email", "rating", "reviewCount",
  "offersHomeCollection": true, "homeCollectionFee": 2000,
  "averageTurnaroundTime": 24,
  "operatingHours": { "monday": "08:00-18:00", ... },
  "accreditations": ["ISO 15189"],
  "mlscn_license_number": "string", "mlscn_expiry_date": "ISO8601",
  "cac_number": "string", "cac_document_url": "url",
  "licenseVerificationStatus": "pending|approved|rejected",
  "providerStatus": "pending|under_review|active|suspended|deactivated"
}
```

### Pharmacy Profile

```json
{
  "id": "uuid", "name": "string", "logo": "url",
  "address": { "street", "city", "state" },
  "phoneNumber", "email", "rating", "reviewCount",
  "offersDelivery": true, "deliveryFee": 1000, "averageDeliveryTime": 60,
  "hasColdChain": true,
  "operatingHours": { "monday": "08:00-20:00", ... },
  "licenseNumber": "string",
  "pcn_license_number": "string", "pcn_expiry_date": "ISO8601",
  "cac_number": "string", "cac_document_url": "url",
  "providerStatus": "pending|under_review|active|suspended|deactivated"
}
```

---

## Key Endpoints Summary

### Auth

- `POST /auth/register` - `{email, password, role, firstName, lastName, phoneNumber, identificationType, identificationNumber}` → 201 `{userId, email, role}`
- `POST /auth/login` - `{email, password, mfaCode?}` → 200 `{accessToken, refreshToken, user}`
- `POST /auth/mfa/enable` → `{qrCode, secret, backupCodes}`
- `POST /auth/mfa/verify` - `{code}` → 200

### Profiles

- `GET /patients/profile` → PatientProfile
- `PATCH /patients/profile` - `{firstName?, lastName?, address?, allergies?, chronicConditions?}`
- `GET /doctors/:id` → DoctorProfile
- `GET /labs/:id` → LabProfile
- `GET /pharmacies/:id` → PharmacyProfile
- `GET /doctors/search?specialty&location&minRating&maxFee` → `{doctors: [...]}`

### Consultations

- `POST /consultations` - `{doctorId, slotId, type, reason, symptoms[], useInsurance, insurancePolicyId?}`
- `GET /consultations/:id` → `{id, status, doctorName, diagnosis, prescriptions[], labOrders[]}`
- `POST /consultations/:id/video-session/start` → `{videoUrl, token}`
- `POST /consultations/:id/cancel` → `{refundAmount, cancellationFee}`

### Lab Orders

- `GET /labs/search?location&testType` → `{labs: [...]}`
- `POST /lab-orders` - `{labId, tests[], collectionType, scheduledAt?, useInsurance}`
- `GET /lab-orders/:id` → `{tests[], status, results: [{testName, resultUrl}]}`
- `PATCH /lab-orders/:id/schedule-collection` - `{scheduledAt, collectionAddress}`

### Pharmacy Orders

- `GET /pharmacies/search?location&medication`
- `POST /pharmacies/:id/check-availability` - `{medications: [{name, dosage, quantity}]}`
- `POST /pharmacy-orders` - `{pharmacyId, prescriptionId, medications[], deliveryType, deliveryAddress?}`
- `GET /pharmacy-orders/:id/track` → `{status, currentLocation, deliveryPersonName}`

### Wallet

- `GET /wallet` → `{balance, currency, isActive}`
- `POST /wallet/fund` - `{amount, paymentMethod}` → `{paymentUrl, reference, expiresAt}`
- `GET /wallet/transactions?type` → `{transactions: [{id, type, amount, balanceAfter, status}]}`
- `POST /wallet/payment-methods` - `{type, cardNumber, expiryMonth, expiryYear, cvv}`

### Insurance

- `POST /insurance/policies` - `{providerId, policyNumber, coverageType, expiresAt}`
- `POST /insurance/verify-coverage` - `{policyId, serviceType, serviceAmount}` → `{isEligible, coverageAmount, patientResponsibility}`
- `POST /insurance/claims` - `{policyId, serviceType, serviceId, amount}`

### Emergency

- `POST /emergency/requests` - `{type, description, location: {lat, lng}, severity}` → `{id, status, estimatedArrivalTime}`
- `GET /emergency/requests/:id/track` → `{vehicleLocation, patientLocation, estimatedArrivalTime, providerPhone}`
- `GET /emergency/providers/nearest?latitude&longitude&type`

### Notifications

- `GET /notifications?isRead&type` → `{notifications: [{id, type, title, message, priority, isRead}]}`
- `PATCH /notifications/read-all` → `{updatedCount}`

### WellPoints

- `GET /wellpoints/balance` → `{balance, tier, expiringPoints}`
- `GET /wellpoints/earning-rules` → `{rules: [{activity, points}], milestones}`
- `GET /wellpoints/marketplace` → `{rewards: [{id, name, pointsCost, stock}]}`
- `POST /wellpoints/redeem` - `{rewardId}` → `{voucherCode, expiresAt}`

### Admin

- `GET /admin/dashboard` → `{users: {total, new}, consultations: {revenue}, wallet: {transactionVolume}}`
- `GET /admin/users?role&status&search`
- `POST /admin/provider-verifications/:id/review` - `{action: approve|reject, rejectionReason?}`

---

## Configuration & Constants

Create `src/lib/constants.ts` for easy multi-country expansion:

```typescript
// Country configuration - easy to add more countries
export const COUNTRIES = {
  Nigeria: {
    code: "NG",
    currency: "NGN",
    currencySymbol: "₦",
    locale: "en-NG",
    phonePrefix: "+234",
  },
  Kenya: {
    code: "KE",
    currency: "KES",
    currencySymbol: "KSh",
    locale: "en-KE",
    phonePrefix: "+254",
  },
  Ghana: {
    code: "GH",
    currency: "GHS",
    currencySymbol: "₵",
    locale: "en-GH",
    phonePrefix: "+233",
  },
} as const;

// Get states/regions by country this is not exhaustive, it's just listing examples
export const REGIONS = {
  NG: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Benin City"],
  KE: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  GH: ["Accra", "Kumasi", "Takoradi", "Cape Coast", "Tema"],
} as const;

// Currency formatter utility
export const formatCurrency = (
  amount: number,
  countryCode: "NG" | "KE" | "GH" = "NG",
) => {
  const config = COUNTRIES[countryCode];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
  }).format(amount);
};
```

---

## Onboarding Flow (Patient)

1. Splash → Welcome (3 slides)
2. Sign Up (email/phone + OTP)
3. Create Password
4. Personal Details (name, DOB, gender, address, emergency contact)
5. Subscription Plan Selection → Payment
6. Success → Login

---

## Core User Journeys (Priority)

1. **Patient Registration** - 4-step: Signup → Profile → Insurance → Wallet
2. **Provider Onboarding** - 4-step: Basic → Professional → Regulatory → Banking
3. **Doctor Discovery** - Search → Filter → View Profile → Book
4. **Consultation** - Book → Pay → Waiting Room → Video/Chat → Prescription/Lab
5. **Lab Tests** - Order → Schedule Collection → Sample → Results
6. **Pharmacy** - Search → Check Availability → Order → Track Delivery
7. **Wallet** - Fund → Pay → Transaction History
8. **Emergency** - One-tap → GPS → Assigned → Tracking → Complete

---

## UI Requirements

- Mobile-first responsive (375px → 1440px+)
- Dark mode support
- Bento grid for dashboards
- Bottom navigation on mobile
- Sidebar on desktop
- Loading skeletons for async data
- Toast notifications for actions

---

## Enums Reference

- **Role**: patient, doctor, lab, pharmacy, insurance_provider, emergency_provider, wellbank_admin, provider_admin
- **Gender**: male, female, other
- **ConsultationType**: telehealth, in_person
- **ConsultationStatus**: scheduled, confirmed, in_progress, completed, cancelled
- **OrderStatus**: pending, confirmed, preparing, ready_for_pickup, in_transit, delivered, cancelled
- **ProviderStatus**: pending, under_review, active, suspended, deactivated
- **KycLevel**: 0 (unverified), 1 (email), 2 (ID), 3 (NIN/BVN), 4 (full)
- **VerificationStatus**: unverified, pending, verified, rejected, expired

---

## Mock Data Requirements

Create mock responses for all endpoints using:

- Realistic African names, addresses, phone numbers (use +234, +254, +233 prefixes)
- Test images from placeholder services
- Valid UUIDs for all IDs
- Date math for expiry calculations

---

## Additional Features

### WellPoints (Wellness Rewards System)

- Users earn points for: daily medication adherence, appointment attendance, health check completion
- Display: balance, tier (bronze/silver/gold/platinum), expiring points
- Marketplace for redeeming points on discounts

### Video Consultation Interface

- Waiting room with timer
- Video/audio toggle
- Chat sidebar
- End call button
- Screen sharing capability

### Emergency Services

- One-tap emergency button (always visible)
- GPS location capture
- Severity levels: critical, high, moderate
- Live tracking of ambulance
- Provider assignment history

### Insurance Integration

- Policy linking with verification
- Coverage check before service
- Claims submission and tracking
- Split payments (insurance + wallet)

Build the patient app first, then provider portals.

---

## FIRST TASK

Build the **Multi-Role Landing Page** and **Patient Registration Flow (4 Steps)**:

1. Landing Page with role selection (Patient, Doctor, Lab, Pharmacy)
2. Patient Sign Up flow:
   - Step 1: Email/Phone + OTP verification
   - Step 2: Personal Details (name, DOB, gender, address, emergency contact)
   - Step 3: Health Info (blood type, allergies, conditions)
   - Step 4: Insurance (optional) → Success
3. Patient Login
4. Patient Dashboard with Quick Actions

Focus on patient experience first before the Admin dashboard
