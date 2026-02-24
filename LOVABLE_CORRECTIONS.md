# WellBank — Complete API Contract for Lovable

> Version: 2.0
> Date: 2026-02-19
> Purpose: Single source of truth for frontend development

---

## ⚠️ IMPORTANT: Read This First

**User Roles (4 total):**

- `patient` - Seeks healthcare services
- `doctor` - Provides consultations (can be independent)
- `provider_admin` - Creates organizations (hospital/lab/pharmacy/etc)
- `wellbank_admin` - Platform admin (seeded, created by super admin)

**Organization Types (created by provider_admin):**

- `hospital`, `laboratory`, `pharmacy`, `clinic`, `insurance`, `emergency`, `logistics`

**Organization Member Roles (scoped to org):**

- `admin`, `doctor`, `pharmacist`, `lab_tech`, `nurse`, `receptionist`, `staff`

**All 3rd-party integrations are STUBBED:**

- KYC (Dojah), Payments (BudPay), SMS, Video, Logistics = return mock success

---

## Base URL

```
http://localhost:35432/api/v1
```

---

## API Response Standard

```json
{
  "status": "success" | "error" | "fail",
  "message": "Human-readable message",
  "data": { ... },
  "errors": [{ "code": "CODE", "message": "..." }],
  "meta": { "pagination": { "total": 150, "page": 1, "perPage": 20 } }
}
```

---

## 1. Authentication

### 1.1 Send OTP

```
POST /auth/otp/send
Body: { "type": "phone" | "email", "destination": "+2348012345678" }
Response: { "otpId": "uuid", "expiresAt": "ISO timestamp" }
```

### 1.2 Verify OTP

```
POST /auth/otp/verify
Body: { "otpId": "uuid", "code": "123456" }
Response: { "verificationToken": "temp-token-string" }
```

### 1.3 Complete Registration (after OTP)

```
POST /auth/register/complete
Body: {
  "verificationToken": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "role": "patient" | "doctor" | "provider_admin"
}
Response: {
  "userId": "uuid",
  "roles": ["patient"],
  "activeRole": "patient",
  "needsOnboarding": true
}
```

### 1.4 Login

```
POST /auth/login
Body: { "email": "string", "password": "string", "mfaCode?: "string" }
Response: {
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "user": {
    "id": "uuid",
    "email": "string",
    "roles": ["patient", "doctor"],
    "activeRole": "patient",
    "isVerified": true,
    "isKycVerified": false,
    "mfaEnabled": false
  }
}
```

### 1.5 Refresh Token

```
POST /auth/refresh
Body: { "refreshToken": "string" }
Response: { "accessToken": "jwt", "refreshToken": "jwt" }
```

### 1.6 Logout

```
POST /auth/logout
Header: Authorization: Bearer <token>
Response: { "message": "Logged out" }
```

---

## 2. User & Profile

### 2.1 Get Current User

```
GET /users/me
Header: Authorization: Bearer <token>
Response: {
  "id": "uuid",
  "email": "string",
  "roles": ["patient"],
  "activeRole": "patient",
  "firstName": "string",
  "lastName": "string",
  "isKycVerified": false,
  "kycLevel": 0
}
```

### 2.2 Update User

```
PATCH /users/me
Body: { "firstName"?: "string", "lastName"?: "string", "phoneNumber"?: "string" }
```

### 2.3 Add Role (Multi-role)

```
POST /users/me/roles
Body: { "role": "doctor" | "patient" | "provider_admin" }
Response: { "roles": ["patient", "doctor"], "activeRole": "patient" }
```

### 2.4 Switch Active Role

```
POST /users/me/switch-role
Body: { "activeRole": "doctor" }
Response: { "activeRole": "doctor" }
```

---

## 3. Patient Profile

### 3.1 Get Patient Profile

```
GET /patients/profile
Header: Authorization: Bearer <token>
Response: {
  "id": "uuid",
  "userId": "uuid",
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "1990-01-15",
  "gender": "male" | "female" | "other",
  "phoneNumber": "+2348012345678",
  "email": "string",
  "nationality": "Nigerian",
  "lga": "Victoria Island",
  "profilePhoto": "url",
  "nextOfKin": { "name": "string", "phoneNumber": "string", "relationship": "spouse" },
  "identificationType": "NIN" | "BVN" | "VOTER_CARD" | "DRIVERS_LICENSE" | "PASSPORT",
  "identificationNumber": "string",
  "nin": "string",
  "bvn": "string",
  "bloodType": "O+",
  "genotype": "AA",
  "currentMedications": ["Vitamin D"],
  "allergies": ["Penicillin"],
  "chronicConditions": ["Diabetes"],
  "address": { "street": "string", "city": "string", "state": "Lagos", "lga": "string", "country": "Nigeria", "postalCode": "string" },
  "emergencyContacts": [{ "name": "string", "relationship": "string", "phoneNumber": "string" }],
  "insurancePolicy": { "provider": "AXA", "policyNumber": "string", "isActive": true },
  "kycLevel": 0,
  "isKycVerified": false
}
```

