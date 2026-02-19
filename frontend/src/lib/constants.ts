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
