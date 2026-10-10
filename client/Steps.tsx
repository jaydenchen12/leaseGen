import { CITIES, type Tenant, UTILITIES } from '../shared/types';
import { money, proratedRent } from '../shared/format';
import { cities } from '../shared/cities';
import type { StepProps as Props } from '../shared/cities/types';
import { Area, Check, Field, Num, Radio, Text } from '../shared/fields';
import type { Step } from './validate';

function Property({ lease, set }: Props) {
  const p = lease.property;
  const up = (patch: Partial<typeof p>) => set({ property: { ...p, ...patch } });
  const city = cities[lease.city];
  return (
    <>
      <Field label="City">
        <Radio
          name="city"
          value={lease.city}
          options={CITIES.map((key) => [key, `${cities[key].name}, ${cities[key].state}`])}
          onChange={(city) => set({ city, ...cities[city].presets(lease) })}
        />
      </Field>
      <Field label="Street address">
        <Text value={p.street} onChange={(street) => up({ street })} />
      </Field>
      <div className="row row3">
        <Field label="Unit (blank if none)">
          <Text value={p.unit} onChange={(unit) => up({ unit })} />
        </Field>
        <Field label="ZIP code">
          <Text value={p.zip} onChange={(zip) => up({ zip })} />
        </Field>
        <Field label="Year built">
          <Num value={p.yearBuilt} onChange={(yearBuilt) => up({ yearBuilt })} />
        </Field>
      </div>
      <p className="hint">
        {city.name}, {city.state}
      </p>
      <Field label="Appliances and furnishings included">
        <Text value={p.furnishings} onChange={(furnishings) => up({ furnishings })} />
      </Field>
      <Field label="Parking">
        <Text value={p.parking} onChange={(parking) => up({ parking })} />
      </Field>
      <Field label="Keys and access devices provided">
        <Text value={p.keys} onChange={(keys) => up({ keys })} />
      </Field>
    </>
  );
}

function LandlordStep({ lease, set }: Props) {
  const L = lease.landlord;
  const up = (patch: Partial<typeof L>) => set({ landlord: { ...L, ...patch } });
  return (
    <>
      <p className="hint">Saved in this browser and reused for the next lease.</p>
      <Field label="Landlord name (person or company, as shown on the Rental License)">
        <Text value={L.name} onChange={(name) => up({ name })} />
      </Field>
      <Field label="Mailing street address">
        <Text value={L.street} onChange={(street) => up({ street })} />
      </Field>
      <div className="row row3">
        <Field label="City">
          <Text value={L.city} onChange={(city) => up({ city })} />
        </Field>
        <Field label="State">
          <Text value={L.state} onChange={(state) => up({ state })} />
        </Field>
        <Field label="ZIP code">
          <Text value={L.zip} onChange={(zip) => up({ zip })} />
        </Field>
      </div>
      <div className="row">
        <Field label="Phone">
          <Text type="tel" value={L.phone} onChange={(phone) => up({ phone })} />
        </Field>
        <Field label="Email">
          <Text type="email" value={L.email} onChange={(email) => up({ email })} />
        </Field>
      </div>
      <Field label={cities[lease.city].licenseLabel}>
        <Text value={L.rentalLicense} onChange={(rentalLicense) => up({ rentalLicense })} />
      </Field>
    </>
  );
}

function Tenants({ lease, set }: Props) {
  const tenants = lease.tenants;
  const update = (i: number, patch: Partial<Tenant>) =>
    set({ tenants: tenants.map((t, j) => (j === i ? { ...t, ...patch } : t)) });
  return (
    <>
      {tenants.map((t, i) => (
        <div className="card" key={i}>
          <div className="card-head">
            <strong>Tenant {i + 1}</strong>
            {tenants.length > 1 && (
              <button className="link" onClick={() => set({ tenants: tenants.filter((_, j) => j !== i) })}>
                Remove
              </button>
            )}
          </div>
          <Field label="Full legal name">
            <Text value={t.name} onChange={(name) => update(i, { name })} />
          </Field>
          <div className="row">
            <Field label="Email">
              <Text type="email" value={t.email} onChange={(email) => update(i, { email })} />
            </Field>
            <Field label="Phone">
              <Text type="tel" value={t.phone} onChange={(phone) => update(i, { phone })} />
            </Field>
          </div>
        </div>
      ))}
      <button onClick={() => set({ tenants: [...tenants, { name: '', email: '', phone: '' }] })}>Add tenant</button>
      <Field label="Other occupants who will not sign (one per line)" hint="For example minor children. Leave blank if none.">
        <Area value={lease.occupants} onChange={(occupants) => set({ occupants })} />
      </Field>
    </>
  );
}