### 3.2 Update Patient Profile

```
PATCH /patients/profile
Body: {
  "firstName"?: "string",
  "lastName"?: "string",
  "dateOfBirth"?: "1990-01-15",
  "gender"?: "male" | "female" | "other",
  "nationality"?: "Nigerian",
  "lga"?: "string",
  "profilePhoto"?: "url",
  "nextOfKin"?: { "name": "string", "phoneNumber": "string", "relationship": "string" },
  "bloodType"?: "O+",
  "genotype"?: "AA",
  "currentMedications"?: ["string"],
  "allergies"?: ["string"],
  "chronicConditions"?: ["string"],
  "address"?: { "street": "string", "city": "string", "state": "string", "lga": "string", "country": "string", "postalCode": "string" },
  "emergencyContacts"?: [{ "name": "string", "phoneNumber": "string", "relationship": "string" }]
}
```

---

## 4. Doctor Profile

### 4.1 Get Doctor Profile

```
GET /doctors/:id
Response: {
  "id": "uuid",
  "userId": "uuid",
  "firstName": "string",
  "lastName": "string",
  "profilePhoto": "url",
  "bio": "string",
  "specialties": ["Cardiology"],
  "qualifications": [{ "degree": "MBBS", "institution": "UNIBEN", "year": 2015 }],
  "yearsExperience": 10,
  "consultationFee": 5000,
  "licenseNumber": "string",
  "mdcnLicenseNumber": "string",
  "mdcnExpiryDate": "2025-12-31",
  "rating": 4.5,
  "reviewCount": 120,
  "acceptsInsurance": true,
  "languages": ["English", "Yoruba"],
  "availability": [{ "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "isAvailable": true }],
  "providerStatus": "active"
}
```

### 4.2 Search Doctors

```
GET /doctors/search?specialty=Cardiology&location=Lagos&minRating=4&maxFee=10000
Response: { "doctors": [...] }
```

---

## 5. Organizations (Hospitals, Labs, Pharmacies)

### 5.1 Create Organization (provider_admin only)

```
POST /organizations
Header: Authorization: Bearer <token>
Body: {
  "name": "Lagos General Hospital",
  "type": "hospital" | "laboratory" | "pharmacy" | "clinic" | "insurance" | "emergency" | "logistics",
  "address": { "street": "string", "city": "string", "state": "Lagos", "country": "Nigeria" },
  "phoneNumber": "string",
  "email": "string"
}
Response: {
  "id": "uuid",
  "name": "string",
  "type": "hospital",
  "status": "pending"
}
```

### 5.2 Get My Organizations

```
GET /organizations
Header: Authorization: Bearer <token>
Response: {
  "organizations": [
    { "id": "uuid", "name": "string", "type": "hospital", "roleInOrg": "admin", "status": "active" }
  ]
}
```

### 5.3 Get Organization Details

```
GET /organizations/:id
Response: {
  "id": "uuid",
  "name": "string",
  "type": "hospital",
  "address": {},
  "phoneNumber": "string",
  "email": "string",
  "status": "active",
  "bedCapacity"?: 100,
  "departments"?: ["Cardiology", "Pediatrics"],
  "services"?: ["Emergency", "Surgery"],
  "operatingHours": { "monday": "08:00-20:00" }
}
```

### 5.4 Add Organization Member (org admin only)

```
POST /organizations/:id/members
Body: {
  "userId": "uuid",
  "roleInOrg": "admin" | "doctor" | "pharmacist" | "lab_tech" | "nurse" | "receptionist" | "staff",
  "department": "string"
}
```

### 5.5 Get Organization Members

```
GET /organizations/:id/members
Response: {
  "members": [
    { "userId": "uuid", "firstName": "string", "lastName": "string", "roleInOrg": "doctor", "department": "Cardiology" }
  ]
}
```

### 5.6 Invite User to Organization

```
POST /organizations/:id/invite
Body: { "email": "string", "roleInOrg": "doctor" }
Response: { "inviteId": "uuid", "message": "Invitation sent" }
```

---

## 6. Subscription (Patient)

### 6.1 Get Plans

