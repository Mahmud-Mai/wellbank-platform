# WellBank Lean API Spec (v1)

Base URL: `http://localhost:35432/api/v1`
Auth: Bearer Token in Authorization header.

## 1. Authentication

- POST /auth/register: { email, password, role[patient|doctor|lab|pharmacy|admin], firstName, lastName, phoneNumber, identificationType[NIN|BVN], identificationNumber } -> 201 { userId, email, role }
- POST /auth/login: { email, password, mfaCode? } -> 200 { accessToken, refreshToken, user: {id, email, role, isKycVerified} }
- POST /auth/mfa/enable: 200 { qrCode, secret, backupCodes }
- POST /auth/mfa/verify: { code } -> 200 OK

## 2. Patient Profile

- GET /patients/profile: 200 { id, firstName, lastName, gender, isKycVerified, address, emergencyContacts: [{name, relationship, phone}], allergies[], chronicConditions[], bloodType }
- PATCH /patients/profile: { firstName?, lastName?, address?, allergies[], chronicConditions[] } -> 200 OK
- GET /patients/medical-history: ?page&limit&type -> 200 { records: [{id, type[consultation|lab_result|prescription], title, providerName, date, attachments[]}] }

## 3. Medical Records

- POST /medical-records: { patientId, type, title, description, data(encrypted), attachments[] } -> 201 { id, patientId, type }
- GET /medical-records/:id: 200 { id, title, description, data(decrypted), attachments[], createdAt }
- POST /medical-records/:id/grant-access: { providerId, expiresAt? } -> 200 OK
- GET /medical-records/:id/audit-logs: 200 { logs: [{userName, action, timestamp, ipAddress}] }

## 4. Doctor Discovery

- GET /doctors/search: ?specialty&location&availability&minRating&maxFee -> 200 { doctors: [{id, firstName, lastName, profilePhoto, specialties[], consultationFee, rating, isAvailable}] }
- GET /doctors/:id: 200 { id, bio, qualifications[], licenseNumber, licenseStatus[pending|approved], languages[], acceptsInsurance }
- GET /doctors/:id/availability: ?startDate&endDate -> 200 { slots: [{id, date, startTime, endTime, isAvailable, consultationType[telehealth|in_person]}] }

## 5. Consultations

- POST /consultations: { doctorId, slotId, type[telehealth|in_person], reason, symptoms[], useInsurance, insurancePolicyId? } -> 201 { id, status[scheduled|confirmed], fee, insuranceCoverage, patientResponsibility }
- ERR 402: { required, available } (Insufficient wallet balance)
- GET /consultations/:id: 200 { id, status, doctorName, diagnosis, notes, prescriptions: [{medicationName, dosage, frequency}], labOrders: [{testName, status}] }
- POST /consultations/:id/cancel: { reason } -> 200 { refundAmount, cancellationFee }
- POST /consultations/:id/video-session/start: 200 { videoUrl, token }

## 6. Laboratory

- GET /labs/search: ?location&testType -> 200 { labs: [{id, name, location, offersHomeCollection}] }
- GET /labs/:id/tests: 200 { tests: [{id, name, category, cost, requiresFasting, sampleType}] }
- POST /lab-orders: { labId, tests[], collectionType[home_collection|lab_visit], scheduledAt, collectionAddress?, useInsurance } -> 201 { id, totalCost, insuranceCoverage, status }

## 6. Laboratory (Continued)

- GET /lab-orders: ?status&page -> 200 { orders: [{id, labName, testCount, status, totalCost}] }
- GET /lab-orders/:id: 200 { tests[], collectionAddress, status, results: [{testName, resultUrl}] }
- PATCH /lab-orders/:id/schedule-collection: { scheduledAt, collectionAddress } -> 200 OK
- GET /lab-orders/:id/results: 200 { results: [{testName, resultData: {parameters: [{name, value, unit, status[normal|abnormal|critical]}]}, resultUrl}] }

## 7. Pharmacy

