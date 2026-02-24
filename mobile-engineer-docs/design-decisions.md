# WellBank Design Decisions & Open Discussions

This document tracks architectural decisions, open discussions, and unresolved questions. It serves as a living reference for all developers and AI agents working on the project.

**Principle:** The PRD is the source of truth for product decisions. Where the PRD specifies requirements, we follow them. Technical implementation choices are documented here.

**Status Legend:** `OPEN` = under discussion | `DECIDED` = decision made | `IMPLEMENTED` = code reflects this

---

## DD-001: User Entity Model — Single Role vs. Multi-Role Hybrid

**Status:** DECIDED
**Decision:** Multi-role hybrid — single user + roles table + per-role profile tables + organization membership
**Date Opened:** 2026-02-18
**Date Decided:** 2026-02-19
**Affects:** Auth module, onboarding, all profile modules, wallet, medical records
**Blocking:** Task 7 (User Profiles), Task 8 (Dojah KYC), Task 9 (Provider Onboarding)

### Decision Summary

**Simplified User Roles (deviation from PRD):**
- Users register as: `patient`, `doctor`, or `provider_admin`
- Labs/Pharmacies/Hospitals are **Organizations**, not user roles
- Users can ADD more roles later (e.g., patient adds doctor role)

**Why this approach (vs PRD):**
1. Cleaner separation of concerns — people are users, businesses are organizations
2. Organizations can have branches, multiple locations
3. Staff roles are scoped to organizations, not global
4. Easier to add new organization types without changing user model
5. Everyone logs in as a user — simpler authentication

**Implementation:**
- `UserRole` enum: patient, doctor, provider_admin, insurance_provider, emergency_provider, wellbank_admin
- `OrganizationType` enum: hospital, laboratory, pharmacy, clinic, lab_chain, pharmacy_chain
- `OrganizationMemberRole` enum: admin, doctor, pharmacist, lab_tech, nurse, receptionist, staff

### Implementation

See DD-001 Decision Summary above for the final implementation details.

---

## DD-002: Hospital as an Organization Entity — Doctor Affiliation Model
- Frontend shows role switcher if user has multiple roles
- NDPR compliance: one deletion request wipes everything
- Wallet and payment history unified

**Login flow with multi-role:**
- `POST /auth/login` authenticates the user and returns all assigned roles
- JWT payload includes `roles: string[]` and `activeRole: string`
- Frontend defaults to last-used role or lets user pick
- Role switcher in navbar to change context (updates `activeRole` in token or session)
- Guards check `activeRole` against required roles for each endpoint

**Onboarding impact:**
- Each role has its own onboarding tracked in `provider_onboarding` with `(user_id, role)` composite
- Adding a second role triggers a lighter onboarding (skip KYC if already verified)

### Comparison Summary

| Aspect | Single Role (current) | Separate Tables | Hybrid (recommended) |
|--------|----------------------|-----------------|---------------------|
| Doctor as patient | Needs 2 accounts | Needs 2 accounts | One account, 2 roles |
| Login | Simple | Check N tables | Simple |
| Wallet | Clean | Which account? | Clean |
| Medical records | Only if role=patient | Separate account | Doctor's patient-profile has records |
| Data duplication | None | Name/email/phone duplicated | None |
| Schema bloat | User table grows | Clean per table | Clean — profile tables |
| RBAC guards | Simple enum check | Complex multi-table | Check roles array |
| NDPR deletion | Simple | Must find all accounts | Simple |
| Onboarding | One flow | One flow per table | Per-role, reuses KYC |

### Migration Path (if Option C is chosen)

1. Create `user_roles` junction table
2. Migrate existing `role` column data into `user_roles` rows
3. Create per-role profile tables (patient_profiles, doctor_profiles, etc.)
4. Update `UserRole` usage from single value to array throughout codebase
5. Update JWT strategy to include `roles[]` and `activeRole`
6. Update `RolesGuard` to check against `activeRole`
7. Add "Add Role" endpoint and simplified onboarding for additional roles
8. Drop `role` column from `users` table

### Open Questions

- [ ] Should there be a limit on how many roles a user can have?
- [ ] Should organizational roles (lab, pharmacy, hospital) be tied to an organization entity rather than a user?
- [ ] How does the role switcher work on mobile (bottom nav changes per role)?
- [ ] Does the PRD specify any constraints on multi-role users? (PDFs need to be reviewed — could not be read by current tooling)

### References

- Current user entity: `backend/src/modules/auth/entities/user.entity.ts`
- Shared enums: `shared/src/enums.ts`
- Onboarding migration: `backend/src/migrations/1700000000000-CreateProfileAndDocumentTables.ts`
- Design spec: `.kiro/specs/wellbank/design.md` (lines 1198-1338, provider onboarding flows)
- Requirements spec: `.kiro/specs/wellbank/requirements.md` (Requirement 1 and 1.1)
- Tasks blocked: Tasks 7, 8, 9 in `.kiro/specs/wellbank/tasks.md`

---

## DD-002: Hospital as an Organization Entity — Doctor Affiliation Model

**Status:** DECIDED
**Decision:** Follow PRD — Hospital as Organization entity with organization_members table
**Date Opened:** 2026-02-18
**Date Decided:** 2026-02-19
**Affects:** Auth module, onboarding, doctor profiles, emergency module, organization management
**Blocking:** Task 9 (Provider Onboarding), Task 10 (Doctor Discovery), Task 17 (Emergency Services)
**Related:** DD-001 (multi-role model), DD-010 (Hospital-linked patients)

### Decision

Follow PRD — implement organizations with members:

- Hospitals (and other facilities) are `organizations` table, not users
- `organization_members` links users to organizations with roles (admin, doctor, pharmacist, etc.)
- Doctors can be independent AND affiliated with multiple organizations
- Hospital onboarding includes branches, staff, facility classification, discounts for enrolled patients
- Provider Admin role manages organization, not a separate user type

### Implementation

Per PRD Hospital Onboarding Form:
- Create `organizations` table with type (HOSPITAL, LAB_CHAIN, PHARMACY_CHAIN, CLINIC)
- Create `organization_members` junction table
- Hospital profile includes branches, bed capacity, departments, services
- Doctor affiliation via organization_members
- Hospital-linked patients via enrollment table (DD-010)

