# WellBank Healthcare Platform - API Endpoints Specification

## Overview

This document provides a comprehensive specification of all API endpoints for the WellBank Healthcare Platform. It is designed for frontend developers using Lovable (or any frontend framework) to build the Next.js frontend with mock data while the backend is being developed.

**Base URL:** `http://localhost:35432/api/v1`

**Custom Ports:**

- API Server: `35432`
- PostgreSQL: `54320`
- Redis: `63790`

**Authentication:**

- All authenticated endpoints require a Bearer token in the `Authorization` header
- Format: `Authorization: Bearer <access_token>`

**Common Data Formats:**

- All timestamps: ISO 8601 format (e.g., `2024-01-15T10:30:00Z`)
- All IDs: UUID v4 format
- All dates: ISO 8601 date format (e.g., `2024-01-15`)

**Pagination Parameters (for list endpoints):**

- `page` (number, default: 1): Page number
- `limit` (number, default: 20, max: 100): Items per page
- `sort` (string): Sort field (e.g., `createdAt`, `-createdAt` for descending)
- `filter` (object): Filter criteria (varies by endpoint)

**Common HTTP Status Codes:**

- `200 OK`: Successful request
- `201 Created`: Resource successfully created
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

## 1. Authentication Module

### 1.1 Register User

**Endpoint:** `POST /auth/register`

**Description:** Register a new user account

**Authentication:** None

**Request Body:**

```json
{
  "email": "string (email format, required)",
  "password": "string (min 8 chars, mixed case, numbers, symbols, required)",
```

"role": "string (enum: patient, doctor, lab, pharmacy, insurance, emergency, admin, required)",
"firstName": "string (required)",
"lastName": "string (required)",
"phoneNumber": "string (required)",
"identificationType": "string (enum: NIN, BVN, required)",
"identificationNumber": "string (required)"
}

````

**Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "userId": "uuid",
    "email": "string",
    "role": "string",
    "isVerified": false,
    "createdAt": "ISO 8601 timestamp"
  }
}
````

**Error Responses:**

400 Bad Request:

```json
{
  "status": "fail",
  "message": "Invalid request data",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "field": "password",
      "message": "Password must be at least 8 characters with mixed case, numbers, and symbols"
    }
  ]
}
```

409 Conflict:

```json
{
  "status": "fail",
  "message": "An account with this email already exists",
  "errors": [
    {
      "code": "EMAIL_EXISTS",
      "message": "An account with this email already exists"
    }
  ]
}
```

500 Internal Server Error:

```json
{
  "status": "error",
  "message": "An unexpected error occurred. Please try again later.",
  "errors": [
    {
      "code": "INTERNAL_ERROR",
      "message": "An unexpected error occurred. Please try again later."
    }
  ]
}
```

---

### 1.2 Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive access tokens

**Authentication:** None

**Request Body:**

```json
{
  "email": "string (email format, required)",
  "password": "string (required)",
  "mfaCode": "string (optional, required if MFA enabled)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "accessToken": "string (JWT token)",
    "refreshToken": "string (JWT token)",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "string",
      "role": "string",
      "isVerified": true,
      "isKycVerified": true,
      "mfaEnabled": false
    }
  }
}
```

**Error Responses:**

401 Unauthorized:

```json
{
  "status": "fail",
  "message": "Invalid email or password",
  "errors": [
    {
      "code": "INVALID_CREDENTIALS",
      "message": "Invalid email or password"
    }
  ]
}
```

403 Forbidden (MFA required):

```json
{
  "status": "fail",
  "message": "Multi-factor authentication code required",
  "errors": [
    {
      "code": "MFA_REQUIRED",
      "message": "Multi-factor authentication code required"
    }
  ]
}
```

429 Too Many Requests:

```json
{
  "status": "fail",
  "message": "Too many login attempts. Please try again in 15 minutes.",
  "errors": [
    {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Too many login attempts. Please try again in 15 minutes."
    }
  ]
}
```

---

### 1.3 Refresh Token

**Endpoint:** `POST /auth/refresh`

**Description:** Refresh access token using refresh token

**Authentication:** None (requires refresh token in body)

**Request Body:**

```json
{
  "refreshToken": "string (required)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  }
}
```

**Error Responses:**

401 Unauthorized:

```json
{
  "status": "fail",
  "message": "Invalid or expired refresh token",
  "errors": [
    {
      "code": "INVALID_TOKEN",
      "message": "Invalid or expired refresh token"
    }
  ]
}
```

---

### 1.4 Logout

**Endpoint:** `POST /auth/logout`

**Description:** Logout user and invalidate tokens

**Authentication:** Required (Bearer token)

**Request Body:** None

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### 1.5 Request Password Reset

**Endpoint:** `POST /auth/password-reset/request`

**Description:** Request password reset link

**Authentication:** None

**Request Body:**

```json
{
  "email": "string (email format, required)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

---

### 1.6 Reset Password

**Endpoint:** `POST /auth/password-reset/confirm`

**Description:** Reset password using reset token

**Authentication:** None

**Request Body:**

```json
{
  "token": "string (reset token from email, required)",
  "newPassword": "string (min 8 chars, mixed case, numbers, symbols, required)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

**Error Responses:**

400 Bad Request:

```json
{
  "status": "fail",
  "message": "Invalid or expired reset token",
  "errors": [
    {
      "code": "INVALID_TOKEN",
      "message": "Invalid or expired reset token"
    }
  ]
}
```

---

### 1.7 Verify Email

**Endpoint:** `POST /auth/verify-email`

**Description:** Verify user email address

**Authentication:** None

**Request Body:**

```json
{
  "token": "string (verification token from email, required)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Email verified successfully"
}
```

**Error Responses:**

400 Bad Request:

```json
{
  "status": "fail",
  "message": "Invalid or expired verification token",
  "errors": [
    {
      "code": "INVALID_TOKEN",
      "message": "Invalid or expired verification token"
    }
  ]
}
```

---

### 1.8 Enable MFA

**Endpoint:** `POST /auth/mfa/enable`

**Description:** Enable multi-factor authentication (required for healthcare providers)

**Authentication:** Required (Bearer token)

**Request Body:** None

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "qrCode": "string (base64 encoded QR code image)",
    "secret": "string (MFA secret for manual entry)",
    "backupCodes": ["string", "string", "string"]
  }
}
```

---

### 1.9 Verify MFA

**Endpoint:** `POST /auth/mfa/verify`

**Description:** Verify and activate MFA

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "code": "string (6-digit MFA code, required)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "MFA enabled successfully"
}
```

**Error Responses:**

400 Bad Request:

```json
{
  "status": "fail",
  "message": "Invalid MFA code",
  "errors": [
    {
      "code": "INVALID_CODE",
      "message": "Invalid MFA code"
    }
  ]
}
```

---

### 1.10 Disable MFA

**Endpoint:** `POST /auth/mfa/disable`

**Description:** Disable multi-factor authentication

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "code": "string (6-digit MFA code, required)",
  "password": "string (current password, required)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "MFA disabled successfully"
}
```

---

## 2. Patient Profile Module

### 2.1 Get Patient Profile

**Endpoint:** `GET /patients/profile`

**Description:** Get current patient's profile

**Authentication:** Required (Bearer token, role: patient)

**Query Parameters:** None

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "ISO 8601 date",
    "gender": "string (enum: male, female, other)",
    "phoneNumber": "string",
    "email": "string",
    "identificationType": "string (enum: NIN, BVN)",
    "identificationNumber": "string",
    "isKycVerified": true,
    "kycLevel": "number (0-4)",
    "nin": "string",
    "bvn": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "postalCode": "string"
    },
    "emergencyContacts": [
      {
        "name": "string",
        "relationship": "string",
        "phoneNumber": "string"
      }
    ],
    "allergies": ["string"],
    "chronicConditions": ["string"],
    "bloodType": "string (enum: A+, A-, B+, B-, AB+, AB-, O+, O-)",
    "ndprConsent": true,
    "dataProcessingConsent": true,
    "marketingConsent": false,
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

### 2.2 Update Patient Profile

**Endpoint:** `PATCH /patients/profile`

**Description:** Update patient profile information

**Authentication:** Required (Bearer token, role: patient)

**Request Body:**

```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "phoneNumber": "string (optional)",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string"
  },
  "emergencyContacts": [
    {
      "name": "string",
      "relationship": "string",
      "phoneNumber": "string"
    }
  ],
  "allergies": ["string"],
  "chronicConditions": ["string"],
  "bloodType": "string (enum: A+, A-, B+, B-, AB+, AB-, O+, O-)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "firstName": "string",
    "lastName": "string",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

