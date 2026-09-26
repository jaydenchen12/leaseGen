import type { ReactNode } from 'react';
import { UTILITIES, type LeaseInput } from './types';
import { joinNames, longDate, money, ordinal, proratedRent } from './format';

const LEAD_WARNING =
  'Housing built before 1978 may contain lead-based paint. Lead from paint, paint chips, and dust can pose health hazards if not managed properly. Lead exposure is especially harmful to young children and pregnant women. Before renting pre-1978 housing, lessors must disclose the presence of known lead-based paint and/or lead-based paint hazards in the dwelling. Lessees must also receive a federally approved pamphlet on lead poisoning prevention.';

export function premisesAddress(input: LeaseInput): string {
  const { street, unit, zip } = input.property;
  return `${street}${unit ? `, Unit ${unit}` : ''}, Philadelphia, Pennsylvania ${zip}`;
}

function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Box({ on }: { on: boolean }) {
  return <span className={on ? 'cb on' : 'cb'} />;
}

function SigRow({ label, name, anchor }: { label: string; name: string; anchor: string }) {
  return (
    <div className="sig-row">
      <div className="sig-name">
        <div className="sig-space">
          <span className="anchor">/sig_{anchor}/</span>
        </div>
        <div className="sig-label">
          {label}: {name}
        </div>
      </div>
      <div className="sig-date">
        <div className="sig-space">
          <span className="anchor">/date_{anchor}/</span>
        </div>
        <div className="sig-label">Date</div>
      </div>
    </div>
  );
}

function Signatures({ input, lead }: { input: LeaseInput; lead: string }) {
  return (
    <div className="signatures">
      <p>{lead}</p>
      <SigRow label="LANDLORD" name={input.landlord.name} anchor="landlord" />
      {input.tenants.map((t, i) => (
        <SigRow key={i} label="TENANT" name={t.name} anchor={`tenant${i + 1}`} />
      ))}
    </div>
  );
}

