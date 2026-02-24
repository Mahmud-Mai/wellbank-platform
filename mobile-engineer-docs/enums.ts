/**
 * Shared enums for WellBank platform
 */

/**
 * User roles on the platform.
 * 
 * DESIGN DECISION (Deviation from PRD):
 * - PRD specifies: patient, doctor, lab, pharmacy, insurance, emergency, admin
 * - We simplified to 3 roles + wellbank_admin (seeded)
 * 
 * @see OrganizationType for organization types (hospital, lab, pharmacy, insurance, emergency, logistics)
 * @see OrganizationMemberRole for roles within organizations
 */
export enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor",
  PROVIDER_ADMIN = "provider_admin",  // Creates organizations (hospital/lab/pharmacy/etc)
  WELLBANK_ADMIN = "wellbank_admin"  // Platform admin (seeded, created by super admin)
}

export enum KycLevel {
  LEVEL_0 = 0, // Unverified
  LEVEL_1 = 1, // Email/Phone verified
  LEVEL_2 = 2, // Basic ID verified
  LEVEL_3 = 3, // Full identity verified (NIN/BVN)
  LEVEL_4 = 4  // Full compliance verified
}

export enum ProviderStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  DEACTIVATED = "deactivated"
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

export enum DocumentVerificationStatus {
  UNVERIFIED = "unverified",
  PENDING = "pending",
  VERIFIED = "verified",
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

/**
 * Organization types - created by provider_admin users
 * 
 * DESIGN DECISION (Deviation from PRD):
 * - PRD specifies users register directly as: lab, pharmacy, hospital
 * - We model these as ORGANIZATIONS created by provider_admin users
 * 
 * All are businesses (not individual people):
 * - hospital, laboratory, pharmacy, clinic = healthcare facilities
 * - insurance, emergency, logistics = service providers
 */
export enum OrganizationType {
  HOSPITAL = "hospital",
  LABORATORY = "laboratory",
  PHARMACY = "pharmacy",
  CLINIC = "clinic",
  INSURANCE = "insurance",
  EMERGENCY = "emergency",
  LOGISTICS = "logistics"
}

/**
 * Roles a user can have within an organization
 * 
 * These are SCOPED to the organization, not global user roles.
 * A user can be "doctor" at Hospital A and "pharmacist" at Pharmacy B.
 * 
 * DESIGN DECISION:
 * - Predefined roles for MVP (simpler than custom RBAC)
 * - Organization creator (provider_admin) automatically becomes org admin
 */
export enum OrganizationMemberRole {
  ADMIN = "admin",           // Can manage organization, invite members
  DOCTOR = "doctor",         // Healthcare provider
  PHARMACIST = "pharmacist", // Pharmacy staff
  LAB_TECH = "lab_tech",     // Lab staff
  NURSE = "nurse",          // Nursing staff
  RECEPTIONIST = "receptionist", // Front desk
  STAFF = "staff"           // General staff
}

export enum OnboardingStepType {
  BASIC_INFO = "basic_info",
  PROFESSIONAL_INFO = "professional_info",
  IDENTITY_VERIFICATION = "identity_verification",
  REGULATORY_VERIFICATION = "regulatory_verification",
  BANKING_SETUP = "banking_setup",
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

export enum DocumentType {
  // Identity Documents
  NATIONAL_ID = "national_id",
  VOTER_CARD = "voter_card",
  DRIVERS_LICENSE = "drivers_license",
  INTERNATIONAL_PASSPORT = "international_passport",
  BVN = "bvn",
  NIN = "nin",

  // Doctor Documents
  MBBS_CERTIFICATE = "mbbs_certificate",
  MDCN_LICENSE = "mdcn_license",
  PRACTICING_LICENSE = "practing_license",
  NYSC_CERTIFICATE = "nysc_certificate",
  MEDICAL_INDEMNITY_INSURANCE = "medical_indemnity_insurance",

  // Laboratory Documents
  MLSCN_LICENSE = "mlscn_license",
  LAB_PRACTICE_LICENSE = "lab_practice_license",
  ISO_CERTIFICATION = "iso_certification",

  // Pharmacy Documents
  PCN_LICENSE = "pcn_license",
  PREMISES_LICENSE = "premises_license",
  SUPERINTENDENT_LICENSE = "superintendent_license",

  // Insurance Documents
  NAICOM_LICENSE = "naicom_license",
  HMO_LICENSE = "hmo_license",

  // Hospital Documents
  STATE_HEALTH_LICENSE = "state_health_license",
  HOSPITAL_OPERATING_LICENSE = "hospital_operating_license",
  ENVIRONMENTAL_PERMIT = "environmental_permit",
  MEDICAL_DIRECTOR_LICENSE = "medical_director_license",
  NHIA_ACCREDITATION = "nhia_accreditation",

  // Ambulance Documents
  STATE_MINISTRY_APPROVAL = "state_ministry_approval",
  AMBULANCE_SERVICE_LICENSE = "ambulance_service_license",
  VEHICLE_REGISTRATION = "vehicle_registration",
  ROAD_WORTHINESS = "road_worthiness",
  DRIVER_MEDICAL_FITNESS = "driver_medical_fitness",
  PARAMEDIC_CERTIFICATION = "paramedic_certification",

  // Logistics Documents
  COMPANY_INSURANCE = "company_insurance",
  DRIVER_LICENSE = "driver_license",
  POLICE_CLEARANCE = "police_clearance",
  LASDRI_PERMIT = "lasdri_permit",
  DELIVERY_BOX_HYGIENE = "delivery_box_hygiene",

  // Business Documents
  CAC_CERTIFICATE = "cac_certificate",
  TAX_CLEARANCE = "tax_clearance",
  TIN = "tin",

  // Insurance Card
  INSURANCE_CARD = "insurance_card",

  // Patient Documents
  SELFIE_PHOTO = "selfie_photo",
  ID_PHOTO_FRONT = "id_photo_front",
  ID_PHOTO_BACK = "id_photo_back"
}

export enum AmbulanceType {
  BLS = "basic_life_support",
  ALS = "advanced_life_support"
}

export enum SettlementFrequency {
  DAILY = "daily",
  WEEKLY = "weekly"
}

export enum BankAccountVerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  FAILED = "failed"
}

export enum InsuranceProviderType {
  HMO = "hmo",
  HEALTH_INSURANCE = "health_insurance"
}

export enum OrganizationOwnershipType {
  PRIVATE = "private",
  PUBLIC = "public",
  FAITH_BASED = "faith_based",
  NGO = "ngo"
}

export enum FacilityType {
  PRIMARY_CARE_CLINIC = "primary_care_clinic",
  SECONDARY_HOSPITAL = "secondary_hospital",
  TERTIARY_HOSPITAL = "tertiary_hospital",
  SPECIALIST_HOSPITAL = "specialist_hospital"
}
