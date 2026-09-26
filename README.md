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
2. A Disclosures and Acknowledgments page: the federal lead-based paint disclosure, the Philadelphia lead-safe
   or lead-free certification acknowledgment, the Certificate of Rental Suitability and Partners for Good Housing
   handbook receipt, and the Philadelphia bed bug disclosure, with one signature block.
3. Exhibit A: the EPA pamphlet "Protect Your Family From Lead in Your Home" (always attached).

Each party signs twice in total: once for the lease and once for the disclosures page.

## Signing platforms

Upload the PDF as the envelope document and add the Certificate of Rental Suitability, the Partners for Good
Housing handbook, and the lead certificate as additional documents in the same envelope.

Invisible anchor text sits at every signature and date line, so DocuSign AutoPlace (or the equivalent in
other platforms) can place fields automatically:

| Party    | Signature anchor | Date anchor     |
| -------- | ---------------- | --------------- |
| Landlord | `/sig_landlord/` | `/date_landlord/` |
| Tenant 1 | `/sig_tenant1/`  | `/date_tenant1/`  |
| Tenant 2 | `/sig_tenant2/`  | `/date_tenant2/`  |

Each anchor appears on both signature pages, so one AutoPlace rule places both fields for that party.

## Legal notes

The lease follows the Pennsylvania Landlord and Tenant Act (notice to quit, deposit limits, escrow, deposit
return, abandoned property), the federal lead disclosure rule, and Philadelphia's rental license, Certificate of
Rental Suitability, lead certification, bed bug, and eviction diversion requirements. The wizard enforces the
two-month deposit cap and the 60-day Certificate of Rental Suitability window. Have an attorney review the
template before first use; laws change.
