import type { LeaseInput } from '../shared/types';
import { daysBetween, parseDate } from '../shared/format';

export const STEPS = [
  'Property',
  'Landlord',
  'Tenants',
  'Term',
  'Rent',
  'Deposit and fees',
  'Utilities',
  'Policies',
  'Philadelphia',
  'Stipulations',
  'Review',
] as const;
export type Step = (typeof STEPS)[number];

const blank = (s: string) => s.trim() === '';

export function validate(step: Step, l: LeaseInput): string[] {
  const errors: string[] = [];
  const need = (ok: boolean, message: string) => {
    if (!ok) errors.push(message);
  };
  switch (step) {
    case 'Property':
      need(!blank(l.property.street), 'Street address is required');
      need(/^\d{5}$/.test(l.property.zip), 'ZIP code must be 5 digits');
      need(
        l.property.yearBuilt >= 1600 && l.property.yearBuilt <= new Date().getFullYear(),
        'Year built is not valid',
      );
      need(!blank(l.property.furnishings), 'Appliances and furnishings is required (write None if none)');
      need(!blank(l.property.parking), 'Parking is required');
      need(!blank(l.property.keys), 'Keys is required');
      break;
    case 'Landlord': {
      const L = l.landlord;
      need(!blank(L.name), 'Landlord name is required');
      need(!blank(L.street), 'Landlord street address is required');
      need(!blank(L.city), 'Landlord city is required');
      need(!blank(L.state), 'Landlord state is required');
      need(!blank(L.zip), 'Landlord ZIP code is required');
      need(!blank(L.phone), 'Landlord phone is required');
      need(L.email.includes('@'), 'Landlord email is required');
      need(!blank(L.rentalLicense), 'Philadelphia Rental License number is required');
      break;
    }
    case 'Tenants':
      need(l.tenants.length > 0, 'At least one tenant is required');
      l.tenants.forEach((t, i) => {
        need(!blank(t.name), `Tenant ${i + 1}: name is required`);
        need(t.email.includes('@'), `Tenant ${i + 1}: email is required`);
        need(!blank(t.phone), `Tenant ${i + 1}: phone is required`);
      });
      break;
    case 'Term':
      need(!blank(l.term.start), 'Start date is required');
      need(!blank(l.term.end), 'End date is required');
      if (l.term.start && l.term.end) need(daysBetween(l.term.start, l.term.end) > 0, 'End date must be after the start date');
      break;
    case 'Rent':
      need(l.rent.monthly > 0, 'Monthly rent must be greater than 0');
      need(
        Number.isInteger(l.rent.dueDay) && l.rent.dueDay >= 1 && l.rent.dueDay <= 28,
        'Rent due day must be between 1 and 28',
      );
      need(!blank(l.rent.paymentInstructions), 'Payment method is required');
      break;
    case 'Deposit and fees':
      need(l.deposit.amount > 0, 'Security deposit must be greater than 0');
      need(
        l.deposit.amount + (l.pets.allowed ? l.pets.deposit : 0) <= 2 * l.rent.monthly,
        'Security deposit plus pet deposit cannot exceed two months of rent (68 P.S. § 250.511a)',
      );
      need(!blank(l.deposit.bankName), 'Escrow bank name is required (68 P.S. § 250.511b)');
      need(!blank(l.deposit.bankAddress), 'Escrow bank address is required');
      need(l.fees.graceDays >= 0, 'Grace period cannot be negative');
      need(l.fees.lateFee > 0, 'Late charge must be greater than 0');
      need(l.fees.dailyLateFee >= 0, 'Daily late charge cannot be negative');
      need(l.fees.returnedPaymentFee > 0, 'Returned payment charge must be greater than 0');
      break;
    case 'Utilities':
      break;
    case 'Policies':
      if (l.pets.allowed) {
        need(!blank(l.pets.description), 'Describe the permitted pet(s)');
        need(l.pets.deposit >= 0 && l.pets.monthlyRent >= 0, 'Pet amounts cannot be negative');
      }
      break;
    case 'Philadelphia': {
      const p = l.philadelphia;
      need(!blank(p.crsDate), 'Certificate of Rental Suitability date is required');
      if (p.crsDate && l.term.start) {
        const gap = daysBetween(p.crsDate, l.term.start);
        need(
          gap >= 0 && gap <= 60,
          'The Certificate of Rental Suitability must be issued within 60 days before the lease start date (Philadelphia Code § 9-3903)',
        );
      }
      need(!blank(p.leadCertificationDate), 'Lead certificate inspection date is required');
      if (p.leadCertificationDate && l.term.start) {
        need(daysBetween(p.leadCertificationDate, l.term.start) >= 0, 'Lead certificate inspection date cannot be after the lease start date');
        if (p.leadCertification === 'Lead-Safe') {
          const inspected = parseDate(p.leadCertificationDate);
          const expires = new Date(inspected.getFullYear() + 4, inspected.getMonth(), inspected.getDate());
          need(
            parseDate(l.term.start) <= expires,
            'A Lead-Safe certificate is valid for 48 months from its inspection date (Philadelphia Code § 6-802(15)); this one expires before the lease starts',
          );
        }
      }
      if (p.bedBugsReported) need(!blank(p.bedBugDetails), 'Describe the bed bug history and remediation');
      break;
    }
    case 'Stipulations':
    case 'Review':
      break;
  }
  return errors;
}

export function validateAll(l: LeaseInput): string[] {
  return STEPS.flatMap((step) => validate(step, l).map((e) => `${step}: ${e}`));
}
