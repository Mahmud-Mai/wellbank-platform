/**
 * Shared enums for WellBank platform
 */

export enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor",
  LABORATORY = "laboratory",
  PHARMACY = "pharmacy",
  INSURANCE_PROVIDER = "insurance_provider",
  EMERGENCY_PROVIDER = "emergency_provider",
  WELLBANK_ADMIN = "wellbank_admin",
  PROVIDER_ADMIN = "provider_admin"
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

export enum IdentificationType {
  NIN = "NIN",
  BVN = "BVN"
}

export enum VerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired"
}

export enum ConsultationType {
  TELEHEALTH = "telehealth",
  IN_PERSON = "in_person"
}

export enum ConsultationStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show"
}

export enum RecordType {
  CONSULTATION_NOTE = "consultation_note",
  LAB_RESULT = "lab_result",
  PRESCRIPTION = "prescription",
  IMAGING = "imaging",
  VACCINATION = "vaccination",
  ALLERGY = "allergy",
  CHRONIC_CONDITION = "chronic_condition"
}

export enum LabOrderStatus {
  PENDING = "pending",
  SAMPLE_COLLECTED = "sample_collected",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum CollectionType {
  HOME_COLLECTION = "home_collection",
  LAB_VISIT = "lab_visit"
}

export enum MedicationForm {
  TABLET = "tablet",
  CAPSULE = "capsule",
  SYRUP = "syrup",
  INJECTION = "injection",
  CREAM = "cream",
  DROPS = "drops",
  INHALER = "inhaler"
}

export enum DeliveryType {
  PICKUP = "pickup",
  USER_ARRANGED_DELIVERY = "user_arranged_delivery"
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY_FOR_PICKUP = "ready_for_pickup",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  CANCELLED = "cancelled"
}

export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
  PAYMENT = "payment",
  REFUND = "refund",
  INSURANCE_REIMBURSEMENT = "insurance_reimbursement"
}

export enum TransactionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REVERSED = "reversed"
}

export enum CoverageType {
  BASIC = "basic",
  STANDARD = "standard",
  PREMIUM = "premium",
  FAMILY = "family"
}

export enum ClaimStatus {
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  PARTIALLY_APPROVED = "partially_approved",
  DENIED = "denied",
  PAID = "paid"
}

export enum EmergencyType {
  MEDICAL = "medical",
  ACCIDENT = "accident",
  CARDIAC = "cardiac",
  RESPIRATORY = "respiratory",
  TRAUMA = "trauma",
  OTHER = "other"
}

export enum EmergencyStatus {
  REQUESTED = "requested",
  DISPATCHED = "dispatched",
  EN_ROUTE = "en_route",
  ARRIVED = "arrived",
  TRANSPORTING = "transporting",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum ProviderType {
  DOCTOR = "doctor",
  PHARMACY = "pharmacy",
  LABORATORY = "laboratory",
  HOSPITAL = "hospital",
  AMBULANCE = "ambulance"
}

export enum OnboardingStepType {
  BASIC_INFO = "basic_info",
  IDENTITY_VERIFICATION = "identity_verification",
  LICENSE_VERIFICATION = "license_verification",
  DOCUMENT_UPLOAD = "document_upload",
  ADMIN_REVIEW = "admin_review",
  PROFILE_SETUP = "profile_setup"
}

export enum StepStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed"
}

export enum JobType {
  PAYMENT_RECONCILIATION = "payment_reconciliation",
  MEDICAL_RECORD_ENCRYPTION = "medical_record_encryption",
  EMAIL_NOTIFICATION = "email_notification",
  PROVIDER_VERIFICATION = "provider_verification",
  AUDIT_LOG_PROCESSING = "audit_log_processing"
}

export enum JobStatus {
  WAITING = "waiting",
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
  DELAYED = "delayed"
}

export enum NotificationType {
  APPOINTMENT_REMINDER = "appointment_reminder",
  TEST_RESULT_READY = "test_result_ready",
  PRESCRIPTION_READY = "prescription_ready",
  PAYMENT_CONFIRMATION = "payment_confirmation",
  EMERGENCY_ALERT = "emergency_alert",
  SYSTEM_NOTIFICATION = "system_notification"
}

export enum NotificationChannel {
  PUSH = "push",
  EMAIL = "email",
  SMS = "sms",
  IN_APP = "in_app"
}