### 2.3 Get Medical History

**Endpoint:** `GET /patients/medical-history`

**Description:** Get patient's medical history

**Authentication:** Required (Bearer token, role: patient)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `type` (string, optional): Filter by record type (consultation, lab_result, prescription, diagnosis)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "records": [
      {
        "id": "uuid",
        "type": "string (enum: consultation, lab_result, prescription, diagnosis)",
        "title": "string",
        "description": "string",
        "providerId": "uuid",
        "providerName": "string",
        "date": "ISO 8601 timestamp",
        "attachments": ["string (file URLs)"],
        "createdAt": "ISO 8601 timestamp"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 2.4 Get Emergency Contacts

**Endpoint:** `GET /patients/emergency-contacts`

**Description:** Get patient's emergency contacts

**Authentication:** Required (Bearer token, role: patient)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "relationship": "string",
      "phoneNumber": "string",
      "isPrimary": true
    }
  ]
}
```

---

## 3. Medical Records Module

### 3.1 Create Medical Record

**Endpoint:** `POST /medical-records`

**Description:** Create a new medical record (provider only)

**Authentication:** Required (Bearer token, role: doctor, lab, pharmacy)

**Request Body:**

```json
{
  "patientId": "uuid (required)",
  "type": "string (enum: consultation, lab_result, prescription, diagnosis, required)",
  "title": "string (required)",
  "description": "string (required)",
  "data": "object (encrypted medical data, required)",
  "attachments": ["string (file URLs, optional)"]
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Medical record created successfully",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "type": "string",
    "title": "string",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 3.2 Get Medical Record

**Endpoint:** `GET /medical-records/:id`

**Description:** Get a specific medical record

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Medical record ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "providerId": "uuid",
    "providerName": "string",
    "type": "string",
    "title": "string",
    "description": "string",
    "data": "object (decrypted medical data)",
    "attachments": ["string (file URLs)"],
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

403 Forbidden:

```json
{
  "status": "fail",
  "message": "You do not have permission to access this medical record",
  "errors": [
    {
      "code": "ACCESS_DENIED",
      "message": "You do not have permission to access this medical record"
    }
  ]
}
```

404 Not Found:

```json
{
  "status": "fail",
  "message": "Medical record not found",
  "errors": [
    {
      "code": "RECORD_NOT_FOUND",
      "message": "Medical record not found"
    }
  ]
}
```

---

### 3.3 List Medical Records

**Endpoint:** `GET /medical-records`

**Description:** List medical records (filtered by user role)

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `patientId` (uuid, optional): Filter by patient (provider only)
- `type` (string, optional): Filter by record type
- `startDate` (ISO 8601 date, optional): Filter from date
- `endDate` (ISO 8601 date, optional): Filter to date

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "records": [
      {
        "id": "uuid",
        "patientId": "uuid",
        "providerId": "uuid",
        "providerName": "string",
        "type": "string",
        "title": "string",
        "date": "ISO 8601 timestamp",
        "createdAt": "ISO 8601 timestamp"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 3.4 Grant Record Access

**Endpoint:** `POST /medical-records/:id/grant-access`

**Description:** Grant provider access to medical record

**Authentication:** Required (Bearer token, role: patient)

**Path Parameters:**

- `id` (uuid, required): Medical record ID

**Request Body:**

```json
{
  "providerId": "uuid (required)",
  "expiresAt": "ISO 8601 timestamp (optional)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Access granted successfully",
  "data": {
    "recordId": "uuid",
    "providerId": "uuid",
    "grantedAt": "ISO 8601 timestamp",
    "expiresAt": "ISO 8601 timestamp"
  }
}
```

---

### 3.5 Revoke Record Access

**Endpoint:** `POST /medical-records/:id/revoke-access`

**Description:** Revoke provider access to medical record

**Authentication:** Required (Bearer token, role: patient)

**Path Parameters:**

- `id` (uuid, required): Medical record ID

**Request Body:**

```json
{
  "providerId": "uuid (required)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Access revoked successfully"
}
```

---

### 3.6 Get Access Audit Logs

**Endpoint:** `GET /medical-records/:id/audit-logs`

**Description:** Get audit logs for medical record access

**Authentication:** Required (Bearer token, role: patient)

**Path Parameters:**

- `id` (uuid, required): Medical record ID

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "id": "uuid",
        "recordId": "uuid",
        "userId": "uuid",
        "userName": "string",
        "action": "string (enum: view, create, update, grant_access, revoke_access)",
        "timestamp": "ISO 8601 timestamp",
        "ipAddress": "string",
        "userAgent": "string"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

## 4. Doctor Discovery Module

### 4.1 Search Doctors

**Endpoint:** `GET /doctors/search`

**Description:** Search for doctors with filters

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `specialty` (string, optional): Filter by specialty
- `location` (string, optional): Filter by location (city or state)
- `availability` (string, optional): Filter by availability (today, this_week, this_month)
- `minRating` (number, optional): Minimum rating (1-5)
- `maxFee` (number, optional): Maximum consultation fee
- `search` (string, optional): Search by name or specialty

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "userId": "uuid",
        "firstName": "string",
        "lastName": "string",
        "profilePhoto": "string (URL)",
        "specialties": ["string"],
        "qualifications": ["string"],
        "yearsOfExperience": 10,
        "consultationFee": 5000,
        "rating": 4.5,
        "reviewCount": 120,
        "location": {
          "city": "string",
          "state": "string"
        },
        "isAvailable": true,
        "nextAvailableSlot": "ISO 8601 timestamp"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### 4.2 Get Doctor Profile

**Endpoint:** `GET /doctors/:id`

**Description:** Get detailed doctor profile

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Doctor ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "firstName": "string",
    "lastName": "string",
    "profilePhoto": "string (URL)",
    "bio": "string",
    "specialties": ["string"],
    "qualifications": [
      {
        "degree": "string",
        "institution": "string",
        "year": 2015
      }
    ],
    "licenseNumber": "string",
    "mdcn_license_number": "string",
    "mdcn_expiry_date": "ISO 8601 date",
    "licenseVerificationStatus": "string (enum: pending, approved, rejected)",
    "license_expiry_date": "ISO 8601 date",
    "nin": "string",
    "bvn": "string",
    "providerStatus": "string (enum: pending, under_review, active, suspended, deactivated)",
    "yearsOfExperience": 10,
    "consultationFee": 5000,
    "rating": 4.5,
    "reviewCount": 120,
    "location": {
      "street": "string",
      "city": "string",
      "state": "string",
      "country": "string"
    },
    "languages": ["string"],
    "hasAmbulance": false,
    "acceptsInsurance": true,
    "ndprConsent": true,
    "dataProcessingConsent": true,
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 4.3 Get Doctor Availability

**Endpoint:** `GET /doctors/:id/availability`

**Description:** Get doctor's available time slots

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Doctor ID

**Query Parameters:**

- `startDate` (ISO 8601 date, required): Start date for availability check
- `endDate` (ISO 8601 date, required): End date for availability check

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "doctorId": "uuid",
    "slots": [
      {
        "id": "uuid",
        "date": "ISO 8601 date",
        "startTime": "ISO 8601 timestamp",
        "endTime": "ISO 8601 timestamp",
        "isAvailable": true,
        "consultationType": "string (enum: telehealth, in_person, both)"
      }
    ]
  }
}
```

---

### 4.4 Get Doctor Reviews

**Endpoint:** `GET /doctors/:id/reviews`

**Description:** Get doctor reviews and ratings

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Doctor ID

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `sort` (string, default: -createdAt): Sort by (createdAt, rating)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "averageRating": 4.5,
    "totalReviews": 120,
    "ratingDistribution": {
      "5": 80,
      "4": 30,
      "3": 7,
      "2": 2,
      "1": 1
    },
    "reviews": [
      {
        "id": "uuid",
        "patientName": "string (anonymized)",
        "rating": 5,
        "comment": "string",
        "consultationType": "string (enum: telehealth, in_person)",
        "createdAt": "ISO 8601 timestamp"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 120,
      "totalPages": 6
    }
  }
}
```

---

## 5. Consultation Module

### 5.1 Book Consultation

**Endpoint:** `POST /consultations`

**Description:** Book a consultation with a doctor

**Authentication:** Required (Bearer token, role: patient)

**Request Body:**

```json
{
  "doctorId": "uuid (required)",
  "slotId": "uuid (required)",
  "type": "string (enum: telehealth, in_person, required)",
  "reason": "string (required)",
  "symptoms": ["string"],
  "useInsurance": "boolean (default: false)",
  "insurancePolicyId": "uuid (optional, required if useInsurance is true)"
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Consultation booked successfully",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "type": "string",
    "status": "string (enum: scheduled, confirmed, in_progress, completed, cancelled)",
    "scheduledAt": "ISO 8601 timestamp",
    "duration": 30,
    "fee": 5000,
    "insuranceCoverage": 3000,
    "patientResponsibility": 2000,
    "createdAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

400 Bad Request:

```json
{
  "status": "fail",
  "message": "The selected time slot is no longer available",
  "errors": [
    {
      "code": "SLOT_UNAVAILABLE",
      "message": "The selected time slot is no longer available"
    }
  ],
  "data": {
    "suggestedSlots": [
      {
        "id": "uuid",
        "startTime": "ISO 8601 timestamp",
        "endTime": "ISO 8601 timestamp"
      }
    ]
  }
}
```

402 Payment Required:

```json
{
  "status": "fail",
  "message": "Insufficient wallet balance. Please add funds to continue.",
  "errors": [
    {
      "code": "INSUFFICIENT_BALANCE",
      "message": "Insufficient wallet balance. Please add funds to continue."
    }
  ],
  "data": {
    "required": 5000,
    "available": 2000
  }
}
```

---

### 5.2 List Consultations

**Endpoint:** `GET /consultations`

**Description:** List user's consultations

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional): Filter by status
- `type` (string, optional): Filter by type
- `startDate` (ISO 8601 date, optional): Filter from date
- `endDate` (ISO 8601 date, optional): Filter to date

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "consultations": [
      {
        "id": "uuid",
        "patientId": "uuid",
        "patientName": "string",
        "doctorId": "uuid",
        "doctorName": "string",
        "doctorPhoto": "string (URL)",
        "type": "string",
        "status": "string",
        "scheduledAt": "ISO 8601 timestamp",
        "duration": 30,
        "fee": 5000,
        "createdAt": "ISO 8601 timestamp"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### 5.3 Get Consultation Details

**Endpoint:** `GET /consultations/:id`

**Description:** Get detailed consultation information

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Consultation ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "patientName": "string",
    "doctorId": "uuid",
    "doctorName": "string",
    "doctorPhoto": "string (URL)",
    "type": "string",
    "status": "string",
    "scheduledAt": "ISO 8601 timestamp",
    "startedAt": "ISO 8601 timestamp",
    "completedAt": "ISO 8601 timestamp",
    "duration": 30,
    "fee": 5000,
    "insuranceCoverage": 3000,
    "patientResponsibility": 2000,
    "reason": "string",
    "symptoms": ["string"],
    "diagnosis": "string",
    "notes": "string",
    "prescriptions": [
      {
        "id": "uuid",
        "medicationName": "string",
        "dosage": "string",
        "frequency": "string",
        "duration": "string",
        "instructions": "string"
      }
    ],
    "labOrders": [
      {
        "id": "uuid",
        "testName": "string",
        "status": "string"
      }
    ],
    "videoSessionUrl": "string (if type is telehealth)",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

### 5.4 Cancel Consultation

**Endpoint:** `POST /consultations/:id/cancel`

**Description:** Cancel a scheduled consultation

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Consultation ID

**Request Body:**

```json
{
  "reason": "string (required)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Consultation cancelled successfully",
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "refundAmount": 5000,
    "cancellationFee": 0,
    "cancelledAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

400 Bad Request:

```json
{
  "status": "fail",
  "message": "Cancellation is only allowed up to 2 hours before the scheduled time",
  "errors": [
    {
      "code": "CANCELLATION_NOT_ALLOWED",
      "message": "Cancellation is only allowed up to 2 hours before the scheduled time"
    }
  ],
  "data": {
    "cancellationFee": 2500
  }
}
```

---

### 5.5 Start Video Session

**Endpoint:** `POST /consultations/:id/video-session/start`

**Description:** Start a telehealth video session

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Consultation ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "sessionId": "uuid",
    "consultationId": "uuid",
    "videoUrl": "string (WebRTC connection URL)",
    "token": "string (session token)",
    "expiresAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

400 Bad Request:

```json
{
  "status": "fail",
  "message": "Video session can only be started within 15 minutes of scheduled time",
  "errors": [
    {
      "code": "SESSION_NOT_READY",
      "message": "Video session can only be started within 15 minutes of scheduled time"
    }
  ]
}
```

---

### 5.6 End Video Session

**Endpoint:** `POST /consultations/:id/video-session/end`

**Description:** End a telehealth video session

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Consultation ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Video session ended successfully",
  "data": {
    "consultationId": "uuid",
    "duration": 28,
    "endedAt": "ISO 8601 timestamp"
  }
}
```

---

### 5.7 Add Consultation Notes

**Endpoint:** `POST /consultations/:id/notes`

**Description:** Add notes to consultation (doctor only)

**Authentication:** Required (Bearer token, role: doctor)

**Path Parameters:**

- `id` (uuid, required): Consultation ID

**Request Body:**

```json
{
  "diagnosis": "string (required)",
  "notes": "string (required)",
  "recommendations": "string (optional)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Notes added successfully"
}
```

---

### 5.8 Create Prescription

**Endpoint:** `POST /consultations/:id/prescriptions`

**Description:** Create prescription during consultation (doctor only)

**Authentication:** Required (Bearer token, role: doctor)

**Path Parameters:**

- `id` (uuid, required): Consultation ID

**Request Body:**

```json
{
  "medications": [
    {
      "name": "string (required)",
      "dosage": "string (required)",
      "frequency": "string (required)",
      "duration": "string (required)",
      "instructions": "string (optional)"
    }
  ]
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Prescription created successfully",
  "data": {
    "id": "uuid",
    "consultationId": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "medications": [
      {
        "id": "uuid",
        "name": "string",
        "dosage": "string",
        "frequency": "string",
        "duration": "string",
        "instructions": "string"
      }
    ],
    "status": "active",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

## 6. Laboratory Module

### 6.1 Search Labs

**Endpoint:** `GET /labs/search`

**Description:** Search for laboratory providers

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `location` (string, optional): Filter by location
- `testType` (string, optional): Filter by available test type
- `search` (string, optional): Search by name

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "labs": [
      {
        "id": "uuid",
        "name": "string",
        "logo": "string (URL)",
        "location": {
          "city": "string",
          "state": "string"
        },
        "rating": 4.5,
        "reviewCount": 80,
        "offersHomeCollection": true,
        "averageTurnaroundTime": 24
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### 6.2 Get Lab Profile

**Endpoint:** `GET /labs/:id`

**Description:** Get detailed lab profile

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Lab ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "string",
    "logo": "string (URL)",
    "description": "string",
    "location": {
      "street": "string",
      "city": "string",
      "state": "string",
      "country": "string"
    },
    "phoneNumber": "string",
    "email": "string",
    "rating": 4.5,
    "reviewCount": 80,
    "offersHomeCollection": true,
    "homeCollectionFee": 2000,
    "averageTurnaroundTime": 24,
    "operatingHours": {
      "monday": "08:00-18:00",
      "tuesday": "08:00-18:00",
      "wednesday": "08:00-18:00",
      "thursday": "08:00-18:00",
      "friday": "08:00-18:00",
      "saturday": "08:00-14:00",
      "sunday": "closed"
    },
    "accreditations": ["string"],
    "mlscn_license_number": "string",
    "mlscn_expiry_date": "ISO 8601 date",
    "cac_number": "string",
    "cac_document_url": "string (URL)",
    "licenseVerificationStatus": "string (enum: pending, approved, rejected)",
    "providerStatus": "string (enum: pending, under_review, active, suspended, deactivated)",
    "nin": "string",
    "bvn": "string",
    "ndprConsent": true,
    "dataProcessingConsent": true,
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 6.3 Get Lab Test Catalog

**Endpoint:** `GET /labs/:id/tests`

**Description:** Get available tests from a lab

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Lab ID

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 50)
- `category` (string, optional): Filter by test category
- `search` (string, optional): Search by test name

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "tests": [
      {
        "id": "uuid",
        "name": "string",
        "code": "string",
        "category": "string",
        "description": "string",
        "cost": 5000,
        "preparationInstructions": "string",
        "turnaroundTime": 24,
        "requiresFasting": false,
        "sampleType": "string (enum: blood, urine, stool, saliva)"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 50,
      "total": 200,
      "totalPages": 4
    }
  }
}
```

---

### 6.4 Order Lab Tests

**Endpoint:** `POST /lab-orders`

**Description:** Order laboratory tests

**Authentication:** Required (Bearer token, role: patient)

**Request Body:**

```json
{
  "labId": "uuid (required)",
  "prescriptionId": "uuid (optional, if prescribed by doctor)",
  "tests": ["uuid (test IDs, required)"],
  "collectionType": "string (enum: home_collection, lab_visit, required)",
  "scheduledAt": "ISO 8601 timestamp (required if home_collection)",
  "collectionAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string"
  },
  "useInsurance": "boolean (default: false)",
  "insurancePolicyId": "uuid (optional)"
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Lab order created successfully",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "labId": "uuid",
    "labName": "string",
    "tests": [
      {
        "id": "uuid",
        "name": "string",
        "cost": 5000
      }
    ],
    "collectionType": "string",
    "scheduledAt": "ISO 8601 timestamp",
    "status": "string (enum: pending, scheduled, sample_collected, processing, completed, cancelled)",
    "totalCost": 15000,
    "insuranceCoverage": 10000,
    "patientResponsibility": 5000,
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 6.5 List Lab Orders

**Endpoint:** `GET /lab-orders`

**Description:** List user's lab orders

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional): Filter by status

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "id": "uuid",
        "patientId": "uuid",
        "patientName": "string",
        "labId": "uuid",
        "labName": "string",
        "testCount": 3,
        "collectionType": "string",
        "scheduledAt": "ISO 8601 timestamp",
        "status": "string",
        "totalCost": 15000,
        "createdAt": "ISO 8601 timestamp"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 30,
      "totalPages": 2
    }
  }
}
```

---

### 6.6 Get Lab Order Details

**Endpoint:** `GET /lab-orders/:id`

**Description:** Get detailed lab order information

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Lab order ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "patientName": "string",
    "labId": "uuid",
    "labName": "string",
    "prescriptionId": "uuid",
    "tests": [
      {
        "id": "uuid",
        "name": "string",
        "code": "string",
        "cost": 5000,
        "preparationInstructions": "string",
        "status": "string"
      }
    ],
    "collectionType": "string",
    "scheduledAt": "ISO 8601 timestamp",
    "collectedAt": "ISO 8601 timestamp",
    "collectionAddress": {
      "street": "string",
      "city": "string",
      "state": "string"
    },
    "status": "string",
    "totalCost": 15000,
    "insuranceCoverage": 10000,
    "patientResponsibility": 5000,
    "results": [
      {
        "testId": "uuid",
        "testName": "string",
        "resultUrl": "string (PDF URL)",
        "completedAt": "ISO 8601 timestamp"
      }
    ],
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

### 6.7 Schedule Sample Collection

**Endpoint:** `PATCH /lab-orders/:id/schedule-collection`

**Description:** Schedule or reschedule sample collection

**Authentication:** Required (Bearer token, role: patient)

**Path Parameters:**

- `id` (uuid, required): Lab order ID

**Request Body:**

```json
{
  "scheduledAt": "ISO 8601 timestamp (required)",
  "collectionAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string"
  }
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Sample collection scheduled successfully",
  "data": {
    "orderId": "uuid",
    "scheduledAt": "ISO 8601 timestamp"
  }
}
```

---

### 6.8 Get Lab Results

**Endpoint:** `GET /lab-orders/:id/results`

**Description:** Get lab test results

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Lab order ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "orderId": "uuid",
    "results": [
      {
        "id": "uuid",
        "testId": "uuid",
        "testName": "string",
        "testCode": "string",
        "resultData": {
          "parameters": [
            {
              "name": "string",
              "value": "string",
              "unit": "string",
              "referenceRange": "string",
              "status": "string (enum: normal, abnormal, critical)"
            }
          ]
        },
        "resultUrl": "string (PDF URL)",
        "completedAt": "ISO 8601 timestamp",
        "reviewedBy": "string (doctor name, if reviewed)"
      }
    ]
  }
}
```