### Problem

The requirements list **8 roles** including Hospital (`requirements.md:49`), and the design has a Hospital onboarding flow (`design.md:1218-1225`), a `HospitalProfile` interface (`shared/src/interfaces.ts:465`), and `HOSPITAL` in the `ProviderType` enum. However:

1. **`UserRole` enum is missing `HOSPITAL`** — it's not a registrable role in the current code
2. **No organization/entity concept exists** — a hospital is not just a user, it's an organization that employs doctors, has departments, owns ambulances, and may contain an in-house pharmacy and lab
3. **`PROVIDER_ADMIN` role exists** but has no defined relationship to an organization
4. **No API endpoints for hospitals** in `api-endpoints.md`
5. **No hospital-specific tasks** in `tasks.md`
6. **Doctor-hospital relationship is undefined** — can a doctor belong to a hospital? Can they also practice independently? Can they belong to multiple hospitals?

This matters because the platform needs to support two distinct doctor registration paths:

- **Independent doctor**: Registers individually, manages own availability and fees
- **Hospital-affiliated doctor**: Registered by a hospital, may have hospital-set fees, availability tied to hospital schedule

Similarly, a hospital may have its own pharmacy and lab — are these separate entities or sub-entities of the hospital?

### Key Scenarios to Support

**Scenario 1: Hospital registers on WellBank**
- Hospital admin creates an account, completes organizational onboarding (CAC, accreditation, facility details)
- Hospital admin then invites/registers doctors under the hospital
- These doctors appear in search with their hospital affiliation
- Hospital manages department schedules, consultation fees may be hospital-set

**Scenario 2: Independent doctor registers**
- Doctor registers individually, completes personal onboarding (MDCN, NIN)
- Not affiliated with any hospital
- Manages own schedule, fees, and availability

**Scenario 3: Doctor works at hospital AND independently**
- Doctor is affiliated with Hospital A (certain hours/days)
- Also takes independent consultations outside hospital hours
- Should appear in search as both "Dr. X at Hospital A" and "Dr. X (Independent)"

**Scenario 4: Hospital has in-house pharmacy/lab**
- Hospital registers and indicates it has a pharmacy and lab
- Are these separate provider accounts? Or sub-entities of the hospital?
- Patients ordering from "Hospital A Pharmacy" — how does this work?

### Options Considered

#### Option A: Hospital as a User Role (Flat Model)

Add `HOSPITAL` to `UserRole`. A hospital registers like any other user.

```
users: { id, email, role: 'hospital', ... }
hospital_profiles: { user_id, name, bed_capacity, departments, ... }
```

- Simple to implement
- **Fails** to model the hospital→doctor relationship
- Who is the "user" for a hospital? The admin? The institution?
- Can't model departments, staff, sub-services

#### Option B: Organization Entity (Recommended)

Introduce an `organizations` table that hospitals, large lab chains, and pharmacy chains can use. Individual providers remain as users.

```
organizations (id, name, type, cac_number, status, ...)           -- the institution itself
organization_members (org_id, user_id, role_in_org, department)   -- staff/affiliation
hospital_profiles (org_id, bed_capacity, departments, has_ambulance, ...)
```

With this model:
- A hospital admin registers as a user with role `PROVIDER_ADMIN`, creates an organization
- The organization goes through its own onboarding (CAC verification, facility accreditation)
- Admin invites doctors → doctor either already has a WellBank account or gets invited to create one
- Doctor's `organization_members` entry tracks their affiliation, department, and org-specific role
- A doctor can be in multiple organizations AND practice independently
- Hospital's in-house pharmacy/lab can be modeled as sub-entities of the organization

**Organization types:** HOSPITAL, LAB_CHAIN, PHARMACY_CHAIN, CLINIC

**Login/access flow:**
- Hospital admin logs in → sees org dashboard (manage doctors, departments, schedules)
- Doctor logs in → sees personal dashboard + affiliated hospital context
- `PROVIDER_ADMIN` role now has a clear meaning: admin of an organization

#### Option C: Hospital as a Tag/Affiliation Only

Don't model hospitals as first-class entities. Instead, doctors have a `hospitalAffiliation` field.

- Simplest to implement
- Can't onboard hospitals themselves
- Can't model hospital-level features (bed capacity, ambulance, departments)
- Doesn't support the hospital admin managing their doctors
- **Fails** requirements since Hospital is explicitly listed as a registrable role

