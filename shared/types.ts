export const CITIES = ['philadelphia', 'seattle'] as const;
export type CityKey = (typeof CITIES)[number];

export type Landlord = {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  rentalLicense: string;
};

export type Tenant = { name: string; email: string; phone: string };

export const UTILITIES = [
  'Electricity',
  'Gas',
  'Water and sewer',
  'Trash and recycling',
  'Internet',
  'Cable / TV',
  'Lawn and yard care',
  'Snow and ice removal',
] as const;
export type Utility = (typeof UTILITIES)[number];
export type Payer = 'landlord' | 'tenant';

export type EndOfTerm = 'monthToMonth' | 'vacate';
export type Smoking = 'prohibited' | 'outdoorsOnly' | 'allowed';
export type BuildingSmokingPolicy = 'prohibitedInAllUnits' | 'allowedInAllUnits' | 'allowedInSomeUnits';
export type LeadCertification = 'Lead-Safe' | 'Lead-Free';

export type LeaseInput = {
  city: CityKey;
  property: {
    street: string;
    unit: string;
    zip: string;
    yearBuilt: number;
    furnishings: string;
    parking: string;
    keys: string;
  };
  landlord: Landlord;
  tenants: Tenant[];
  occupants: string;
  term: { start: string; end: string; endOfTerm: EndOfTerm };
  rent: { monthly: number; dueDay: number; paymentInstructions: string };
  deposit: { amount: number; bankName: string; bankAddress: string };
  fees: { graceDays: number; lateFee: number; dailyLateFee: number; returnedPaymentFee: number };
  utilities: Record<Utility, Payer>;
  pets: { allowed: boolean; description: string; deposit: number; monthlyRent: number };
  smoking: Smoking;
  buildingSmokingPolicy: BuildingSmokingPolicy;
  rentersInsuranceRequired: boolean;
  philadelphia: {
    crsDate: string;
    leadCertification: LeadCertification;
    leadCertificationDate: string;
    bedBugsReported: boolean;
    bedBugDetails: string;
  };
  seattle: {
    singleFamily: boolean;
    smokeDetectors: 'hardWired' | 'battery';
    fireSprinklers: boolean;
    fireAlarm: boolean;
    emergencyNotificationPlan: boolean;
    emergencyRelocationPlan: boolean;
    emergencyEvacuationPlan: boolean;
    agentForService: string;
    leadKnownHazards: string;
    leadRecords: string;
  };
  stipulations: string;
};

export const emptyLease: LeaseInput = {
  city: 'philadelphia',
  property: {
    street: '',
    unit: '',
    zip: '',
    yearBuilt: 1925,
    furnishings: 'Refrigerator, stove and oven',
    parking: 'No parking is included',
    keys: '2 keys to the Premises and 1 mailbox key',
  },
  landlord: { name: '', street: '', city: 'Philadelphia', state: 'PA', zip: '', phone: '', email: '', rentalLicense: '' },
  tenants: [{ name: '', email: '', phone: '' }],
  occupants: '',
  term: { start: '', end: '', endOfTerm: 'monthToMonth' },
  rent: { monthly: 0, dueDay: 1, paymentInstructions: 'Online through Apartments.com Rental Manager' },
  deposit: { amount: 0, bankName: '', bankAddress: '' },
  fees: { graceDays: 5, lateFee: 50, dailyLateFee: 0, returnedPaymentFee: 35 },
  utilities: {
    Electricity: 'tenant',
    Gas: 'tenant',
    'Water and sewer': 'tenant',
    'Trash and recycling': 'landlord',
    Internet: 'tenant',
    'Cable / TV': 'tenant',
    'Lawn and yard care': 'tenant',
    'Snow and ice removal': 'tenant',
  },
  pets: { allowed: false, description: '', deposit: 0, monthlyRent: 0 },
  smoking: 'prohibited',
  buildingSmokingPolicy: 'prohibitedInAllUnits',
  rentersInsuranceRequired: true,
  philadelphia: {
    crsDate: '',
    leadCertification: 'Lead-Safe',
    leadCertificationDate: '',
    bedBugsReported: false,
    bedBugDetails: '',
  },
  seattle: {
    singleFamily: false,
    smokeDetectors: 'battery',
    fireSprinklers: false,
    fireAlarm: false,
    emergencyNotificationPlan: false,
    emergencyRelocationPlan: false,
    emergencyEvacuationPlan: false,
    agentForService: '',
    leadKnownHazards: '',
    leadRecords: '',
  },
  stipulations: '',
};
