import { daysBetween, joinNames, money } from '../format';
import type { LeaseInput } from '../types';
import type { City, StepProps } from './types';
import { FederalLeadDisclosure } from './lead';
import { MoveInChecklist } from './checklist';
import { Area, Check, Field, Radio, Text } from '../fields';

const blank = (s: string) => s.trim() === '';

function smokingPolicyText(input: LeaseInput): string {
  switch (input.buildingSmokingPolicy) {
    case 'prohibitedInAllUnits':
      return 'Smoking is prohibited in all dwelling units';
    case 'allowedInAllUnits':
      return 'Smoking is allowed in all dwelling units';
    case 'allowedInSomeUnits':
      return 'Smoking is allowed in some dwelling units';
  }
}

function depositInstallments(input: LeaseInput): number {
  return input.term.start && input.term.end && daysBetween(input.term.start, input.term.end) >= 182 ? 6 : 4;
}

function LocalStep({ lease, set }: StepProps) {
  const s = lease.seattle;
  const up = (patch: Partial<typeof s>) => set({ seattle: { ...s, ...patch } });
  return (
    <>
      <Check
        checked={s.singleFamily}
        onChange={(singleFamily) => up({ singleFamily })}
        label="The Premises is a single-family residence (not a unit in a building with other units)"
      />
      <p className="hint">
        Parking in a multifamily building must be rented under a separate agreement, so the parking line is used only
        for a single-family residence.
      </p>
      <Field label="Smoke detection devices" hint="State law requires this notice; the building items below apply unless the Premises is a single-family residence.">
        <Radio
          name="smokeDetectors"
          value={s.smokeDetectors}
          options={[
            ['hardWired', 'Hard-wired'],
            ['battery', 'Battery operated'],
          ]}
          onChange={(smokeDetectors) => up({ smokeDetectors })}
        />
      </Field>
      <Check checked={s.fireSprinklers} onChange={(fireSprinklers) => up({ fireSprinklers })} label="Building has a fire sprinkler system" />
      <Check checked={s.fireAlarm} onChange={(fireAlarm) => up({ fireAlarm })} label="Building has a fire alarm system" />
      <Check
        checked={s.emergencyNotificationPlan}
        onChange={(emergencyNotificationPlan) => up({ emergencyNotificationPlan })}
        label="Building has an emergency notification plan (copy given to tenant)"
      />
      <Check
        checked={s.emergencyRelocationPlan}
        onChange={(emergencyRelocationPlan) => up({ emergencyRelocationPlan })}
        label="Building has an emergency relocation plan (copy given to tenant)"
      />
      <Check
        checked={s.emergencyEvacuationPlan}
        onChange={(emergencyEvacuationPlan) => up({ emergencyEvacuationPlan })}
        label="Building has an emergency evacuation plan (copy given to tenant)"
      />
      <Field
        label="Agent for service in King County"
        hint="Name and King County address of the person who accepts notices and legal papers for the landlord. Leave blank if the landlord lives in Washington."
      >
        <Text value={s.agentForService} onChange={(agentForService) => up({ agentForService })} />
      </Field>
      <Field label="Known lead-based paint or hazards" hint="Leave blank if none are known. Federal disclosure for housing built before 1978.">
        <Text value={s.leadKnownHazards} onChange={(leadKnownHazards) => up({ leadKnownHazards })} />
      </Field>
      <Field label="Lead records or reports given to the tenant" hint="Leave blank if there are none.">
        <Area value={s.leadRecords} onChange={(leadRecords) => up({ leadRecords })} />
      </Field>
    </>
  );
}

function validateLocal(l: LeaseInput): string[] {
  const errors: string[] = [];
  if (l.term.start && l.term.end && daysBetween(l.term.start, l.term.end) > 366) {
    errors.push('Washington leases longer than 12 months must be notarized to be enforceable (RCW 59.18.210); use a term of 12 months or less');
  }
  return errors;
}

