import type { LeaseInput } from '../types';

const ROWS = [
  'Entry and hallways',
  'Living room',
  'Dining area',
  'Kitchen: counters, cabinets, and sink',
  'Kitchen: stove and oven',
  'Kitchen: refrigerator',
  'Kitchen: dishwasher',
  'Bathroom: tub or shower, toilet, and sink',
  'Bathroom: fixtures, fan, and tile',
  'Bedroom 1',
  'Bedroom 2',
  'Bedroom 3',
  'Walls, paint, and wallpaper',
  'Carpets and other flooring',
  'Windows, screens, and window coverings',
  'Doors, locks, and keys',
  'Lighting and electrical outlets',
  'Heating and water heater',
  'Smoke and carbon monoxide alarms',
  'Laundry',
  'Furniture and furnishings',
  'Exterior, yard, and parking',
  'Other',
];

function PlainSig({ label, name }: { label: string; name: string }) {
  return (
    <div className="sig-row">
      <div className="sig-name">
        <div className="sig-space" />
        <div className="sig-label">
          {label}: {name}
        </div>
      </div>
      <div className="sig-date">
        <div className="sig-space" />
        <div className="sig-label">Date</div>
      </div>
    </div>
  );
}

export function MoveInChecklist({ input }: { input: LeaseInput }) {
  return (
    <>
      <p>
        Landlord and Tenant complete this checklist together when Tenant takes possession, describing the condition and
        cleanliness of, and any existing damage to, each item (RCW 59.18.260). Both sign and date it, and Tenant
        receives a copy. The move-out column is completed when the tenancy ends.
      </p>
      <table className="checklist">
        <thead>
          <tr>
            <th>Item</th>
            <th>Condition at move-in</th>
            <th>Condition at move-out</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row}>
              <th>{row}</th>
              <td />
              <td />
              <td />
            </tr>
          ))}
        </tbody>
      </table>
      <p>Keys and access devices received by Tenant: ________________________________________________</p>
      <div className="signatures">
        <p>
          <strong>Move-in inspection.</strong> The parties inspected the Premises together and agree that this checklist
          accurately describes its condition at move-in.
        </p>
        <PlainSig label="LANDLORD" name={input.landlord.name} />
        {input.tenants.map((t, i) => (
          <PlainSig key={i} label="TENANT" name={t.name} />
        ))}
      </div>
      <div className="signatures">
        <p>
          <strong>Move-out inspection.</strong> The parties inspected the Premises at move-out and the move-out column
          records its condition.
        </p>
        <PlainSig label="LANDLORD" name={input.landlord.name} />
        {input.tenants.map((t, i) => (
          <PlainSig key={i} label="TENANT" name={t.name} />
        ))}
      </div>
    </>
  );
}
