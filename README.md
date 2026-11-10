# Dr. Arun Kumar website

Static HTML, CSS and JavaScript for `https://www.drarunkumar.in/`, published by the existing GitHub Pages workflow from `main`. No framework build is required.

## Consultation pages, 10 November 2026

| Patient enquiry | Page |
| --- | --- |
| Sexologist / Agra clinic | `sexologist-agra.html` |
| Premature ejaculation / shighrapatan | `premature-ejaculation-agra.html` |
| Erectile dysfunction | `erectile-dysfunction-agra.html` |
| Sperm count, motility and male fertility | `male-fertility-agra.html` |
| Appointments, hours and directions | `contact.html` |

These five pages use standalone `consultation.css`, system fonts and the existing institute logo. They have static call, WhatsApp and Maps links, including a mobile contact bar that also works without JavaScript. The main navigation progressively collapses only when JavaScript is active.

The homepage links directly to the relevant consultations. Treatment cards no longer require visitors to complete the self-assessment to enquire. The assessment itself and its scoring are unchanged. A sitemap and robots file provide crawl discovery; they do not guarantee indexing or ranking.

Public details are retained from the November 3 production update: centre open 24 hours; Dr. Arun consultations 7 AM–7 PM IST daily. Reception confirms the appointment and fee. Phone and WhatsApp: `9927005959`. Directions retain the owner's link: `https://maps.app.goo.gl/KXKvnoKUAVTJcy5v9?g_st=ac`.

## Contact measurement

The existing WhatsApp contact action `AW-622603961/WpCCCMrn0IsdELnd8KgC` is preserved. It records a contact click, not a sent message, connected call or confirmed appointment. The script emits no conversion on page load.

The `arun_clinic_contact` data-layer event reports only the contact method (`phone`, `whatsapp`, `directions`). Phone and directions are not mapped to new Google Ads conversion actions. This website update does not change Ads goals, campaigns, budgets or bidding. Google Ads configuration and live attribution need separate verification.

Measurement only runs on `drarunkumar.in` and `www.drarunkumar.in`. Preview domains do not load the tag. Existing payload overrides omit condition-specific paths, arbitrary query strings, form fields, assessment answers and WhatsApp text. Attribution identifiers are retained. No enhanced conversions or remarketing audiences were added.

## Verification and release

```sh
node --check main.js
node --test tests/contact-flow.test.cjs
python3 tests/check_site.py
git diff --check
```

The automated checks cover contact routing, duplicate tags/events, preview isolation, sensitive-field omission, assessment consent, balanced HTML and local links. They do not confirm that a real phone call connected, a message was delivered, or an appointment was booked.

Review desktop and narrow/mobile layouts, menu opening and Escape dismissal, FAQ expansion, visible focus and the fixed contact bar. After merge, confirm GitHub Pages deployment succeeds and verify the production pages and shared CSS return the updated content. Preserve the existing domain, logo files and other doctors' sites.

## Patient-information sources

- [NHS: ejaculation problems](https://www.nhs.uk/conditions/ejaculation-problems/)
- [NHS: erectile dysfunction](https://www.nhs.uk/conditions/erection-problems-erectile-dysfunction/)
- [NHS: low sperm count](https://www.nhs.uk/conditions/low-sperm-count/)

The pages offer general information and consultation routes, not individual diagnoses, prescriptions or guaranteed outcomes.
