import { daysBetween, joinNames, longDate, money, parseDate } from '../format';
import type { LeaseInput } from '../types';
import type { City, StepProps } from './types';
import { FederalLeadDisclosure } from './lead';
import { Area, Check, Field, Radio, Text } from '../fields';

const blank = (s: string) => s.trim() === '';

function LocalStep({ lease, set }: StepProps) {
  const p = lease.philadelphia;
  const up = (patch: Partial<typeof p>) => set({ philadelphia: { ...p, ...patch } });
  return (
    <>
      <Field
        label="Certificate of Rental Suitability issue date"
        hint="Pull it from L&I eCLIPSE. It must be issued within 60 days before the lease start date."
      >
        <Text type="date" value={p.crsDate} onChange={(crsDate) => up({ crsDate })} />
      </Field>
      <Field label="Lead certification">
        <Radio
          name="leadCertification"
          value={p.leadCertification}
          options={[
            ['Lead-Safe', 'Lead-Safe certificate'],
            ['Lead-Free', 'Lead-Free certificate'],
          ]}
          onChange={(leadCertification) => up({ leadCertification })}
        />
      </Field>
      <Field label="Lead certificate inspection date" hint="Lead-Safe certificates are valid for 48 months from the inspection. Lead-Free certificates do not expire.">
        <Text type="date" value={p.leadCertificationDate} onChange={(leadCertificationDate) => up({ leadCertificationDate })} />
      </Field>
      <Check
        checked={p.bedBugsReported}
        onChange={(bedBugsReported) => up({ bedBugsReported })}
        label="Bed bug infestation or treatment in the unit during the last 120 days"
      />
      {p.bedBugsReported && (
        <Field label="Bed bug history and remediation">
          <Area value={p.bedBugDetails} onChange={(bedBugDetails) => up({ bedBugDetails })} />
        </Field>
      )}
    </>
  );
}

function validateLocal(l: LeaseInput): string[] {
  const errors: string[] = [];
  const need = (ok: boolean, message: string) => {
    if (!ok) errors.push(message);
  };
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
  return errors;
}

function validateMoney(l: LeaseInput): string[] {
  const errors: string[] = [];
  const need = (ok: boolean, message: string) => {
    if (!ok) errors.push(message);
  };
  need(l.deposit.amount > 0, 'Security deposit must be greater than 0');
  need(
    l.deposit.amount + (l.pets.allowed ? l.pets.deposit : 0) <= 2 * l.rent.monthly,
    'Security deposit plus pet deposit cannot exceed two months of rent (68 P.S. § 250.511a)',
  );
  need(l.fees.lateFee > 0, 'Late charge must be greater than 0');
  need(l.fees.returnedPaymentFee > 0, 'Returned payment charge must be greater than 0');
  return errors;
}