function validateMoney(l: LeaseInput): string[] {
  const errors: string[] = [];
  const need = (ok: boolean, message: string) => {
    if (!ok) errors.push(message);
  };
  need(l.deposit.amount > 0, 'Security deposit must be greater than 0');
  need(l.deposit.amount <= l.rent.monthly, 'Security deposit cannot exceed one month of rent (Seattle Municipal Code 7.24.035)');
  if (l.pets.allowed) {
    need(l.pets.deposit <= 0.25 * l.rent.monthly, 'Pet deposit cannot exceed 25 percent of one month of rent (Seattle Municipal Code 7.24.038)');
    need(l.pets.monthlyRent === 0, 'Seattle prohibits pet rent and other pet fees (Seattle Municipal Code 7.24.038.E)');
  }
  need(l.fees.graceDays >= 5, 'Washington requires at least 5 days after the due date before a late charge (RCW 59.18.170)');
  need(l.fees.lateFee <= 10, 'Seattle caps late charges at $10 per month (Seattle Municipal Code 7.24.034)');
  need(l.fees.dailyLateFee === 0, 'Seattle allows no late charge beyond $10 per month, so the daily charge must be 0');
  need(l.fees.returnedPaymentFee <= 31, 'Returned payment charge cannot exceed $31 in Seattle (Seattle Municipal Code 7.24.040)');
  return errors;
}

