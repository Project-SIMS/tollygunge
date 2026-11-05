# Reviewed city aliases

These are city names within the stated administrative hierarchy, not a claim that every PIN in a district lies within municipal limits. PIN/state/district validation still runs independently. Unlisted cities are held for review rather than inferred from post-office or district names.

Kolkata/Calcutta: the Kolkata Municipal Corporation describes the city renaming in 2001: https://www.kmcgov.in/KMCPortal/jsp/KMCAboutKolkataHome.jsp

Howrah/Haora: the district administration identifies the city in Howrah district, West Bengal: https://howrah.gov.in/map-of-district/ ; the government district survey records the alternate name: https://www.dmm.gov.in/pdfs/DSR/DSR_Howrah.pdf

Reviewed on 2026-10-11. Adding cities requires a source documenting their state/district relationship, a reviewed alias CSV, and validation against the installed postal reference. City aliases do not change postal locality names.

Delhi / East (reviewed 2026-11-02): the East Delhi district administration's
school directory lists Mayur Vihar, Delhi 110091 within East district:
https://dmeast.delhi.gov.in/education/ . This mapping uses the installed postal
hierarchy's state `Delhi` and district `East`; it does not map other districts
or infer cities from district names.

## Member-address corrections reviewed 2026-11-02

These aliases preserve supplied city names while validating against the installed
postal hierarchy. District spellings below match the postal reference exactly.

- Durgapur and Asansol, Paschim Bardhaman, West Bengal: district administrative
  setup https://paschimbardhaman.gov.in/administrative-setup/ and district survey
  https://www.wbindustries.gov.in/files/Mines/DSR/Paschim_Bardhaman_Modified_DSR_Final_Mar24.pdf
- Bhubaneswar, Khordha, Odisha: district city description
  https://khordha.odisha.gov.in/en/tourism/tourist-places/bhubaneswar
- Thiruvananthapuram, Kerala: https://trivandrum.nic.in/en/ and the Vattiyoorkavu
  village office (PIN 695013, Trivandrum Corporation)
  https://landrevenue.kerala.gov.in/core/Office_websites/contactus.php?nm=260Vattiyoorkavuvillageoffice
  The source spelling `Thiruvannathapuram` is an input alias normalized to
  `Thiruvananthapuram`; original imported source cells remain in the saved batch.
- New Town postal addresses using Kolkata, postal district `24 Paraganas North`:
  https://smartcity.nkdamar.org/nkda-profile identifies New Town, Kolkata 700156.
  This is a postal city alias, not a claim about municipal jurisdiction.
- Jajpur Road, postal district `Jajapur`, Odisha: Government of Odisha notice
  https://labour.odisha.gov.in/sites/default/files/2022-08/16073_21.07.2022.pdf
  documents Jajpur Road, Vyasanagar Tahasil, Jajpur 755019. PIN 755019 also serves
  Kendujhar locations, so district selection must use the supplied locality.

No address lines, identity details, membership status, account verification or
payment records are changed by these city-reference additions.

## PIN-specific Burla mapping reviewed 2026-11-04

The Sambalpur district postal directory lists Burla/Medical College Burla
(768017), Engineering College Burla (768018), Jyotivihar Burla (768019), and
Jagruti Vihar Burla (768020):
https://sambalpur.odisha.gov.in/en/directory/std-and-pin-codes .
The reviewed runtime mapping in `src/domain/postal-cities.ts` applies only to
these PINs with the matching Odisha/Sambalpur hierarchy. It does not assign
Burla to every PIN in Sambalpur district or rename postal localities.