function Term({ lease, set }: Props) {
  const t = lease.term;
  const up = (patch: Partial<typeof t>) => set({ term: { ...t, ...patch } });
  return (
    <>
      <div className="row">
        <Field label="Start date">
          <Text type="date" value={t.start} onChange={(start) => up({ start })} />
        </Field>
        <Field label="End date">
          <Text type="date" value={t.end} onChange={(end) => up({ end })} />
        </Field>
      </div>
      {cities[lease.city].supportsVacateAtEnd ? (
        <Field label="At the end of the term">
          <Radio
            name="endOfTerm"
            value={t.endOfTerm}
            options={[
              ['monthToMonth', 'Lease continues month-to-month'],
              ['vacate', 'Lease ends and tenant must move out'],
            ]}
            onChange={(endOfTerm) => up({ endOfTerm })}
          />
        </Field>
      ) : (
        <p className="hint">
          In {cities[lease.city].name} the lease continues month-to-month after the end date unless it is renewed,
          and the landlord needs just cause to end it.
        </p>
      )}
    </>
  );
}

function Rent({ lease, set }: Props) {
  const r = lease.rent;
  const up = (patch: Partial<typeof r>) => set({ rent: { ...r, ...patch } });
  const prorated = lease.term.start && r.monthly > 0 ? proratedRent(r.monthly, lease.term.start) : null;
  return (
    <>
      <div className="row">
        <Field label="Monthly rent ($)">
          <Num value={r.monthly} step={0.01} onChange={(monthly) => up({ monthly })} />
        </Field>
        <Field label="Due on day of month (1 to 28)">
          <Num value={r.dueDay} onChange={(dueDay) => up({ dueDay })} />
        </Field>
      </div>
      {prorated && prorated.partial && (
        <p className="hint">
          First partial month is prorated automatically: {money(prorated.amount)} for {prorated.days} days through{' '}
          {prorated.through}.
        </p>
      )}
      <Field label="Payment method">
        <Text value={r.paymentInstructions} onChange={(paymentInstructions) => up({ paymentInstructions })} />
      </Field>
    </>
  );
}

function DepositAndFees({ lease, set }: Props) {
  const d = lease.deposit;
  const f = lease.fees;
  const upD = (patch: Partial<typeof d>) => set({ deposit: { ...d, ...patch } });
  const upF = (patch: Partial<typeof f>) => set({ fees: { ...f, ...patch } });
  return (
    <>
      <Field label="Security deposit ($)" hint={cities[lease.city].depositHint}>
        <Num value={d.amount} step={0.01} onChange={(amount) => upD({ amount })} />
      </Field>
      <Field label="Deposit bank name" hint="The deposit is held in a separate account and the bank is disclosed in the lease.">
        <Text value={d.bankName} onChange={(bankName) => upD({ bankName })} />
      </Field>
      <Field label="Deposit bank address">
        <Text value={d.bankAddress} onChange={(bankAddress) => upD({ bankAddress })} />
      </Field>
      <div className="row">
        <Field label="Grace period (days after due date)">
          <Num value={f.graceDays} onChange={(graceDays) => upF({ graceDays })} />
        </Field>
        <Field label="Late charge ($)">
          <Num value={f.lateFee} step={0.01} onChange={(lateFee) => upF({ lateFee })} />
        </Field>
      </div>
      <div className="row">
        <Field label="Additional late charge per day ($, 0 for none)">
          <Num value={f.dailyLateFee} step={0.01} onChange={(dailyLateFee) => upF({ dailyLateFee })} />
        </Field>
        <Field label="Returned payment charge ($)">
          <Num value={f.returnedPaymentFee} step={0.01} onChange={(returnedPaymentFee) => upF({ returnedPaymentFee })} />
        </Field>
      </div>
    </>
  );
}

