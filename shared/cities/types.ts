import type { ReactNode } from 'react';
import type { CityKey, LeaseInput } from '../types';

export type Exhibit = { letter: string; title: string; file: string };

export type StepProps = { lease: LeaseInput; set: (patch: Partial<LeaseInput>) => void };

export type City = {
  key: CityKey;
  name: string;
  state: string;
  stateAbbr: string;
  jurisdiction: string;
  eSignLaw: string;
  county: string;
  supportsVacateAtEnd: boolean;
  depositHint: string;
  exhibits: Exhibit[];
  termSummary: (input: LeaseInput) => string;
  term: (input: LeaseInput) => ReactNode;
  rentNotes: (input: LeaseInput) => ReactNode;
  lateCharges: (input: LeaseInput) => ReactNode;
  securityDeposit: (input: LeaseInput) => ReactNode;
  utilitiesNotes: (input: LeaseInput) => ReactNode;
  occupancy: (input: LeaseInput) => ReactNode;
  smokingNote: (input: LeaseInput) => ReactNode;
  condition: ReactNode;
  maintenance: (input: LeaseInput) => ReactNode;
  alarms: ReactNode;
  access: ReactNode;
  insurance: (input: LeaseInput) => ReactNode;
  defaults: (input: LeaseInput) => ReactNode;
  moveOut: ReactNode;
  localRequirements: (input: LeaseInput) => ReactNode;
  generalExtras: ReactNode;
  attachments: (input: LeaseInput) => ReactNode;
  disclosures: (input: LeaseInput) => ReactNode;
  disclosureCertification: string;
  LocalStep: (props: StepProps) => ReactNode;
  validateLocal: (lease: LeaseInput) => string[];
  validateMoney: (lease: LeaseInput) => string[];
};