```
GET /subscriptions/plans
Response: {
  "plans": [
    { "id": "uuid", "name": "Basic", "price": 5000, "billingCycle": "monthly", "features": ["Consultations", "Lab Tests"] }
  ]
}
```

### 6.2 Subscribe

```
POST /subscriptions
Body: { "planId": "uuid", "paymentMethod": "wallet" | "card" | "bank_transfer" }
Response: { "subscriptionId": "uuid", "status": "active", "startDate": "2026-02-19", "renewalDate": "2026-03-19" }
```

### 6.3 Get Current Subscription

```
GET /subscriptions/current
Response: { "plan": {}, "status": "active", "renewalDate": "2026-03-19" }
```

---

## 7. Wallet

### 7.1 Get Wallet

```
GET /wallet
Response: { "id": "uuid", "balance": 50000, "currency": "NGN", "isActive": true }
```

### 7.2 Fund Wallet

```
POST /wallet/fund
Body: { "amount": 10000, "paymentMethod": "card" | "bank_transfer" }
Response: { "paymentUrl": "https://budpay...", "reference": "string", "expiresAt": "ISO" }
```

### 7.3 Get Transactions

```
GET /wallet/transactions?type=credit&page=1&perPage=20
Response: {
  "transactions": [
    { "id": "uuid", "type": "credit", "amount": 10000, "balanceAfter": 60000, "status": "completed", "description": "Wallet Top-up", "createdAt": "ISO" }
  ]
}
```

---

## 8. Bank Accounts (Provider Payouts)

### 8.1 Get Bank Accounts

```
GET /bank-accounts
Response: {
  "accounts": [
    { "id": "uuid", "bankName": "GTBank", "accountName": "John Doe", "accountNumber": "0123456789", "verificationStatus": "verified" }
  ]
}
```

### 8.2 Add Bank Account

```
POST /bank-accounts
Body: { "bankName": "GTBank", "accountName": "string", "accountNumber": "0123456789", "bvn": "string" }
```

---

## 9. Consultations

### 9.1 Book Consultation

```
POST /consultations
Body: {
  "doctorId": "uuid",
  "type": "telehealth" | "in_person",
  "scheduledAt": "2026-02-20T10:00:00Z",
  "reason": "Follow-up",
  "symptoms": ["headache"],
  "useInsurance": false
}
Response: { "consultationId": "uuid", "status": "scheduled", "fee": 5000 }
```

### 9.2 Get Consultations

```
GET /consultations?status=scheduled
Response: { "consultations": [...] }
```

### 9.3 Get Consultation Details

```
GET /consultations/:id
Response: {
  "id": "uuid",
  "doctorId": "uuid",
  "doctorName": "Dr. Smith",
  "patientId": "uuid",
  "type": "telehealth",
  "status": "completed",
  "scheduledAt": "ISO",
  "fee": 5000,
  "prescriptions": [{ "id": "uuid", "medicationName": "string", "dosage": "string" }],
  "labOrders": [...]
}
```

### 9.4 Start Video Session

```
POST /consultations/:id/video-session/start
Response: { "videoUrl": "https://...", "token": "string" }
```

### 9.5 Cancel Consultation

```
POST /consultations/:id/cancel
Response: { "refundAmount": 4500, "cancellationFee": 500 }
```

---

## 10. Lab Orders

### 10.1 Search Labs

```
GET /labs/search?location=Lagos&testType=Blood
Response: { "labs": [...] }
```

### 10.2 Book Lab Test

```
POST /lab-orders
Body: {
  "labId": "uuid",
  "tests": [{ "testId": "uuid" }],
  "collectionType": "home" | "lab",
  "scheduledAt": "ISO",
  "address": {}
}
Response: { "orderId": "uuid", "status": "pending", "totalCost": 5000 }
```

### 10.3 Get Lab Order

```
GET /lab-orders/:id
Response: { "id": "uuid", "status": "completed", "results": [...] }
```

---

## 11. Pharmacy Orders

### 11.1 Search Pharmacies

```
GET /pharmacies/search?location=Lagos&medication=Amoxicillin
Response: { "pharmacies": [...] }
```

### 11.2 Check Availability

```
POST /pharmacies/:id/check-availability
Body: { "medications": [{ "name": "Amoxicillin", "dosage": "500mg", "quantity": 2 }] }
Response: { "available": true, "totalCost": 2000 }
```

### 11.3 Place Order

```
POST /pharmacy-orders
Body: {
  "pharmacyId": "uuid",
  "prescriptionId": "uuid",
  "medications": [{ "medicationId": "uuid", "quantity": 2 }],
  "deliveryType": "pickup" | "delivery",
  "deliveryAddress": {}
}
Response: { "orderId": "uuid", "status": "confirmed", "totalCost": 2000 }
```

