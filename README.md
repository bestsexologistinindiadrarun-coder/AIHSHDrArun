# Dr. Arun Kumar website

Static HTML/CSS/JavaScript site for `www.drarunkumar.in`. No framework build or new runtime dependency is required.

## Proposed consultation-page update, 18 October 2026

This branch is for review. It does **not** change Google Ads settings, budgets,
keywords, conversion-goal status, Business Profiles or the production branch.
The existing institute logo and image files are unchanged. No generated imagery
is represented as a photograph of the real clinic.

| Ad-group intent | Proposed destination, after deployment |
| --- | --- |
| Sexologist Agra / Sexologist Near Me | `/sexologist-agra.html` |
| Premature Ejaculation Consultation | `/premature-ejaculation-agra.html` |
| Erectile Function Consultation | `/erectile-dysfunction-agra.html` |

The home and contact pages provide direct contact links. All pages receive a
mobile Call / WhatsApp / Directions bar through `main.js`. The mobile menu now
has a real WhatsApp link rather than a decorative CSS pseudo-element.

The existing appointment selector checks published hours only. It has no booking
backend. Its wording now describes a **request requiring clinic confirmation**,
not real-time slot availability. The owner confirmed consultation hours of
6:00 AM–8:00 PM IST on 18 October 2026. Displayed hours and the appointment
selector use this window. Assessment scoring has not been changed.

## Contact measurement

- The existing `AW-622603961/WpCCCMrn0IsdELnd8KgC` WhatsApp contact conversion is
  preserved. It records a contact attempt, not a sent message or an appointment.
- A neutral data-layer event `arun_clinic_contact` has `contact_method` equal to
  `phone`, `whatsapp` or `directions`. Phone and directions hooks are **not**
  connected to new Google Ads conversion actions. No new primary goals exist.
- Do not attach a second WhatsApp conversion tag to this hook: the existing
  conversion is already emitted by the script.
- Measurement is limited to `drarunkumar.in` and `www.drarunkumar.in`. Localhost,
  GitHub Pages alternate domains and previews do not load the tag or send events.
- Payload overrides use the site origin, neutral page title and referrer origin.
  Condition-specific paths, arbitrary query strings, fragments, names, telephone
  input values, assessment answers and WhatsApp message text are not included.
  The existing attribution identifiers `gclid`, `gbraid`, `wbraid` are retained.
- No enhanced conversions, customer matching or remarketing audiences were added.
- There is no server-confirmed booking event. A genuine booking/conversation must
  not be inferred from a click. Configure qualified outcomes separately only when
  appropriate, supported, privacy-reviewed and validated.
- This change does not introduce a consent-management platform. Before publishing,
  review the site's privacy notice, applicable consent requirements and connected
  Google tag settings. Do not assume that these code changes alone establish
  legal or Google policy compliance.

## Checks

Run from the repository root with Node.js 18+ and Python 3:

```sh
node --check main.js
node --test tests/contact-flow.test.cjs
python3 tests/check_site.py
git diff --check
```

The tests use stubs and local parsing. They do not send conversion requests or
test rendering, mobile browsers, Google's backend or appointment availability.

## Required release review

1. Consultation hours are confirmed by the owner as 6:00 AM–8:00 PM IST.
   Verify the fee, credentials and address. Pages ask visitors to confirm
   their appointment time and fee with the clinic before travelling.
2. Review Hindi/English copy and relevant healthcare-advertising requirements.
   No ranking, cure, qualification or patient-volume guarantees were added.
3. Preview the branch locally or through the existing authorized hosting workflow.
   Test 320px, 390px, 768px and desktop widths, keyboard navigation, the menu,
   sticky bar, FAQs and contact links. Confirm mobile content is not covered.
4. Verify that Google Maps resolves to this exact clinic, not another similarly
   named business. Directions currently use the full clinic name/address query.
5. Approve and merge through the existing deployment workflow. Do not change
   Google Ads URLs before the corresponding HTTPS pages return successfully.
6. After release, use Tag Assistant to verify one contact conversion per click,
   no conversion on page load, no patient fields and no duplicate Google tags.
   Real calls/WhatsApp handoff and Ads attribution still require live checks.
7. Update only the relevant Dr. Arun Agra ad URLs after those checks. Preserve
   other doctors' assets and the existing budget, keywords and campaign settings.

## Content references

- [NHS: ejaculation problems](https://www.nhs.uk/conditions/ejaculation-problems/)
- [NHS: erectile dysfunction](https://www.nhs.uk/conditions/erection-problems-erectile-dysfunction/)
- [Google tag API reference](https://developers.google.com/tag-platform/gtagjs/reference)
- [Google Ads customer data restrictions](https://support.google.com/google-ads/answer/7475709)

These references support general information, not a diagnosis or a claim that
this clinic has obtained approval for any specific advertisement.
