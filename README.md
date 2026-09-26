# Philadelphia Lease Generator

Locally hosted wizard that asks the same questions as the Apartments.com lease builder and produces a
Pennsylvania / Philadelphia residential lease as a single PDF packet, ready to upload to DocuSign or any
e-signature platform.

## Run

```
npm install
npm start
```

Open http://localhost:3000. The landlord details and the current draft are saved in the browser.
`npm install` downloads the Chrome build used to render the PDF.

## What the packet contains

1. The lease, with a key-terms summary, numbered sections, special stipulations, and one signature block.
2. A Disclosures and Acknowledgments page with one signature block: the federal lead-based paint disclosure,
   the Philadelphia lead-safe or lead-free certification acknowledgment, the Certificate of Rental Suitability
   and Partners in Good Housing receipt, and the Philadelphia bed bug disclosure.
3. Exhibit A: the EPA pamphlet "Protect Your Family From Lead in Your Home".
4. Exhibit B: the City of Philadelphia bed bug informational notice (required by Philadelphia Code Chapter 9-4800).
5. Exhibit C: the City's Partners in Good Housing handbook (required by Philadelphia Code § 9-3903).

Each party signs twice in total: once for the lease and once for the disclosures page.

## Before each lease

- Pull a Certificate of Rental Suitability from L&I eCLIPSE. It must be issued within 60 days before the start
  date; the wizard enforces this.
- Have a valid lead certificate. A Lead-Safe certificate is valid for 48 months from its inspection date and
  must be accompanied by the dust wipe laboratory results; a Lead-Free certificate does not expire. The wizard
  enforces the 48-month rule.
- Keep a written bed bug control plan for the property, as the bed bug ordinance requires.

## Signing platforms

Upload the PDF as the envelope document. Add the Certificate of Rental Suitability and the lead certificate
(with the wipe test results for a Lead-Safe certificate) as additional documents in the same envelope, and put
a tenant signature field on the lead certificate: Philadelphia Code § 6-803 requires the tenant to acknowledge
the certificate by signing a copy of it.

Invisible anchor text sits at every signature and date line, so DocuSign AutoPlace (or the equivalent in
other platforms) can place fields automatically:

| Party    | Signature anchor | Date anchor       |
| -------- | ---------------- | ----------------- |
| Landlord | `/sig_landlord/` | `/date_landlord/` |
| Tenant 1 | `/sig_tenant1/`  | `/date_tenant1/`  |
| Tenant 2 | `/sig_tenant2/`  | `/date_tenant2/`  |

Each anchor appears on both signature pages, so one AutoPlace rule places both fields for that party.

## Legal basis

Pennsylvania Landlord and Tenant Act of 1951: notice to quit (§ 250.501), abandoned property (§ 250.505a),
deposit limits (§ 250.511a), escrow and interest (§ 250.511b), deposit return (§ 250.512). Pennsylvania
Carbon Monoxide Alarm Standards Act, Electronic Transactions Act, and Plain Language Consumer Contract Act.
Federal lead disclosure rule (42 U.S.C. § 4852d, 40 CFR 745.113). Philadelphia Code: rental license
(§ 9-3902), Certificate of Rental Suitability and handbook (§ 9-3903), unfair rental practices, good cause,
and eviction diversion (Chapter 9-800), lead disclosure and certification (Chapter 6-800), bed bugs
(Chapter 9-4800), building smoking policy disclosure, snow removal (§ 10-720).

The statute and ordinance texts were checked against the Pennsylvania General Assembly and City of
Philadelphia sites when this template was written. Have an attorney review it before first use; laws change.
