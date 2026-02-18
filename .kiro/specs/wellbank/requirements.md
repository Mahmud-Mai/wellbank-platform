# WellBank Requirements Document

## Introduction

WellBank is a unified digital healthcare coordination platform designed for the African market, initially targeting Nigeria. The platform connects patients to healthcare providers (doctors, hospitals, laboratories, pharmacies, emergency services, and insurers) with seamless service discovery, care coordination, and wallet-based payments. Built as a modular monolith using NestJS backend and Next.js frontend, WellBank ensures HIPAA-like data protection and NDPR compliance while providing a mobile-first, dark-mode user experience.

## Glossary

- **WellBank_Platform**: The complete healthcare coordination system
- **Patient**: Primary user seeking healthcare services
- **Healthcare_Provider**: Any service provider (Doctor, Lab, Pharmacy, Emergency, Insurance)
- **Doctor**: Healthcare provider offering consultations
- **Laboratory**: Diagnostic service provider
- **Pharmacy**: Medication provider
- **Insurance_Provider**: Coverage verification and billing entity
- **Emergency_Provider**: Ambulance and emergency services
- **WellBank_Admin**: Platform administration user
- **Provider_Admin**: Organization account management user
- **Consultation**: Medical appointment (telehealth or in-person)
- **Wallet**: Digital payment system within the platform
- **WellPoints**: Wellness rewards system
- **Medical_Record**: Patient's health information and history
- **NDPR**: Nigeria Data Protection Regulation
- **RBAC**: Role-Based Access Control

## Requirements

### Requirement 1: Authentication and User Management

**User Story:** As a user, I want to securely register and authenticate on the platform, so that I can access healthcare services appropriate to my role.

#### Acceptance Criteria

1. WHEN a user registers with valid credentials, THE WellBank_Platform SHALL create a new account and send verification
2. WHEN a user attempts to register with invalid or duplicate credentials, THE WellBank_Platform SHALL reject the registration and provide clear error messages
3. WHEN a verified user logs in with correct credentials, THE WellBank_Platform SHALL authenticate them and redirect to their role-appropriate dashboard
4. WHEN a user attempts to log in with incorrect credentials, THE WellBank_Platform SHALL reject the login and implement rate limiting after multiple failures
5. THE WellBank_Platform SHALL implement multi-factor authentication for all Healthcare_Provider accounts
6. WHEN a user requests password reset, THE WellBank_Platform SHALL send a secure reset link and expire it after 24 hours
7. THE WellBank_Platform SHALL enforce strong password policies with minimum 8 characters, mixed case, numbers, and symbols
8. THE WellBank_Platform SHALL implement RBAC to ensure users only access features appropriate to their role

### Requirement 1.1: Multi-Role Provider Onboarding

**User Story:** As a Healthcare_Provider, I want to complete a structured onboarding process so that I can be verified and activated on the platform.

#### 4-Step Onboarding Flow

All 8 roles (Patient, Doctor, Laboratory, Pharmacy, Insurance Provider, Emergency Provider, Hospital, Provider Admin) must complete a 4-step onboarding process:

**Step 1: Basic Information**
- Email verification
- Password creation
- Basic profile information (name, phone, role selection)

**Step 2: Professional Information**
- Role-specific professional details
- For Patients: Insurance status, emergency contacts
- For Doctors: Specializations, qualifications, consultation fees
- For Labs: Test categories, accreditations
- For Pharmacies: License info, delivery capabilities
- For Hospitals: Bed capacity, departments, emergency services

**Step 3: Regulatory Verification**
- Nigerian regulatory document verification
- NIN (National Identification Number) - all providers
- BVN (Bank Verification Number) - for banking/payments
- CAC (Corporate Affairs Commission) - for organizations
- MDCN (Medical and Dental Council of Nigeria) - for doctors
- PCN (Pharmacists Council of Nigeria) - for pharmacies
- MLSCN (Medical Laboratory Science Council of Nigeria) - for labs

