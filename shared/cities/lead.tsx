import { Box } from '../Lease';

const LEAD_WARNING =
  'Housing built before 1978 may contain lead-based paint. Lead from paint, paint chips, and dust can pose health hazards if not managed properly. Lead exposure is especially harmful to young children and pregnant women. Before renting pre-1978 housing, lessors must disclose the presence of known lead-based paint and/or lead-based paint hazards in the dwelling. Lessees must also receive a federally approved pamphlet on lead poisoning prevention.';

// knownHazards and records are empty when the lessor has no knowledge and no records.
export function FederalLeadDisclosure({ knownHazards, records, pamphletExhibit }: { knownHazards: string; records: string; pamphletExhibit: string }) {
  return (
    <>
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
        <Box on={knownHazards !== ''} />
        (i) Known lead-based paint and/or lead-based paint hazards are present in the housing
        {knownHazards ? ` (explain): ${knownHazards}` : '.'}
      </p>
      <p>
        <Box on={knownHazards === ''} />
        (ii) Lessor has no knowledge of lead-based paint and/or lead-based paint hazards in the housing.
      </p>
      <p>(b) Records and reports available to the lessor:</p>
      <p>
        <Box on={records !== ''} />
        (i) Lessor has provided the lessee with all available records and reports pertaining to lead-based paint
        and/or lead-based paint hazards in the housing{records ? `, namely: ${records}` : '.'}
      </p>
      <p>
        <Box on={records === ''} />
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
        (d) Lessee has received the pamphlet "Protect Your Family From Lead in Your Home" (Exhibit {pamphletExhibit}).
      </p>
      <p>(e) No agent is involved in this lease on behalf of the lessor.</p>
    </>
  );
}