### Proposed Data Model (Option B)

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type organization_type NOT NULL,          -- hospital, lab_chain, pharmacy_chain, clinic
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    logo_url VARCHAR(500),
    description TEXT,
    address JSONB,
    cac_number VARCHAR(100),
    cac_document_url VARCHAR(500),
    verification_status verification_status DEFAULT 'pending',
    provider_status provider_status DEFAULT 'pending',
    created_by UUID REFERENCES users(id),     -- the admin who created it
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_in_org VARCHAR(50) NOT NULL,         -- admin, doctor, pharmacist, lab_tech, receptionist
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE TABLE hospital_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    bed_capacity INTEGER,
    occupied_beds INTEGER DEFAULT 0,
    icu_beds INTEGER DEFAULT 0,
    emergency_beds INTEGER DEFAULT 0,
    departments TEXT[] NOT NULL,
    has_ambulance BOOLEAN DEFAULT FALSE,
    ambulance_count INTEGER DEFAULT 0,
    has_emergency_room BOOLEAN DEFAULT FALSE,
    has_pharmacy BOOLEAN DEFAULT FALSE,
    has_laboratory BOOLEAN DEFAULT FALSE,
    has_radiology BOOLEAN DEFAULT FALSE,
    accreditations TEXT[],
    operating_hours JSONB
);
```

### Impact on DD-001 (Multi-Role Model)

If Option B is adopted here, the hybrid model from DD-001 becomes even more important:
- `PROVIDER_ADMIN` in `user_roles` grants access to manage organizations
- A doctor user can be both an `organization_member` (hospital-affiliated) and an independent practitioner
- The `user_roles` table tracks what a user CAN do; `organization_members` tracks where they do it

### Impact on Existing Code

- `UserRole` enum: Remove `HOSPITAL` from consideration as a user role; hospitals are organizations, not users
- `PROVIDER_ADMIN` role: Gets a clear definition — a user who manages one or more organizations
- `ProviderType` enum: `HOSPITAL` remains valid as an organization type
- `HospitalProfile` interface in `shared/src/interfaces.ts`: Needs refactoring to reference `organization_id` instead of `user_id`
- Emergency module: "Dispatch to nearest hospital" queries `organizations` table filtered by type=HOSPITAL with ambulance capability
- Doctor search: Needs to show hospital affiliation from `organization_members`

### Open Questions

- [ ] Can a lab or pharmacy also be an organization? (e.g., a lab chain with multiple branches)
- [ ] Should the organization have its own wallet, or do payments go to the admin's wallet?
- [ ] Can a hospital set consultation fees for its doctors, or do doctors always set their own?
- [ ] How does scheduling work for hospital-affiliated doctors? Hospital manages schedule vs. doctor manages own?
- [ ] Should hospital-affiliated doctors go through a lighter onboarding (hospital already verified)?
- [x] Does the PRD specify any of this? **YES — see PRD Analysis below**
- [ ] What is the MVP scope for hospital support — full org management or just hospital profile + doctor affiliation?

### PRD Analysis (2026-02-18)

The PRD confirms and expands on the hospital model significantly:

**Hospital registers its own doctors:** PRD Section "Hospital Onboarding Form" → Section 8 "WellBank Service Configuration" explicitly asks: "Allow only hospital doctors? (Yes/No)", "Discount for registered patients? (Yes/No)", "Free consultation for enrolled patients? (Yes/No)". This confirms the hospital-as-organization model (Option B).

**Hospital has branches:** PRD Section 2 "Facility Location & Branches" supports multiple branches with separate addresses. The current `HospitalProfile` interface has no branch concept.

**Hospital facility classification:** PRD Section 3 defines facility types (Primary Care Clinic, Secondary Hospital, Tertiary Hospital, Specialist Hospital) — not in current specs.

**Hospital has in-house pharmacy/lab:** PRD Section 3 asks "Pharmacy Available? Laboratory Available?" — confirming sub-entity relationship.

**Hospital-linked patients get benefits:** PRD Workflow 3 says "Patient sees hospital doctors → Discount or free consultation". This requires a patient→hospital relationship.

**Hospital verification includes site inspection:** PRD Section 14 status flow includes `SITE_INSPECTION` step between UNDER_REVIEW and APPROVED — not in current `ProviderStatus` enum.

**Doctor has `hospital_affiliation` field:** PRD Doctor Onboarding Section B explicitly lists "Hospital Affiliation(s)" (plural) — confirming a doctor can be affiliated with multiple hospitals.

**Insurance/HMO integration at hospital level:** PRD Section 9 asks hospitals to list accepted HMOs and NHIA registration — not modeled anywhere in current specs.

### References

- Requirements listing 8 roles including Hospital: `requirements.md:49`
- Hospital onboarding flow: `design.md:1218-1225`
- Hospital in role matrix: `design.md:1335`
- `HospitalProfile` interface: `shared/src/interfaces.ts:464-492`
- `HOSPITAL` in `ProviderType`: `shared/src/enums.ts:174`
- `PROVIDER_ADMIN` in `UserRole`: `shared/src/enums.ts:13`
- Missing from `UserRole` enum: `shared/src/enums.ts:5-14` (no HOSPITAL entry)
- Missing from API endpoints: `api-endpoints.md` (no hospital section)
- Missing from tasks: `tasks.md` (only one mention at line 336)

---

## DD-003: Missing Subscription/Payment Plan Model

**Status:** DECIDED
**Decision:** Follow PRD — include patient subscription in onboarding flow
**Date Opened:** 2026-02-18
**Affects:** Auth module, onboarding, payments, wallet module
**Blocking:** Task 3 (Auth), Task 15 (Wallet/Payments)
**Source:** PRD Section 1 "Authentication & Subscription", PRD Section 5.1 "Onboarding & Access" (Step 7-8)

### Problem

The PRD explicitly includes **patient subscription** as a core monetization model and part of the onboarding flow:

- PRD Section 4 Module 1: "Authentication & Subscription" (grouped together)
- PRD Section 5.1 onboarding screens include: Step 7 "Subscription Plan Selection", Step 8 "Payment for Subscription", Step 9 "Success Screen"
- PRD Section 11 Monetization: "Patient subscription" is item #1
- PRD Section 3.4 Pricing: "Monthly subscription" for patients
- PRD Admin Portal: Screen 4 is "Subscription Plans"

**None of this exists in the current specs or code:**
- No subscription plan entity/interface
- No subscription management API endpoints
- No subscription selection in onboarding flow
- No admin subscription plan configuration
- `requirements.md` doesn't mention subscriptions at all
- `tasks.md` has no subscription-related tasks
- `api-endpoints.md` has no subscription endpoints

### What Needs to Be Defined

1. **Subscription plans table** — plan name, price, billing cycle, features included
2. **User subscriptions table** — user_id, plan_id, status, start_date, renewal_date, payment_method
3. **Subscription in onboarding** — after profile creation, before dashboard access
4. **Subscription gating** — what features are locked without an active subscription?
5. **Admin plan management** — CRUD for subscription plans
6. **Integration with BudPay** — recurring billing or manual renewal
7. **Grace period / expiry handling** — what happens when subscription lapses?

### Open Questions

- [ ] Is subscription required for MVP or can it be deferred to post-MVP?
- [ ] What features are gated behind subscription vs. free?
- [ ] Is there a free tier/trial period?
- [ ] Do providers also have subscriptions (PRD mentions SaaS expansion post-MVP)?
- [ ] Does subscription interact with wallet (auto-deduct from wallet balance)?
- [ ] What subscription plans exist (basic, standard, premium)?

### References

- PRD Section 1 Module 1: Authentication & Subscription
- PRD Section 5.1 Steps 7-8: Subscription Plan Selection & Payment
- PRD Section 11: Monetization model
- PRD Admin Portal Screen 4: Subscription Plans
- Missing from: `requirements.md`, `design.md`, `tasks.md`, `api-endpoints.md`, `shared/src/interfaces.ts`, `shared/src/enums.ts`

---

## DD-004: Missing Logistics/Delivery Provider Role

**Status:** DECIDED
**Decision:** Defer implementation; add stubs to indicate presence and intent
**Date Opened:** 2026-02-18
**Affects:** Pharmacy module, lab module, onboarding, user roles
**Blocking:** Task 14 (Pharmacy Services)
**Source:** PRD Section 7 "Delivery / Logistics Provider"

### Problem

The PRD defines a **7th provider type: Delivery/Logistics Provider** with a full onboarding form (PRD Section 7) including:

- Company details, CAC registration, coverage area
- Vehicle types (bike/van), cold-chain delivery, GPS tracking, same-day capability
- Per-rider verification: driver's license, national ID, guarantor form, police clearance, vehicle registration, road worthiness, LASDRI (Lagos), delivery box hygiene certification
- Company-level compliance: CAC, TIN, public liability insurance

**This role is completely absent from the current specs and code:**
- `UserRole` enum has no `LOGISTICS` or `DELIVERY_PROVIDER`
- No `LogisticsProfile` or `DeliveryProvider` interface (though `shared/src/interfaces.ts` has nothing)
- `DeliveryType` enum only has `PICKUP` and `USER_ARRANGED_DELIVERY` — no platform-managed delivery
- No logistics onboarding, no rider management, no delivery assignment system
- `design.md` explicitly defers logistics to post-MVP: "Third-party logistics partners for delivery"
- `tasks.md` has no logistics tasks

### Key Decision

The `design.md` already made a conscious decision to defer this:
> **Deferred for Post-MVP:** Third-party logistics partners for delivery

The current pharmacy delivery model is `PICKUP` or `USER_ARRANGED_DELIVERY` (the patient arranges their own delivery).

**However**, the PRD includes it as a full onboarding form, suggesting it's expected in the product scope. This needs alignment.

### Options

1. **Keep deferred** — MVP uses pickup-only and user-arranged delivery. Add logistics module post-MVP.
2. **Add basic logistics** — Onboard logistics providers, assign deliveries, but no real-time tracking (that's complex).
3. **Full logistics** — Complete rider management, GPS tracking, cold-chain verification as per PRD.

### Open Questions

- [ ] Is logistics provider required for MVP? PRD includes it but design.md defers it.
- [ ] If deferred, should we still create the data model/enums now to avoid future migration pain?
- [ ] Does lab home collection also use logistics providers, or do labs handle their own collection?

### References

- PRD Section 7: Delivery / Logistics Provider onboarding form
- PRD Rider Requirements: per-rider verification documents
- `design.md:1176`: "Third-party logistics partners for delivery" listed under Deferred
- `shared/src/enums.ts:104-107`: `DeliveryType` only has PICKUP and USER_ARRANGED_DELIVERY
- Missing from: `UserRole` enum, `interfaces.ts`, `api-endpoints.md`, `tasks.md`

---

## DD-005: Patient Onboarding — Missing PRD Fields and OTP Verification

**Status:** DECIDED
**Decision:** Follow PRD — add all missing fields and implement multi-step OTP flow
**Date Opened:** 2026-02-18
**Affects:** Auth module, patient profile, onboarding flow
**Blocking:** Task 3 (Auth), Task 7 (User Profiles)
**Source:** PRD Section 1 "Patient Onboarding Form", PRD Section 5.1 "Onboarding & Access"

### Problem

The PRD patient onboarding is more detailed than what the current specs capture. Gaps:

**A. OTP-based verification (not email link)**

PRD onboarding flow: Sign Up (Phone/Email) → **OTP Verification** → Create Password → Personal Details
Current specs: Email-based verification via token link (`POST /auth/verify-email` with token)

The PRD expects **OTP (one-time password) verification**, likely SMS-based since it's mobile-first Africa market. This is a fundamentally different auth flow from email token verification.

**B. Missing patient profile fields**

| PRD Field | Current Status |
|-----------|---------------|
| Genotype | Missing from `PatientProfile` interface and all specs |
| Blood Group | Exists as `bloodType` in interface, but PRD calls it "Blood Group" |
| State / LGA (Local Government Area) | Missing — `Address` only has street/city/state/country/postalCode |
| Nationality | Missing entirely |
| Next of Kin (name, phone, relationship) | Partially covered by `EmergencyContact` but PRD treats as separate from emergency contacts |
| Selfie upload | Missing — PRD Section D "Verification" requires selfie + valid ID |
| Valid ID type selection | Current has `IdentificationType` (NIN/BVN) but PRD lists: National ID, Voter Card, Driver's License, International Passport |

**C. Insurance during onboarding**

PRD Patient Section C: Insurance info (provider, policy number, expiry, card upload) is collected **during onboarding**, not as a separate flow later. Current specs treat insurance as a completely separate module.

**D. Splash/Welcome screens**

PRD has Splash Screen and Welcome/Introduction (3 slides) — frontend-only concern but not mentioned in any current frontend spec.

### What Needs to Change

1. Add `genotype`, `nationality`, `lga` fields to `PatientProfile` interface
2. Expand `Address` to include `lga` field (Nigeria-specific)
3. Add `nextOfKin` as a distinct field (vs emergency contacts)
4. Expand `IdentificationType` enum: NIN, BVN, VOTER_CARD, DRIVERS_LICENSE, INTERNATIONAL_PASSPORT
5. Add selfie upload requirement to onboarding/KYC flow
6. Decide: OTP verification vs. email link verification (or both?)
7. Include optional insurance collection in patient onboarding step

### Open Questions

- [ ] OTP via SMS — which SMS provider for Nigeria? (e.g., Termii, Africa's Talking)
- [ ] Is OTP required for MVP or can email verification suffice initially?
- [ ] Should `nextOfKin` be a separate entity from `emergencyContacts` or merged?
- [ ] Is selfie verification part of Dojah KYC integration or a separate upload?
- [ ] Should LGA be a dropdown (requires LGA database) or free text?

### References

- PRD Section 1: Patient Onboarding Form (Sections A-D)
- PRD Section 5.1: Onboarding screen flow (10 screens)
- `shared/src/interfaces.ts:190-216`: Current `PatientProfile` interface
- `shared/src/enums.ts:38-41`: Current `IdentificationType` (only NIN, BVN)
- `api-endpoints.md:510-620`: Patient profile endpoints (missing fields)

---

## DD-006: Provider Onboarding Forms — Missing Fields Per PRD

**Status:** DECIDED
**Decision:** Follow PRD — add all ~25 missing document types to `DocumentType` enum and missing profile fields
**Date Opened:** 2026-02-18
**Affects:** All provider onboarding, shared interfaces, document types
**Blocking:** Task 9 (Provider Onboarding)
**Source:** PRD Sections 2-6 (Provider Onboarding Forms)

### Problem

The PRD defines detailed onboarding forms per provider type with fields not captured in the current interfaces. Key gaps per role:

#### Doctor (PRD Section 2)

| PRD Field | Current Status |
|-----------|---------------|
| Sub-specialty | Missing — only `specialties` array exists |
| Years of Experience | Missing from `Doctor` interface |
| Hospital Affiliation(s) (plural) | Missing — ties into DD-002 |
| MBBS Certificate upload | Missing from `DocumentType` enum |
| Annual Practicing License | Missing from `DocumentType` enum |
| NYSC Certificate (or exemption) | Missing from `DocumentType` enum |
| Medical Indemnity Insurance | Missing from `DocumentType` enum |
| Government ID upload | Missing — separate from MDCN license |
| Live Selfie | Missing |

#### Laboratory (PRD Section 3)

| PRD Field | Current Status |
|-----------|---------------|
| RC Number (CAC) | Exists as `cacNumber` |
| Contact Person | Missing from `LaboratoryProfile` |
| TIN (Tax ID) | Missing entirely from all profiles |
| Environmental/Health Permit | Missing from `DocumentType` |
| ISO 15189 certification | Missing from `DocumentType` |
| Chief Lab Scientist Name | Missing |
| Chief Lab Scientist MLSCN Number | Missing |

#### Pharmacy (PRD Section 4)

| PRD Field | Current Status |
|-----------|---------------|
| Superintendent Pharmacist Name | Missing from `PharmacyProfile` |
| Superintendent Pharmacist License | Missing from `DocumentType` |
| Annual Premises License | Missing from `DocumentType` |
| TIN | Missing |
| Controlled Drugs Declaration | Missing entirely |

#### Insurance Provider (PRD Section 5)

| PRD Field | Current Status |
|-----------|---------------|
| NAICOM Registration Number | Missing from `InsuranceProviderProfile` |
| NAICOM License upload | Missing from `DocumentType` |
| Tax Clearance Certificate | Missing from `DocumentType` |
| HMO License | Missing from `DocumentType` |
| API Integration Available | Missing |
| Claims Processing Time | Exists as `claimProcess` (string) but PRD expects numeric turnaround |
| Settlement Account / Billing Cycle | Missing |

#### Emergency/Ambulance Provider (PRD Section 6)

| PRD Field | Current Status |
|-----------|---------------|
| State Coverage area | `coverageAreas` exists but no state-level granularity |
| Fleet types (BLS vs ALS) | `hasAdvancedLifeSupport` and `hasBasicLifeSupport` exist |
| State Ministry of Health Approval | Missing from `DocumentType` |
| Ambulance Service License | Missing from `DocumentType` |
| Vehicle Registration Papers | Missing from `DocumentType` |
| Road Worthiness Certificate | Missing from `DocumentType` |
| Driver Medical Fitness | Missing from `DocumentType` |
| Paramedic Certification | Missing from `DocumentType` |

### Missing Document Types (Summary)

The `DocumentType` enum needs these additions from the PRD:

```typescript
// Doctor-specific
MBBS_CERTIFICATE = "mbbs_certificate",
ANNUAL_PRACTICING_LICENSE = "annual_practicing_license",
NYSC_CERTIFICATE = "nysc_certificate",
MEDICAL_INDEMNITY_INSURANCE = "medical_indemnity_insurance",
GOVERNMENT_ID = "government_id",
SELFIE = "selfie",