**Step 4: Banking & Activation**
- Bank account details for payments
- Payment method setup
- Final verification and account activation

#### Onboarding Statuses

- `PENDING`: Initial registration complete
- `UNDER_REVIEW`: Documents submitted, awaiting verification
- `ACTIVE`: Fully verified and operational
- `SUSPENDED`: License expired or compliance issue
- `DEACTIVATED`: Voluntary or involuntary deactivation

#### Nigerian Regulatory Data Fields

All Auth and Profile endpoints MUST include:

```typescript
// Nigerian Regulatory Fields
nin?: string;                    // National Identification Number
bvn?: string;                   // Bank Verification Number
cac_number?: string;            // Corporate Affairs Commission (organizations)
mdcn_license_number?: string;   // Medical and Dental Council of Nigeria
mdcn_expiry_date?: Date;        // MDCN license expiry
pcn_license_number?: string;    // Pharmacists Council of Nigeria
pcn_expiry_date?: Date;         // PCN license expiry
mlscn_license_number?: string;  // Medical Laboratory Science Council of Nigeria
mlscn_expiry_date?: Date;       // MLSCN license expiry
cac_document_url?: string;      // CAC certificate document
```

#### Acceptance Criteria

1. WHEN a provider registers, THE WellBank_Platform SHALL create a PENDING onboarding record
2. WHEN a provider completes Step 1, THE WellBank_Platform SHALL update onboarding status to IN_PROGRESS
3. WHEN a provider submits regulatory documents, THE WellBank_Platform SHALL initiate verification with relevant authorities
4. WHEN license verification fails, THE WellBank_Platform SHALL mark the provider as SUSPENDED
5. WHEN a license expires, THE WellBank_Platform SHALL automatically trigger SUSPENSION
6. WHEN all steps are verified, THE WellBank_Platform SHALL set status to ACTIVE
7. THE WellBank_Platform SHALL enforce license expiry checks daily via automated job

### Requirement 2: User Profile and Medical Records Management

**User Story:** As a Patient, I want to manage my profile and medical records securely, so that Healthcare_Providers can access relevant information for better care.

#### Acceptance Criteria

1. WHEN a Patient creates their profile, THE WellBank_Platform SHALL collect essential demographic and medical history information
2. WHEN a Patient updates their medical records, THE WellBank_Platform SHALL encrypt the data and maintain version history
3. WHEN a Healthcare_Provider requests access to Medical_Records, THE WellBank_Platform SHALL require Patient consent and log the access
4. THE WellBank_Platform SHALL allow Patients to grant and revoke Medical_Record access permissions to specific Healthcare_Providers
5. WHEN Medical_Records are accessed, THE WellBank_Platform SHALL create audit logs with timestamp, user, and purpose
6. THE WellBank_Platform SHALL encrypt all Medical_Records using end-to-end encryption
7. WHEN a Patient deletes their account, THE WellBank_Platform SHALL anonymize their Medical_Records while preserving aggregate healthcare data

### Requirement 3: Doctor Discovery and Consultation Booking

**User Story:** As a Patient, I want to discover and book consultations with Doctors, so that I can receive medical care when needed.

#### Acceptance Criteria

1. WHEN a Patient searches for Doctors, THE WellBank_Platform SHALL return results filtered by specialty, location, availability, and ratings
2. WHEN a Patient views a Doctor's profile, THE WellBank_Platform SHALL display qualifications, specialties, availability, consultation fees, and patient reviews
3. WHEN a Patient books an available consultation slot, THE WellBank_Platform SHALL reserve the slot and send confirmations to both parties
4. WHEN a Patient attempts to book an unavailable slot, THE WellBank_Platform SHALL prevent the booking and suggest alternative times
5. THE WellBank_Platform SHALL allow Patients to cancel consultations up to 2 hours before the scheduled time
6. WHEN a consultation is cancelled within 2 hours, THE WellBank_Platform SHALL apply cancellation fees as per Doctor's policy
7. THE WellBank_Platform SHALL send automated reminders 24 hours and 1 hour before scheduled consultations

