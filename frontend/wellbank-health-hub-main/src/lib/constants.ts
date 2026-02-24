export const COUNTRIES = {
  Nigeria: {
    code: "NG" as const,
    currency: "NGN",
    currencySymbol: "₦",
    locale: "en-NG",
    phonePrefix: "+234",
  },
  Kenya: {
    code: "KE" as const,
    currency: "KES",
    currencySymbol: "KSh",
    locale: "en-KE",
    phonePrefix: "+254",
  },
  Ghana: {
    code: "GH" as const,
    currency: "GHS",
    currencySymbol: "₵",
    locale: "en-GH",
    phonePrefix: "+233",
  },
} as const;

export type CountryCode = "NG" | "KE" | "GH";

export const REGIONS: Record<CountryCode, string[]> = {
  NG: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Benin City", "Enugu", "Calabar"],
  KE: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  GH: ["Accra", "Kumasi", "Takoradi", "Cape Coast", "Tema"],
};

export const formatCurrency = (
  amount: number,
  countryCode: CountryCode = "NG"
) => {
  const country = Object.values(COUNTRIES).find((c) => c.code === countryCode);
  if (!country) return `₦${amount.toLocaleString()}`;
  return new Intl.NumberFormat(country.locale, {
    style: "currency",
    currency: country.currency,
  }).format(amount);
};

export const formatDate = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const SPECIALTIES = [
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Gynecology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Urology",
];

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export const GENOTYPES = ["AA", "AS", "AC", "SS", "SC", "CC"] as const;
export const GENDERS = ["male", "female", "other"] as const;

export const API_BASE = "http://localhost:35432/api/v1";

// ─── Nigerian States & LGAs ───
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

export const STATE_LGAS: Record<string, string[]> = {
  Lagos: ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
  Abuja: ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
  FCT: ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
  Kano: ["Dala", "Fagge", "Gwale", "Kano Municipal", "Nassarawa", "Tarauni", "Ungogo"],
  Rivers: ["Obio-Akpor", "Port Harcourt", "Eleme", "Ikwerre", "Oyigbo"],
  Oyo: ["Ibadan North", "Ibadan South-West", "Ibadan South-East", "Ibadan North-East", "Ibadan North-West", "Oluyole", "Akinyele"],
  Ogun: ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ifo", "Obafemi Owode", "Sagamu"],
  Enugu: ["Enugu East", "Enugu North", "Enugu South", "Nkanu East", "Nkanu West", "Nsukka"],
  Anambra: ["Awka North", "Awka South", "Onitsha North", "Onitsha South", "Nnewi North", "Nnewi South"],
  Delta: ["Warri North", "Warri South", "Warri South-West", "Ughelli North", "Ughelli South", "Sapele"],
  Edo: ["Benin City", "Egor", "Ikpoba-Okha", "Oredo", "Ovia North-East", "Ovia South-West"],
};

// ─── Nigerian Banks ───
export const NIGERIAN_BANKS = [
  "Access Bank", "Citibank", "Ecobank", "Fidelity Bank", "First Bank of Nigeria",
  "First City Monument Bank (FCMB)", "Globus Bank", "Guaranty Trust Bank (GTBank)",
  "Heritage Bank", "Jaiz Bank", "Keystone Bank", "Kuda Bank", "Opay",
  "Palmpay", "Polaris Bank", "Providus Bank", "Stanbic IBTC Bank",
  "Standard Chartered Bank", "Sterling Bank", "SunTrust Bank",
  "Titan Trust Bank", "Union Bank", "United Bank for Africa (UBA)",
  "Unity Bank", "VFD Microfinance Bank", "Wema Bank", "Zenith Bank",
] as const;

// ─── Identification Types ───
export const ID_TYPES = [
  { value: "NIN", label: "National Identification Number (NIN)" },
  { value: "BVN", label: "Bank Verification Number (BVN)" },
  { value: "VOTER_CARD", label: "Voter's Card" },
  { value: "DRIVERS_LICENSE", label: "Driver's License" },
  { value: "PASSPORT", label: "International Passport" },
] as const;

// ─── Relationships ───
export const RELATIONSHIPS = ["spouse", "parent", "sibling", "child", "other"] as const;

// ─── Organization Types ───
export const ORGANIZATION_TYPES = [
  { value: "hospital", label: "Hospital / Clinic" },
  { value: "laboratory", label: "Laboratory" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "clinic", label: "Clinic" },
  { value: "insurance", label: "Insurance / HMO" },
  { value: "emergency", label: "Emergency / Ambulance" },
  { value: "logistics", label: "Logistics / Delivery" },
] as const;

// ─── Chronic Conditions ───
export const COMMON_CONDITIONS = [
  "Diabetes", "Hypertension", "Asthma", "Heart Disease", "Sickle Cell",
  "Arthritis", "Epilepsy", "HIV/AIDS", "Hepatitis", "Cancer",
] as const;

// ─── Hospital Facility Types ───
export const FACILITY_TYPES = [
  "Primary Care Clinic",
  "Secondary Hospital",
  "Tertiary / Specialist Hospital",
] as const;

export const OWNERSHIP_TYPES = ["Private", "Public", "Faith-based", "NGO"] as const;

// ─── Ambulance Types ───
export const AMBULANCE_TYPES = ["Basic Life Support", "Advanced Life Support"] as const;

// ─── Vehicle Types ───
export const VEHICLE_TYPES = ["Bike", "Van", "Truck"] as const;

// ─── Verification Statuses ───
export const VERIFICATION_STATUSES = {
  PENDING: { label: "Pending", color: "bg-accent/20 text-accent" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-wellbank-teal/20 text-wellbank-teal" },
  APPROVED: { label: "Approved", color: "bg-primary/20 text-primary" },
  REJECTED: { label: "Rejected", color: "bg-destructive/20 text-destructive" },
} as const;

export type VerificationStatus = keyof typeof VERIFICATION_STATUSES;
