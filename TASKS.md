# Project Tasks

## Registration & Onboarding Implementation

### Phase 1: Patient Flow ✅ COMPLETED
- [x] 1. Role Selection
- [x] 2. Email Verification
- [x] 3. OTP Verification
- [x] 4. Account Details (with email prefill)
- [x] 5. Personal Details (DOB, Gender, Address, State, LGA, Nationality, NIN)
- [x] 6. Next of Kin (name, phone, relationship)
- [x] 7. Health Info (blood type, genotype, allergies, chronic conditions, medications)
- [x] 8. Insurance (provider, policy number, expiry, upload card - optional)
- [x] 9. Verification (selfie + valid ID upload)

### Phase 2: Doctor Flow ✅ COMPLETED
- [x] 1-4. Base steps (reuse from patient)
- [x] 5. Personal Details
- [x] 6. Professional Info (specialty, experience, fees, availability)
- [x] 7. Certifications (MBBS, MDCN, practicing license, NYSC uploads)
- [x] 8. Identity (selfie + ID upload)
- [x] 9. Banking (bank details + BVN)
- [x] 10. Submit for Review

### Phase 3: Provider Admin ✅ COMPLETED
- [x] 1-4. Base steps (reuse)
- [x] 5. Organization Type Selection (Hospital/Lab/Pharmacy/Insurance/Ambulance/Logistics)
- [x] 6. Organization Info (dynamic based on type)
- [x] 7. Services/Ops (dynamic based on type)
- [x] 8. Certifications (dynamic document uploads based on type)
- [x] 9. Banking
- [x] 10. Verification (selfie + ID upload)

---

## Backend Updates

### Registration State Management ✅ COMPLETED
- [x] Added registrationStep, registrationData, registrationToken, registrationTokenExpires to User entity
- [x] saveRegistrationStep API endpoint
- [x] getRegistrationState API endpoint
- [x] resumeRegistration API endpoint
- [x] clearRegistrationState API endpoint
- [x] Email service with MailHog integration

### Backend Tasks ✅ COMPLETED
- [x] Add TTL config for registration state (ENV variable: REGISTRATION_TOKEN_TTL_DAYS)
- [x] Auto-approve patient logic - patients are ACTIVE after registration
- [x] Pending approval flow - doctors/provider admins are PENDING until admin approval
- [x] Update OrganizationType enum (removed CLINIC, use FacilityType instead)
- [x] Fix: Make passwordHash nullable for incomplete registrations

### Pending Backend Tasks
- [ ] Document upload service (needs S3/Minio integration)
- [ ] Public endpoint for document uploads during registration
- [ ] Admin notification when doctor/provider admin registers
- [ ] Admin approval workflow endpoints

---

## Design Decisions (Documented)
- [x] Email-only OTP (SMS cost optimization) - phone collected in account step
- [x] Selfie + ID verification applies to ALL roles
- [x] Patient auto-approve, Doctor/Provider Admin admin review
- [x] Clinic is subtype of Hospital (use FacilityType.PRIMARY_CARE_CLINIC)

---

## Future Tasks

### Frontend
- [ ] Implement file upload handling (connect to backend)
- [ ] Add progress indicator for uploads
- [ ] Add terms & conditions acceptance step
- [ ] Polish UI/UX (loading states, validation messages)

### Testing
- [ ] End-to-end testing of registration flows
- [ ] Resume registration testing
- [ ] Document upload testing

### Documentation
- [ ] API documentation for registration endpoints
- [ ] Update user guide with new registration flow