### Requirement 4: Telehealth and In-Person Consultation Delivery

**User Story:** As a Patient and Doctor, I want to conduct consultations via video/chat or in-person, so that medical care can be delivered effectively.

#### Acceptance Criteria

1. WHEN a telehealth consultation begins, THE WellBank_Platform SHALL provide secure video/audio communication with less than 300ms latency
2. WHEN participants join a telehealth session, THE WellBank_Platform SHALL verify their identities and ensure only authorized users can access
3. THE WellBank_Platform SHALL allow Doctors to share screens, documents, and prescriptions during telehealth sessions
4. WHEN a telehealth session ends, THE WellBank_Platform SHALL automatically save session notes and any shared documents to Medical_Records
5. THE WellBank_Platform SHALL provide in-session chat functionality with message encryption
6. WHEN network connectivity is poor, THE WellBank_Platform SHALL gracefully degrade to audio-only or chat modes
7. THE WellBank_Platform SHALL record consultation duration for billing and compliance purposes
8. THE WellBank_Platform SHALL allow emergency escalation during consultations to connect with Emergency_Providers

### Requirement 5: Laboratory Test Request and Management

**User Story:** As a Patient, I want to request laboratory tests and receive results, so that I can complete diagnostic requirements for my healthcare.

#### Acceptance Criteria

1. WHEN a Doctor prescribes lab tests, THE WellBank_Platform SHALL allow Patients to search and select Laboratory providers
2. WHEN a Patient books a lab test, THE WellBank_Platform SHALL offer home collection or lab visit options with scheduling
3. THE WellBank_Platform SHALL provide Patients with pre-test instructions and preparation guidelines
4. WHEN lab results are ready, THE WellBank_Platform SHALL notify the Patient and make results available to the prescribing Doctor
5. THE WellBank_Platform SHALL encrypt and securely store all lab results in the Patient's Medical_Records
6. WHEN a Patient requests lab results, THE WellBank_Platform SHALL provide them in a standardized, downloadable format
7. THE WellBank_Platform SHALL allow Laboratories to update test status (sample collected, processing, completed)

### Requirement 6: Pharmacy Integration and Medication Delivery

**User Story:** As a Patient, I want to order prescribed medications from pharmacies, so that I can receive treatments conveniently.

#### Acceptance Criteria

1. WHEN a Doctor issues a prescription, THE WellBank_Platform SHALL make it available to the Patient for pharmacy fulfillment
2. WHEN a Patient searches for pharmacies, THE WellBank_Platform SHALL show availability of prescribed medications and delivery options
3. THE WellBank_Platform SHALL allow Patients to choose between pharmacy pickup and home delivery
4. WHEN a Patient orders medication for delivery, THE WellBank_Platform SHALL provide real-time tracking and estimated delivery time
5. THE WellBank_Platform SHALL verify prescription authenticity and prevent duplicate fulfillment across pharmacies
6. WHEN medication is dispensed, THE WellBank_Platform SHALL update the Patient's Medical_Records with medication history
7. THE WellBank_Platform SHALL send medication reminders and refill notifications to Patients

### Requirement 7: Wallet and Payment System

**User Story:** As a Patient, I want to manage payments through a digital wallet, so that I can pay for healthcare services seamlessly.

#### Acceptance Criteria

1. THE WellBank_Platform SHALL provide each Patient with a digital Wallet for storing funds and making payments
2. WHEN a Patient adds funds to their Wallet, THE WellBank_Platform SHALL support multiple payment methods (bank transfer, card, mobile money)
3. WHEN a healthcare service is completed, THE WellBank_Platform SHALL automatically deduct payment from the Patient's Wallet
4. WHEN Wallet balance is insufficient, THE WellBank_Platform SHALL prevent service booking and suggest funding options
5. THE WellBank_Platform SHALL provide detailed transaction history and receipts for all Wallet activities
6. WHEN a service is cancelled or refunded, THE WellBank_Platform SHALL automatically credit the Patient's Wallet
7. THE WellBank_Platform SHALL implement fraud detection and transaction monitoring for all Wallet operations
8. THE WellBank_Platform SHALL support split payments between Wallet funds and insurance coverage

