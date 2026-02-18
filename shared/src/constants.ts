/**
 * WellBank Configuration Constants
 * Supports multi-country expansion across Africa
 */

export const CountryCode = {
  NIGERIA: 'NG',
  KENYA: 'KE',
  GHANA: 'GH',
} as const;

export type CountryCode = typeof CountryCode[keyof typeof CountryCode];

export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  phonePrefix: string;
  idTypes: string[];
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  [CountryCode.NIGERIA]: {
    code: CountryCode.NIGERIA,
    name: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    locale: 'en-NG',
    phonePrefix: '+234',
    idTypes: ['NIN', 'BVN', 'Voters Card', 'Driver License', 'International Passport'],
  },
  [CountryCode.KENYA]: {
    code: CountryCode.KENYA,
    name: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    locale: 'en-KE',
    phonePrefix: '+254',
    idTypes: ['National ID', 'Passport', 'Driving License', 'Alien ID'],
  },
  [CountryCode.GHANA]: {
    code: CountryCode.GHANA,
    name: 'Ghana',
    currency: 'GHS',
    currencySymbol: '₵',
    locale: 'en-GH',
    phonePrefix: '+233',
    idTypes: ['National ID', 'Passport', 'Driver License', 'Voters ID'],
  },
};

export const REGIONS: Record<CountryCode, string[]> = {
  [CountryCode.NIGERIA]: [
    'Lagos',
    'Abuja',
    'Port Harcourt',
    'Ibadan',
    'Kano',
    'Benin City',
    'Kaduna',
    'Enugu',
    'Abuja',
    'Jos',
  ],
  [CountryCode.KENYA]: [
    'Nairobi',
    'Mombasa',
    'Kisumu',
    'Nakuru',
    'Eldoret',
    'Thika',
    'Malindi',
    'Kitale',
  ],
  [CountryCode.GHANA]: [
    'Accra',
    'Kumasi',
    'Takoradi',
    'Cape Coast',
    'Tema',
    'Tarkwa',
    'Ho',
    'Koforidua',
  ],
};

export function formatCurrency(amount: number, countryCode: CountryCode = CountryCode.NIGERIA): string {
  const config = COUNTRIES[countryCode];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
  }).format(amount);
}

export function formatPhoneNumber(phone: string, countryCode: CountryCode = CountryCode.NIGERIA): string {
  const config = COUNTRIES[countryCode];
  if (phone.startsWith(config.phonePrefix)) {
    return phone;
  }
  return `${config.phonePrefix}${phone.replace(/^0/, '')}`;
}

export function getCountryConfig(countryCode: CountryCode): CountryConfig {
  return COUNTRIES[countryCode];
}

export function getRegions(countryCode: CountryCode): string[] {
  return REGIONS[countryCode] || [];
}

export const DEFAULT_COUNTRY = CountryCode.NIGERIA;