### 11.4 Track Order

```
GET /pharmacy-orders/:id/track
Response: { "status": "in_transit", "driverName": "John", "currentLocation": { "lat": 0, "lng": 0 } }
```

---

## 12. Emergency

### 12.1 Request Emergency

```
POST /emergency/requests
Body: {
  "type": "medical" | "accident" | "cardiac" | "respiratory" | "trauma",
  "description": "string",
  "location": { "latitude": 6.5, "longitude": 3.3 },
  "severity": "critical" | "high" | "moderate"
}
Response: { "requestId": "uuid", "status": "requested", "estimatedArrival": "15 mins" }
```

### 12.2 Track Emergency

```
GET /emergency/requests/:id/track
Response: { "status": "en_route", "ambulanceLocation": {}, "eta": "10 mins", "providerPhone": "string" }
```

---

## 13. Insurance

### 13.1 Add Policy

```
POST /insurance/policies
Body: { "providerId": "uuid", "policyNumber": "string", "coverageType": "string", "expiresAt": "ISO" }
```

### 13.2 Verify Coverage

```
POST /insurance/verify-coverage
Body: { "policyId": "uuid", "serviceType": "consultation", "serviceAmount": 5000 }
Response: { "isEligible": true, "coverageAmount": 3000, "patientResponsibility": 2000 }
```

---

## 14. Notifications

### 14.1 Get Notifications

```
GET /notifications?isRead=false&type=appointment_reminder
Response: {
  "notifications": [...],
  "unreadCount": 5
}
```

### 14.2 Mark as Read

```
PATCH /notifications/:id/read
```

### 14.3 Mark All as Read

```
PATCH /notifications/read-all
```

---

## 15. WellPoints

### 15.1 Get Balance

```
GET /wellpoints/balance
Response: { "balance": 2500, "tier": "gold", "expiringPoints": 500 }
```

### 15.2 Get Transactions

```
GET /wellpoints/transactions
Response: { "transactions": [...] }
```

### 15.3 Get Earning Rules

```
GET /wellpoints/earning-rules
Response: { "rules": [...], "milestones": [...] }
```

### 15.4 Get Marketplace

```
GET /wellpoints/marketplace
Response: { "rewards": [...] }
```

### 15.5 Redeem Points

```
POST /wellpoints/redeem
Body: { "rewardId": "uuid" }
Response: { "voucherCode": "STRING", "expiresAt": "ISO" }
```

---

## 16. Admin

### 16.1 Dashboard Stats

```
GET /admin/dashboard
Response: {
  "users": { "total": 1000, "newToday": 50 },
  "consultations": { "today": 100, "revenue": 500000 },
  "providers": { "active": 200, "pendingVerification": 20 }
}
```

### 16.2 Get Users

```
GET /admin/users?role=doctor&status=active&search=Smith
Response: { "users": [...] }
```

### 16.3 Get Providers (with verification status)

```
GET /admin/providers?type=hospital&status=pending
Response: { "providers": [...] }
```

### 16.4 Review Provider

```
POST /admin/providers/:id/review
Body: { "action": "approve" | "reject" | "request_info", "comment": "string" }
```

### 16.5 Get Documents

```
GET /admin/documents?userId=uuid&status=pending
Response: { "documents": [...] }
```

### 16.6 Review Document

```
POST /admin/documents/:id/review
Body: { "action": "approve" | "reject", "rejectionReason": "string" }
```

---

## Mock API Implementation Notes

All third-party integrations should return mock success:

```typescript
// KYC (Dojah) - stub
async verifyNin(nin: string) {
  return { verified: true, name: "Mock Name", dob: "1990-01-01" };
}

// Payment (BudPay) - stub
async initiatePayment(amount: number) {
  return { paymentUrl: "https://mock-budpay...", reference: "MOCK-123" };
}

// SMS - stub
async sendSms(phone: string, message: string) {
  return { success: true, messageId: "MOCK-SMS" };
}
```

---

## Frontend Tasks Summary

1. **Auth**: OTP flow, multi-role login, role switcher
2. **Patient**: Profile with all fields (nationality, LGA, nextOfKin, currentMedications, etc.)
3. **Organizations**: Create org, manage members, invite users
4. **Subscription**: Plan selection, payment flow
5. **Providers**: Doctor search, Lab search, Pharmacy search, booking flows
6. **Wallet**: Fund, transactions
7. **Bank Accounts**: Add for payouts
8. **WellPoints**: Balance, earn, redeem
9. **Admin**: Dashboard, user management, provider verification, document review
