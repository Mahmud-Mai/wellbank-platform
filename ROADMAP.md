# WellBank Project Roadmap

This file provides a high-level overview of all user journeys and technical tasks required to complete the WellBank platform.

---

## Phase 1: Registration & Authentication ✅ COMPLETED

- [x] Patient Registration (9 steps) - Role → Verify → OTP → Account → Personal → Next of Kin → Health → Insurance → Verification
- [x] Doctor Registration (10 steps) - Role → Verify → OTP → Account → Personal → Professional → Certifications → Identity → Banking → Review
- [x] Provider Admin Registration (10 steps) - Role → Verify → OTP → Account → Org Type → Org Info → Services → Certs → Banking → Verification
- [x] Login with resume registration option

---

## Phase 2: Next Priorities (In Progress)

- [ ] Registration backend fixes (passwordHash nullable)
- [ ] Document upload service (S3/Minio)
- [ ] Legacy onboarding cleanup (remove PatientOnboarding.tsx, DoctorOnboarding.tsx)
- [ ] Admin notification when provider registers

---

## Phase 3: Core User Journeys

### Patient Journeys

| # | Journey | Status | Notes |
|---|---------|--------|-------|
| 1 | Doctor Discovery & Booking | 🔄 STUB | UI exists, needs backend integration |
| 2 | Consultation (Video/Chat) | 🔄 STUB | UI exists, needs video infrastructure |
| 3 | Lab Test Request & Home Collection | 🔄 STUB | UI exists, needs lab service integration |
| 4 | Pharmacy Orders & Delivery | 🔄 STUB | UI exists, needs pharmacy service |
| 5 | Emergency Services | 🔄 STUB | UI exists, needs emergency service |
| 6 | Wallet & Payments | 🔄 STUB | UI exists, needs payment integration |
| 7 | Insurance Integration | 🔄 STUB | Fields collected in registration |
| 8 | WellPoints/Rewards | ✅ EXISTS | UI complete |

### Provider Journeys

| # | Journey | Status | Notes |
|---|---------|--------|-------|
| 1 | Doctor Dashboard & Availability | 🔄 STUB | UI exists, needs backend |
| 2 | Consultation Management | 🔄 STUB | UI exists, needs service |
| 3 | Lab Test Processing & Results | 🔄 STUB | Needs lab service |
| 4 | Pharmacy Inventory & Orders | 🔄 STUB | Needs pharmacy service |
| 5 | Organization Management | 🔄 STUB | NewOrganization.tsx exists |
| 6 | Hospital Branches | 🔄 STUB | Doctors/labs/pharmacies under one org |
| 7 | Provider Payments/Settlement | 🔄 STUB | Needs payment integration |

### Admin Journeys (Missing)

| # | Journey | Status |
|---|---------|--------|
| 1 | Admin Dashboard | 🔄 NOT STARTED |
| 2 | Provider Verification & Approval | 🔄 NOT STARTED |
| 3 | Document Verification | 🔄 NOT STARTED |
| 4 | License Expiry Monitoring | 🔄 NOT STARTED |
| 5 | User Management | 🔄 NOT STARTED |
| 6 | Reports & Analytics | 🔄 NOT STARTED |

---

## Technical Task Blocks

### Backend Services Needed

| # | Service | Enables |
|---|---------|---------|
| 1 | Document Upload Service | Verification, certifications, insurance cards |
| 2 | Consultation Service | Doctor-patient consultations |
| 3 | Lab Order Service | Test requests, sample collection |
| 4 | Pharmacy Order Service | Medication orders, delivery |
| 5 | Payment/Wallet Service | Wallet funding, payments, refunds |
| 6 | Insurance Verification | Policy validation, claims |
| 7 | Admin Service | Provider approval, user management |
| 8 | Notification Service | SMS, email, push notifications |

### Frontend Components Needed

| # | Component | Enables |
|---|---------|---------|
| 1 | Admin Portal | Provider management, verification |
| 2 | Video Consultation UI | Live consultations |
| 3 | Lab Results Viewer | Test results display |
| 4 | Pharmacy Cart | Medication ordering |
| 5 | Emergency Request UI | Ambulance booking |
| 6 | Payment Flow | Wallet funding, payments |

### Infrastructure (Later)

| # | Component | Purpose |
|---|---------|---------|
| 1 | Video Infrastructure | WebRTC, Twilio, or similar for consultations |
| 2 | S3/Minio | Document storage |
| 3 | SMS Service | Transactional SMS |
| 4 | Push Notifications | In-app notifications |

---

## Stub Implementations

The following features are **intentionally stubbed** (UI exists, backend integration deferred):

1. **Doctor Search & Profiles** - Frontend complete, needs search API
2. **Consultations** - UI complete, needs video infrastructure
3. **Lab Tests** - UI complete, needs lab service integration
4. **Pharmacy** - UI complete, needs pharmacy service
5. **Emergency** - UI complete, needs emergency provider integration
6. **Wallet** - UI complete, needs payment gateway integration
7. **Insurance** - Fields collected in registration, needs verification API
8. **Admin Portal** - Not started

These stubs allow the app to be demo-ready while complex integrations are built later.

---

## Design Decisions

- [x] Email-only OTP (SMS cost optimization) - phone collected in account step
- [x] Selfie + ID verification applies to ALL roles
- [x] Patient auto-approve, Doctor/Provider Admin require admin review
- [x] Clinic is subtype of Hospital (use FacilityType.PRIMARY_CARE_CLINIC)
- [x] All provider types created as ORGANIZATIONS (not individual accounts)