### Requirement 8: Insurance Integration and Coverage Verification

**User Story:** As a Patient, I want to verify insurance coverage and process claims, so that I can reduce out-of-pocket healthcare expenses.

#### Acceptance Criteria

1. WHEN a Patient links their insurance policy, THE WellBank_Platform SHALL verify coverage details with the Insurance_Provider
2. WHEN booking a service, THE WellBank_Platform SHALL check insurance coverage and display Patient's financial responsibility
3. THE WellBank_Platform SHALL automatically submit claims to Insurance_Providers for covered services
4. WHEN insurance covers partial costs, THE WellBank_Platform SHALL charge the remaining amount to the Patient's Wallet
5. WHEN insurance coverage is denied, THE WellBank_Platform SHALL notify the Patient and charge the full amount to their Wallet
6. THE WellBank_Platform SHALL provide real-time insurance eligibility verification before service delivery
7. THE WellBank_Platform SHALL maintain audit trails of all insurance transactions and claim submissions

### Requirement 9: Emergency Services and GPS Integration

**User Story:** As a Patient, I want to access emergency services quickly, so that I can receive immediate medical attention during health crises.

#### Acceptance Criteria

1. THE WellBank_Platform SHALL provide an emergency button accessible from all screens
2. WHEN the emergency button is activated, THE WellBank_Platform SHALL immediately capture the Patient's GPS location
3. THE WellBank_Platform SHALL automatically connect Patients to the nearest available Emergency_Provider based on GPS location
4. WHEN an emergency request is made, THE WellBank_Platform SHALL share Patient's Medical_Records and emergency contacts with the Emergency_Provider
5. THE WellBank_Platform SHALL provide real-time tracking of emergency response vehicles
6. THE WellBank_Platform SHALL maintain a 24/7 emergency hotline with qualified medical dispatchers
7. WHEN emergency services are dispatched, THE WellBank_Platform SHALL notify the Patient's emergency contacts automatically

### Requirement 10: Notifications and Communication System

**User Story:** As a user, I want to receive timely notifications about my healthcare activities, so that I stay informed and don't miss important appointments or updates.

#### Acceptance Criteria

1. THE WellBank_Platform SHALL send push notifications for appointment reminders, test results, and prescription updates
2. WHEN critical health information is available, THE WellBank_Platform SHALL send immediate notifications via multiple channels (push, SMS, email)
3. THE WellBank_Platform SHALL allow users to customize notification preferences by type and delivery method
4. WHEN a Healthcare_Provider sends a message, THE WellBank_Platform SHALL deliver it securely and notify the recipient
5. THE WellBank_Platform SHALL provide an in-app messaging system with end-to-end encryption
6. THE WellBank_Platform SHALL maintain notification history and allow users to mark notifications as read/unread
7. WHEN the app is offline, THE WellBank_Platform SHALL queue notifications and deliver them when connectivity is restored

### Requirement 11: WellPoints Rewards System

**User Story:** As a Patient, I want to earn and redeem wellness rewards, so that I'm incentivized to maintain healthy behaviors and use the platform regularly.

#### Acceptance Criteria

1. THE WellBank_Platform SHALL award WellPoints to Patients for completing health activities (consultations, lab tests, medication adherence)
2. WHEN Patients achieve health milestones, THE WellBank_Platform SHALL provide bonus WellPoints
3. THE WellBank_Platform SHALL allow Patients to redeem WellPoints for discounts on healthcare services
4. WHEN WellPoints are earned or redeemed, THE WellBank_Platform SHALL update the Patient's balance and provide transaction details
5. THE WellBank_Platform SHALL provide a WellPoints marketplace where Patients can browse available rewards
6. THE WellBank_Platform SHALL implement WellPoints expiration policies and notify Patients before points expire
7. THE WellBank_Platform SHALL prevent WellPoints fraud by validating all earning activities