**Error Responses:**

404 Not Found:

```json
{
  "status": "fail",
  "message": "Lab results are not yet available",
  "errors": [
    {
      "code": "RESULTS_NOT_READY",
      "message": "Lab results are not yet available"
    }
  ]
}
```

---

## 7. Pharmacy Module

### 7.1 Search Pharmacies

**Endpoint:** `GET /pharmacies/search`

**Description:** Search for pharmacy providers

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `location` (string, optional): Filter by location
- `medication` (string, optional): Filter by medication availability
- `search` (string, optional): Search by name

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "pharmacies": [
      {
        "id": "uuid",
        "name": "string",
        "logo": "string (URL)",
        "location": {
          "city": "string",
          "state": "string"
        },
        "rating": 4.5,
        "reviewCount": 60,
        "offersDelivery": true,
        "deliveryFee": 1000,
        "averageDeliveryTime": 60
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 40,
      "totalPages": 2
    }
  }
}
```

---

### 7.2 Get Pharmacy Profile

**Endpoint:** `GET /pharmacies/:id`

**Description:** Get detailed pharmacy profile

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Pharmacy ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "string",
    "logo": "string (URL)",
    "description": "string",
    "location": {
      "street": "string",
      "city": "string",
      "state": "string",
      "country": "string"
    },
    "phoneNumber": "string",
    "email": "string",
    "rating": 4.5,
    "reviewCount": 60,
    "offersDelivery": true,
    "deliveryFee": 1000,
    "averageDeliveryTime": 60,
    "hasColdChain": true,
    "operatingHours": {
      "monday": "08:00-20:00",
      "tuesday": "08:00-20:00",
      "wednesday": "08:00-20:00",
      "thursday": "08:00-20:00",
      "friday": "08:00-20:00",
      "saturday": "08:00-18:00",
      "sunday": "10:00-16:00"
    },
    "licenseNumber": "string",
    "pcn_license_number": "string",
    "pcn_expiry_date": "ISO 8601 date",
    "cac_number": "string",
    "cac_document_url": "string (URL)",
    "licenseVerificationStatus": "string (enum: pending, approved, rejected)",
    "providerStatus": "string (enum: pending, under_review, active, suspended, deactivated)",
    "nin": "string",
    "bvn": "string",
    "ndprConsent": true,
    "dataProcessingConsent": true,
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 7.3 Check Medication Availability

**Endpoint:** `POST /pharmacies/:id/check-availability`

**Description:** Check medication availability at pharmacy

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Pharmacy ID

**Request Body:**

```json
{
  "medications": [
    {
      "name": "string (required)",
      "dosage": "string (required)",
      "quantity": "number (required)"
    }
  ]
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "pharmacyId": "uuid",
    "medications": [
      {
        "name": "string",
        "dosage": "string",
        "requestedQuantity": 30,
        "inStock": true,
        "availableQuantity": 100,
        "unitPrice": 500,
        "totalPrice": 15000
      }
    ],
    "totalCost": 15000
  }
}
```

---

### 7.4 Order Medications

**Endpoint:** `POST /pharmacy-orders`

**Description:** Order medications from pharmacy

**Authentication:** Required (Bearer token, role: patient)

**Request Body:**

```json
{
  "pharmacyId": "uuid (required)",
  "prescriptionId": "uuid (required)",
  "medications": [
    {
      "medicationId": "uuid (required)",
      "quantity": "number (required)"
    }
  ],
  "deliveryType": "string (enum: pickup, delivery, required)",
  "deliveryAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string"
  },
  "useInsurance": "boolean (default: false)",
  "insurancePolicyId": "uuid (optional)"
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Pharmacy order created successfully",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "pharmacyId": "uuid",
    "pharmacyName": "string",
    "prescriptionId": "uuid",
    "medications": [
      {
        "id": "uuid",
        "name": "string",
        "dosage": "string",
        "quantity": 30,
        "unitPrice": 500,
        "totalPrice": 15000
      }
    ],
    "deliveryType": "string",
    "deliveryAddress": {
      "street": "string",
      "city": "string",
      "state": "string"
    },
    "status": "string (enum: pending, confirmed, preparing, ready_for_pickup, out_for_delivery, delivered, cancelled)",
    "totalCost": 16000,
    "deliveryFee": 1000,
    "insuranceCoverage": 10000,
    "patientResponsibility": 6000,
    "estimatedDeliveryTime": "ISO 8601 timestamp",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 7.5 List Pharmacy Orders

