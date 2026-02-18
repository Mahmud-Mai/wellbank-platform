# WellBank Complete API Reference

## Quick Reference: What Each Endpoint Returns

This appendix provides complete reference for all endpoints. Use this to build mock data.

---

## 1. Authentication (10 endpoints)

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/auth/register` | POST | `{userId, email, role}` |
| `/auth/login` | POST | `{accessToken, refreshToken, user: {id, email, role, isKycVerified}}` |
| `/auth/refresh` | POST | `{accessToken, refreshToken}` |
| `/auth/logout` | POST | `200 OK` |
| `/auth/password-reset` | POST | `{message}` |
| `/auth/password-reset/:token` | POST | `200 OK` |
| `/auth/verify-email/:token` | POST | `{message}` |
| `/auth/mfa/enable` | POST | `{qrCode, secret, backupCodes[]}` |
| `/auth/mfa/verify` | POST | `{secret}` |
| `/auth/mfa/disable` | POST | `200 OK` |

---

## 2. Patient Profile (4 endpoints)

### GET /patients/profile
```json
{
  "id": "uuid", "userId": "uuid", "firstName": "John", "lastName": "Doe",
  "dateOfBirth": "1990-01-15", "gender": "male",
  "phoneNumber": "+2348012345678", "email": "john@example.com",
  "identificationType": "NIN", "identificationNumber": "12345678901",
  "nin": "12345678901", "bvn": "12345678901",
  "kycLevel": 3, "isKycVerified": true,
  "bloodType": "O+", "genotype": "AA",
  "address": { "street": "123 Main St", "city": "Lagos", "state": "Lagos", "country": "Nigeria", "postalCode": "10001" },
  "emergencyContacts": [{ "name": "Jane Doe", "relationship": "spouse", "phoneNumber": "+2348012345679" }],
  "allergies": ["Penicillin"], "chronicConditions": ["Diabetes"],
  "insurancePolicy": { "provider": "AXA", "policyNumber": "POL123", "isActive": true },
  "ndprConsent": true, "dataProcessingConsent": true, "marketingConsent": false,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PATCH /patients/profile
Request: `{firstName?, lastName?, dateOfBirth?, gender?, phoneNumber?, address?, emergencyContacts?, allergies?, chronicConditions?, bloodType?, genotype?}`

---

## 3. Medical Records (6 endpoints)

### GET /patients/medical-history
```json
{
  "records": [
    {
      "id": "uuid", "type": "consultation_note", "title": "Annual Checkup",
      "providerName": "Dr. Smith", "date": "2024-01-15",
      "attachments": [{ "type": "pdf", "url": "https://..." }]
    }
  ],
  "meta": { "pagination": { "total": 50, "page": 1, "perPage": 20, "totalPages": 3 } }
}
```

### POST /medical-records
Request: `{patientId, type, title, description, data: {...}, attachments[]}`
Response: `{id, patientId, type}`

### GET /medical-records/:id
```json
{
  "id": "uuid", "patientId": "uuid", "type": "lab_result",
  "title": "Blood Test", "description": "Complete Blood Count",
  "data": { "hemoglobin": "14.5", "wbc": "7000" },
  "attachments": [], "createdAt": "2024-01-15T10:00:00Z"
}
```

### POST /medical-records/:id/grant-access
Request: `{providerId, expiresAt?}`
Response: `{accessId, expiresAt}`

### GET /medical-records/:id/audit-logs
```json
{
  "logs": [
    { "userName": "Dr. Smith", "action": "VIEW", "timestamp": "2024-01-15T10:30:00Z", "ipAddress": "192.168.1.1" }
  ]
}
```

---

## 4. Doctors (4 endpoints)

### GET /doctors/search
Query: `?specialty=cardiology&location=lagos&minRating=4&maxFee=10000`
```json
{
  "doctors": [
    {
      "id": "uuid", "firstName": "Sarah", "lastName": "Johnson",
      "profilePhoto": "https://...",
      "specialties": ["Cardiology", "Internal Medicine"],
      "consultationFee": 5000, "rating": 4.8, "reviewCount": 150,
      "isAvailable": true, "yearsExperience": 12,
      "location": { "city": "Lagos", "state": "Lagos" },
      "languages": ["English", "Yoruba"], "acceptsInsurance": true
    }
  ],
  "meta": { "pagination": { "total": 25, "page": 1, "perPage": 20 } }
}
```

### GET /doctors/:id
```json
{
  "id": "uuid", "firstName": "Sarah", "lastName": "Johnson",
  "profilePhoto": "https://...", "bio": "Experienced cardiologist...",
  "specialties": ["Cardiology"], "qualifications": [{ "degree": "MBBS", "institution": "UNIBEN", "year": 2005 }],
  "licenseNumber": "MDCN/12345", "mdcn_license_number": "MDCN/12345",
  "mdcn_expiry_date": "2025-12-31",
  "licenseVerificationStatus": "approved", "license_expiry_date": "2025-12-31",
  "providerStatus": "active", "nin": "...", "bvn": "...",
  "consultationFee": 5000, "rating": 4.8, "reviewCount": 150,
  "hasAmbulance": false, "acceptsInsurance": true,
  "languages": ["English", "Yoruba"], "hospitalAffiliation": "Lagos General",
  "availability": [{ "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "isAvailable": true }],
  "ndprConsent": true
}
```

### GET /doctors/:id/availability
Query: `?startDate=2024-02-01&endDate=2024-02-07`
```json
{
  "slots": [
    { "id": "uuid", "date": "2024-02-01", "startTime": "09:00", "endTime": "09:30", "isAvailable": true, "consultationType": "telehealth" },
    { "id": "uuid", "date": "2024-02-01", "startTime": "09:30", "endTime": "10:00", "isAvailable": false, "consultationType": "telehealth" }
  ]
}
```

### GET /doctors/:id/reviews
```json
{
  "reviews": [
    { "id": "uuid", "patientName": "John D.", "rating": 5, "comment": "Great doctor!", "createdAt": "2024-01-10" }
  ],
  "meta": { "pagination": { "total": 150, "page": 1, "perPage": 10 } }
}
```

---

## 5. Consultations (8 endpoints)

### POST /consultations
Request: `{doctorId, slotId, type: "telehealth"|"in_person", reason, symptoms[], useInsurance?, insurancePolicyId?}`
```json
{
  "id": "uuid", "status": "confirmed",
  "fee": 5000, "insuranceCoverage": 3000, "patientResponsibility": 2000,
  "scheduledAt": "2024-02-01T09:00:00Z"
}
```

### GET /consultations
Query: `?status=upcoming&page=1`
```json
{
  "consultations": [
    { "id": "uuid", "doctorName": "Dr. Sarah", "type": "telehealth", "status": "scheduled", "scheduledAt": "2024-02-01T09:00:00Z", "fee": 5000 }
  ],
  "meta": { "pagination": { "total": 10, "page": 1, "perPage": 20 } }
}
```

### GET /consultations/:id
```json
{
  "id": "uuid", "patientId": "uuid", "doctorId": "uuid",
  "doctorName": "Dr. Sarah Johnson", "type": "telehealth",
  "status": "completed", "reason": "Follow-up",
  "symptoms": ["headache", "fatigue"],
  "diagnosis": "Stress-related symptoms",
  "notes": "Patient advised to reduce workload...",
  "prescriptions": [
    { "id": "uuid", "medicationName": "Panadol", "dosage": "500mg", "frequency": "twice daily", "duration": "7 days" }
  ],
  "labOrders": [
    { "id": "uuid", "testName": "Blood Count", "status": "pending" }
  ],
  "fee": 5000, "createdAt": "2024-02-01T09:00:00Z"
}
```

### POST /consultations/:id/cancel
Request: `{reason: "Schedule conflict"}`
Response: `{refundAmount: 4500, cancellationFee: 500}`

### POST /consultations/:id/video-session/start
Response: `{videoUrl: "https://video-call-url...", token: "jwt-token"}`

### POST /consultations/:id/video-session/end
Response: `{duration: 1800}`

### POST /consultations/:id/notes
Request: `{notes: "Patient presented with..."}`
Response: `{id, notes}`

### POST /consultations/:id/prescriptions
Request: `{medicationName, dosage, frequency, duration, instructions}`
Response: `{id}`

---

## 6. Laboratories (8 endpoints)

### GET /labs/search
Query: `?location=lagos&testType=blood`
```json
{
  "labs": [
    { "id": "uuid", "name": "LabCorp Nigeria", "logo": "https://...", "rating": 4.7, "offersHomeCollection": true, "homeCollectionFee": 2000, "location": { "city": "Lagos" } }
  ]
}
```

### GET /labs/:id
```json
{
  "id": "uuid", "name": "LabCorp Nigeria", "logo": "https://...",
  "description": "Leading diagnostic lab in Lagos",
  "address": { "street": "123 Victoria Island", "city": "Lagos", "state": "Lagos" },
  "phoneNumber": "+2348012345678", "email": "info@labcorp.ng",
  "rating": 4.7, "reviewCount": 320, "offersHomeCollection": true, "homeCollectionFee": 2000,
  "averageTurnaroundTime": 24, "testCategories": ["Blood", "Urine", "Imaging"],
  "operatingHours": { "monday": "06:00-20:00", "tuesday": "06:00-20:00" },
  "accreditations": ["ISO 15189", "MLSCN"],
  "mlscn_license_number": "MLSCN/12345", "mlscn_expiry_date": "2025-12-31",
  "cac_number": "RC123456", "providerStatus": "active"
}
```

### GET /labs/:id/tests
```json
{
  "tests": [
    { "id": "uuid", "name": "Complete Blood Count", "code": "CBC001", "category": "Blood", "cost": 5000, "requiresFasting": false, "sampleType": "blood" },
    { "id": "uuid", "name": "Malaria Test", "code": "MAL001", "category": "Blood", "cost": 2000, "requiresFasting": false, "sampleType": "blood" }
  ]
}
```

### POST /lab-orders
Request: `{labId, tests: [{testId, quantity}], collectionType: "home_collection"|"lab_visit", scheduledAt?, collectionAddress?, useInsurance?}`
```json
{
  "id": "uuid", "labName": "LabCorp Nigeria", "tests": [{ "testId": "uuid", "name": "CBC", "cost": 5000 }],
  "totalCost": 5000, "insuranceCoverage": 0, "patientResponsibility": 5000,
  "status": "pending", "collectionType": "home_collection", "scheduledAt": "2024-02-05T10:00:00Z"
}
```

### GET /lab-orders
Query: `?status=pending&page=1`
```json
{
  "orders": [
    { "id": "uuid", "labName": "LabCorp Nigeria", "testCount": 2, "totalCost": 7000, "status": "pending", "scheduledAt": "2024-02-05" }
  ]
}
```

### GET /lab-orders/:id
```json
{
  "id": "uuid", "labId": "uuid", "labName": "LabCorp Nigeria",
  "tests": [{ "testId": "uuid", "name": "CBC", "cost": 5000 }],
  "totalCost": 7000, "status": "sample_collected",
  "collectionType": "home_collection", "collectionAddress": { "city": "Lagos" },
  "sampleCollectedAt": "2024-02-05T10:30:00Z",
  "results": [{ "id": "uuid", "testName": "CBC", "resultUrl": "https://..." }]
}
```

### PATCH /lab-orders/:id/schedule-collection
Request: `{scheduledAt: "2024-02-10T10:00:00Z", collectionAddress: {...}}`
Response: `{scheduledAt, collectionAddress}`

### GET /lab-orders/:id/results
```json
{
  "results": [
    {
      "testName": "Complete Blood Count",
      "resultData": {
        "parameters": [
          { "name": "Hemoglobin", "value": "14.5", "unit": "g/dL", "normalRange": "12.0-17.5", "status": "normal" },
          { "name": "WBC", "value": "7500", "unit": "/uL", "normalRange": "4000-11000", "status": "normal" }
        ]
      },
      "resultUrl": "https://...", "completedAt": "2024-02-06T14:00:00Z"
    }
  ]
}
```

---

## 7. Pharmacies (7 endpoints)

### GET /pharmacies/search
Query: `?location=lagos&medication=paracetamol`
```json
{
  "pharmacies": [
    { "id": "uuid", "name": "HealthPlus Pharmacy", "logo": "https://...", "rating": 4.6, "offersDelivery": true, "deliveryFee": 1000, "distance": 2.5, "location": { "city": "Lagos" } }
  ]
}
```

### GET /pharmacies/:id
```json
{
  "id": "uuid", "name": "HealthPlus Pharmacy", "logo": "https://...",
  "description": "Trusted pharmacy in Lagos",
  "address": { "street": "45 Ajose Adeogun", "city": "Victoria Island", "state": "Lagos" },
  "phoneNumber": "+2348012345678", "email": "info@healthplus.ng",
  "rating": 4.6, "reviewCount": 280,
  "offersDelivery": true, "deliveryFee": 1000, "deliveryRadius": 10, "averageDeliveryTime": 60,
  "hasColdChain": true, "minimumOrderValue": 1000,
  "operatingHours": { "monday": "08:00-22:00" },
  "licenseNumber": "PCN/12345", "pcn_license_number": "PCN/12345", "pcn_expiry_date": "2025-12-31",
  "cac_number": "RC123456", "providerStatus": "active"
}
```

### POST /pharmacies/:id/check-availability
Request: `{medications: [{name: "Panadol Extra", dosage: "500mg", quantity: 2}]}`
```json
{
  "medications": [
    { "name": "Panadol Extra", "requestedQuantity": 2, "inStock": true, "availableQuantity": 100, "unitPrice": 500, "totalPrice": 1000 }
  ],
  "totalCost": 1000
}
```

### POST /pharmacy-orders
Request: `{pharmacyId, prescriptionId?, medications: [{medicationId, quantity, price}], deliveryType: "pickup"|"delivery", deliveryAddress?, useInsurance?}`
```json
{
  "id": "uuid", "status": "confirmed", "totalCost": 1500, "deliveryFee": 1000, "insuranceCoverage": 0, "patientResponsibility": 2500,
  "estimatedDeliveryTime": "2024-02-05T14:00:00Z"
}
```

### GET /pharmacy-orders
Query: `?status=active`
```json
{
  "orders": [
    { "id": "uuid", "pharmacyName": "HealthPlus", "itemsCount": 3, "totalCost": 2500, "status": "preparing", "createdAt": "2024-02-04T10:00:00Z" }
  ]
}
```

### GET /pharmacy-orders/:id
```json
{
  "id": "uuid", "pharmacyId": "uuid", "pharmacyName": "HealthPlus",
  "medications": [{ "name": "Panadol", "quantity": 2, "price": 1000 }],
  "totalCost": 2500, "deliveryFee": 1000,
  "status": "in_transit",
  "statusHistory": [
    { "status": "confirmed", "timestamp": "2024-02-04T10:00:00Z" },
    { "status": "preparing", "timestamp": "2024-02-04T10:30:00Z" },
    { "status": "in_transit", "timestamp": "2024-02-04T12:00:00Z" }
  ],
  "trackingInfo": { "currentLocation": { "lat": 6.5244, "lng": 3.3792 }, "estimatedArrival": "2024-02-04T14:00:00Z" }
}
```

### GET /pharmacy-orders/:id/track
```json
{
  "status": "in_transit",
  "currentLocation": { "lat": 6.5244, "lng": 3.3792, "address": "Ozumba Mbadiwe, Victoria Island" },
  "deliveryPersonName": "John Delivery", "deliveryPersonPhone": "+2348012345678",
  "estimatedArrival": "2024-02-04T14:00:00Z"
}
```

---

## 8. Wallet (7 endpoints)

### GET /wallet
```json
{ "id": "uuid", "balance": 50000, "currency": "NGN", "isActive": true }
```

### POST /wallet/fund
Request: `{amount: 10000, paymentMethod: "card"|"bank_transfer"|"mobile_money"}`
```json
{ "paymentUrl": "https://payment-gateway-url...", "reference": "WB-123456", "expiresAt": "2024-02-04T12:00:00Z" }
```

### GET /wallet/transactions
Query: `?type=credit&page=1`
```json
{
  "transactions": [
    { "id": "uuid", "type": "credit", "amount": 10000, "balanceAfter": 50000, "status": "completed", "description": "Wallet Top-up", "reference": "TXN-001", "createdAt": "2024-02-01T10:00:00Z" },
    { "id": "uuid", "type": "debit", "amount": 5000, "balanceAfter": 45000, "status": "completed", "description": "Consultation with Dr. Sarah", "reference": "TXN-002", "createdAt": "2024-02-02T14:00:00Z" }
  ],
  "meta": { "pagination": { "total": 50, "page": 1, "perPage": 20 } }
}
```

### GET /wallet/transactions/:id
```json
{ "id": "uuid", "type": "debit", "amount": 5000, "balanceAfter": 45000, "status": "completed", "description": "Consultation", "reference": "TXN-002", "metadata": { "serviceType": "consultation", "serviceId": "uuid" }, "createdAt": "2024-02-02T14:00:00Z" }
```

### GET /wallet/payment-methods
```json
[
  { "id": "uuid", "type": "card", "isDefault": true, "details": { "last4": "1234", "brand": "Visa", "expiryMonth": 12, "expiryYear": 2025 } }
]
```

### POST /wallet/payment-methods
Request: `{type: "card", cardNumber: "4111111111111111", expiryMonth: 12, expiryYear: 2025, cvv: "123"}`
OR: `{type: "bank_account", accountNumber: "1234567890", bankCode: "044"}`

### DELETE /wallet/payment-methods/:id
Response: `200 OK`

---

## 9. Insurance (7 endpoints)

### POST /insurance/policies
Request: `{providerId, policyNumber: "POL123", coverageType: "premium", expiresAt: "2025-12-31"}`
```json
{
  "id": "uuid", "providerId": "uuid", "providerName": "AXA Mansard",
  "policyNumber": "POL123", "coverageType": "premium",
  "coverageLimit": 500000, "deductible": 10000, "copayment": 0.1,
  "isActive": true, "expiresAt": "2025-12-31"
}
```

### GET /insurance/policies
```json
{
  "policies": [
    { "id": "uuid", "providerName": "AXA Mansard", "policyNumber": "POL123", "coverageType": "premium", "isActive": true, "expiresAt": "2025-12-31" }
  ]
}
```

### GET /insurance/policies/:id
```json
{
  "id": "uuid", "providerId": "uuid", "providerName": "AXA Mansard",
  "policyNumber": "POL123", "coverageType": "premium",
  "coverageLimit": 500000, "deductible": 10000, "copayment": 0.1,
  "isActive": true, "expiresAt": "2025-12-31",
  "benefits": [{ "service": "consultation", "covered": true, "limit": 50000 }]
}
```

### POST /insurance/verify-coverage
Request: `{policyId, serviceType: "consultation", serviceAmount: 5000}`
```json
{ "isEligible": true, "isCovered": true, "coverageAmount": 4500, "patientResponsibility": 500, "copayAmount": 500 }
```

### POST /insurance/claims
Request: `{policyId, serviceType: "consultation", serviceId: "uuid", amount: 5000}`
```json
{ "id": "uuid", "claimNumber": "CLM-001", "status": "submitted", "submittedAt": "2024-02-01T10:00:00Z" }
```

### GET /insurance/claims
```json
{
  "claims": [
    { "id": "uuid", "claimNumber": "CLM-001", "serviceType": "consultation", "amount": 5000, "status": "approved", "approvedAmount": 4500, "submittedAt": "2024-02-01T10:00:00Z" }
  ]
}
```

### GET /insurance/claims/:id
```json
{
  "id": "uuid", "claimNumber": "CLM-001", "policyId": "uuid",
  "serviceType": "consultation", "amount": 5000, "status": "approved",
  "approvedAmount": 4500, "denialReason": null,
  "submittedAt": "2024-02-01T10:00:00Z", "processedAt": "2024-02-05T14:00:00Z"
}
```

---

## 10. Emergency (6 endpoints)

### POST /emergency/requests
Request: `{type: "ambulance"|"urgent_care", description: "Chest pain", location: {latitude: 6.5244, longitude: 3.3792}, severity: "critical"|"high"|"moderate"}`
```json
{
  "id": "uuid", "status": "dispatched", "type": "ambulance",
  "estimatedArrivalTime": "2024-02-01T10:15:00Z",
  "assignedProvider": { "id": "uuid", "name": "Lagos Ambulance Service", "phoneNumber": "+2348012345678" }
}
```

### GET /emergency/requests/:id
```json
{
  "id": "uuid", "patientId": "uuid", "type": "ambulance",
  "status": "en_route", "severity": "critical",
  "description": "Chest pain",
  "location": { "latitude": 6.5244, "longitude": 3.3792, "address": "Victoria Island" },
  "assignedProvider": { "id": "uuid", "name": "Lagos Ambulance" },
  "dispatchedAt": "2024-02-01T10:00:00Z", "estimatedArrivalTime": "2024-02-01T10:15:00Z"
}
```

### GET /emergency/requests/:id/track
```json
{
  "status": "en_route",
  "vehicleLocation": { "latitude": 6.5124, "longitude": 3.3892 },
  "patientLocation": { "latitude": 6.5244, "longitude": 3.3792 },
  "estimatedArrivalTime": "2024-02-01T10:15:00Z",
  "providerPhone": "+2348012345678"
}
```

### GET /emergency/requests
Query: `?status=active`
```json
{
  "requests": [
    { "id": "uuid", "type": "ambulance", "status": "en_route", "severity": "critical", "createdAt": "2024-02-01T10:00:00Z" }
  ]
}
```

### GET /emergency/providers/nearest
Query: `?latitude=6.5244&longitude=3.3792&type=ambulance`
```json
[
  { "id": "uuid", "name": "Lagos Ambulance Service", "type": "ambulance", "distance": 2.5, "averageResponseTime": 15, "isAvailable": true }
]
```

### POST /emergency/requests/:id/cancel
Request: `{reason: "Situation resolved"}`
Response: `{status: "cancelled"}`

---

## 11. Notifications (7 endpoints)

### GET /notifications
Query: `?isRead=false&type=appointment`
```json
{
  "notifications": [
    { "id": "uuid", "type": "appointment_reminder", "title": "Appointment Tomorrow", "message": "Your appointment with Dr. Sarah is tomorrow at 9am", "priority": "high", "isRead": false, "data": { "resourceId": "uuid" }, "createdAt": "2024-02-01T10:00:00Z" }
  ],
  "meta": { "pagination": { "total": 25, "page": 1, "perPage": 20 }, "unreadCount": 5 }
}
```

### PATCH /notifications/:id/read
Response: `{isRead: true, readAt: "2024-02-01T10:30:00Z"}`

### PATCH /notifications/read-all
Response: `{updatedCount: 5}`

### DELETE /notifications/:id
Response: `200 OK`

### GET /notifications/preferences
```json
{
  "email": { "enabled": true, "appointmentReminders": true, "labResults": true, "marketing": false },
  "push": { "enabled": true, "emergencyAlerts": true, "orderUpdates": true },
  "sms": { "enabled": false }
}
```

### POST /notifications/preferences
Request: `{email: {...}, push: {...}, sms: {...}}`

### POST /notifications/messages
Request: `{recipientId: "uuid", subject: "Follow-up", message: "Your test results are ready", priority: "normal"}`
Response: `{id: "uuid", sentAt: "2024-02-01T10:00:00Z"}`

---

## 12. WellPoints (6 endpoints)

### GET /wellpoints/balance
```json
{ "balance": 2500, "tier": "gold", "lifetimeEarned": 5000, "lifetimeRedeemed": 2500, "expiringPoints": 500, "expiryDate": "2024-03-01" }
```

### GET /wellpoints/transactions
```json
{
  "transactions": [
    { "id": "uuid", "type": "earn", "points": 100, "description": "Attended appointment", "createdAt": "2024-02-01T10:00:00Z" },
    { "id": "uuid", "type": "redeem", "points": 500, "description": "Redeemed for discount", "createdAt": "2024-01-15T10:00:00Z" }
  ],
  "meta": { "pagination": { "total": 30, "page": 1 } }
}
```

### GET /wellpoints/earning-rules
```json
{
  "rules": [
    { "activity": "consultation_attended", "points": 100, "description": "Earn points for attending consultations" },
    { "activity": "lab_test_completed", "points": 50, "description": "Complete lab tests" },
    { "activity": "medication_adherence", "points": 10, "description": "Log medication daily" }
  ],
  "milestones": [
    { "points": 1000, "tier": "silver", "bonus": 100 },
    { "points": 2500, "tier": "gold", "bonus": 500 }
  ]
}
```

### GET /wellpoints/marketplace
```json
{
  "rewards": [
    { "id": "uuid", "name": "₦500 Discount", "pointsCost": 500, "discountType": "fixed", "value": 500, "stock": 100, "expiresAt": "2024-12-31" },
    { "id": "uuid", "name": "10% Off Next Consultation", "pointsCost": 300, "discountType": "percentage", "value": 10, "stock": 50 }
  ]
}
```

### POST /wellpoints/redeem
Request: `{rewardId: "uuid"}`
Response: `{voucherCode": "WP-ABC123", "voucherValue": 500, "expiresAt": "2024-03-31"}`

### GET /wellpoints/redeemed
```json
{
  "rewards": [
    { "id": "uuid", "name": "₦500 Discount", "voucherCode": "WP-ABC123", "redeemedAt": "2024-01-15T10:00:00Z", "expiresAt": "2024-02-15", "used": false }
  ]
}
```

---

## 13. Admin (11 endpoints)

### GET /admin/dashboard
```json
{
  "users": { "total": 5000, "new": 150, "active": 3500 },
  "consultations": { "today": 50, "revenue": 250000 },
  "wallet": { "transactionVolume": 5000000, "todayVolume": 500000 },
  "providers": { "pendingVerification": 25, "active": 200 }
}
```

### GET /admin/users
Query: `?role=doctor&status=active&search=smith&page=1`
```json
{
  "users": [
    { "id": "uuid", "email": "drsmith@email.com", "role": "doctor", "status": "active", "isKycVerified": true, "createdAt": "2024-01-01" }
  ],
  "meta": { "pagination": { "total": 50, "page": 1 } }
}
```

### GET /admin/users/:id
```json
{
  "id": "uuid", "email": "drsmith@email.com", "role": "doctor", "status": "active",
  "kycLevel": 4, "isKycVerified": true, "providerStatus": "active",
  "profile": { "firstName": "John", "lastName": "Smith", "specialty": "Cardiology" },
  "createdAt": "2024-01-01T00:00:00Z", "lastLoginAt": "2024-02-01T10:00:00Z"
}
```

### POST /admin/users/:id/suspend
Request: `{reason: "Policy violation"}`
Response: `{status: "suspended"}`

### POST /admin/users/:id/reactivate
Response: `{status: "active"}`

### GET /admin/provider-verifications
Query: `?status=pending&type=doctor`
```json
{
  "requests": [
    { "id": "uuid", "providerName": "Dr. Sarah Johnson", "type": "doctor", "submittedAt": "2024-02-01", "status": "pending", "riskScore": "low" }
  ]
}
```

### POST /admin/provider-verifications/:id/review
Request: `{action: "approve"|"reject", rejectionReason?, comments?}`

### GET /admin/audit-logs
Query: `?userId=uuid&action=LOGIN&page=1`
```json
{
  "logs": [
    { "id": "uuid", "userId": "uuid", "userEmail": "admin@wellbank.com", "action": "USER_SUSPEND", "entity": "user", "entityId": "uuid", "timestamp": "2024-02-01T10:00:00Z", "ipAddress": "192.168.1.1" }
  ],
  "meta": { "pagination": { "total": 1000, "page": 1 } }
}
```

### GET /admin/settings
```json
{
  "fees": { "platformFee": 0.1, "consultationFee": 500, "minimumWithdrawal": 1000 },
  "wellpoints": { "referralPoints": 500, "signUpPoints": 100 },
  "cancellation": { "freeUntilHours": 2, "feePercentage": 0.1 },
  "limits": { "maxWalletBalance": 1000000, "maxTransaction": 500000 }
}
```

### POST /admin/settings
Request: `{fees: {...}, wellpoints: {...}, cancellation: {...}}`

### POST /admin/reports/compliance
Request: `{reportType: "data_access"|"security_audit", format: "pdf"|"csv", startDate, endDate}`
Response: `{reportUrl: "https://...", "expiresAt: "2024-02-07"}`

---

## Error Response Format

```json
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [
    { "code": "VALIDATION_ERROR", "field": "email", "message": "Invalid email format" }
  ]
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Invalid or missing token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INSUFFICIENT_BALANCE` - Wallet low on funds
- `SLOT_UNAVAILABLE` - Booking slot taken
- `LICENSE_EXPIRED` - Provider license expired