function Utilities({ lease, set }: Props) {
  return (
    <table className="util">
      <thead>
        <tr>
          <th>Service</th>
          <th>Landlord</th>
          <th>Tenant</th>
        </tr>
      </thead>
      <tbody>
        {UTILITIES.map((u) => (
          <tr key={u}>
            <td>{u}</td>
            {(['landlord', 'tenant'] as const).map((payer) => (
              <td key={payer}>
                <input
                  type="radio"
                  name={u}
                  checked={lease.utilities[u] === payer}
                  onChange={() => set({ utilities: { ...lease.utilities, [u]: payer } })}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Policies({ lease, set }: Props) {
  const p = lease.pets;
  const upP = (patch: Partial<typeof p>) => set({ pets: { ...p, ...patch } });
  return (
    <>
      <Check checked={p.allowed} onChange={(allowed) => upP({ allowed })} label="Pets allowed" />
      {p.allowed && (
        <>
          <Field label="Permitted pet(s)" hint="For example: one cat named Milo, or one dog under 40 pounds.">
            <Text value={p.description} onChange={(description) => upP({ description })} />
          </Field>
          <div className="row">
            <Field label="Pet deposit ($, counts toward the deposit cap)">
              <Num value={p.deposit} step={0.01} onChange={(deposit) => upP({ deposit })} />
            </Field>
            {cities[lease.city].allowsPetRent && (
              <Field label="Monthly pet rent ($)">
                <Num value={p.monthlyRent} step={0.01} onChange={(monthlyRent) => upP({ monthlyRent })} />
              </Field>
            )}
          </div>
        </>
      )}
      <Field label="Smoking">
        <Radio
          name="smoking"
          value={lease.smoking}
          options={[
            ['prohibited', 'Prohibited everywhere on the property'],
            ['outdoorsOnly', 'Outdoors only'],
            ['allowed', 'Permitted'],
          ]}
          onChange={(smoking) => set({ smoking })}
        />
      </Field>
      <Field label="Building smoking policy" hint="Philadelphia requires landlords of buildings with 3 or more units to disclose the building policy.">
        <Radio
          name="buildingSmokingPolicy"
          value={lease.buildingSmokingPolicy}
          options={[
            ['prohibitedInAllUnits', 'Smoking prohibited in all dwelling units'],
            ['allowedInAllUnits', 'Smoking allowed in all dwelling units'],
            ['allowedInSomeUnits', 'Smoking allowed in some dwelling units'],
          ]}
          onChange={(buildingSmokingPolicy) => set({ buildingSmokingPolicy })}
        />
      </Field>
      <Check
        checked={lease.rentersInsuranceRequired}
        onChange={(rentersInsuranceRequired) => set({ rentersInsuranceRequired })}
        label="Renter's insurance required ($100,000 liability minimum)"
      />
    </>
  );
}

function Stipulations({ lease, set }: Props) {
  return (
    <Field label="Special stipulations" hint="Separate stipulations with a blank line. Each becomes a numbered term in the lease.">
      <Area value={lease.stipulations} onChange={(stipulations) => set({ stipulations })} />
    </Field>
  );
}

function Review({ lease }: Props) {
  const rows: [string, string][] = [
    ['Premises', `${lease.property.street}${lease.property.unit ? `, Unit ${lease.property.unit}` : ''}`],
    ['Tenants', lease.tenants.map((t) => t.name).join(', ')],
    ['Term', `${lease.term.start} to ${lease.term.end}`],
    ['Rent', `${money(lease.rent.monthly)} due on day ${lease.rent.dueDay}`],
    ['Security deposit', money(lease.deposit.amount)],
    ['Late charge', `${money(lease.fees.lateFee)} after ${lease.fees.graceDays} days`],
    ['Pets', lease.pets.allowed ? lease.pets.description : 'Not permitted'],
    ['Stipulations', lease.stipulations.trim() ? 'Included' : 'None'],
  ];
  return (
    <>
      <table className="util">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td>
                <strong>{k}</strong>
              </td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">
        The PDF includes the lease, the disclosures page, and the exhibits for {cities[lease.city].name}. Upload it
        to your signing platform and add the city documents listed in the README to the same envelope.
      </p>
    </>
  );
}

export function StepForm({ step, lease, set }: Props & { step: Step }) {
  switch (step) {
    case 'Property':
      return <Property lease={lease} set={set} />;
    case 'Landlord':
      return <LandlordStep lease={lease} set={set} />;
    case 'Tenants':
      return <Tenants lease={lease} set={set} />;
    case 'Term':
      return <Term lease={lease} set={set} />;
    case 'Rent':
      return <Rent lease={lease} set={set} />;
    case 'Deposit and fees':
      return <DepositAndFees lease={lease} set={set} />;
    case 'Utilities':
      return <Utilities lease={lease} set={set} />;
    case 'Policies':
      return <Policies lease={lease} set={set} />;
    case 'Local': {
      const Local = cities[lease.city].LocalStep;
      return <Local lease={lease} set={set} />;
    }
    case 'Stipulations':
      return <Stipulations lease={lease} set={set} />;
    case 'Review':
      return <Review lease={lease} set={set} />;
  }
}