**Endpoint:** `GET /pharmacy-orders`

**Description:** List user's pharmacy orders

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional): Filter by status

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "id": "uuid",
        "patientId": "uuid",
        "patientName": "string",
        "pharmacyId": "uuid",
        "pharmacyName": "string",
        "medicationCount": 3,
        "deliveryType": "string",
        "status": "string",
        "totalCost": 16000,
        "estimatedDeliveryTime": "ISO 8601 timestamp",
        "createdAt": "ISO 8601 timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

---

### 7.6 Get Pharmacy Order Details

**Endpoint:** `GET /pharmacy-orders/:id`

**Description:** Get detailed pharmacy order information

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Pharmacy order ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "patientName": "string",
    "pharmacyId": "uuid",
    "pharmacyName": "string",
    "pharmacyPhone": "string",
    "prescriptionId": "uuid",
    "medications": [
      {
        "id": "uuid",
        "name": "string",
        "genericName": "string",
        "dosage": "string",
        "quantity": 30,
        "unitPrice": 500,
        "totalPrice": 15000,
        "instructions": "string"
      }
    ],
    "deliveryType": "string",
    "deliveryAddress": {
      "street": "string",
      "city": "string",
      "state": "string",
      "postalCode": "string"
    },
    "status": "string",
    "statusHistory": [
      {
        "status": "string",
        "timestamp": "ISO 8601 timestamp",
        "note": "string"
      }
    ],
    "totalCost": 16000,
    "deliveryFee": 1000,
    "insuranceCoverage": 10000,
    "patientResponsibility": 6000,
    "estimatedDeliveryTime": "ISO 8601 timestamp",
    "deliveredAt": "ISO 8601 timestamp",
    "trackingInfo": {
      "currentLocation": "string",
      "estimatedArrival": "ISO 8601 timestamp"
    },
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