// Organization-wide
TAX_CLEARANCE = "tax_clearance",
TIN_CERTIFICATE = "tin_certificate",
ENVIRONMENTAL_HEALTH_PERMIT = "environmental_health_permit",

// Pharmacy-specific
SUPERINTENDENT_PHARMACIST_LICENSE = "superintendent_pharmacist_license",
ANNUAL_PREMISES_LICENSE = "annual_premises_license",

// Insurance-specific
NAICOM_LICENSE = "naicom_license",
HMO_LICENSE = "hmo_license",

// Hospital-specific
STATE_HEALTH_LICENSE = "state_health_license",
HOSPITAL_OPERATING_LICENSE = "hospital_operating_license",
NHIA_ACCREDITATION = "nhia_accreditation",
MDCN_DIRECTOR_LICENSE = "mdcn_director_license",

// Emergency/Ambulance-specific
AMBULANCE_SERVICE_LICENSE = "ambulance_service_license",
VEHICLE_REGISTRATION = "vehicle_registration",
ROAD_WORTHINESS = "road_worthiness",
DRIVER_MEDICAL_FITNESS = "driver_medical_fitness",
PARAMEDIC_CERTIFICATION = "paramedic_certification",
STATE_MINISTRY_APPROVAL = "state_ministry_approval",

