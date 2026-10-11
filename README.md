# Lease Generator

Locally hosted wizard that asks the same questions as the Apartments.com lease builder and produces a residential
lease as a single PDF packet, ready to upload to DocuSign or any e-signature platform. Supported cities:
Philadelphia, Pennsylvania and Seattle, Washington. The city is chosen on the first step of the wizard.

## Run

```
npm install
npm start
```

Open http://localhost:3000. The landlord details and the current draft are saved in the browser.
`npm install` downloads the Chrome build used to render the PDF.

## What the packet contains

The lease (key-terms summary, numbered sections, special stipulations, one signature block) and a Disclosures
and Acknowledgments page with a second signature block, followed by the city's exhibits. Each party signs twice.
Invisible anchor text sits at every signature and date line so DocuSign AutoPlace can place fields automatically
(`/sig_landlord/`, `/date_landlord/`, `/sig_tenant1/`, `/date_tenant1/`, and so on); each anchor appears on both
signature pages.

### Philadelphia

- Disclosures: federal lead-based paint disclosure, Philadelphia lead certification acknowledgment, Certificate of
  Rental Suitability and Partners in Good Housing receipt, bed bug disclosure.
- Exhibit A: EPA pamphlet "Protect Your Family From Lead in Your Home". Exhibit B: City bed bug informational
  notice. Exhibit C: Partners in Good Housing handbook.
- Before each lease: pull a Certificate of Rental Suitability from L&I eCLIPSE (issued within 60 days before the
  start date, enforced by the wizard), have a valid lead certificate (Lead-Safe certificates last 48 months from the
  inspection, enforced by the wizard), and keep a written bed bug control plan.
- In the envelope, add the Certificate of Rental Suitability and the lead certificate (with wipe test results for
  a Lead-Safe certificate), with a tenant signature field on the certificate as Philadelphia Code § 6-803 requires.

### Seattle

- Disclosures: federal lead-based paint disclosure, the fire safety and smoke detection notice (signed by both
  parties on the disclosures page, as RCW 59.18.060 requires), mold information receipt, flood hazard and
  insurance disclosure, receipt of the Seattle documents, and the security deposit trust account and checklist
  statement.
- Exhibit A: move-in condition checklist, completed and signed by both parties when the tenant takes possession
  (required before any deposit can be collected). Exhibit B: EPA lead pamphlet. Exhibit C: Washington Department
  of Health mold information (DOH 333-302). Exhibit D: City of Seattle Renter's Handbook (December 2025).
  Exhibit E: voter registration form.
- Before each lease: register the unit under the Rental Registration and Inspection Ordinance and enter the
  registration number, and hand the tenant a printed copy of the Renter's Handbook at signing (the City requires
  the printed copy; the PDF in the packet documents receipt).
- In the envelope, add a copy of the current RRIO registration. For a multifamily building, parking must be a
  separate agreement, and utility billing for master-metered services needs a Third Party Billing addendum.
- The wizard enforces the Seattle and Washington limits: deposit at most one month's rent, pet deposit at most 25
  percent of rent, no pet rent, late charge at most $10 per month after a 5-day grace period, returned payment
  charge at most $31, and a term of 12 months or less (longer leases must be notarized). The lease continues
  month-to-month at the end of the term because Seattle requires just cause to end a tenancy.
- Not included: the City's fee disclosure form that Seattle will require before the first page of leases signed
  from July 1, 2027 (the City has not published the model form yet).

## Legal basis

Philadelphia: Pennsylvania Landlord and Tenant Act of 1951 (§§ 250.501, 250.505a, 250.511a, 250.511b, 250.512),
Carbon Monoxide Alarm Standards Act, Electronic Transactions Act, Plain Language Consumer Contract Act;
Philadelphia Code §§ 9-3902 and 9-3903, Chapter 9-800, Chapter 6-800, Chapter 9-4800, § 10-720.

Seattle: Washington Residential Landlord-Tenant Act (RCW 59.18, including the 2025 rent stabilization sections
59.18.700 to 59.18.720, the 2026 flood disclosure and portable cooling device sections, and the just cause rules in
59.18.650), RCW 59.12.030, RCW 43.44.110, RCW 19.27.530; Seattle Municipal Code Chapters 7.24, 7.25, 22.205,
22.206, 22.212, 22.214, 14.08, and 14.09.

Federal: lead disclosure rule (42 U.S.C. § 4852d, 40 CFR 745.113).

The statute and ordinance texts were checked against the Pennsylvania General Assembly, Washington Legislature,
City of Philadelphia, and City of Seattle sites when this template was written. Have an attorney review the
template for each city before first use; laws change.