export function Lease({ input }: { input: LeaseInput }) {
  const { property: P, landlord: L, tenants, term, rent, deposit, fees, utilities, pets, philadelphia: PH } = input;
  const address = premisesAddress(input);
  const tenantNames = joinNames(tenants.map((t) => t.name));
  const prorated = term.start ? proratedRent(rent.monthly, term.start) : null;
  const tenantUtilities = UTILITIES.filter((u) => utilities[u] === 'tenant');
  const occupants = input.occupants
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const stipulations = input.stipulations
    .trim()
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const landlordAddress = `${L.street}, ${L.city}, ${L.state} ${L.zip}`;

  return (
    <div className="lease">
      <h1>Residential Lease Agreement</h1>
      <p className="subtitle">{address}</p>

      <table>
        <tbody>
          <tr>
            <th>Premises</th>
            <td>{address}</td>
          </tr>
          <tr>
            <th>Landlord</th>
            <td>
              {L.name}, {landlordAddress}, {L.phone}, {L.email}
            </td>
          </tr>
          <tr>
            <th>Tenant(s)</th>
            <td>{tenantNames}</td>
          </tr>
          <tr>
            <th>Term</th>
            <td>
              {longDate(term.start)} through {longDate(term.end)}
              {term.endOfTerm === 'monthToMonth' ? ', then month-to-month' : ', then Tenant must vacate'}
            </td>
          </tr>
          <tr>
            <th>Monthly Rent</th>
            <td>
              {money(rent.monthly)}, due on the {ordinal(rent.dueDay)} day of each month
              {prorated && prorated.partial ? `; first partial month prorated to ${money(prorated.amount)}` : ''}
            </td>
          </tr>
          <tr>
            <th>Security Deposit</th>
            <td>{money(deposit.amount)}</td>
          </tr>
          <tr>
            <th>Late Charge</th>
            <td>
              {money(fees.lateFee)} if rent is not received within {fees.graceDays} days after the due date
              {fees.dailyLateFee > 0 ? `, plus ${money(fees.dailyLateFee)} per day thereafter` : ''}
            </td>
          </tr>
          <tr>
            <th>Utilities Paid by Tenant</th>
            <td>{tenantUtilities.length ? tenantUtilities.join(', ') : 'None'}</td>
          </tr>
          <tr>
            <th>Pets</th>
            <td>{pets.allowed ? `Permitted: ${pets.description}` : 'Not permitted'}</td>
          </tr>
          <tr>
            <th>Smoking</th>
            <td>
              {input.smoking === 'prohibited' && 'Prohibited'}
              {input.smoking === 'outdoorsOnly' && 'Outdoors only'}
              {input.smoking === 'allowed' && 'Permitted'}
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        This Residential Lease Agreement (the "Lease") is entered into as of the date of the last signature below. The
        table above summarizes key terms; the numbered sections that follow control.
      </p>

      <Sec title="Parties">
        <p>
          This Lease is between {L.name}, whose address is {landlordAddress} ("Landlord"), and {tenantNames} (each a
          "Tenant" and, together, "Tenant"). If more than one person signs as Tenant, each is jointly and severally
          liable for every obligation under this Lease, and notice given by Landlord to any one Tenant is notice to all
          Tenants.
        </p>
      </Sec>

      <Sec title="Premises">
        <p>
          Landlord leases to Tenant, and Tenant leases from Landlord, the residential dwelling located at {address} (the
          "Premises"), together with the following:
        </p>
        <ol className="sub">
          <li>Appliances and furnishings included: {P.furnishings}.</li>
          <li>Parking: {P.parking}.</li>
          <li>
            Keys and access devices: Landlord will give Tenant {P.keys}. Tenant may not duplicate keys, change or add
            locks, or alter any access device without Landlord's written consent, and must return every key and access
            device when the tenancy ends. Tenant will pay the cost of replacing lost keys or re-keying locks.
          </li>
        </ol>
      </Sec>

      <Sec title="Term">
        <p>
          The term of this Lease begins on {longDate(term.start)} (the "Start Date") and ends at 11:59 p.m. on{' '}
          {longDate(term.end)} (the "End Date") (the "Term").
        </p>
        {term.endOfTerm === 'monthToMonth' ? (
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
        )}
      </Sec>

      <Sec title="Rent">
        <p>
          Tenant will pay Landlord rent of {money(rent.monthly)} per month (the "Monthly Rent"), in advance, on or
          before the {ordinal(rent.dueDay)} day of each month, without demand, deduction, or setoff.
          {prorated && prorated.partial
            ? ` Because the Term begins on ${longDate(term.start)}, rent for the first partial month (${prorated.days} days, through ${prorated.through}) is prorated to ${money(prorated.amount)} and is due on or before the Start Date.`
            : ' The first month’s rent is due on or before the Start Date.'}
        </p>
        <ol className="sub">
          <li>
            Payment method: {rent.paymentInstructions}. Landlord may change the payment method or address on 30 days'
            written notice.
          </li>
          <li>
            The first rent payment and the Security Deposit must be received in full before Landlord delivers keys.
          </li>
          <li>
            Landlord may apply any payment to the oldest amounts outstanding first. Landlord's acceptance of a partial
            payment does not waive Landlord's right to the balance or any remedy.
          </li>
          <li>Tenant may not withhold or reduce rent except as Pennsylvania law expressly allows.</li>
        </ol>
      </Sec>

      <Sec title="Late Charges and Returned Payments">
        <ol className="sub">
          <li>
            If Landlord does not receive any installment of rent within {fees.graceDays} days after its due date,
            Tenant will pay a late charge of {money(fees.lateFee)}
            {fees.dailyLateFee > 0
              ? `, plus ${money(fees.dailyLateFee)} for each additional day the rent remains unpaid`
              : ''}
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
      </Sec>

      <Sec title="Security Deposit">
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
      </Sec>

      <Sec title="Utilities and Services">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Paid by</th>
            </tr>
          </thead>
          <tbody>
            {UTILITIES.map((u) => (
              <tr key={u}>
                <th>{u}</th>
                <td>{utilities[u] === 'tenant' ? 'Tenant' : 'Landlord'}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
      </Sec>

      <Sec title="Use and Occupancy">
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
      </Sec>

      <Sec title="Pets">
        {pets.allowed ? (
          <ol className="sub">
            <li>Tenant may keep only the following animal(s) on the Premises: {pets.description}.</li>
            <li>
              {pets.deposit > 0
                ? `Tenant will pay a pet deposit of ${money(pets.deposit)}, which is part of the Security Deposit and is refundable subject to Section 6. `
                : ''}
              {pets.monthlyRent > 0
                ? `Tenant will pay pet rent of ${money(pets.monthlyRent)} per month together with the Monthly Rent. `
                : ''}
              Tenant is responsible for all damage, odors, stains, waste, and pest treatment caused by any animal, will
              keep every animal licensed and vaccinated as Philadelphia requires, leashed or contained when outside the
              Premises, and will not allow any animal to disturb others.
            </li>
            <li>No other animal may be kept on the Premises, even temporarily, without Landlord's written consent.</li>
            <li>
              An assistance animal that Landlord must allow under fair housing law is not a pet; no pet deposit or pet
              rent applies to it. Tenant must request that accommodation in writing.
            </li>
          </ol>
        ) : (
          <p>
            No animal of any kind may be kept on the Premises, even temporarily, without Landlord's prior written
            consent. This does not apply to an assistance animal that Landlord must allow under fair housing law; Tenant
            must request that accommodation in writing.
          </p>
        )}
      </Sec>

      <Sec title="Smoking">
        {input.smoking === 'prohibited' && (
          <p>
            Smoking and vaping of any substance, including tobacco, cannabis, and electronic cigarettes, are prohibited
            everywhere on the Premises and in any building or common area of which the Premises is a part, by Tenant and
            by every occupant and guest. Tenant will pay the cost of removing smoke odor or residue and repairing any
            smoke-related damage.
          </p>
        )}
        {input.smoking === 'outdoorsOnly' && (
          <p>
            Smoking and vaping of any substance, including tobacco, cannabis, and electronic cigarettes, are prohibited
            inside the Premises and inside any building of which the Premises is a part. Smoking is permitted only
            outdoors, at least 15 feet from any door, window, or vent, and all cigarette waste must be disposed of
            properly. Tenant will pay the cost of removing smoke odor or residue and repairing any smoke-related damage.
          </p>
        )}
        {input.smoking === 'allowed' && (
          <p>
            Smoking is permitted in the Premises. Tenant will pay the cost of removing smoke odor and residue and
            repairing any smoke-related damage beyond normal wear and tear when the tenancy ends.
          </p>
        )}
        <p>
          Building smoking policy, disclosed as the Philadelphia Code requires: smoking is{' '}
          {input.buildingSmokingPolicy === 'prohibitedInAllUnits' && 'prohibited in all dwelling units'}
          {input.buildingSmokingPolicy === 'allowedInAllUnits' && 'allowed in all dwelling units'}
          {input.buildingSmokingPolicy === 'allowedInSomeUnits' && 'allowed in some dwelling units'} of the building
          that contains the Premises.
        </p>
      </Sec>

      <Sec title="Condition of Premises">
        <p>
          Tenant has inspected the Premises and accepts it in its present condition, in good order and repair, except for
          any item Tenant lists on a written move-in condition report delivered to Landlord within 5 days after the Start
          Date. Landlord makes no promise about the condition of the Premises other than those written in this Lease and
          those implied by law. When the tenancy ends, Tenant will return the Premises in the same condition as at the
          Start Date, normal wear and tear excepted, clean and free of Tenant's property and trash.
        </p>
      </Sec>

      <Sec title="Maintenance and Repairs">
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
      </Sec>

      <Sec title="Smoke and Carbon Monoxide Alarms">
        <p>
          Landlord will deliver the Premises with working smoke alarms and, as required by the Pennsylvania Carbon
          Monoxide Alarm Standards Act (35 P.S. § 7221 et seq.), working carbon monoxide alarms. Tenant will test every
          alarm monthly, replace batteries as needed, never disable, remove, or cover an alarm, and immediately notify
          Landlord in writing of any alarm that does not work. Tenant is liable for any damage that results from
          tampering with an alarm.
        </p>
      </Sec>

      <Sec title="Alterations">
        <p>
          Tenant will not paint, wallpaper, drill into tile, brick, or cabinetry, change or add locks, install fixtures
          or equipment, or make any other alteration to the Premises without Landlord's prior written consent. Tenant
          may hang pictures with small nails or hooks but must repair the holes when the tenancy ends. Any alteration or
          fixture that Tenant installs becomes Landlord's property unless Landlord requires Tenant to remove it and
          restore the Premises. A satellite dish or antenna may be installed only as federal rules permit, at Tenant's
          expense, within areas under Tenant's exclusive control, and without penetrating the roof or exterior walls.
        </p>
      </Sec>

      <Sec title="Landlord's Access">
        <p>
          Landlord and Landlord's agents and contractors may enter the Premises at reasonable times after giving Tenant
          at least 24 hours' written notice (including by email or text message) to inspect, make repairs or improvements, show
          the Premises to prospective tenants, buyers, lenders, insurers, or inspectors, or for any other lawful purpose.
          No notice is required in an emergency, when Tenant has requested a repair, or when Landlord reasonably believes
          the Premises has been abandoned. During the last 60 days of the Term, Landlord may show the Premises to
          prospective tenants and place a "for rent" sign on the property. Tenant will not unreasonably deny access, and
          refusing lawful access is a default under this Lease.
        </p>
      </Sec>

      <Sec title="Assignment and Subletting">
        <p>
          Tenant will not assign this Lease, sublet all or any part of the Premises, or allow any other person to occupy
          the Premises, including through Airbnb or any other short-term rental arrangement, without Landlord's prior
          written consent, which Landlord may withhold in its sole discretion. Any attempted assignment or sublease
          without consent is void and is a default under this Lease. Landlord's consent to one assignment or sublease is
          not consent to any other, and Tenant remains liable under this Lease after any assignment or sublease.
        </p>
      </Sec>

      <Sec title="Insurance and Liability">
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
      </Sec>

      <Sec title="Damage or Destruction">
        <p>
          If the Premises is damaged by fire or other casualty not caused by Tenant or Tenant's occupants or guests so
          that it is unfit to live in, either party may terminate this Lease by written notice to the other, and rent
          stops as of the date Tenant vacates. If neither party terminates, Landlord will repair the Premises within a
          reasonable time, and rent abates in proportion to the part of the Premises that cannot be used until the
          repairs are complete. If Tenant or Tenant's occupants or guests caused the damage, rent does not abate and
          Tenant is liable for the loss.
        </p>
      </Sec>

      <Sec title="Default and Remedies">
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
      </Sec>

      <Sec title="Move-Out and Abandoned Property">
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
      </Sec>

      <Sec title="Notices">
        <p>
          Except for a notice that Pennsylvania law requires to be served in a particular way, every notice under this
          Lease must be in writing and delivered by hand, by first-class or certified mail, or by email: to Landlord at{' '}
          {landlordAddress} or {L.email}; and to Tenant at the Premises or at the email address listed for each Tenant
          below. A mailed notice is effective 3 days after it is postmarked; a hand-delivered or emailed notice is
          effective when delivered or sent. Either party may change its notice address by written notice to the other.
          Tenant agrees that Landlord may send routine communications by text message or email.
        </p>
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t, i) => (
              <tr key={i}>
                <th>{t.name}</th>
                <td>{t.email}</td>
                <td>{t.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sec>

      <Sec title="Philadelphia Requirements">
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
      </Sec>

      <Sec title="General Provisions">
        <ol className="sub">
          <li>
            This Lease, including the Disclosures and Acknowledgments and Exhibits A, B, and C, is the entire agreement between
            Landlord and Tenant. No oral statement or promise is part of this Lease. This Lease may be changed only by a
            writing signed by Landlord and Tenant.
          </li>
          <li>
            If any provision of this Lease is held invalid or unenforceable, the rest of this Lease remains in effect,
            and the provision will be enforced to the fullest extent the law allows.
          </li>
          <li>
            This Lease is governed by the laws of the Commonwealth of Pennsylvania. Any legal action concerning this
            Lease will be brought in the courts of Philadelphia County, Pennsylvania.
          </li>
          <li>
            This Lease binds and benefits Landlord and Tenant and their heirs, personal representatives, successors,
            and permitted assigns. Time is of the essence of every provision of this Lease. Headings are for
            convenience only.
          </li>
          <li>
            This Lease may be signed electronically and in counterparts. An electronic signature, and a scanned or
            electronically transmitted copy of a signed Lease, has the same effect as an original under the federal
            Electronic Signatures in Global and National Commerce Act and the Pennsylvania Electronic Transactions Act
            (73 P.S. § 2260.101 et seq.).
          </li>
          <li>
            Nothing in this Lease limits any right of a Tenant in military service under the Servicemembers Civil
            Relief Act.
          </li>
          <li>
            This Lease is written in plain language as the Pennsylvania Plain Language Consumer Contract Act (73 P.S.
            § 2201 et seq.) intends. Tenant has read this entire Lease, has had the opportunity to ask questions and
            consult an attorney, and agrees to its terms.
          </li>
        </ol>
      </Sec>

      <Sec title="Additional Terms and Stipulations">
        {stipulations.length ? (
          <ol className="num">
            {stipulations.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        ) : (
          <p>None.</p>
        )}
      </Sec>

      <Sec title="Attachments">
        <p>
          The following are part of this Lease: the Disclosures and Acknowledgments that follow the signatures;
          Exhibit A, the EPA pamphlet "Protect Your Family From Lead in Your Home"; Exhibit B, the City of Philadelphia
          bed bug informational notice; and Exhibit C, the City of Philadelphia Partners in Good Housing handbook.
          Landlord has also given Tenant the Certificate of Rental Suitability and the Philadelphia{' '}
          {PH.leadCertification} certificate for the Premises
          {PH.leadCertification === 'Lead-Safe' ? ' with its dust wipe laboratory results' : ''}.
        </p>
      </Sec>

      <Signatures
        input={input}
        lead="By signing below, Landlord and Tenant agree to every term of this Lease, including the Disclosures and Acknowledgments and Exhibits A, B, and C."
      />

      <div className="page-break">
        <h1>Disclosures and Acknowledgments</h1>
        <p className="subtitle">
          Residential Lease Agreement for {address} (built {P.yearBuilt}), Term beginning {longDate(term.start)}
        </p>

        <h3>Part A. Federal Lead-Based Paint Disclosure (42 U.S.C. § 4852d; 24 CFR Part 35; 40 CFR Part 745)</h3>
        <div className="box">
          <p>
            <strong>Lead Warning Statement.</strong> {LEAD_WARNING}
          </p>
        </div>
        <p>
          <strong>Lessor's Disclosure.</strong>
        </p>
        <p>(a) Presence of lead-based paint and/or lead-based paint hazards:</p>
        <p>
          <Box on={false} />
          (i) Known lead-based paint and/or lead-based paint hazards are present in the housing.
        </p>
        <p>
          <Box on />
          (ii) Lessor has no knowledge of lead-based paint and/or lead-based paint hazards in the housing.
        </p>
        <p>(b) Records and reports available to the lessor:</p>
        <p>
          <Box on />
          (i) Lessor has provided the lessee with all available records and reports pertaining to lead-based paint
          and/or lead-based paint hazards in the housing, namely: City of Philadelphia {PH.leadCertification}{' '}
          Certificate for the Premises dated {longDate(PH.leadCertificationDate)}, issued following inspection by a
          certified lead inspector, which identified no lead-based paint hazards.
        </p>
        <p>
          <Box on={false} />
          (ii) Lessor has no reports or records pertaining to lead-based paint and/or lead-based paint hazards in the
          housing.
        </p>
        <p>
          <strong>Lessee's Acknowledgment.</strong>
        </p>
        <p>
          <Box on />
          (c) Lessee has received copies of all information listed above.
        </p>
        <p>
          <Box on />
          (d) Lessee has received the pamphlet "Protect Your Family From Lead in Your Home" (Exhibit A).
        </p>
        <p>(e) No agent is involved in this lease on behalf of the lessor.</p>

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

        <Signatures
          input={input}
          lead="The parties have reviewed the information above and certify, to the best of their knowledge, that the information they have provided is true and accurate. Tenant acknowledges receipt of the documents described in Parts A through D, including Exhibits A, B, and C."
        />
      </div>
    </div>
  );
}