### 7.7 Track Delivery

**Endpoint:** `GET /pharmacy-orders/:id/track`

**Description:** Track medication delivery in real-time

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Pharmacy order ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "orderId": "uuid",
    "status": "out_for_delivery",
    "currentLocation": {
      "latitude": 6.5244,
      "longitude": 3.3792,
      "address": "string"
    },
    "estimatedArrival": "ISO 8601 timestamp",
    "deliveryPersonName": "string",
    "deliveryPersonPhone": "string"
  }
}
```

---

## 8. Wallet Module

### 8.1 Get Wallet Balance

**Endpoint:** `GET /wallet`

**Description:** Get user's wallet information

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "balance": 50000,
    "currency": "NGN",
    "isActive": true,
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

### 8.2 Add Funds to Wallet

**Endpoint:** `POST /wallet/fund`

**Description:** Add funds to wallet using BudPay

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "amount": "number (required, minimum: 100)",
  "paymentMethod": "string (enum: card, bank_transfer, mobile_money, required)",
  "callbackUrl": "string (optional)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Payment initiated successfully",
  "data": {
    "transactionId": "uuid",
    "amount": 10000,
    "paymentUrl": "string (BudPay payment URL)",
    "reference": "string (payment reference)",
    "expiresAt": "ISO 8601 timestamp"
  }
}
```

---

### 8.3 Get Transaction History

**Endpoint:** `GET /wallet/transactions`

**Description:** Get wallet transaction history

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `type` (string, optional): Filter by type (credit, debit)
- `startDate` (ISO 8601 date, optional): Filter from date
- `endDate` (ISO 8601 date, optional): Filter to date

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "walletId": "uuid",
        "type": "string (enum: credit, debit)",
        "amount": 5000,
        "balanceBefore": 45000,
        "balanceAfter": 50000,
        "description": "string",
        "reference": "string",
        "status": "string (enum: pending, completed, failed, reversed)",
        "metadata": {
          "serviceType": "string (consultation, lab_order, pharmacy_order, etc.)",
          "serviceId": "uuid"
        },
        "createdAt": "ISO 8601 timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 8.4 Get Transaction Details

**Endpoint:** `GET /wallet/transactions/:id`

**Description:** Get detailed transaction information

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Transaction ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "walletId": "uuid",
    "type": "string",
    "amount": 5000,
    "balanceBefore": 45000,
    "balanceAfter": 50000,
    "description": "string",
    "reference": "string",
    "status": "string",
    "paymentMethod": "string",
    "metadata": {
      "serviceType": "string",
      "serviceId": "uuid",
      "serviceName": "string"
    },
    "receiptUrl": "string (PDF URL)",
    "createdAt": "ISO 8601 timestamp",
    "completedAt": "ISO 8601 timestamp"
  }
}
```

---

### 8.5 Get Payment Methods

**Endpoint:** `GET /wallet/payment-methods`

**Description:** Get saved payment methods

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "type": "string (enum: card, bank_account)",
      "isDefault": true,
      "details": {
        "last4": "1234",
        "brand": "Visa",
        "expiryMonth": 12,
        "expiryYear": 2025
      },
      "createdAt": "ISO 8601 timestamp"
    }
  ]
}
```

---

### 8.6 Add Payment Method

**Endpoint:** `POST /wallet/payment-methods`

**Description:** Add a new payment method

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "type": "string (enum: card, bank_account, required)",
  "cardNumber": "string (required if type is card)",
  "expiryMonth": "number (required if type is card)",
  "expiryYear": "number (required if type is card)",
  "cvv": "string (required if type is card)",
  "accountNumber": "string (required if type is bank_account)",
  "bankCode": "string (required if type is bank_account)",
  "setAsDefault": "boolean (default: false)"
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Payment method added successfully",
  "data": {
    "id": "uuid",
    "type": "string",
    "isDefault": false,
    "details": {
      "last4": "1234",
      "brand": "Visa"
    },
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 8.7 Delete Payment Method

**Endpoint:** `DELETE /wallet/payment-methods/:id`

**Description:** Remove a payment method

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Payment method ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Payment method removed successfully"
}
```

---

## 9. Insurance Module

### 9.1 Link Insurance Policy

**Endpoint:** `POST /insurance/policies`

**Description:** Link an insurance policy to patient account

**Authentication:** Required (Bearer token, role: patient)

**Request Body:**

```json
{
  "providerId": "uuid (required)",
  "policyNumber": "string (required)",
  "policyHolderName": "string (required)",
  "policyHolderRelationship": "string (enum: self, spouse, child, parent, required)",
  "coverageType": "string (enum: basic, standard, premium, required)",
  "expiresAt": "ISO 8601 date (required)"
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Insurance policy linked successfully",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "providerId": "uuid",
    "providerName": "string",
    "policyNumber": "string",
    "coverageType": "string",
    "coverageLimit": 500000,
    "deductible": 50000,
    "copayment": 20,
    "isActive": true,
    "isVerified": true,
    "expiresAt": "ISO 8601 date",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 9.2 List Insurance Policies

**Endpoint:** `GET /insurance/policies`

**Description:** List patient's insurance policies

**Authentication:** Required (Bearer token, role: patient)

**Query Parameters:**

- `status` (string, optional): Filter by status (active, expired)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "providerId": "uuid",
      "providerName": "string",
      "providerLogo": "string (URL)",
      "policyNumber": "string",
      "coverageType": "string",
      "coverageLimit": 500000,
      "deductible": 50000,
      "copayment": 20,
      "isActive": true,
      "expiresAt": "ISO 8601 date",
      "createdAt": "ISO 8601 timestamp"
    }
  ]
}
```

---

### 9.3 Get Insurance Policy Details

**Endpoint:** `GET /insurance/policies/:id`

**Description:** Get detailed insurance policy information

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Policy ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "providerId": "uuid",
    "providerName": "string",
    "providerLogo": "string (URL)",
    "policyNumber": "string",
    "policyHolderName": "string",
    "policyHolderRelationship": "string",
    "coverageType": "string",
    "coverageLimit": 500000,
    "usedAmount": 150000,
    "remainingAmount": 350000,
    "deductible": 50000,
    "copayment": 20,
    "coveredServices": ["consultation", "lab_tests", "pharmacy", "emergency"],
    "isActive": true,
    "isVerified": true,
    "expiresAt": "ISO 8601 date",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

### 9.4 Verify Insurance Coverage

**Endpoint:** `POST /insurance/verify-coverage`

**Description:** Verify insurance coverage for a service

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "policyId": "uuid (required)",
  "serviceType": "string (enum: consultation, lab_order, pharmacy_order, emergency, required)",
  "serviceAmount": "number (required)",
  "providerId": "uuid (optional)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "policyId": "uuid",
    "isEligible": true,
    "isCovered": true,
    "coverageAmount": 4000,
    "copaymentAmount": 1000,
    "deductibleApplied": 0,
    "patientResponsibility": 1000,
    "message": "Service is covered under your policy"
  }
}
```

**Error Responses:**

400 Bad Request:

```json
{
  "status": "fail",
  "error": "COVERAGE_DENIED",
  "message": "This service is not covered under your policy",
  "data": {
    "isEligible": true,
    "isCovered": false,
    "patientResponsibility": 5000
  }
}
```

---

### 9.5 Submit Insurance Claim

