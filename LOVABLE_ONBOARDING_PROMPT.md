## Fix WellBank Frontend - Complete Onboarding & Organization Gaps

We identified critical gaps in the frontend onboarding. Based on the PRD, we need ALL of the following:

---

## 1. PATIENT ONBOARDING - Full PRD Compliance

Create page `/onboarding/patient` (redirect here after patient registration if profile incomplete):

### Section A: Personal Information
- `firstName`, `lastName` (pre-filled from registration)
- `phoneNumber`, `email` (pre-filled)
- `dateOfBirth` - date picker
- `gender` - radio (male/female/other)
- `address.street` - text
- `address.city` - text
- `address.state` - dropdown (Lagos, Kano, etc.)
- `address.lga` - dropdown (dependent on state)
- `nationality` - dropdown (Nigeria default)
- `nin` - text (optional, but recommended)

### Section B: Next of Kin
- `nextOfKin.name` - text
- `nextOfKin.phoneNumber` - phone
- `nextOfKin.relationship` - dropdown (spouse, parent, sibling, child, other)

### Section C: Health Information
- `bloodType` - dropdown (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `genotype` - dropdown (AA, AS, SS, AC)
- `allergies` - multi-input array (add/remove buttons)
- `chronicConditions` - multi-input array (diabetes, hypertension, asthma, etc.)
- `currentMedications` - multi-input array

### Section D: Insurance (Optional)
- `insuranceProvider` - text
- `insurancePolicyNumber` - text
- `insuranceExpiryDate` - date picker
- `insuranceCardPhoto` - file upload (JPG/PNG/PDF)

### Section E: Verification (KYC)
- `selfiePhoto` - file upload with camera capture
- `idType` - dropdown (NIN, BVN, VOTER_CARD, DRIVERS_LICENSE, PASSPORT)
- `idPhoto` - file upload (front)
- `idPhotoBack` - file upload (back, if applicable)

**UX:** Multi-step wizard with progress indicator. Save each step or save all at end via POST `/api/patients/complete-profile`.

---

## 2. DOCTOR ONBOARDING - Full PRD Compliance

Create page `/onboarding/doctor` (redirect here after doctor registration):

### Section A: Personal Details
- `firstName`, `lastName`, `phoneNumber`, `email` (pre-filled)
- `dateOfBirth` - date picker
- `gender` - radio
- `address.street`, `city`, `state`, `lga`

### Section B: Professional Information
- `specialty` - dropdown (Cardiology, Dermatology, General Practice, Pediatrics, etc.)
- `subSpecialty` - text (optional)
- `yearsExperience` - number
- `consultationTypes` - multi-select (Virtual, Physical)
- `hospitalAffiliations` - multi-input array (hospital names)
- `availabilitySchedule` - weekly schedule builder (day + time slots)
- `consultationFee` - number (Naira)
- `bio` - textarea

### Section C: Certifications (Document Uploads - MANDATORY)
Upload these documents (PDF/JPG):
- `mbbsCertificate` - file upload
- `mdcnLicense` - file upload (Medical and Dental Council of Nigeria)
- `mdcnLicenseNumber` - text input (for verification)
- `practicingLicense` - file upload (annual)
- `practicingLicenseExpiry` - date picker
- `nyscCertificate` - file upload OR exemption document
- `medicalIndemnityInsurance` - file upload (optional)
- `otherCertificates` - file upload array (optional)

### Section D: Identity Verification
- `governmentIdType` - dropdown
- `governmentIdPhoto` - file upload
- `selfiePhoto` - file upload with camera

### Section E: Banking (For Settlement)
- `bankName` - dropdown (First Bank, GTBank, etc.)
- `accountName` - text (must match bank records)
- `accountNumber` - text (10 digits)
- `bvn` - text (11 digits)

**UX:** 5-step wizard. Cannot proceed to next step without mandatory fields. POST to `/api/doctors/complete-profile`.

---

## 3. ORGANIZATION CREATION - Full PRD Compliance

Create page `/organization/new` for `provider_admin` role:

### COMMON: Organization Information (All Types)
- `name` - text
- `type` - radio (hospital, laboratory, pharmacy, clinic, insurance, emergency, logistics)
- `description` - textarea
- `email` - email
- `phoneNumber` - phone
- `contactPerson` - text (name of responsible person)
- `address.street` - text
- `address.city` - text
- `address.state` - dropdown
- `address.lga` - dropdown
- `cacNumber` - text (CAC registration)
- `tin` - text (Tax Identification Number)
- `logoUrl` - file upload (optional)

### HOSPITAL: Additional Fields
- `ownershipType` - dropdown (Private, Public, Faith-based, NGO)
- `yearEstablished` - year
- `facilityType` - dropdown (Primary Care Clinic, Secondary Hospital, Tertiary Specialist)
- `bedCapacity` - number
- `consultingRooms` - number
- `hasOperatingTheatre` - toggle
- `hasICU` - toggle
- `hasPharmacy` - toggle
- `hasLaboratory` - toggle
- `hasAmbulance` - toggle
- `hasEmergencyRoom` - toggle
- `is24Hours` - toggle
- `operatingHours` - day/time picker per day
- `services` - multi-input array (list of services offered)
- `departments` - multi-input array
- `averagePatientVolumeDaily` - number
- `consultationFeeRange` - text (e.g., "5000-20000")
- `acceptsInsurance` - toggle
- `hmosAccepted` - multi-input array
- `nhiaNumber` - text (if applicable)

### HOSPITAL: Document Uploads
- `stateHealthLicense` - file
- `operatingLicense` - file
- `environmentalPermit` - file
- `cacCertificate` - file
- `taxClearance` - file
- `medicalDirectorName` - text
- `medicalDirectorMdcn` - text
- `medicalDirectorLicense` - file

### LABORATORY: Additional Fields
- `contactPerson` - text
- `homeSampleCollection` - toggle
- `operatingHours` - day/time picker
- `services` - multi-input (list of tests offered)

### LABORATORY: Document Uploads
- `mlscnLicense` - file (Medical Laboratory Science Council of Nigeria)
- `practiceLicense` - file
- `cacCertificate` - file
- `tin` - file
- `environmentalPermit` - file (if applicable)
- `isoCertification` - file (optional)
- `chiefLabScientistName` - text
- `chiefLabScientistMlsn` - text

### PHARMACY: Additional Fields
- `superintendentPharmacistName` - text
- `superintendentPharmacistLicense` - text
- `deliveryAvailable` - toggle
- `operatingHours` - day/time picker
- `coldChainCapability` - toggle
- `handlesControlledDrugs` - toggle

### PHARMACY: Document Uploads
- `pcnLicense` - file (Pharmacists Council of Nigeria)
- `superintendentLicense` - file
- `premisesLicense` - file
- `cacCertificate` - file
- `tin` - file
- `controlledDrugsCompliance` - agreement checkbox

### INSURANCE: Additional Fields
- `naicomNumber` - text
- `productTypes` - multi-input
- `coverageScope` - textarea
- `apiEnabled` - toggle
- `claimsTurnaroundDays` - number

### INSURANCE: Document Uploads
- `naicomLicense` - file
- `cacCertificate` - file
- `taxClearance` - file
- `hmoLicense` - file (if HMO)

### EMERGENCY/AMBULANCE: Additional Fields
- `coverageArea` - text
- `ambulanceCount` - number
- `ambulanceTypes` - multi-select (Basic Life Support, Advanced Life Support)
- `gpsTracking` - toggle
- `averageResponseTime` - text

### EMERGENCY: Document Uploads
- `stateMinistryApproval` - file
- `ambulanceServiceLicense` - file
- `vehicleRegistrations` - file array
- `roadWorthiness` - file
- `driverMedicalFitness` - file
- `paramedicCertification` - file

### LOGISTICS: Additional Fields
- `coverageArea` - text
- `vehicleTypes` - multi-select (Bike, Van, Truck)
- `coldChainDelivery` - toggle
- `gpsTracking` - toggle
- `sameDayDelivery` - toggle

### LOGISTICS: Document Uploads
- `cacCertificate` - file
- `tin` - file
- `companyInsurance` - file
- For each rider:
  - `driverLicense` - file
  - `nationalId` - file
  - `policeClearance` - file
  - `vehicleRegistration` - file

### ALL ORGANIZATIONS: Banking Section
- `bankName` - dropdown
- `accountName` - text
- `accountNumber` - text
- `bvn` - text (for corporate signatory)
- `settlementFrequency` - dropdown (Daily, Weekly)

### ALL ORGANIZATIONS: Compliance & Declaration
Checkboxes:
- [ ] Data Privacy Agreement (NDPR Compliance)
- [ ] Terms & Conditions Acceptance
- [ ] Anti-Fraud Declaration
- [ ] Service Level Agreement (SLA)

**API:** POST to `/api/organizations`. Returns organization with status "PENDING". Auto-add user as org admin.

---

## 4. ADD NEW ROLE - Multi-Profile Support

Create page `/add-role` for logged-in users:

### Step 1: Select Role
- Show roles user doesn't already have
- Options: patient, doctor, provider_admin

### Step 2: Role-Specific Onboarding
- **Patient** → Same as #1 above (simplified - skip if has patient profile)
- **Doctor** → Same as #2 above
- **Provider Admin** → Same as #3 above (organization creation)

### Step 3: Completion
- After onboarding, show "Switch to [Role]?" modal
- Switch activeRole via API

**API:** POST `/api/auth/role/add` then POST `/api/auth/role/switch`.

---

## 5. BACKEND INTEGRATION NOTES

Update `mock-api.ts` with:

```typescript
patients: {
  completeProfile: (data: PatientOnboardingData) => Promise<...>,
  uploadDocument: (type: string, file: File) => Promise<...>,
},
doctors: {
  completeProfile: (data: DoctorOnboardingData) => Promise<...>,
  uploadDocument: (type: string, file: File) => Promise<...>,
},
organizations: {
  create: (data: OrganizationData) => Promise<...>,
  list: () => Promise<...>,
  getById: (id: string) => Promise<...>,
},
auth: {
  addRole: (role: string) => Promise<...>,
  switchRole: (role: string) => Promise<...>,
},
```

Update `types.ts` with new interfaces for:
- `PatientOnboardingData`
- `DoctorOnboardingData`
- `OrganizationData`
- `DocumentUpload`
- `BankAccountInput`

---

## 6. VERIFICATION STATUS TRACKING

For all onboarding flows, track status:
- `PENDING` - Initial state
- `UNDER_REVIEW` - Submitted, awaiting admin
- `APPROVED` - Verified
- `REJECTED` - Failed verification

Show status badge on user dashboard.

---

## Summary of Missing Items Added

| Section | Added |
|---------|-------|
| Patient | Insurance (provider, policy, card upload), KYC (selfie, ID upload), NIN |
| Doctor | All document uploads (MBBS, MDCN, practicing, NYSC), Banking, Hospital affiliations |
| Organization | ALL document types per org type, Banking, Compliance checkboxes |
| Hospital | Facility type, bed capacity, departments, services, Medical Director, HMOs |
| Lab | MLSCN license, chief scientist, home collection |
| Pharmacy | PCN license, superintendent, controlled drugs |
| All | Settlement frequency, BVN |

Keep existing registration flow exactly as-is. Add onboarding wizards AFTER registration completes.