export const seattle: City = {
  key: 'seattle',
  name: 'Seattle',
  state: 'Washington',
  stateAbbr: 'WA',
  jurisdiction: 'the State of Washington',
  eSignLaw: 'the Washington Uniform Electronic Transactions Act (chapter 1.80 RCW)',
  county: 'King County',
  supportsVacateAtEnd: false,
  allowsPetRent: false,
  licenseLabel: 'Seattle Rental Registration and Inspection Ordinance (RRIO) registration number',
  depositHint:
    'Seattle caps the security deposit plus any nonrefundable move-in fees at one month of rent, and the pet deposit at 25 percent of one month of rent.',
  presets: ({ term, pets }) => ({
    term: { ...term, endOfTerm: 'monthToMonth' },
    pets: { ...pets, monthlyRent: 0 },
    fees: { graceDays: 5, lateFee: 10, dailyLateFee: 0, returnedPaymentFee: 31 },
  }),
  exhibits: [
    { letter: 'A', title: 'Move-In Condition Checklist', render: (input) => <MoveInChecklist input={input} /> },
    { letter: 'B', title: 'EPA pamphlet "Protect Your Family From Lead in Your Home"', file: 'protect-your-family-from-lead.pdf' },
    { letter: 'C', title: 'Washington State Department of Health mold information (DOH 333-302)', file: 'wa-doh-mold-faq.pdf' },
    { letter: 'D', title: 'City of Seattle Renter’s Handbook', file: 'seattle-renters-handbook.pdf' },
    { letter: 'E', title: 'Voter registration form (King County Elections)', file: 'king-county-voter-registration-form.pdf' },
  ],

  termSummary: () => ', then month-to-month',

  term: () => (
    <>
      <p>
        At the End Date this Lease continues on a month-to-month basis on the same terms unless Landlord and Tenant sign
        a written renewal, which is one of the outcomes Seattle Municipal Code 7.24.030.J permits; Landlord may instead
        offer Tenant a new lease on reasonable terms between 60 and 90 days before the End Date. Tenant may end the
        tenancy at the End Date, or at the end of any later rental month, by giving Landlord written notice at least 20
        days before that date (RCW 59.18.200 and 59.18.650). Landlord may end or refuse to continue the tenancy only for
        a just cause listed in RCW 59.18.650 and Seattle Municipal Code Chapter 22.205, by a written notice that states
        the cause and the facts supporting it and includes the language Seattle requires. Landlord will not make the
        terms of a month-to-month tenancy more burdensome than those of this Lease beyond what RCW 59.18.700(4) allows.
      </p>
      <p>
        Rent increases. Landlord will not increase the Monthly Rent or any other recurring charge during the first 12
        months of the tenancy, and after that no more than once in any 12-month period and by no more than the limit in
        RCW 59.18.700 (seven percent plus the Seattle-area consumer price index, or ten percent, whichever is less,
        unless the Premises is exempt under RCW 59.18.710). Any increase requires at least 180 days' prior written
        notice (Seattle Municipal Code 7.24.030.A), takes effect only at the start of a rental period, and will be given
        on the state notice form with the Seattle helpline information and, for an increase of ten percent or more, the
        Economic Displacement Relocation Assistance notice (Seattle Municipal Code Chapter 22.212).
      </p>
    </>
  ),

  rentNotes: ({ rent }) => (
    <ol className="sub">
      <li>
        Payment method: {rent.paymentInstructions}. Tenant may always pay by personal check (unless a check from Tenant
        was returned unpaid within the previous nine months), cashier's check, or money order, by mail or at the address
        in Section 21, and is never required to pay electronically (RCW 59.18.063; Seattle Municipal Code 7.24.030.E).
        Landlord will give a receipt for any cash payment and, on request, for any other payment.
      </li>
      <li>
        The first rent payment and the Security Deposit, or its first installment under Section 6, must be received
        before Landlord delivers keys. Landlord does not collect last month's rent in advance.
      </li>
      <li>
        Landlord will apply every payment first to rent and only then to late charges, damages, or other charges, as
        RCW 59.18.283 requires.
      </li>
      <li>Tenant may withhold rent, repair and deduct, or reduce rent only as chapter 59.18 RCW allows.</li>
    </ol>
  ),

  lateCharges: ({ fees }) => (
    <ol className="sub">
      <li>
        No late charge applies to rent paid within {fees.graceDays} days after its due date (RCW 59.18.170 guarantees at
        least 5 days). If rent remains unpaid after that, Tenant will pay a late charge of {money(fees.lateFee)} for
        that month, which does not exceed the $10 per month maximum in Seattle Municipal Code 7.24.034. Landlord will
        not charge any other fee for late payment or for preparing or delivering a notice.
      </li>
      <li>
        If any payment is returned or refused for insufficient funds or any other reason, Tenant will pay a
        returned-payment charge of {money(fees.returnedPaymentFee)}, which does not exceed the amount Landlord's bank
        charges or $31, whichever is less, and Landlord may require a cashier's check or money order for payments
        during the next nine months (RCW 59.18.063).
      </li>
      <li>
        Landlord's acceptance of a late payment does not waive Landlord's right to insist on timely payment in the
        future. A 14-day notice to pay rent or vacate may be served at any time after rent is due.
      </li>
    </ol>
  ),

  securityDeposit: (input) => {
    const { deposit, pets } = input;
    const n = depositInstallments(input);
    return (
      <ol className="sub">
        <li>
          Tenant will pay Landlord a security deposit of {money(deposit.amount)} (the "Security Deposit"). It does not
          exceed one month's rent, and Landlord charges no nonrefundable move-in fees, as Seattle Municipal Code
          7.24.035 requires.
          {pets.allowed && pets.deposit > 0
            ? ` Tenant will also pay a pet damage deposit of ${money(pets.deposit)}, which does not exceed 25 percent of one month's rent (Seattle Municipal Code 7.24.038) and is refundable on the same terms as the Security Deposit.`
            : ''}
        </li>
        <li>
          Installments. At Tenant's written request, Tenant may pay the Security Deposit in {n} consecutive, equal
          monthly installments beginning on the Start Date and due with the rent
          {pets.allowed && pets.deposit > 0 ? ', and the pet damage deposit in 3 consecutive, equal monthly installments' : ''}
          . Landlord charges no fee or interest for paying in installments. A missed installment is treated as rent
          owing and may be the subject of a 10-day notice to comply or vacate (Seattle Municipal Code 7.24.035.C; RCW
          59.18.610).
        </li>
        <li>
          Landlord will hold the Security Deposit in a trust account at {deposit.bankName}, {deposit.bankAddress}, as
          RCW 59.18.270 requires, will give Tenant a written receipt when it is paid, and will notify Tenant in writing
          of any change of depository. Unless the parties agree otherwise in writing, Landlord keeps any interest the
          trust account earns.
        </li>
        <li>
          Checklist. No deposit may be collected unless Landlord and Tenant sign and date a written move-in condition
          checklist and Tenant receives a copy (RCW 59.18.260; Seattle Municipal Code 7.24.035.E). The checklist is
          Exhibit A. The parties will complete and sign it when Tenant takes possession, and it is the basis for any
          damage charge at move-out.
        </li>
        <li>
          Deductions. After the tenancy ends, Landlord may retain from the Security Deposit only unpaid rent and other
          charges Tenant owes, and the cost of repairing damage to the Premises caused by Tenant or Tenant's occupants,
          guests, or animals beyond wear resulting from ordinary use, where the condition was documented in the
          checklist. Landlord will not retain any amount for ordinary wear, for carpet cleaning unless wear beyond
          ordinary use is documented, or for more than the cost of repairing the damaged portion (RCW 59.18.280).
        </li>
        <li>
          Return. Within 30 days after the tenancy ends and Tenant vacates, Landlord will deliver or mail to Tenant's
          last known address a full and specific written statement of the basis for retaining any part of the Security
          Deposit, with copies of the estimates, invoices, or receipts that substantiate each charge, together with any
          refund due (RCW 59.18.280). Tenant will give Landlord a forwarding address in writing at move-out.
        </li>
        <li>Tenant remains liable for any amount owed that exceeds the Security Deposit.</li>
      </ol>
    );
  },

  utilitiesNotes: ({ seattle: S }) => (
    <ol className="sub">
      <li>
        Tenant will place each Tenant-paid utility that the provider will bill to Tenant, such as Seattle City Light
        electricity, natural gas, internet, and cable, in Tenant's name by the Start Date and keep it on until the
        tenancy ends. Seattle Public Utilities bills water, sewer, and solid waste service to the property owner and does
        not open accounts in a tenant's name; where this Lease assigns those services to Tenant, Tenant will reimburse
        Landlord the actual charges shown on the utility's bill for the Premises within 10 days after receiving a copy
        of the bill.
      </li>
      {!S.singleFamily && (
        <li>
          If the Premises is in a building with three or more units and Landlord bills Tenant for a master-metered or
          unmetered utility, Landlord will do so only under Seattle's Third Party Billing Regulation (Seattle Municipal
          Code Chapter 7.25), under a written addendum that discloses the allocation method and the other terms that
          chapter requires, and every bill will state that it comes from Landlord and not from the utility.
        </li>
      )}
      <li>
        Tenant will not tamper with meters or use utilities in a way that damages the Premises, and will keep the heat
        on during cold weather to prevent frozen pipes. Where Tenant is responsible for lawn and yard care or snow and
        ice removal, Tenant will keep the yard and the adjoining sidewalk maintained and clear as the Seattle Municipal
        Code requires of occupants.
      </li>
    </ol>
  ),

  occupancy: (input) => {
    const occupants = input.occupants
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <ol className="sub">
        <li>
          The Premises will be occupied by Tenant and the following additional occupants:{' '}
          {occupants.length ? joinNames(occupants) : 'none'}. In addition, as Seattle Municipal Code 7.24.030.I
          provides, Tenant's immediate family members, one additional resident who is not a member of Tenant's
          immediate family, and that resident's immediate family may reside in the Premises, as long as the total
          number of residents does not exceed the occupancy limits set by law. Tenant will give Landlord the name of
          each such additional resident in writing within 30 days after that person moves in. Landlord may screen an
          additional resident who is not a member of Tenant's immediate family using the criteria applied to Tenant and
          may require that resident to sign this Lease, and will impose no other condition or charge for these
          residents.
        </li>
        <li>
          A guest who stays more than 14 consecutive days, or more than 21 days in any 60-day period, without becoming
          an additional resident under the preceding paragraph is an unauthorized occupant.
        </li>
        <li>
          Tenant will use the Premises only as a private residence. Tenant will not operate a business that involves
          customers, clients, deliveries, or employees at the Premises, and will not offer the Premises or any part of
          it for short-term rental, lodging, or paying guests.
        </li>
        <li>
          Tenant and Tenant's occupants and guests will not disturb the quiet enjoyment of neighbors, permit a nuisance
          or common waste, engage in criminal, drug-related, or gang-related activity, store hazardous or flammable
          materials, or violate any law or written building rule that Landlord provides to Tenant (RCW 59.18.130).
        </li>
        <li>Tenant is responsible for the conduct of every occupant and guest.</li>
      </ol>
    );
  },

  smokingNote: () => null,

  parking: ({ property, seattle: S }) =>
    S.singleFamily ? (
      <>Parking: {property.parking}.</>
    ) : (
      <>
        Parking: not included in this Lease. Any parking space is rented, if at all, under a separate written parking
        agreement, as Seattle Municipal Code 7.24.030.G requires for multifamily buildings, and Tenant may decline
        parking.
      </>
    ),

  condition: (
    <p>
      Landlord and Tenant will inspect the Premises together when Tenant takes possession and will complete, sign, and
      date the move-in condition checklist attached as Exhibit A, which describes the condition and cleanliness of the
      walls, paint, flooring and carpets, furniture, appliances, fixtures, and equipment (RCW 59.18.260). Tenant will
      receive a copy of the signed checklist and may request one free replacement copy. When the tenancy ends, Tenant
      will restore the Premises to its condition at the Start Date except for wear resulting from ordinary use and
      conditions caused by Landlord's failure to meet Landlord's obligations (RCW 59.18.130), and will leave it clean
      and free of Tenant's property and trash.
    </p>
  ),

  maintenance: ({ landlord: L, seattle: S }) => (
    <ol className="sub">
      <li>
        Landlord will keep the Premises fit for human habitation and perform every duty in RCW 59.18.060 and Seattle
        Municipal Code 22.206.160, including maintaining the structure, roof, plumbing, electrical, heating, and hot
        water systems and Landlord-supplied appliances; keeping the Premises weathertight; providing reasonably adequate
        locks and keys; providing a reasonable program for pest control at the start of the tenancy
        {S.singleFamily ? '' : ' and during it'}; {S.singleFamily ? '' : 'providing garbage receptacles and regular removal; '}
        and setting the water heater at no more than 120 degrees Fahrenheit at the start of the tenancy (RCW
        19.27A.060).
      </li>
      <li>
        Tenant will keep the Premises as clean and sanitary as its condition permits; dispose of garbage, recycling, and
        compost properly and at regular intervals; use electrical, gas, heating, and plumbing fixtures and appliances
        properly; not intentionally or negligently damage any part of the Premises or permit others to do so; not permit
        a nuisance or common waste; promptly report any water leak, mold, or pest problem to Landlord in writing; and pay
        the cost of extermination for any infestation caused by Tenant (RCW 59.18.130).
      </li>
      <li>
        Tenant will send repair requests to Landlord in writing at the address or email in Section 21. After receiving
        written notice of a defective condition, Landlord will begin repairs within the time RCW 59.18.070 requires:
        within 24 hours when the condition deprives Tenant of hot or cold water, heat, or electricity or is imminently
        hazardous to life; within 72 hours when it deprives Tenant of the use of a refrigerator, range and oven, or a
        major plumbing fixture supplied by Landlord; and within 10 days in all other cases, except where circumstances
        are beyond Landlord's control. If Landlord does not, Tenant has the remedies in RCW 59.18.090 through 59.18.115,
        including repair and deduct under RCW 59.18.100, and this Lease does not limit them.
      </li>
      <li>
        Tenant will pay the cost of any repair made necessary by the negligence or misuse of Tenant or Tenant's
        occupants, guests, or animals, including clogged drains, broken glass, lockouts, and damage from unreported
        leaks or open windows.
      </li>
      <li>
        In an emergency such as fire, flooding, a gas leak, no heat in winter, or a sewage backup, Tenant will call 911
        if there is any danger and then notify Landlord immediately at {L.phone}.
      </li>
    </ol>
  ),

  alarms: (
    <p>
      The Premises is equipped with smoke detection devices as RCW 43.44.110 requires and with carbon monoxide alarms
      as RCW 19.27.530 requires, and Landlord has made sure every device is operational at the start of the tenancy.
      Tenant is responsible for maintaining each device as its manufacturer specifies, including replacing batteries,
      for testing the devices regularly, and for notifying Landlord in writing of any device that does not work. Tenant
      may not remove, disable, or cover a device. A tenant who fails to maintain a smoke detection device may be fined
      up to $200 under RCW 43.44.110. The fire safety and protection notice that RCW 59.18.060(12) requires appears in
      the Disclosures and Acknowledgments.
    </p>
  ),

  access: (
    <p>
      Tenant will not unreasonably withhold consent for Landlord to enter the Premises to inspect it, make necessary or
      agreed repairs, alterations, or improvements, supply necessary or agreed services, or show it to prospective or
      actual purchasers, lenders, tenants, workers, or contractors. Except in an emergency or when it is impracticable,
      Landlord will give Tenant at least 2 days' written notice of intent to enter, stating the date and either the
      exact time or the earliest and latest possible times of entry and a telephone number Tenant may call to object or
      ask to reschedule, and will enter only at reasonable times. For showing the Premises to prospective or actual
      purchasers or tenants, at least 1 day's notice is required, and Landlord will not show the Premises excessively
      (RCW 59.18.150; Seattle Municipal Code 22.206.180.F). Landlord may enter without notice in an emergency or if the
      Premises has been abandoned. A party who violates these rules after one written notice listing the date and time
      of a violation is liable for up to $100 for each later violation plus the other party's costs and reasonable
      attorneys' fees (RCW 59.18.150).
    </p>
  ),

  insurance: (input) => (
    <ol className="sub">
      <li>
        Landlord's insurance does not cover Tenant's personal property or Tenant's liability to others.
        {input.rentersInsuranceRequired
          ? ' Tenant will maintain renter’s insurance throughout the tenancy with personal liability coverage of at least $100,000, will list Landlord as an interested party or additional interest, and will give Landlord proof of coverage before the Start Date and at each renewal.'
          : ' Landlord strongly recommends that Tenant purchase renter’s insurance, including flood coverage.'}
      </li>
      <li>
        Tenant is liable for damage to the Premises caused by Tenant or Tenant's occupants, guests, or animals (RCW
        59.18.130). Nothing in this Lease limits any liability of Landlord that arises under law or requires Tenant to
        indemnify Landlord for that liability; RCW 59.18.230 makes any such provision unenforceable.
      </li>
    </ol>
  ),

  defaults: (input) => (
    <ol className="sub">
      <li>
        Tenant is in default if Tenant (1) fails to pay rent when due; (2) fails to comply with a material term of this
        Lease or a duty under RCW 59.18.130; (3) commits or permits waste, a nuisance, unlawful activity, or substantial
        interference with the use and enjoyment of other residents; (4) abandons the Premises; or (5) made an
        intentional and material misrepresentation on the rental application.
      </li>
      <li>
        Before ending the tenancy, Landlord will serve the written notice state law requires (RCW 59.12.030 and
        59.18.650): a 14-day notice to pay rent or vacate for unpaid rent, on the form in RCW 59.18.057; a 10-day notice
        to comply or vacate for any other breach; or a 3-day notice to quit for waste, nuisance, or unlawful activity.
        Every such notice will state the facts supporting it, will be served as RCW 59.12.040 requires, and will include
        the right-to-counsel statement and the Renting in Seattle helpline sentence that Seattle Municipal Code
        22.206.195 and 22.206.180 require. The Premises must be registered under Seattle's Rental Registration and
        Inspection Ordinance before any such notice may be served.
      </li>
      <li>
        Landlord may end or refuse to continue the tenancy only for a just cause listed in RCW 59.18.650 and Seattle
        Municipal Code Chapter 22.205, and Tenant keeps every defense those laws provide, including the Seattle winter
        (December 1 through March 1) and school-year eviction protections where they apply. No provision of this Lease
        waives those rights (Seattle Municipal Code 22.205.020).
      </li>
      <li>
        If Tenant defaults and vacates, Tenant is liable as RCW 59.18.310 provides, and Landlord will make a reasonable
        effort to re-rent the Premises and mitigate damages. Landlord charges no lease-break fee beyond what that
        statute allows.
      </li>
      <li>
        Attorneys' fees and costs are recoverable only as chapter 59.18 RCW authorizes and a court awards them (RCW
        59.18.230 and 59.18.290).
      </li>
      <li>
        Landlord's remedies are cumulative. No delay or failure by Landlord to enforce any provision, and no acceptance
        of rent after a default, waives that default or any later default. Tenant's obligations survive termination of
        this Lease.
      </li>
    </ol>
  ),

  moveOut: (
    <ol className="sub">
      <li>
        To end the tenancy at the End Date or at the end of any later rental month, Tenant must give Landlord written
        notice at least 20 days before that date (RCW 59.18.200 and 59.18.650); a Tenant in military service may give
        shorter notice as RCW 59.18.200 allows, and a Tenant who is a victim of domestic violence, sexual assault,
        unlawful harassment, or stalking may end the tenancy early as RCW 59.18.575 provides. On or before the last
        day, Tenant will remove all of Tenant's property, clean the Premises, return every key and access device to
        Landlord, and give Landlord a forwarding address in writing.
      </li>
      <li>
        If Tenant abandons the Premises, Landlord will make a reasonable effort to re-rent it. Landlord may take
        possession of property Tenant leaves behind and store it in a reasonably secure place, and will make reasonable
        efforts to send Tenant a written notice stating Landlord's name and address, where the property is stored, and
        the date after which it will be sold or disposed of. Landlord may sell or dispose of the property 45 days after
        mailing or delivering that notice, or 7 days after it if the property is worth $250 or less, except personal
        papers, family pictures, and keepsakes, and will return the property on written request before then upon
        payment of the actual or reasonable moving and storage costs, whichever is less (RCW 59.18.310). Property
        remaining after an eviction is handled under RCW 59.18.312.
      </li>
    </ol>
  ),

  localRequirements: ({ landlord: L, seattle: S }) => (
    <ol className="sub">
      <li>
        Rental Registration. The Premises is registered under Seattle's Rental Registration and Inspection Ordinance
        (Seattle Municipal Code Chapter 22.214), registration No. {L.rentalLicense}, and Landlord has given Tenant a
        copy of the current registration as Section 22.214.040.I requires.
      </li>
      <li>
        Renter's Handbook and Voter Registration. Landlord has given Tenant a printed copy of the City of Seattle
        Renter's Handbook, the summary of landlord-tenant laws that Seattle Municipal Code 7.24.080 requires, which is
        also attached as Exhibit D, together with voter registration information and a voter registration form
        (Exhibit E). Landlord will provide the current handbook again at any renewal and annually during a
        month-to-month tenancy.
      </li>
      <li>
        Landlord's Agent for Service.{' '}
        {S.agentForService.trim()
          ? `Landlord designates ${S.agentForService.trim()} as the person residing in King County who is authorized to accept notices and service of process for Landlord (RCW 59.18.060(16)).`
          : 'Notices and process may be served on Landlord at the address in Section 21. If Landlord does not reside in Washington, the person to whom rent is paid is Landlord’s agent for service of notices and process (RCW 59.18.060(16)).'}
      </li>
      <li>
        Portable Cooling Devices. Tenant may install a portable cooling device, including a window-mounted unit, after
        giving Landlord at least 2 days' notice, and Landlord charges no fee for its use, inspection, or installation
        (RCW 59.18.740). Landlord may restrict a window-mounted device only on the grounds that statute allows: if the
        window is a necessary egress and the device would interfere with it; if the device would prevent Tenant from
        locking a window that is accessible from outside; if the device would require excessive brackets or hardware
        that would damage or void the warranty of the window or frame, puncture the exterior wall, or otherwise cause
        significant damage; if the device cannot be secured against falling out of the window; or if Landlord's
        insurance policy expressly restricts such devices and Landlord gives Tenant written evidence of the restriction.
        Landlord may require that any device be adequately drained and may inspect or service a window-mounted device
        after installation. Tenant is responsible for damage caused by a device Tenant installs.
      </li>
      <li>
        Fees. Landlord charges no fees other than those this Lease states and Seattle Municipal Code Chapters 7.24 and
        7.25 permit: no move-in fee other than the deposits in Section 6, no fee for keeping an animal, no fee for
        paying by check, money order, or bank transfer, no fee for any notice, and no late charge above $10 per month.
        Replacing a lost key costs the lesser of Landlord's actual cost or $50.
      </li>
      <li>
        Tenant Protections. Landlord complies with the federal Fair Housing Act, the Washington Law Against
        Discrimination, and Seattle's Open Housing and Fair Chance Housing ordinances (Seattle Municipal Code Chapters
        14.08 and 14.09), will not retaliate against Tenant for exercising any legal right (RCW 59.18.240; Seattle
        Municipal Code 7.24.110), and will not interfere with Tenant's right to organize with other tenants. A Tenant
        who is a victim of domestic violence, sexual assault, unlawful harassment, or stalking has the rights that RCW
        59.18.575 and Seattle Municipal Code 7.24.030.H provide, including early termination without penalty. Eligible
        tenants have the right to free legal counsel in an eviction case (Seattle Municipal Code 22.206.195). Nothing
        in this Lease waives any right Tenant has under chapter 59.18 RCW or the Seattle Municipal Code.
      </li>
      <li>
        Help. If you need help understanding this Lease or information about your renter rights, call the Renting in
        Seattle Helpline at (206) 684-5700 or visit www.seattle.gov/rentinginseattle.
      </li>
    </ol>
  ),

  generalExtras: (
    <li>
      This Lease is subject to the Washington Residential Landlord-Tenant Act (chapter 59.18 RCW) and Seattle Municipal
      Code Chapters 7.24, 7.25, 22.205, and 22.206. Any provision that conflicts with those laws, including any waiver
      of a right or remedy under them, is unenforceable (RCW 59.18.230; Seattle Municipal Code 7.24.100 and
      22.205.020), and the rest of this Lease remains in effect. Landlord has given each Tenant an executed copy of
      this Lease (RCW 59.18.065). Tenant has read this entire Lease, has had the opportunity to ask questions and
      consult an attorney, and agrees to its terms.
    </li>
  ),

  attachments: ({ seattle: S }) => (
    <p>
      The following are part of this Lease: the Disclosures and Acknowledgments that follow the signatures; Exhibit A,
      the move-in condition checklist; Exhibit B, the EPA pamphlet "Protect Your Family From Lead in Your Home"; Exhibit
      C, the Washington State Department of Health mold information (DOH 333-302); Exhibit D, the City of Seattle
      Renter's Handbook; and Exhibit E, the voter registration form. Landlord has also given Tenant a copy of the
      current Rental Registration and Inspection Ordinance registration for the Premises
      {S.singleFamily ? '' : ', and any parking is covered by a separate parking agreement'}.
    </p>
  ),

  disclosures: (input) => {
    const { landlord: L, deposit, pets, seattle: S } = input;
    const yesNo = (v: boolean) => (v ? 'Yes' : 'No');
    const plan = (v: boolean) => (v ? 'Yes; a copy has been provided to Tenant' : 'No');
    return (
      <>
        <FederalLeadDisclosure knownHazards={S.leadKnownHazards.trim()} records={S.leadRecords.trim()} pamphletExhibit="B" />

        <h3>Part B. Fire Safety and Smoke Detection Notice (RCW 59.18.060(12); RCW 43.44.110)</h3>
        <p>
          Landlord notifies Tenant that the Premises is equipped with smoke detection devices as RCW 43.44.110 requires
          and that Landlord has made sure every device is operational at the start of the tenancy. Tenant is responsible
          for maintaining each device in proper operating condition as the manufacturer specifies, including replacing
          batteries, and a tenant who fails to do so may be fined up to $200 under RCW 43.44.110.
        </p>
        {S.singleFamily ? (
          <p>
            The Premises is a single-family residence, so the additional building disclosures in RCW 59.18.060(12) do
            not apply.
          </p>
        ) : (
          <table>
            <tbody>
              <tr>
                <th>Smoke detection devices</th>
                <td>{S.smokeDetectors === 'hardWired' ? 'Hard-wired' : 'Battery operated'}</td>
              </tr>
              <tr>
                <th>Fire sprinkler system</th>
                <td>{yesNo(S.fireSprinklers)}</td>
              </tr>
              <tr>
                <th>Fire alarm system</th>
                <td>{yesNo(S.fireAlarm)}</td>
              </tr>
              <tr>
                <th>Building smoking policy</th>
                <td>{smokingPolicyText(input)}</td>
              </tr>
              <tr>
                <th>Emergency notification plan</th>
                <td>{plan(S.emergencyNotificationPlan)}</td>
              </tr>
              <tr>
                <th>Emergency relocation plan</th>
                <td>{plan(S.emergencyRelocationPlan)}</td>
              </tr>
              <tr>
                <th>Emergency evacuation plan</th>
                <td>{plan(S.emergencyEvacuationPlan)}</td>
              </tr>
            </tbody>
          </table>
        )}
        <p>By signing below, Landlord and Tenant sign this notice as RCW 59.18.060(12) requires, and each keeps a copy.</p>

        <h3>Part C. Mold Information (RCW 59.18.060(14))</h3>
        <p>
          Landlord has given Tenant the Washington State Department of Health information about the health hazards of
          indoor mold and how to control mold growth (DOH 333-302), attached as Exhibit C, and Tenant acknowledges
          receiving it. Tenant will keep the Premises ventilated, promptly clean small areas of mold, and promptly report
          leaks, moisture problems, and mold to Landlord in writing.
        </p>

        <h3>Part D. Flood Hazard and Insurance Disclosure (RCW 59.18.060(13))</h3>
        <p>
          The property may be located in a special flood hazard area or an area of potential flooding. Landlord's
          insurance does not cover the loss of Tenant's personal possessions, and Tenant should consider purchasing
          renter's insurance and flood insurance. Information about hazards affecting the property, including flood
          risk, is available from King County.
        </p>

        <h3>Part E. Seattle Documents (Seattle Municipal Code 7.24.070, 7.24.080, and 22.214.040)</h3>
        <p>
          Tenant acknowledges receiving with this Lease (1) a printed copy of the City of Seattle Renter's Handbook, the
          summary of landlord-tenant laws, which is also attached as Exhibit D; (2) voter registration information and a
          voter registration form (Exhibit E); and (3) a copy of the current Rental Registration and Inspection
          Ordinance registration for the Premises, No. {L.rentalLicense}.
        </p>

        <h3>Part F. Security Deposit Receipt and Move-In Checklist (RCW 59.18.260 and 59.18.270; Seattle Municipal Code 7.24.035)</h3>
        <p>
          The Security Deposit of {money(deposit.amount)}
          {pets.allowed && pets.deposit > 0 ? ` and the pet damage deposit of ${money(pets.deposit)}` : ''} will be
          held in a trust account at {deposit.bankName}, {deposit.bankAddress}. Landlord will give Tenant a written
          receipt when the deposit, or each installment of it, is paid. The move-in condition checklist (Exhibit A) will
          be completed, signed, and dated by Landlord and Tenant when Tenant takes possession, and Tenant will receive a
          copy.
        </p>
      </>
    );
  },

  disclosureCertification:
    'The parties have reviewed the information above and certify, to the best of their knowledge, that the information they have provided is true and accurate. Landlord and Tenant sign the fire safety and smoke detection notice in Part B, and Tenant acknowledges receipt of the documents described in Parts A through F, including Exhibits B, C, D, and E.',

  LocalStep,
  validateLocal,
  validateMoney,
};