- GET /pharmacies/search: ?location&medication -> 200 { pharmacies: [{id, name, location, rating, offersDelivery}] }
- POST /pharmacies/:id/check-availability: { medications: [{name, dosage, quantity}] } -> 200 { medications: [{inStock, unitPrice, totalPrice}], totalCost }
- POST /pharmacy-orders: { pharmacyId, prescriptionId, medications[], deliveryType[pickup|delivery], deliveryAddress, useInsurance } -> 201 { id, status, totalCost, deliveryFee, insuranceCoverage, patientResponsibility }
- GET /pharmacy-orders/:id: 200 { medications[], statusHistory[], trackingInfo: {currentLocation, estimatedArrival} }
- GET /pharmacy-orders/:id/track: 200 { status, currentLocation: {lat, lng, address}, deliveryPersonName }

## 8. Wallet (BudPay Integration)

- GET /wallet: 200 { balance, currency, isActive }
- POST /wallet/fund: { amount, paymentMethod[card|bank_transfer|mobile_money] } -> 200 { paymentUrl, reference, expiresAt }
- GET /wallet/transactions: ?type[credit|debit] -> 200 { transactions: [{id, type, amount, balanceAfter, status, metadata: {serviceType, serviceId}}] }
- GET /wallet/payment-methods: 200 [{ id, type[card|bank_account], isDefault, details: {last4, brand} }]
- POST /wallet/payment-methods: { type, cardNumber, expiryMonth, expiryYear, cvv | accountNumber, bankCode } -> 201 OK

## 9. Insurance

- POST /insurance/policies: { providerId, policyNumber, coverageType[basic|standard|premium], expiresAt } -> 201 { id, coverageLimit, copayment, isActive }
- POST /insurance/verify-coverage: { policyId, serviceType, serviceAmount } -> 200 { isEligible, isCovered, coverageAmount, patientResponsibility }
- POST /insurance/claims: { policyId, serviceType, serviceId, amount } -> 201 { id, claimNumber, status[submitted|under_review|approved|denied|paid] }

## 10. Emergency

- POST /emergency/requests: { type[ambulance|urgent_care], description, location: {lat, lng}, severity[critical|high|moderate] } -> 201 { id, status, estimatedArrivalTime }
- GET /emergency/requests/:id/track: 200 { vehicleLocation: {lat, lng}, patientLocation, estimatedArrivalTime, providerPhone }
- GET /emergency/providers/nearest: ?latitude&longitude&type -> 200 [{ id, name, type, distance, averageResponseTime }]

## 11. Notifications & Messaging

- GET /notifications: ?isRead&type -> 200 { notifications: [{id, type, title, message, priority, isRead, data: {resourceId}}] }
- PATCH /notifications/read-all: 200 { updatedCount }
- GET /notifications/preferences: 200 { email: {enabled, marketing}, push: {enabled, emergency}, sms: {enabled} }
- POST /notifications/messages: { recipientId, subject, message, priority } -> 201 { id, sentAt }

## 12. WellPoints (Loyalty)

- GET /wellpoints/balance: 200 { balance, tier[bronze|silver|gold|platinum], expiringPoints }
- GET /wellpoints/earning-rules: 200 { rules: [{activity, points}], milestones[] }
- GET /wellpoints/marketplace: 200 { rewards: [{id, name, pointsCost, discountType, stock}] }
- POST /wellpoints/redeem: { rewardId } -> 200 { voucherCode, expiresAt }

## 13. Admin

- GET /admin/dashboard: 200 { users: {total, new}, consultations: {revenue}, wallet: {transactionVolume} }
- GET /admin/users: ?role&status&search -> 200 { users: [{id, email, role, status, isKycVerified}] }
- POST /admin/provider-verifications/:id/review: { action[approve|reject], rejectionReason? } -> 200 OK
- GET /admin/settings: 200 { fees: {platformFee}, wellpoints: {referralPoints}, cancellation: {hours} }
- POST /admin/reports/compliance: { reportType[data_access|security_audit], format[pdf|csv] } -> 200 { reportUrl }

## Appendix: Global References

- Enums: Role[patient, doctor, lab, pharmacy, emergency, admin, insurance]; Status[pending, confirmed, processing, completed, cancelled, failed].
- Errors: All errors follow { status: "fail", error: "CODE", message: "..." }.
- Webhook: BudPay events sent to `POST /webhooks/budpay`.