**Endpoint:** `POST /insurance/claims`

**Description:** Submit an insurance claim (auto-submitted by system)

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "policyId": "uuid (required)",
  "serviceType": "string (enum: consultation, lab_order, pharmacy_order, emergency, required)",
  "serviceId": "uuid (required)",
  "amount": "number (required)",
  "documents": ["string (file URLs, optional)"]
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Insurance claim submitted successfully",
  "data": {
    "id": "uuid",
    "policyId": "uuid",
    "claimNumber": "string",
    "serviceType": "string",
    "serviceId": "uuid",
    "amount": 5000,
    "status": "string (enum: submitted, under_review, approved, denied, paid)",
    "submittedAt": "ISO 8601 timestamp"
  }
}
```

---

### 9.6 List Insurance Claims

**Endpoint:** `GET /insurance/claims`

**Description:** List patient's insurance claims

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional): Filter by status
- `policyId` (uuid, optional): Filter by policy

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "claims": [
      {
        "id": "uuid",
        "policyId": "uuid",
        "providerName": "string",
        "claimNumber": "string",
        "serviceType": "string",
        "amount": 5000,
        "approvedAmount": 4000,
        "status": "string",
        "submittedAt": "ISO 8601 timestamp",
        "processedAt": "ISO 8601 timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 30,
      "totalPages": 2
    }
  }
}
```

---

### 9.7 Get Claim Details

**Endpoint:** `GET /insurance/claims/:id`

**Description:** Get detailed claim information

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Claim ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "policyId": "uuid",
    "providerName": "string",
    "claimNumber": "string",
    "serviceType": "string",
    "serviceId": "uuid",
    "amount": 5000,
    "approvedAmount": 4000,
    "deniedAmount": 1000,
    "status": "string",
    "statusHistory": [
      {
        "status": "string",
        "timestamp": "ISO 8601 timestamp",
        "note": "string"
      }
    ],
    "documents": ["string (file URLs)"],
    "denialReason": "string",
    "submittedAt": "ISO 8601 timestamp",
    "processedAt": "ISO 8601 timestamp",
    "paidAt": "ISO 8601 timestamp"
  }
}
```

---

## 10. Emergency Module

### 10.1 Create Emergency Request

**Endpoint:** `POST /emergency/requests`

**Description:** Create an emergency service request

**Authentication:** Required (Bearer token, role: patient)

**Request Body:**

```json
{
  "type": "string (enum: ambulance, urgent_care, medical_emergency, required)",
  "description": "string (required)",
  "location": {
    "latitude": "number (required)",
    "longitude": "number (required)",
    "address": "string (optional)"
  },
  "severity": "string (enum: critical, high, moderate, required)"
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Emergency request created successfully",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "type": "string",
    "status": "string (enum: pending, dispatched, en_route, arrived, completed, cancelled)",
    "location": {
      "latitude": 6.5244,
      "longitude": 3.3792,
      "address": "string"
    },
    "severity": "string",
    "estimatedArrivalTime": "ISO 8601 timestamp",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 10.2 Get Emergency Request Status

**Endpoint:** `GET /emergency/requests/:id`

**Description:** Get emergency request details and status

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Emergency request ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "patientName": "string",
    "patientPhone": "string",
    "type": "string",
    "description": "string",
    "status": "string",
    "location": {
      "latitude": 6.5244,
      "longitude": 3.3792,
      "address": "string"
    },
    "severity": "string",
    "assignedProviderId": "uuid",
    "assignedProviderName": "string",
    "assignedProviderPhone": "string",
    "vehicleInfo": {
      "type": "string",
      "plateNumber": "string",
      "color": "string"
    },
    "currentLocation": {
      "latitude": 6.52,
      "longitude": 3.375
    },
    "estimatedArrivalTime": "ISO 8601 timestamp",
    "dispatchedAt": "ISO 8601 timestamp",
    "arrivedAt": "ISO 8601 timestamp",
    "completedAt": "ISO 8601 timestamp",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 10.3 Track Emergency Response

**Endpoint:** `GET /emergency/requests/:id/track`

**Description:** Track emergency response vehicle in real-time

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Emergency request ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "requestId": "uuid",
    "status": "en_route",
    "vehicleLocation": {
      "latitude": 6.52,
      "longitude": 3.375,
      "timestamp": "ISO 8601 timestamp"
    },
    "patientLocation": {
      "latitude": 6.5244,
      "longitude": 3.3792
    },
    "estimatedArrivalTime": "ISO 8601 timestamp",
    "distanceRemaining": 2.5,
    "providerPhone": "string"
  }
}
```

---

### 10.4 List Emergency Requests

**Endpoint:** `GET /emergency/requests`

**Description:** List user's emergency requests

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional): Filter by status

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "requests": [
      {
        "id": "uuid",
        "type": "string",
        "status": "string",
        "severity": "string",
        "location": {
          "address": "string"
        },
        "assignedProviderName": "string",
        "createdAt": "ISO 8601 timestamp",
        "completedAt": "ISO 8601 timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

---

### 10.5 Get Nearest Emergency Providers

**Endpoint:** `GET /emergency/providers/nearest`

**Description:** Get nearest emergency service providers

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `latitude` (number, required): Current latitude
- `longitude` (number, required): Current longitude
- `type` (string, optional): Filter by provider type
- `limit` (number, default: 10): Number of results

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "type": "string (enum: ambulance, hospital, urgent_care)",
      "location": {
        "latitude": 6.5244,
        "longitude": 3.3792,
        "address": "string"
      },
      "distance": 2.5,
      "phoneNumber": "string",
      "isAvailable": true,
      "averageResponseTime": 15,
      "equipment": ["string"],
      "rating": 4.5
    }
  ]
}
```

---

### 10.6 Cancel Emergency Request

**Endpoint:** `POST /emergency/requests/:id/cancel`

**Description:** Cancel an emergency request

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Emergency request ID

**Request Body:**

```json
{
  "reason": "string (required)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Emergency request cancelled successfully"
}
```

**Error Responses:**

400 Bad Request:

```json
{
  "status": "fail",
  "error": "CANNOT_CANCEL",
  "message": "Cannot cancel emergency request after provider has arrived"
}
```

---

## 11. Notifications Module

### 11.1 List Notifications

**Endpoint:** `GET /notifications`

**Description:** List user's notifications

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `isRead` (boolean, optional): Filter by read status
- `type` (string, optional): Filter by notification type

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "userId": "uuid",
        "type": "string (enum: appointment_reminder, test_result, prescription, payment, emergency, system)",
        "title": "string",
        "message": "string",
        "priority": "string (enum: low, medium, high, critical)",
        "isRead": false,
        "data": {
          "resourceType": "string",
          "resourceId": "uuid",
          "actionUrl": "string"
        },
        "createdAt": "ISO 8601 timestamp"
      }
    ],
    "unreadCount": 15,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 11.2 Mark Notification as Read

**Endpoint:** `PATCH /notifications/:id/read`

**Description:** Mark a notification as read

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Notification ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

---

### 11.3 Mark All Notifications as Read

**Endpoint:** `PATCH /notifications/read-all`

**Description:** Mark all notifications as read

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 15
  }
}
```

---

### 11.4 Delete Notification

**Endpoint:** `DELETE /notifications/:id`

**Description:** Delete a notification

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (uuid, required): Notification ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Notification deleted successfully"
}
```

---

### 11.5 Get Notification Preferences

**Endpoint:** `GET /notifications/preferences`

**Description:** Get user's notification preferences

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "userId": "uuid",
    "email": {
      "enabled": true,
      "appointmentReminders": true,
      "testResults": true,
      "prescriptions": true,
      "payments": true,
      "marketing": false
    },
    "push": {
      "enabled": true,
      "appointmentReminders": true,
      "testResults": true,
      "prescriptions": true,
      "payments": true,
      "emergency": true
    },
    "sms": {
      "enabled": true,
      "appointmentReminders": true,
      "testResults": false,
      "emergency": true
    }
  }
}
```

---

### 11.6 Update Notification Preferences

**Endpoint:** `PATCH /notifications/preferences`

**Description:** Update notification preferences

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "email": {
    "enabled": "boolean (optional)",
    "appointmentReminders": "boolean (optional)",
    "testResults": "boolean (optional)",
    "prescriptions": "boolean (optional)",
    "payments": "boolean (optional)",
    "marketing": "boolean (optional)"
  },
  "push": {
    "enabled": "boolean (optional)",
    "appointmentReminders": "boolean (optional)",
    "testResults": "boolean (optional)",
    "prescriptions": "boolean (optional)",
    "payments": "boolean (optional)",
    "emergency": "boolean (optional)"
  },
  "sms": {
    "enabled": "boolean (optional)",
    "appointmentReminders": "boolean (optional)",
    "testResults": "boolean (optional)",
    "emergency": "boolean (optional)"
  }
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Notification preferences updated successfully"
}
```