### Requirement 12: Admin Portal and Platform Management

**User Story:** As a WellBank_Admin, I want to manage the platform, monitor activities, and ensure compliance, so that the platform operates effectively and securely.

#### Acceptance Criteria

1. THE WellBank_Platform SHALL provide WellBank_Admins with a comprehensive dashboard showing platform metrics and user activities
2. WHEN suspicious activities are detected, THE WellBank_Platform SHALL alert WellBank_Admins and provide investigation tools
3. THE WellBank_Platform SHALL allow WellBank_Admins to manage user accounts, including suspension and reactivation
4. THE WellBank_Platform SHALL provide audit logs for all administrative actions with timestamp and admin identification
5. THE WellBank_Platform SHALL allow WellBank_Admins to configure platform settings, fees, and business rules
6. THE WellBank_Platform SHALL provide compliance reporting tools for NDPR and healthcare regulations
7. THE WellBank_Platform SHALL allow WellBank_Admins to manage Healthcare_Provider onboarding and verification

### Requirement 13: Data Security and Compliance

**User Story:** As a user, I want my personal and medical data to be protected according to international standards, so that my privacy is maintained and regulatory requirements are met.

#### Acceptance Criteria

1. THE WellBank_Platform SHALL encrypt all Medical_Records and personal data using AES-256 encryption
2. THE WellBank_Platform SHALL implement end-to-end encryption for all communications between users
3. WHEN data is transmitted, THE WellBank_Platform SHALL use TLS 1.3 or higher for all network communications
4. THE WellBank_Platform SHALL comply with NDPR requirements for data collection, processing, and storage
5. THE WellBank_Platform SHALL implement data residency requirements keeping Nigerian user data within Nigeria
6. THE WellBank_Platform SHALL provide users with data export and deletion capabilities as required by NDPR
7. THE WellBank_Platform SHALL conduct regular security audits and penetration testing
8. THE WellBank_Platform SHALL implement intrusion detection and prevention systems

### Requirement 14: Performance and Scalability

**User Story:** As a user, I want the platform to load quickly and perform reliably, so that I can access healthcare services without delays.

#### Acceptance Criteria

1. THE WellBank_Platform SHALL load the main application in less than 3 seconds on standard mobile connections
2. WHEN multiple users access the platform simultaneously, THE WellBank_Platform SHALL maintain response times under 2 seconds for all operations
3. THE WellBank_Platform SHALL support horizontal scaling to handle increased user load
4. WHEN system load is high, THE WellBank_Platform SHALL implement graceful degradation without service interruption
5. THE WellBank_Platform SHALL maintain 99.9% uptime availability
6. THE WellBank_Platform SHALL implement caching strategies to optimize frequently accessed data
7. THE WellBank_Platform SHALL monitor performance metrics and alert administrators of degradation

### Requirement 15: Mobile-First User Experience

**User Story:** As a user, I want a mobile-optimized interface with dark mode, so that I can easily access healthcare services on my mobile device.

#### Acceptance Criteria

1. THE WellBank_Platform SHALL provide a responsive design that works seamlessly on mobile devices, tablets, and desktops
2. THE WellBank_Platform SHALL implement dark mode as the primary interface theme with high-contrast colors
3. WHEN users interact with the interface, THE WellBank_Platform SHALL provide clear visual feedback and intuitive navigation
4. THE WellBank_Platform SHALL use bento grid layouts for dashboard information display
5. THE WellBank_Platform SHALL ensure all interactive elements are touch-friendly with appropriate sizing for mobile use
6. THE WellBank_Platform SHALL implement progressive web app features for offline functionality
7. THE WellBank_Platform SHALL optimize images and assets for fast loading on mobile networks