// Quality/Optional
ISO_15189 = "iso_15189",
QUALITY_ACCREDITATION = "quality_accreditation"
```

### Action Required

This is a data model expansion, not an architectural decision. The interfaces and enums need to be updated before Task 9 (Provider Onboarding) is implemented. It's recommended to batch these updates together.

### References

- PRD Sections 2-6: All provider onboarding forms
- PRD Section 11: Hospital onboarding document table
- `shared/src/interfaces.ts:118-133`: Current `DocumentType` enum (12 types → needs ~25+)
- `shared/src/interfaces.ts:248-275`: Doctor interface
- `shared/src/interfaces.ts:504-554`: PharmacyProfile, LaboratoryProfile
- `shared/src/interfaces.ts:557-598`: InsuranceProviderProfile, EmergencyProviderProfile

---

## DD-007: Universal Compliance — Bank Accounts Table and TIN

**Status:** DECIDED
**Decision:** Follow PRD — add bank_accounts table and TIN field per provider onboarding requirements
**Date Opened:** 2026-02-18
**Date Decided:** 2026-02-19
**Affects:** Onboarding, payments, provider profiles
**Blocking:** Task 9 (Provider Onboarding), Task 15 (Wallet/Payments)
**Source:** PRD Section "Banking & Settlement" (all provider forms), PRD DB Schema Section 3

### Implementation

Per PRD:
- Create `bank_accounts` table: id, user_id, bank_name, account_name, account_number, bvn, verification_status
- Add TIN field to all organizational provider profiles (Lab, Pharmacy, Insurance, Hospital)
- Add settlement/payout logic for provider payments
- Bank account verification via BVN + account name matching

### Problem

The PRD defines a **dedicated `bank_accounts` table** used across all provider types:

```
bank_accounts: id, user_id, bank_name, account_name, account_number, bvn, verification_status, created_at
```

Every provider onboarding form (Doctor, Lab, Pharmacy, Insurance, Emergency, Hospital) ends with a "Banking & Settlement" section. The current specs have:

- **No `bank_accounts` table or interface** — banking is not modeled anywhere
- BVN exists as a field on regulatory compliance but not as part of a banking entity
- The `Wallet` interface handles patient payments but doesn't cover provider settlement
- No concept of **provider payouts/settlement** — how do doctors/labs/pharmacies get paid?

Additionally, the PRD requires **TIN (Tax Identification Number)** for all organizational providers (Lab, Pharmacy, Insurance, Hospital). TIN is completely absent from current specs.

### What Needs to Be Added

1. `BankAccount` interface and entity (user_id, bank_name, account_name, account_number, bvn, verification_status)
2. TIN field on all organizational provider profiles
3. Settlement/payout concept — periodic payouts from WellBank to provider bank accounts
4. Bank account verification workflow (BVN + account name matching)
5. Hospital settlement frequency preference (daily/weekly — per PRD Section 10)

### References

- PRD DB Schema Section 3: `bank_accounts` table definition
- PRD all provider forms Section E: Banking & Settlement
- Missing from: `shared/src/interfaces.ts`, `shared/src/enums.ts`, `api-endpoints.md`

---

## DD-008: Admin Onboarding Verification Workflow — Expanded Per PRD

**Status:** DECIDED
**Decision:** Follow PRD — expand verification workflow with risk scoring, site inspection, red flags
**Date Opened:** 2026-02-18
**Affects:** Admin module, provider onboarding
**Blocking:** Task 9 (Provider Onboarding), Task 20 (Admin Portal)
**Source:** PRD Sections 5 (Admin Verification Workflow), 6 (KYC/KYB Risk), 8 (Compliance Architecture)

### Problem

The PRD defines a much richer admin verification workflow than what's in the current specs. Key gaps:

**A. Risk scoring system**

PRD Section 6 defines a KYC/KYB risk checklist with auto-risk scoring:
- Identity risk (ID validity, selfie match, phone ownership, duplicate detection)
- Professional risk (MDCN/PCN/MLSCN/NAICOM registry verification, expired license, name mismatch, duplicate license)
- Business risk (CAC validation, TIN validation, bank account name match, BVN match)
- Operational risk (unrealistic pricing, high cancellation, complaints, abnormal transactions)
- Risk levels 0-4 (Unverified → Fully operational)

Current specs have `KycLevel` 0-4 but no risk scoring logic, no red flags system, no registry verification.

**B. Admin verification screens**

PRD Section 5 defines specific admin screens not in current specs:
- Provider Review List with filters (type, status, risk level, state) and risk score column
- Provider Detail Review with document panel (view/approve/reject per document with comments)
- Risk Panel with auto risk score and flags
- Document Expiry Monitor (30/60 day expiry alerts, bulk notify)
- Actions: Approve, Reject, Request Additional Info, Suspend

Current admin spec (`tasks.md` Task 20) only mentions generic "provider verification workflow."

**C. Site inspection step for hospitals**

PRD Hospital verification flow: PENDING → UNDER REVIEW → **SITE INSPECTION** → APPROVED → ACTIVE

Current `ProviderStatus` enum has no `SITE_INSPECTION` status. This is hospital-specific.

**D. Automated controls**

PRD Section 8.3 defines automated controls:
| Event | Action |
|-------|--------|
| License expired | Auto suspend provider |
| High complaint rate | Risk flag |
| Suspicious transactions | Manual review |
| Document rejected | Notify provider |

Current code has a stub for license expiry cron (`compliance/license-expiry.service.ts`) but nothing else.

**E. Audit system**

PRD Section 8.2 defines an `audit_logs` table tracking: profile changes, document approvals, payment changes, medical record access. Current specs mention audit logging conceptually but the PRD provides a concrete schema.

### Open Questions

- [ ] Should `ProviderStatus` enum include `SITE_INSPECTION`? Or is this a sub-status of `UNDER_REVIEW`?
- [ ] How much of the risk scoring system is MVP? Auto-scoring or manual admin assessment?
- [ ] Should registry verification (MDCN, PCN, MLSCN) be automated via API or manual admin check?
- [ ] Is the complaint/operational risk system MVP or post-MVP?

### References

- PRD Section 5: Admin Verification Workflow Screens
- PRD Section 6: KYC/KYB Risk Checklist
- PRD Section 8: Compliance Architecture
- PRD Hospital Section 14: Hospital-specific verification with site inspection
- `shared/src/enums.ts:24-30`: Current `ProviderStatus` (no SITE_INSPECTION)
- `backend/src/modules/compliance/license-expiry.service.ts`: Existing stub

---

## DD-009: Patient Onboarding Flow — OTP vs Email and Subscription Gating

**Status:** DECIDED
**Decision:** Follow PRD — implement multi-step OTP flow with subscription gating
**Date Opened:** 2026-02-18
**Affects:** Auth module, frontend onboarding
**Blocking:** Task 3 (Auth), Task 22 (Frontend Auth UI)
**Source:** PRD Section 5.1 "Onboarding & Access"

### Problem

The PRD defines a specific 10-screen patient onboarding flow that differs from the current backend auth flow:

**PRD Flow:**
1. Splash Screen
2. Welcome / Introduction (3 slides)
3. Sign Up (Phone / Email)
4. **OTP Verification**
5. Create Password
6. Personal Details (name, DOB, gender, address, emergency contact)
7. **Subscription Plan Selection**
8. **Payment for Subscription**
9. Success Screen
10. Login Screen + Forgot Password

**Current Backend Flow:**
1. `POST /auth/register` (email, password, role, name, phone, ID type, ID number — all at once)
2. Email verification via token link
3. Login

**Key differences:**
- PRD separates sign-up into multiple steps (register → OTP → password → profile). Current backend expects everything in one `POST /register` call.
- PRD uses **OTP** (likely SMS). Current backend uses **email token link**.
- PRD requires **subscription selection and payment** before accessing the app. Current flow has no gating.
- PRD collects personal details AFTER account creation. Current flow collects name/phone during registration.

### Impact

The backend registration endpoint needs to be redesigned as a multi-step flow:
1. Step 1: Email/Phone → send OTP
2. Step 2: Verify OTP → create account shell
3. Step 3: Set password
4. Step 4: Personal details (profile creation)
5. Step 5: Subscription selection + payment
6. Step 6: Account activated

This is a fundamental change to the auth flow and interacts with DD-003 (Subscription) and DD-005 (missing patient fields).

### References

- PRD Section 5.1: Patient onboarding screen list
- PRD Screen Flow Diagrams Section 1.1: Master flow
- `api-endpoints.md:49-137`: Current register endpoint (single POST)
- `backend/src/modules/auth/auth.controller.ts`: Current auth controller

---

## DD-010: Hospital-Linked Patients and Discount Model

**Status:** DECIDED
**Decision:** Follow PRD — implement hospital enrollment with discount/free consultation model
**Date Opened:** 2026-02-18
**Affects:** Hospital module, consultation booking, patient profiles
**Blocking:** Post DD-002 (Organization entity must exist first)
**Source:** PRD Workflow 3, PRD Hospital Section 8

### Problem

The PRD defines a "Hospital-Linked Patient" concept:

> **Workflow 3 – Hospital-Linked Patient:** Patient sees hospital doctors → Discount or free consultation

PRD Hospital Section 8 "WellBank Service Configuration" asks:
- "Allow only hospital doctors?" (Yes/No)
- "Discount for registered patients?" (Yes/No)
- "Free consultation for enrolled patients?" (Yes/No)

PRD Patient Profile Section 5.3 includes "Linked Hospital" as a screen.

This implies:
1. A patient can be "linked" or "enrolled" at a specific hospital
2. Linked patients get preferential pricing (discounts or free consultations)
3. Hospitals can restrict their doctors to only see hospital-enrolled patients (optional)
4. This is a distinct concept from insurance — it's a direct patient→hospital relationship

**Nothing in the current specs models this.** There's no patient→hospital linkage, no discount/pricing rules per hospital, no hospital enrollment concept.

### What Needs to Be Defined

1. `hospital_enrolled_patients` junction table (hospital_id/org_id, patient_id, enrollment_date, status)
2. Hospital pricing rules (discount percentage, free consultation flag, enrolled-only flag)
3. Consultation booking logic: check if patient is enrolled → apply discount
4. Patient profile: show linked hospital(s)
5. Hospital dashboard: manage enrolled patients

### Open Questions

- [ ] How does a patient get "linked" to a hospital? Self-enrollment, hospital invitation, or both?
- [ ] Can a patient be linked to multiple hospitals?
- [ ] Is this MVP or post-MVP?
- [ ] Does "free consultation" mean the hospital absorbs the cost, or is it a WellBank subsidy?

### References

- PRD Workflow 3: Hospital-Linked Patient
- PRD Hospital Section 8: WellBank Service Configuration
- PRD Patient Section 5.3 Screen 8: "Linked Hospital"
- Depends on DD-002 (Organization entity model)

---

## DD-011: Financial Ledger — Double-Entry Bookkeeping

**Status:** DECIDED
**Decision:** Full double-entry ledger (Option C)
**Date Opened:** 2026-02-19
**Date Decided:** 2026-02-19
**Affects:** Wallet module, payments, settlements, compliance
**Blocking:** Task 15 (Wallet/Payments), Task 9 (Provider Onboarding)
**Related:** DD-007 (Bank Accounts for Settlements)

### Decision

Follow PRD explicitly — implement full double-entry bookkeeping. This provides:
- Complete audit trail of all money movements
- Built-in reconciliation capability
- Proper split payment tracking
- Provider payable accounts
- Compliance with NDPR and Nigerian financial regulations
- Future-proof for tax/reporting needs

### Implementation Notes

See the detailed analysis in the Problem, Tradeoffs, and Options sections above for implementation guidance.

### What is a Ledger?

A ledger (specifically double-entry bookkeeping) is a system where **every monetary transaction is recorded as two equal and opposite entries**: a **debit** and a **credit**. This ensures the fundamental accounting equation always holds:

```
Assets = Liabilities + Equity
```

Or in our context:
```
Wallet (Patient) + Platform Revenue + Provider Payables = Bank + Unearned Revenue
```

**Example — Patient pays ₦5,000 for consultation:**

| Entry | Account | Debit | Credit |
|-------|---------|-------|--------|
| 1 | Patient Wallet | -₦5,000 | |
| 2 | Platform Receivable | +₦5,000 | |
| 3 | Provider Payable | | +₦4,000 |
| 4 | Platform Revenue | | +₦1,000 |

**Without a ledger (current model):**
```javascript
// Simple balance update
wallet.balance -= 5000;  // Patient balance reduced
// That's it. No trail of where the money went.
```

### Why It Matters for WellBank

**1. Split Payments are Complex**

The PRD specifies split payments:
- Patient wallet → Consultation fee
- Insurance → Covered portion
- WellPoints → Discount redemption
- Patient wallet (remaining) → Copay

Each split requires tracking money movement. Without dual-entry, you can't verify the sums add up.

**2. Provider Settlements — "What do we owe them?"**

Doctors, labs, and pharmacies need to get paid. Without a ledger:
- How much is WellBank holding for providers?
- What's the payout schedule (daily/weekly)?
- How do you handle disputes?

A ledger tracks `Provider Payable` accounts per provider.

**3. Reconciliation with BudPay**

The design mentions `PAYMENT_RECONCILIATION` as a background job, but there's no data structure to match:
- BudPay webhook events → Internal transaction records → Bank statement

With a ledger, every external event creates matching entries that can be reconciled.

**4. Refunds and Chargebacks**

When a patient requests a refund:
- Current: Just add money back to wallet
- Ledger: Create reversal entries to undo the original transaction

This matters for chargebacks — if a card payment is reversed, the platform needs to know it already paid the provider.

**5. Compliance — NDPR + Nigerian Financial Regulations**

- **NDPR**: Requires audit trails for data processing (includes financial data)
- **CBN**: Digital payment regulations may require transaction records
- **FIRS**: VAT remittance requires transaction records
- **Audit**: Investors/board may require financial statements

A ledger provides the authoritative record.

### Tradeoffs

| Aspect | Without Ledger | With Ledger |
|--------|---------------|-------------|
| Implementation time | Fast (1-2 days) | Moderate (1-2 weeks) |
| Query complexity | Simple | Moderate (JOINs for balances) |
| Debugging | Hard — "where did the money go?" | Easy — trail of entries |
| Compliance | Weak | Strong |
| Reconciliation | Manual | Automated |
| Risk of bugs | High (money created/lost) | Low (debits = credits enforced) |
| Refund handling | Ad-hoc | Structured reversals |

### Options Considered

#### Option A: No Ledger (Current)

- Simple balance field on wallet
- Transactions table with description
- Fast to build
- **Risk**: Hard to reconcile, no split payment clarity, weak compliance

#### Option B: Immutable Transactions Only (Recommended for MVP)

Keep the current `transactions` table but make it **immutable**:

- Transactions can never be updated or deleted
- Refunds create NEW transactions that reference the original
- Add `reference_id` to link related transactions (original → refund)
- Add explicit `split_details` JSON field for wallet + insurance + points

```sql
-- Transaction table with splits
transactions (
  id,
  wallet_id,
  type,           -- credit, debit, refund, payout
  amount,
  balance_before,
  balance_after,
  reference_id,   -- links to original transaction (for refunds)
  split_details,  -- JSON: { wallet: 3000, insurance: 2000, points: 500 }
  metadata,       -- JSON: service_type, service_id, provider_id
  created_at
)
```

**Tradeoff**: Still doesn't give you provider-level payables, but good for MVP.

#### Option C: Full Double-Entry Ledger

Separate `ledger_entries` table:

```sql
ledger_entries (
  id,
  entry_type,     -- patient_deposit, consultation_payment, provider_payout, etc.
  debit_account,  -- wallet:patient_123, wallet:platform
  credit_account, -- wallet:provider_456, revenue:consultation
  amount,
  reference_id,   -- links to consultation, order, etc.
  created_at
)
```

- Every payment creates 2+ entries
- Balances are calculated via SUM (not stored)
- Full accounting capability
- **Tradeoff**: More complex queries, more data, but bulletproof

### Recommendation

**Option B (Immutable Transactions)** for MVP — it's a middle ground:

1. Make transactions immutable (no UPDATE/DELETE)
2. Add `reference_id` for refunds
3. Add explicit `split_details` for multi-source payments
4. Track provider payables in a simple `provider_payouts` table (not full ledger)
5. Defer full double-entry until post-MVP or if compliance requires it

This gives you audit trails and reconciliation ability without the full complexity of double-entry bookkeeping.

### Open Questions

- [ ] Does the business require financial statements? (If yes → Option C)
- [ ] Are there CBN/Nigerian regulatory requirements for digital wallets that mandate ledger?
- [ ] How do we handle provider payouts — do we hold funds (float) or pay immediately?
- [ ] What's the refund policy? Full refund within X days?

### References

- PRD Section 9: "Monetization" — patient subscription, service transaction fees, provider commission
- PRD Requirements: Wallet transaction history, split payments, fraud detection
- Current `Wallet` interface: `shared/src/interfaces.ts:397-407`
- Current `Transaction` interface: `shared/src/interfaces.ts:386-395`
- Background job `PAYMENT_RECONCILIATION`: `shared/src/enums.ts:537`
- DD-007: Bank Accounts for Settlements (depends on this decision)

---

## DD-012: Third-Party Integrations Deferral

**Status:** DECIDED
**Decision:** Defer all third-party integrations until core app is built; stubs are fine
**Date Opened:** 2026-02-19
**Affects:** All external integrations
**Source:** Management Directive

### Decision

All third-party integrations are deferred until the core app is built:

| Integration | Status | Notes |
|------------|--------|-------|
| **Dojah (KYC)** | Deferred | NIN/BVN/CAC verification - stub for now |
| **BudPay (Payments)** | Deferred | Payment processing - stub for now |
| **Logistics/Delivery** | Deferred | 3rd party delivery - stub for now |
| **SMS (Notifications)** | Deferred | OTP, alerts - stub for now |
| **Video (WebRTC/Agora)** | Deferred | Telehealth - stub for now |

### Implementation

All third-party integrations should have:
1. **Stub service** that returns mock/success responses
2. **Interface** ready for real implementation later
3. **Flag** in config to toggle between stub and real

Example:
```typescript
// Stub implementation
class KycServiceStub implements IKycService {
  async verifyNin(nin: string) {
    return { verified: true, name: "Mock Name", dob: "1990-01-01" };
  }
}

// Real implementation (for later)
class KycServiceReal implements IKycService {
  async verifyNin(nin: string) {
    return await dojahClient.verifyNin(nin);
  }
}
```

---

*To add a new discussion, copy the template below:*

## DD-XXX: Title

**Status:** OPEN
**Date Opened:** YYYY-MM-DD
**Affects:** [modules/areas]
**Blocking:** [tasks]

### Problem
### Options Considered
### Open Questions
### References