---

### 11.7 Send Message (Provider to Patient)

**Endpoint:** `POST /notifications/messages`

**Description:** Send a secure message to a patient (provider only)

**Authentication:** Required (Bearer token, role: doctor, lab, pharmacy)

**Request Body:**

```json
{
  "recipientId": "uuid (required)",
  "subject": "string (required)",
  "message": "string (required)",
  "priority": "string (enum: low, medium, high, default: medium)"
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "id": "uuid",
    "senderId": "uuid",
    "recipientId": "uuid",
    "subject": "string",
    "sentAt": "ISO 8601 timestamp"
  }
}
```

---

## 12. WellPoints Module

### 12.1 Get WellPoints Balance

**Endpoint:** `GET /wellpoints/balance`

**Description:** Get user's WellPoints balance

**Authentication:** Required (Bearer token, role: patient)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "userId": "uuid",
    "balance": 2500,
    "tier": "string (enum: bronze, silver, gold, platinum)",
    "lifetimeEarned": 5000,
    "lifetimeRedeemed": 2500,
    "expiringPoints": 500,
    "expiringAt": "ISO 8601 date"
  }
}
```

---

### 12.2 Get WellPoints Transaction History

**Endpoint:** `GET /wellpoints/transactions`

**Description:** Get WellPoints earning and redemption history

**Authentication:** Required (Bearer token, role: patient)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `type` (string, optional): Filter by type (earned, redeemed, expired)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "type": "string (enum: earned, redeemed, expired, bonus)",
        "points": 100,
        "balanceBefore": 2400,
        "balanceAfter": 2500,
        "description": "string",
        "source": "string (consultation, lab_test, medication_adherence, milestone)",
        "sourceId": "uuid",
        "createdAt": "ISO 8601 timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### 12.3 Get WellPoints Earning Rules

**Endpoint:** `GET /wellpoints/earning-rules`

**Description:** Get rules for earning WellPoints

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "rules": [
      {
        "activity": "consultation_completed",
        "points": 100,
        "description": "Complete a consultation with a doctor"
      },
      {
        "activity": "lab_test_completed",
        "points": 50,
        "description": "Complete a laboratory test"
      },
      {
        "activity": "medication_adherence_7days",
        "points": 75,
        "description": "Take medications as prescribed for 7 consecutive days"
      },
      {
        "activity": "profile_completion",
        "points": 200,
        "description": "Complete your health profile"
      },
      {
        "activity": "referral",
        "points": 500,
        "description": "Refer a friend who completes their first consultation"
      }
    ],
    "milestones": [
      {
        "name": "First Consultation",
        "points": 200,
        "description": "Bonus for completing your first consultation"
      },
      {
        "name": "Health Champion",
        "points": 1000,
        "description": "Complete 10 consultations"
      }
    ]
  }
}
```

---

### 12.4 Get WellPoints Marketplace

**Endpoint:** `GET /wellpoints/marketplace`

**Description:** Browse available rewards in WellPoints marketplace

**Authentication:** Required (Bearer token, role: patient)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `category` (string, optional): Filter by category

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "rewards": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "category": "string (enum: consultation_discount, lab_discount, pharmacy_discount, gift_card)",
        "pointsCost": 500,
        "discountType": "string (enum: percentage, fixed_amount)",
        "discountValue": 10,
        "imageUrl": "string",
        "termsAndConditions": "string",
        "expiryDays": 30,
        "isAvailable": true,
        "stock": 100
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### 12.5 Redeem WellPoints Reward

**Endpoint:** `POST /wellpoints/redeem`

**Description:** Redeem WellPoints for a reward

**Authentication:** Required (Bearer token, role: patient)

**Request Body:**

```json
{
  "rewardId": "uuid (required)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Reward redeemed successfully",
  "data": {
    "redemptionId": "uuid",
    "rewardId": "uuid",
    "rewardName": "string",
    "pointsRedeemed": 500,
    "newBalance": 2000,
    "voucherCode": "string",
    "expiresAt": "ISO 8601 date",
    "redeemedAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**

400 Bad Request:

```json
{
  "status": "fail",
  "error": "INSUFFICIENT_POINTS",
  "message": "You do not have enough WellPoints to redeem this reward",
  "required": 500,
  "available": 300
}
```

---

### 12.6 Get Redeemed Rewards

**Endpoint:** `GET /wellpoints/redeemed`

**Description:** Get list of redeemed rewards

**Authentication:** Required (Bearer token, role: patient)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional): Filter by status (active, used, expired)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "redemptions": [
      {
        "id": "uuid",
        "rewardId": "uuid",
        "rewardName": "string",
        "pointsRedeemed": 500,
        "voucherCode": "string",
        "status": "string (enum: active, used, expired)",
        "expiresAt": "ISO 8601 date",
        "redeemedAt": "ISO 8601 timestamp",
        "usedAt": "ISO 8601 timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

## 13. Admin Module

### 13.1 Get Dashboard Metrics

**Endpoint:** `GET /admin/dashboard`

**Description:** Get platform metrics and statistics

**Authentication:** Required (Bearer token, role: admin)

**Query Parameters:**

- `startDate` (ISO 8601 date, optional): Start date for metrics
- `endDate` (ISO 8601 date, optional): End date for metrics

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "users": {
      "total": 10000,
      "patients": 8500,
      "doctors": 1200,
      "labs": 150,
      "pharmacies": 100,
      "newThisMonth": 500
    },
    "consultations": {
      "total": 5000,
      "completed": 4500,
      "scheduled": 300,
      "cancelled": 200,
      "revenue": 25000000
    },
    "labOrders": {
      "total": 3000,
      "completed": 2700,
      "pending": 300,
      "revenue": 15000000
    },
    "pharmacyOrders": {
      "total": 4000,
      "delivered": 3800,
      "pending": 200,
      "revenue": 20000000
    },
    "wallet": {
      "totalBalance": 50000000,
      "totalTransactions": 15000,
      "transactionVolume": 100000000
    },
    "insurance": {
      "activePolicies": 3000,
      "claimsSubmitted": 2000,
      "claimsApproved": 1800,
      "claimsDenied": 200
    },
    "emergency": {
      "totalRequests": 500,
      "completed": 480,
      "averageResponseTime": 12
    }
  }
}
```

---

### 13.2 List All Users

**Endpoint:** `GET /admin/users`

**Description:** List all platform users with filters

**Authentication:** Required (Bearer token, role: admin)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `role` (string, optional): Filter by role
- `status` (string, optional): Filter by status (active, suspended, deleted)
- `search` (string, optional): Search by name or email
- `isVerified` (boolean, optional): Filter by verification status

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "string",
        "role": "string",
        "firstName": "string",
        "lastName": "string",
        "isVerified": true,
        "isKycVerified": true,
        "status": "string (enum: active, suspended, deleted)",
        "lastLoginAt": "ISO 8601 timestamp",
        "createdAt": "ISO 8601 timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10000,
      "totalPages": 500
    }
  }
}
```

---

### 13.3 Get User Details

**Endpoint:** `GET /admin/users/:id`

**Description:** Get detailed user information

**Authentication:** Required (Bearer token, role: admin)

**Path Parameters:**

- `id` (uuid, required): User ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "isVerified": true,
    "isKycVerified": true,
    "status": "string",
    "profile": {
      "dateOfBirth": "ISO 8601 date",
      "gender": "string",
      "address": {
        "city": "string",
        "state": "string",
        "country": "string"
      }
    },
    "wallet": {
      "balance": 50000,
      "totalTransactions": 50
    },
    "statistics": {
      "consultations": 10,
      "labOrders": 5,
      "pharmacyOrders": 8
    },
    "lastLoginAt": "ISO 8601 timestamp",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

### 13.4 Suspend User

**Endpoint:** `POST /admin/users/:id/suspend`

**Description:** Suspend a user account

**Authentication:** Required (Bearer token, role: admin)

**Path Parameters:**

- `id` (uuid, required): User ID

**Request Body:**

```json
{
  "reason": "string (required)",
  "duration": "number (days, optional, permanent if not provided)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "User suspended successfully",
  "data": {
    "userId": "uuid",
    "status": "suspended",
    "suspendedUntil": "ISO 8601 timestamp",
    "reason": "string"
  }
}
```

---

### 13.5 Reactivate User

**Endpoint:** `POST /admin/users/:id/reactivate`

**Description:** Reactivate a suspended user account

**Authentication:** Required (Bearer token, role: admin)

**Path Parameters:**

- `id` (uuid, required): User ID

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "User reactivated successfully"
}
```

