import type { ReactNode } from 'react';
import { UTILITIES, type LeaseInput } from './types';
import { cities } from './cities';
import { joinNames, longDate, money, ordinal, proratedRent } from './format';

export function premisesAddress(input: LeaseInput): string {
  const city = cities[input.city];
  const { street, unit, zip } = input.property;
  return `${street}${unit ? `, Unit ${unit}` : ''}, ${city.name}, ${city.state} ${zip}`;
}

export function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Box({ on }: { on: boolean }) {
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
  const city = cities[input.city];
  const { property: P, landlord: L, tenants, term, rent, deposit, fees, utilities, pets } = input;
  const address = premisesAddress(input);
  const tenantNames = joinNames(tenants.map((t) => t.name));
  const prorated = term.start ? proratedRent(rent.monthly, term.start) : null;
  const tenantUtilities = UTILITIES.filter((u) => utilities[u] === 'tenant');
  const stipulations = input.stipulations
    .trim()
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const landlordAddress = `${L.street}, ${L.city}, ${L.state} ${L.zip}`;
  const exhibitLetters = joinNames(city.exhibits.map((e) => e.letter));

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
              {city.termSummary(input)}
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
        {city.term(input)}
      </Sec>

      <Sec title="Rent">
        <p>
          Tenant will pay Landlord rent of {money(rent.monthly)} per month (the "Monthly Rent"), in advance, on or
          before the {ordinal(rent.dueDay)} day of each month, without demand, deduction, or setoff.
          {prorated && prorated.partial
            ? ` Because the Term begins on ${longDate(term.start)}, rent for the first partial month (${prorated.days} days, through ${prorated.through}) is prorated to ${money(prorated.amount)} and is due on or before the Start Date.`
            : ' The first month’s rent is due on or before the Start Date.'}
        </p>
        {city.rentNotes(input)}
      </Sec>

      <Sec title="Late Charges and Returned Payments">{city.lateCharges(input)}</Sec>

      <Sec title="Security Deposit">{city.securityDeposit(input)}</Sec>

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
        {city.utilitiesNotes(input)}
      </Sec>

      <Sec title="Use and Occupancy">{city.occupancy(input)}</Sec>

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
              keep every animal licensed and vaccinated as {city.name} requires, leashed or contained when outside the
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
        {city.smokingNote(input)}
      </Sec>

      <Sec title="Condition of Premises">{city.condition}</Sec>

      <Sec title="Maintenance and Repairs">{city.maintenance(input)}</Sec>

      <Sec title="Smoke and Carbon Monoxide Alarms">{city.alarms}</Sec>

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

      <Sec title="Landlord's Access">{city.access}</Sec>

      <Sec title="Assignment and Subletting">
        <p>
          Tenant will not assign this Lease, sublet all or any part of the Premises, or allow any other person to occupy
          the Premises, including through Airbnb or any other short-term rental arrangement, without Landlord's prior
          written consent, which Landlord may withhold in its sole discretion. Any attempted assignment or sublease
          without consent is void and is a default under this Lease. Landlord's consent to one assignment or sublease is
          not consent to any other, and Tenant remains liable under this Lease after any assignment or sublease.
        </p>
      </Sec>

      <Sec title="Insurance and Liability">{city.insurance(input)}</Sec>

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

      <Sec title="Default and Remedies">{city.defaults(input)}</Sec>

      <Sec title="Move-Out and Abandoned Property">{city.moveOut}</Sec>

      <Sec title="Notices">
        <p>
          Except for a notice that {city.state} law requires to be served in a particular way, every notice under this
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

      <Sec title={`${city.name} Requirements`}>{city.localRequirements(input)}</Sec>

      <Sec title="General Provisions">
        <ol className="sub">
          <li>
            This Lease, including the Disclosures and Acknowledgments and Exhibits {exhibitLetters}, is the entire
            agreement between Landlord and Tenant. No oral statement or promise is part of this Lease. This Lease may be
            changed only by a writing signed by Landlord and Tenant.
          </li>
          <li>
            If any provision of this Lease is held invalid or unenforceable, the rest of this Lease remains in effect,
            and the provision will be enforced to the fullest extent the law allows.
          </li>
          <li>
            This Lease is governed by the laws of {city.jurisdiction}. Any legal action concerning this Lease will
            be brought in the courts of {city.county}, {city.state}.
          </li>
          <li>
            This Lease binds and benefits Landlord and Tenant and their heirs, personal representatives, successors,
            and permitted assigns. Time is of the essence of every provision of this Lease. Headings are for
            convenience only.
          </li>
          <li>
            This Lease may be signed electronically and in counterparts. An electronic signature, and a scanned or
            electronically transmitted copy of a signed Lease, has the same effect as an original under the federal
            Electronic Signatures in Global and National Commerce Act and {city.eSignLaw}.
          </li>
          <li>
            Nothing in this Lease limits any right of a Tenant in military service under the Servicemembers Civil
            Relief Act.
          </li>
          {city.generalExtras}
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

      <Sec title="Attachments">{city.attachments(input)}</Sec>

      <Signatures
        input={input}
        lead={`By signing below, Landlord and Tenant agree to every term of this Lease, including the Disclosures and Acknowledgments and Exhibits ${exhibitLetters}.`}
      />

      <div className="page-break">
        <h1>Disclosures and Acknowledgments</h1>
        <p className="subtitle">
          Residential Lease Agreement for {address} (built {P.yearBuilt}), Term beginning {longDate(term.start)}
        </p>
        {city.disclosures(input)}
        <Signatures input={input} lead={city.disclosureCertification} />
      </div>
    </div>
  );
}