export const philadelphia: City = {
  key: 'philadelphia',
  name: 'Philadelphia',
  state: 'Pennsylvania',
  stateAbbr: 'PA',
  jurisdiction: 'the Commonwealth of Pennsylvania',
  eSignLaw: 'the Pennsylvania Electronic Transactions Act (73 P.S. § 2260.101 et seq.)',
  county: 'Philadelphia County',
  supportsVacateAtEnd: true,
  allowsPetRent: true,
  licenseLabel: 'Philadelphia Rental License number',
  depositHint: 'Pennsylvania caps deposits at two months of rent in the first year.',
  presets: ({ fees }) => ({ fees: { ...fees, lateFee: 50, dailyLateFee: 0, returnedPaymentFee: 35 } }),
  exhibits: [
    { letter: 'A', title: 'EPA pamphlet "Protect Your Family From Lead in Your Home"', file: 'protect-your-family-from-lead.pdf' },
    { letter: 'B', title: 'City of Philadelphia bed bug informational notice', file: 'philadelphia-bed-bug-notice.pdf' },
    { letter: 'C', title: 'City of Philadelphia Partners in Good Housing handbook', file: 'partners-in-good-housing.pdf' },
  ],

  termSummary: ({ term }) => (term.endOfTerm === 'monthToMonth' ? ', then month-to-month' : ', then Tenant must vacate'),

  term: ({ term }) =>
    term.endOfTerm === 'monthToMonth' ? (
      <p>
        Unless Landlord and Tenant sign a written renewal, or either party gives the other written notice of
        termination at least 30 days before the End Date, this Lease continues after the End Date on a
        month-to-month basis on the same terms. During a month-to-month tenancy, Landlord may change the Monthly
        Rent or other terms by giving Tenant at least 30 days' written notice, and either party may end the tenancy
        by giving the other at least 30 days' written notice, effective on the last day of a rental month. A
        month-to-month tenancy is a lease of less than one year under Philadelphia Code Chapter 9-800, so any
        notice from Landlord ending or not renewing it will state the good cause for it, will be given at least 30
        days in advance, and will be hand delivered or sent by first-class mail with proof of mailing.
      </p>
    ) : (
      <p>
        This Lease ends on the End Date, and Tenant must vacate and surrender the Premises by then unless Landlord
        and Tenant sign a written renewal or extension. If Tenant remains in possession after the End Date without
        Landlord's written consent, Tenant is a holdover tenant: Tenant owes rent for each day of holdover at a
        daily rate equal to one-thirtieth of the Monthly Rent, Landlord may recover possession under Pennsylvania
        law, and Landlord's acceptance of any holdover payment does not renew this Lease or waive Landlord's
        rights. If the Term is less than one year, Philadelphia Code Chapter 9-800 requires Landlord to give at
        least 30 days' written notice stating good cause in order not to renew this Lease, and without that notice
        this Lease continues month to month.
      </p>
    ),

  rentNotes: ({ rent }) => (
    <ol className="sub">
      <li>
        Payment method: {rent.paymentInstructions}. Landlord may change the payment method or address on 30 days'
        written notice.
      </li>
      <li>The first rent payment and the Security Deposit must be received in full before Landlord delivers keys.</li>
      <li>
        Landlord may apply any payment to the oldest amounts outstanding first. Landlord's acceptance of a partial
        payment does not waive Landlord's right to the balance or any remedy.
      </li>
      <li>Tenant may not withhold or reduce rent except as Pennsylvania law expressly allows.</li>
    </ol>
  ),

  lateCharges: ({ fees }) => (
    <ol className="sub">
      <li>
        If Landlord does not receive any installment of rent within {fees.graceDays} days after its due date, Tenant
        will pay a late charge of {money(fees.lateFee)}
        {fees.dailyLateFee > 0 ? `, plus ${money(fees.dailyLateFee)} for each additional day the rent remains unpaid` : ''}
        . The parties agree that this late charge is a reasonable estimate of Landlord's administrative and
        collection costs, which are difficult to determine, and is not interest or a penalty.
      </li>
      <li>
        If any payment is returned or refused for insufficient funds or any other reason, Tenant will pay a
        returned-payment charge of {money(fees.returnedPaymentFee)} in addition to any late charge, and Landlord may
        require that future payments be made by certified funds or a payment method Landlord specifies.
      </li>
      <li>
        Landlord's acceptance of a late payment or late charge does not waive Landlord's right to insist on timely
        payment in the future or to pursue any remedy, including eviction for nonpayment.
      </li>
    </ol>
  ),

  securityDeposit: ({ deposit }) => (
    <ol className="sub">
      <li>
        Tenant will pay Landlord a security deposit of {money(deposit.amount)} (the "Security Deposit") before the
        Start Date. The Security Deposit secures Tenant's full performance of this Lease. It is not rent, does not
        limit Tenant's liability, and Tenant may not apply it to the last month's rent or any other payment.
      </li>
      <li>
        As required by 68 P.S. § 250.511b, Landlord will hold the Security Deposit in an escrow account at{' '}
        {deposit.bankName}, {deposit.bankAddress}. If Tenant remains in possession beyond the first year of the
        tenancy, Landlord will return any part of the Security Deposit that exceeds one month's rent as required by
        68 P.S. § 250.511a, and if the Security Deposit is held for more than two years, Landlord will pay interest
        on it as required by 68 P.S. § 250.511b.
      </li>
      <li>
        After Tenant vacates, Landlord may deduct from the Security Deposit any unpaid rent and charges, the cost to
        repair damage to the Premises beyond normal wear and tear, the cost of cleaning needed to return the
        Premises to its move-in condition, the cost of replacing unreturned keys or re-keying locks, the cost of
        removing and storing abandoned property, and any other amount Tenant owes under this Lease.
      </li>
      <li>
        Within 30 days after this Lease ends or Tenant surrenders the Premises and Landlord accepts the surrender,
        whichever occurs first, Landlord will send Tenant a written, itemized list of any deductions and refund the
        balance of the Security Deposit, as required by 68 P.S. § 250.512. Tenant must give Landlord a forwarding
        address in writing when Tenant moves out; if Tenant does not, Landlord will send the list to the Premises
        and Landlord is relieved of liability under 68 P.S. § 250.512 to the extent that statute provides.
      </li>
      <li>Tenant remains liable for any amount owed that exceeds the Security Deposit.</li>
    </ol>
  ),

  utilitiesNotes: () => (
    <ol className="sub">
      <li>
        Tenant will place every Tenant-paid utility that can be separately billed in Tenant's name by the Start Date
        and keep it on continuously until the tenancy ends. For any Tenant-paid service that remains billed to
        Landlord (for example, Philadelphia Water Department water and sewer service), Tenant will reimburse
        Landlord within 10 days after receiving a copy of the bill.
      </li>
      <li>
        Tenant will not tamper with meters, use utilities in a way that damages the Premises, or allow the heat to
        be turned off during cold weather. Landlord is not liable for any interruption of a utility or service that
        Landlord does not cause.
      </li>
      <li>
        Where Tenant is responsible for snow and ice removal, Tenant will clear the sidewalk in front of the
        Premises to a path at least 36 inches wide within 6 hours after snow stops falling, as Philadelphia Code
        § 10-720 requires. Where Tenant is responsible for trash and recycling, Tenant will set out trash and
        recycling only on the days and in the manner the City requires.
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
          The Premises may be occupied only by Tenant and the following additional occupants:{' '}
          {occupants.length ? joinNames(occupants) : 'none'}. No other person may reside in the Premises without
          Landlord's written consent. A guest who stays more than 14 consecutive days, or more than 21 days in any
          60-day period, is an unauthorized occupant.
        </li>
        <li>
          Tenant will use the Premises only as a private residence. Tenant will not operate a business that involves
          customers, clients, deliveries, or employees at the Premises, and will not offer the Premises or any part of
          it for short-term rental, lodging, or paying guests.
        </li>
        <li>
          Tenant and Tenant's occupants and guests will not disturb the quiet enjoyment of neighbors, create a
          nuisance, engage in any criminal activity, store hazardous or flammable materials, or violate any law,
          ordinance, or written building rule that Landlord provides to Tenant.
        </li>
        <li>Tenant is responsible for the conduct of every occupant and guest.</li>
      </ol>
    );
  },

  parking: ({ property }) => <>Parking: {property.parking}.</>,

  smokingNote: (input) => (
    <p>
      Building smoking policy, disclosed as the Philadelphia Code requires: smoking is{' '}
      {input.buildingSmokingPolicy === 'prohibitedInAllUnits' && 'prohibited in all dwelling units'}
      {input.buildingSmokingPolicy === 'allowedInAllUnits' && 'allowed in all dwelling units'}
      {input.buildingSmokingPolicy === 'allowedInSomeUnits' && 'allowed in some dwelling units'} of the building
      that contains the Premises.
    </p>
  ),

  condition: (
    <p>
      Tenant has inspected the Premises and accepts it in its present condition, in good order and repair, except for
      any item Tenant lists on a written move-in condition report delivered to Landlord within 5 days after the Start
      Date. Landlord makes no promise about the condition of the Premises other than those written in this Lease and
      those implied by law. When the tenancy ends, Tenant will return the Premises in the same condition as at the
      Start Date, normal wear and tear excepted, clean and free of Tenant's property and trash.
    </p>
  ),

  maintenance: ({ landlord: L }) => (
    <ol className="sub">
      <li>
        Landlord will keep the Premises fit for habitation, maintain the structure, roof, plumbing, heating,
        electrical systems, and Landlord-supplied appliances in working order, and comply with the Philadelphia
        Property Maintenance Code.
      </li>
      <li>
        Tenant will keep the Premises clean and sanitary; dispose of trash and recycling properly; use every fixture
        and appliance reasonably; keep drains and toilets free of obstructions; not overload electrical circuits;
        keep the heat at 55 degrees Fahrenheit or higher during cold weather to prevent frozen pipes; replace light
        bulbs; and promptly notify Landlord in writing of any condition that needs repair, any water leak, mold, or
        pest problem, and any damage to the Premises.
      </li>
      <li>
        Tenant will pay the cost of any repair made necessary by the negligence, misuse, or neglect of Tenant or
        Tenant's occupants, guests, or animals, including clogged drains, broken glass, lockouts, pest infestations
        caused by Tenant's conduct, and damage from unreported leaks or open windows.
      </li>
      <li>
        Landlord will make repairs that are Landlord's responsibility within a reasonable time after receiving
        written notice. Tenant may not make repairs, hire contractors, or deduct repair costs from rent unless
        Pennsylvania law expressly permits it.
      </li>
      <li>
        In an emergency such as fire, flooding, a gas leak, no heat in winter, or a sewage backup, Tenant will call
        911 if there is any danger and then notify Landlord immediately at {L.phone}.
      </li>
    </ol>
  ),

  alarms: (
    <p>
      Landlord will deliver the Premises with working smoke alarms and, as required by the Pennsylvania Carbon
      Monoxide Alarm Standards Act (35 P.S. § 7221 et seq.), working carbon monoxide alarms. Tenant will test every
      alarm monthly, replace batteries as needed, never disable, remove, or cover an alarm, and immediately notify
      Landlord in writing of any alarm that does not work. Tenant is liable for any damage that results from
      tampering with an alarm.
    </p>
  ),

  access: (
    <p>
      Landlord and Landlord's agents and contractors may enter the Premises at reasonable times after giving Tenant
      at least 24 hours' written notice (including by email or text message) to inspect, make repairs or improvements, show
      the Premises to prospective tenants, buyers, lenders, insurers, or inspectors, or for any other lawful purpose.
      No notice is required in an emergency, when Tenant has requested a repair, or when Landlord reasonably believes
      the Premises has been abandoned. During the last 60 days of the Term, Landlord may show the Premises to
      prospective tenants and place a "for rent" sign on the property. Tenant will not unreasonably deny access, and
      refusing lawful access is a default under this Lease.
    </p>
  ),

  insurance: (input) => (
    <ol className="sub">
      <li>
        Landlord's insurance does not cover Tenant's personal property or Tenant's liability to others.
        {input.rentersInsuranceRequired
          ? ' Tenant will maintain renter’s insurance throughout the tenancy with personal liability coverage of at least $100,000, will list Landlord as an interested party or additional interest, and will give Landlord proof of coverage before the Start Date and at each renewal.'
          : ' Landlord strongly recommends that Tenant purchase renter’s insurance.'}
      </li>
      <li>
        Except to the extent caused by Landlord's negligence or willful misconduct, Landlord is not liable for any
        loss of or damage to Tenant's property, or for injury to any person, caused by theft, fire, smoke, water,
        weather, utility interruption, the acts or omissions of other tenants or third parties, or any other cause.
      </li>
      <li>
        Tenant will indemnify and hold Landlord harmless from any claim, loss, or expense, including reasonable
        attorney's fees, arising from the acts or omissions of Tenant or Tenant's occupants, guests, or animals,
        except to the extent caused by Landlord's negligence or willful misconduct.
      </li>
    </ol>
  ),

  defaults: () => (
    <ol className="sub">
      <li>
        Tenant is in default if Tenant (1) fails to pay rent or any other amount when due; (2) fails to perform any
        other obligation under this Lease; (3) gave false or misleading information in the rental application; (4)
        abandons the Premises; or (5) or any occupant or guest engages in criminal activity, illegal drug activity,
        or violence on or near the Premises.
      </li>
      <li>
        If Tenant defaults, Landlord may terminate this Lease and recover possession after giving Tenant the written
        notice to quit that the Pennsylvania Landlord and Tenant Act of 1951 (68 P.S. § 250.501) requires:
        currently 10 days for nonpayment of rent and, for any other default or at the expiration of the Term, 15
        days for a lease of one year or less or of indeterminate time, or 30 days for a lease of more than one year.
      </li>
      <li>
        Before filing an eviction complaint in a case to which it applies, Landlord will comply with the Philadelphia
        Eviction Diversion Program (Philadelphia Code Chapter 9-800), including giving Tenant the required Notice of
        Rights for Tenants at least 30 days before filing and applying to the program.
      </li>
      <li>
        After a default, Landlord may recover all unpaid rent and charges through the end of the Term, less any rent
        Landlord actually receives by re-letting the Premises (Landlord will make reasonable efforts to re-let), the
        costs of re-letting, the cost of repairing damage, and any other damages the law allows.
      </li>
      <li>
        The prevailing party in any legal action to enforce this Lease may recover reasonable attorney's fees and
        court costs from the other party, to the extent permitted by law.
      </li>
      <li>
        Landlord's remedies are cumulative. No delay or failure by Landlord to enforce any provision, and no
        acceptance of rent after a default, waives that default or any later default. Tenant's obligations survive
        termination of this Lease.
      </li>
    </ol>
  ),

  moveOut: (
    <ol className="sub">
      <li>
        On or before the last day of the tenancy, Tenant will remove all of Tenant's property, clean the Premises,
        return every key and access device to Landlord, and give Landlord a forwarding address in writing. The
        tenancy does not end, and rent continues to accrue, until Tenant returns the keys.
      </li>
      <li>
        Personal property that Tenant leaves in the Premises after the tenancy ends will be handled under 68 P.S.
        § 250.505a. Landlord will send written notice of Tenant's rights by first-class mail to the Premises and to
        any forwarding address Tenant has provided. Tenant will have 10 days from the postmark date of that notice
        to retrieve the property or to ask Landlord to store it; if Tenant asks, Landlord will store the property
        for up to 30 days from the date of the notice at a place of Landlord's choosing, at Tenant's cost. After
        that period, Landlord may dispose of the property as the statute allows. Personal property is deemed
        abandoned in the circumstances the statute describes, including when Tenant has vacated without
        communicating an intent to return, rent is more than 15 days past due, and Landlord has posted notice of
        Tenant's rights regarding the property.
      </li>
    </ol>
  ),

  localRequirements: ({ landlord: L, philadelphia: PH }) => (
    <ol className="sub">
      <li>
        Rental License. Landlord holds Philadelphia Rental License No. {L.rentalLicense} for the Premises, as
        Philadelphia Code § 9-3902 requires.
      </li>
      <li>
        Certificate of Rental Suitability. Landlord has given Tenant a Certificate of Rental Suitability for the
        Premises issued by the Department of Licenses and Inspections on {longDate(PH.crsDate)}, together with the
        City of Philadelphia Partners in Good Housing handbook (Exhibit C), as Philadelphia Code § 9-3903 requires.
        Tenant's acknowledgment of receipt appears in the Disclosures and Acknowledgments that follow the
        signatures.
      </li>
      <li>
        Lead. The federal lead-based paint disclosure and the Philadelphia Lead Paint Disclosure and Certification
        Law disclosure (Philadelphia Code Chapter 6-800) appear in the Disclosures and Acknowledgments. The EPA
        pamphlet "Protect Your Family From Lead in Your Home" is attached as Exhibit A. Landlord has given Tenant a
        copy of the {PH.leadCertification} certificate for the Premises, which Tenant is signing as Philadelphia
        Code § 6-803 requires.
      </li>
      <li>
        Bed Bugs. The bed bug disclosure required by Philadelphia Code Chapter 9-4800 appears in the Disclosures
        and Acknowledgments, and the City of Philadelphia bed bug informational notice is attached as Exhibit B.
        Landlord maintains a bed bug control plan for the property as the Code requires.
      </li>
      <li>
        Fair Housing and Tenant Protections. Landlord complies with the federal Fair Housing Act, the Pennsylvania
        Human Relations Act, and the Philadelphia Fair Practices Ordinance. Landlord will not retaliate against
        Tenant for exercising a legal right, and will not end this Lease or change its terms because a code
        violation has been cited. A Tenant who is a victim of domestic violence or sexual assault has the
        protections the Philadelphia Code provides, including the right to end this Lease early. Nothing in this
        Lease waives any right that Tenant has under applicable law that cannot be waived.
      </li>
      <li>
        Voter Registration. Information on registering to vote is available from the Philadelphia City
        Commissioners at vote.phila.gov and in Exhibit C.
      </li>
    </ol>
  ),

  generalExtras: (
    <li>
      This Lease is written in plain language as the Pennsylvania Plain Language Consumer Contract Act (73 P.S.
      § 2201 et seq.) intends. Tenant has read this entire Lease, has had the opportunity to ask questions and
      consult an attorney, and agrees to its terms.
    </li>
  ),

  attachments: ({ philadelphia: PH }) => (
    <p>
      The following are part of this Lease: the Disclosures and Acknowledgments that follow the signatures;
      Exhibit A, the EPA pamphlet "Protect Your Family From Lead in Your Home"; Exhibit B, the City of Philadelphia
      bed bug informational notice; and Exhibit C, the City of Philadelphia Partners in Good Housing handbook.
      Landlord has also given Tenant the Certificate of Rental Suitability and the Philadelphia{' '}
      {PH.leadCertification} certificate for the Premises
      {PH.leadCertification === 'Lead-Safe' ? ' with its dust wipe laboratory results' : ''}.
    </p>
  ),

  disclosures: ({ landlord: L, philadelphia: PH }) => (
    <>
      <FederalLeadDisclosure
        knownHazards=""
        records={`City of Philadelphia ${PH.leadCertification} Certificate for the Premises dated ${longDate(PH.leadCertificationDate)}, issued following inspection by a certified lead inspector, which identified no lead-based paint hazards.`}
        pamphletExhibit="A"
      />

      <h3>Part B. Philadelphia Lead Paint Disclosure and Certification Law (Philadelphia Code Chapter 6-800)</h3>
      <p>
        Landlord certifies that the Premises has been certified {PH.leadCertification} by a certified lead inspector
        based on an inspection on {longDate(PH.leadCertificationDate)}
        {PH.leadCertification === 'Lead-Safe'
          ? ', that the certificate is valid for 48 months from that inspection and is accompanied by the laboratory results of the dust wipe tests'
          : ', and that a Lead-Free certificate does not expire'}
        , and that Landlord has given Tenant a copy of the certificate and has provided it to the Philadelphia
        Department of Public Health. Tenant acknowledges receipt of the {PH.leadCertification} certificate and is
        signing a copy of it, as Philadelphia Code § 6-803(3)(a) requires.
      </p>

      <h3>Part C. Certificate of Rental Suitability and Partners in Good Housing Handbook (Philadelphia Code § 9-3903)</h3>
      <p>
        Landlord holds Philadelphia Rental License No. {L.rentalLicense} for the Premises. Tenant acknowledges that,
        with this Lease, Tenant received (1) a Certificate of Rental Suitability for the Premises issued by the
        Department of Licenses and Inspections on {longDate(PH.crsDate)}, including Landlord's attestation to the
        suitability of the Premises, and (2) the City of Philadelphia Partners in Good Housing handbook, attached as
        Exhibit C.
      </p>

      <h3>Part D. Bed Bug Disclosure and Information (Philadelphia Code Chapter 9-4800)</h3>
      <p>
        <strong>Infestation history.</strong>{' '}
        {PH.bedBugsReported
          ? `Landlord discloses the following bed bug infestation and remediation history for the Premises during the 120 days before the Start Date, including any ongoing remediation: ${PH.bedBugDetails}`
          : 'Landlord has no knowledge of any bed bug infestation in, or bed bug remediation of, the Premises during the 120 days before the Start Date, and no remediation is ongoing.'}
      </p>
      <p>
        <strong>Informational notice and control plan.</strong> The City of Philadelphia bed bug informational notice
        is attached as Exhibit B, and Tenant acknowledges receiving it. Landlord maintains a bed bug control plan for
        the property as Chapter 9-4800 requires.
      </p>
      <p>
        <strong>Responsibilities.</strong> Tenant will notify Landlord in writing within 5 business days after
        finding or suspecting bed bugs, and will not attempt to treat an infestation with foggers or other
        over-the-counter products. Landlord will acknowledge the notice within 5 business days and, within 10 business
        days after receiving it, will hire a pest management professional to investigate and, if bed bugs are found,
        to remediate until there is no longer evidence of bed bugs, with follow-up monitoring for the next 12 months,
        all as Chapter 9-4800 requires. Tenant will give access for every inspection and treatment and will prepare
        the Premises as the pest management professional instructs, including laundering and bagging belongings.
        Landlord will pay the full cost of remediation when Tenant reports the bed bugs within the first year of the
        tenancy or within 180 days after bed bugs are found in an adjacent unit; in all other cases the cost is
        shared between Landlord and Tenant as Chapter 9-4800 provides.
      </p>
    </>
  ),

  disclosureCertification:
    'The parties have reviewed the information above and certify, to the best of their knowledge, that the information they have provided is true and accurate. Tenant acknowledges receipt of the documents described in Parts A through D, including Exhibits A, B, and C.',

  LocalStep,
  validateLocal,
  validateMoney,
};