---

### 13.6 List Provider Verification Requests

**Endpoint:** `GET /admin/provider-verifications`

**Description:** List healthcare provider verification requests

**Authentication:** Required (Bearer token, role: admin)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional): Filter by status (pending, approved, rejected)
- `providerType` (string, optional): Filter by provider type

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "verifications": [
      {
        "id": "uuid",
        "providerId": "uuid",
        "providerName": "string",
        "providerType": "string (enum: doctor, lab, pharmacy, emergency)",
        "licenseNumber": "string",
        "licenseDocument": "string (URL)",
        "status": "string (enum: pending, approved, rejected, expired)",
        "submittedAt": "ISO 8601 timestamp",
        "reviewedAt": "ISO 8601 timestamp",
        "reviewedBy": "uuid"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### 13.7 Review Provider Verification

**Endpoint:** `POST /admin/provider-verifications/:id/review`

**Description:** Approve or reject provider verification

**Authentication:** Required (Bearer token, role: admin)

**Path Parameters:**

- `id` (uuid, required): Verification request ID

**Request Body:**

```json
{
  "action": "string (enum: approve, reject, required)",
  "rejectionReason": "string (required if action is reject)",
  "notes": "string (optional)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Provider verification reviewed successfully",
  "data": {
    "verificationId": "uuid",
    "providerId": "uuid",
    "status": "approved",
    "reviewedBy": "uuid",
    "reviewedAt": "ISO 8601 timestamp"
  }
}
```

---

### 13.8 Get Audit Logs

**Endpoint:** `GET /admin/audit-logs`

**Description:** Get platform audit logs

**Authentication:** Required (Bearer token, role: admin)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 50)
- `userId` (uuid, optional): Filter by user
- `action` (string, optional): Filter by action type
- `resourceType` (string, optional): Filter by resource type
- `startDate` (ISO 8601 date, optional): Filter from date
- `endDate` (ISO 8601 date, optional): Filter to date

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "id": "uuid",
        "userId": "uuid",
        "userName": "string",
        "userRole": "string",
        "action": "string",
        "resourceType": "string",
        "resourceId": "uuid",
        "ipAddress": "string",
        "userAgent": "string",
        "metadata": {
          "changes": "object",
          "reason": "string"
        },
        "timestamp": "ISO 8601 timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10000,
      "totalPages": 200
    }
  }
}
```

---

### 13.9 Get Platform Settings

**Endpoint:** `GET /admin/settings`

**Description:** Get platform configuration settings

**Authentication:** Required (Bearer token, role: admin)

**Success Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "general": {
      "platformName": "WellBank",
      "maintenanceMode": false,
      "allowNewRegistrations": true
    },
    "fees": {
      "consultationPlatformFee": 5,
      "labOrderPlatformFee": 3,
      "pharmacyOrderPlatformFee": 2,
      "emergencyServiceFee": 10
    },
    "wellpoints": {
      "consultationPoints": 100,
      "labTestPoints": 50,
      "medicationAdherencePoints": 75,
      "referralPoints": 500,
      "pointsExpiryDays": 365
    },
    "cancellation": {
      "consultationCancellationHours": 2,
      "consultationCancellationFeePercentage": 50,
      "labOrderCancellationHours": 24,
      "pharmacyOrderCancellationMinutes": 30
    },
    "notifications": {
      "appointmentReminderHours": [24, 1],
      "pointsExpiryReminderDays": 30
    }
  }
}
```

---

### 13.10 Update Platform Settings

**Endpoint:** `PATCH /admin/settings`

**Description:** Update platform configuration settings

**Authentication:** Required (Bearer token, role: admin)

**Request Body:**

```json
{
  "general": {
    "maintenanceMode": "boolean (optional)",
    "allowNewRegistrations": "boolean (optional)"
  },
  "fees": {
    "consultationPlatformFee": "number (optional)",
    "labOrderPlatformFee": "number (optional)",
    "pharmacyOrderPlatformFee": "number (optional)",
    "emergencyServiceFee": "number (optional)"
  },
  "wellpoints": {
    "consultationPoints": "number (optional)",
    "labTestPoints": "number (optional)",
    "medicationAdherencePoints": "number (optional)",
    "referralPoints": "number (optional)",
    "pointsExpiryDays": "number (optional)"
  }
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Platform settings updated successfully"
}
```

---

### 13.11 Generate Compliance Report

**Endpoint:** `POST /admin/reports/compliance`

**Description:** Generate NDPR compliance report

**Authentication:** Required (Bearer token, role: admin)

**Request Body:**

```json
{
  "reportType": "string (enum: data_access, data_deletion, security_audit, required)",
  "startDate": "ISO 8601 date (required)",
  "endDate": "ISO 8601 date (required)",
  "format": "string (enum: pdf, csv, json, default: pdf)"
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Compliance report generated successfully",
  "data": {
    "reportId": "uuid",
    "reportType": "string",
    "reportUrl": "string (download URL)",
    "generatedAt": "ISO 8601 timestamp",
    "expiresAt": "ISO 8601 timestamp"
  }
}
```

---

## Appendix

### A. Common Error Response Format

All error responses follow this standard format:

```json
{
  "status": "fail",
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ],
  "timestamp": "ISO 8601 timestamp",
  "path": "/api/v1/endpoint",
  "requestId": "uuid"
}
```

### B. Pagination Response Format

All paginated endpoints include this pagination object:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### C. Enum Values Reference

**UserRole:**

- `patient`
- `doctor`
- `lab`
- `pharmacy`
- `insurance`
- `emergency`
- `admin`

**Gender:**

- `male`
- `female`
- `other`

**ConsultationType:**

- `telehealth`
- `in_person`

**ConsultationStatus:**

- `scheduled`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`
- `no_show`

**LabOrderStatus:**

- `pending`
- `scheduled`
- `sample_collected`
- `processing`
- `completed`
- `cancelled`

**PharmacyOrderStatus:**

- `pending`
- `confirmed`
- `preparing`
- `ready_for_pickup`
- `out_for_delivery`
- `delivered`
- `cancelled`

**TransactionType:**

- `credit`
- `debit`

**TransactionStatus:**

- `pending`
- `completed`
- `failed`
- `reversed`

**ClaimStatus:**

- `submitted`
- `under_review`
- `approved`
- `denied`
- `paid`

**EmergencyStatus:**

- `pending`
- `dispatched`
- `en_route`
- `arrived`
- `completed`
- `cancelled`

**NotificationType:**

- `appointment_reminder`
- `test_result`
- `prescription`
- `payment`
- `emergency`
- `system`

**NotificationPriority:**

- `low`
- `medium`
- `high`
- `critical`

### D. Rate Limiting

All API endpoints are subject to rate limiting:

- **Authentication endpoints:** 5 requests per minute per IP
- **Standard endpoints:** 100 requests per minute per user
- **Admin endpoints:** 200 requests per minute per admin

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### E. Webhook Events (BudPay Integration)

The platform receives webhook events from BudPay for payment processing:

**Webhook Endpoint:** `POST /webhooks/budpay`

**Event Types:**

- `payment.success`
- `payment.failed`
- `payment.pending`
- `refund.processed`

**Webhook Payload:**

```json
{
  "event": "payment.success",
  "data": {
    "reference": "string",
    "amount": 10000,
    "currency": "NGN",
    "status": "success",
    "customer": {
      "email": "string",
      "name": "string"
    },
    "metadata": {
      "transactionId": "uuid",
      "userId": "uuid"
    }
  },
  "timestamp": "ISO 8601 timestamp"
}
```

---

## Notes for Frontend Developers

1. **Mock Data:** Use the response schemas provided to create mock data for development
2. **Error Handling:** Always handle all specified error codes for each endpoint
3. **Loading States:** Implement loading states for all async operations
4. **Optimistic Updates:** Consider optimistic UI updates for better UX
5. **Caching:** Cache frequently accessed data (user profile, wallet balance)
6. **Real-time Updates:** Use WebSocket connections for real-time features (video calls, tracking)
7. **Offline Support:** Implement offline-first approach for critical features
8. **Accessibility:** Ensure all UI components are WCAG 2.1 AA compliant
9. **Dark Mode:** All designs should support dark mode as primary theme
10. **Mobile First:** Design for mobile devices first, then scale up

---

**Document Version:** 1.0
**Last Updated:** 2024-01-15
**API Version:** v1
