"""Generates public/data/supply-chain.json.

All suppliers are fictional. IKEA's own sites use real towns but invented figures.
Tiers are derived from the links (shortest path to an IKEA site), so edit the
SITES and LINKS lists and re-run instead of editing the JSON by hand:

    python3 scripts/generate-mock-data.py
"""

import json
from collections import deque
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "data" / "supply-chain.json"

# Shorthand columns per site:
# id, name, type, city, state, lat, lng, description,
# workforce: (headcount, temporaryShare, migrantShare, womenShare)
# conditions: (avgWeeklyHours, wageToLivingWage, injuryRate, union, grievance)
# audit: (status, lastAuditDate, openFindings), certifications
SITES = [
    # IKEA's own operations
    ("dc-dortmund", "IKEA Distribution Centre Dortmund", "distribution", "Dortmund", "North Rhine-Westphalia", 51.585, 7.485,
     "Central warehouse supplying stores in western Germany.",
     (1100, 0.12, 0.28, 0.31), (38.5, 1.45, 2.1, True, True), ("approved", "2026-02-12", 0), ["ISO 45001"]),
    ("dc-salzgitter", "IKEA Distribution Centre Salzgitter", "distribution", "Salzgitter", "Lower Saxony", 52.152, 10.330,
     "Central warehouse supplying stores in northern and eastern Germany.",
     (820, 0.18, 0.22, 0.27), (39.0, 1.38, 2.6, True, True), ("approved", "2025-11-03", 1), ["ISO 45001"]),
    ("store-berlin", "IKEA Berlin-Lichtenberg", "store", "Berlin", "Berlin", 52.524, 13.494,
     "Store and pick-up point.", (430, 0.15, 0.35, 0.52), (37.5, 1.32, 1.1, True, True), ("approved", "2026-01-20", 0), []),
    ("store-hamburg", "IKEA Hamburg-Altona", "store", "Hamburg", "Hamburg", 53.552, 9.935,
     "City-centre store.", (310, 0.14, 0.30, 0.55), (37.5, 1.30, 0.9, True, True), ("approved", "2025-09-15", 0), []),
    ("store-cologne", "IKEA Köln-Godorf", "store", "Cologne", "North Rhine-Westphalia", 50.855, 6.982,
     "Store and pick-up point.", (380, 0.16, 0.27, 0.50), (37.5, 1.34, 1.3, True, True), ("approved", "2026-04-02", 0), []),
    ("store-munich", "IKEA München-Eching", "store", "Eching", "Bavaria", 48.300, 11.618,
     "Store and pick-up point.", (450, 0.13, 0.25, 0.49), (37.5, 1.28, 1.0, True, True), ("approved", "2025-12-08", 0), []),
    ("store-frankfurt", "IKEA Frankfurt", "store", "Frankfurt am Main", "Hesse", 50.096, 8.630,
     "Store and pick-up point.", (360, 0.17, 0.33, 0.51), (37.5, 1.31, 1.2, True, True), ("approved", "2026-03-11", 0), []),

    # Direct suppliers (tier 1)
    ("mfg-lausitz", "Lausitzer Möbelwerk GmbH", "manufacturer", "Cottbus", "Brandenburg", 51.756, 14.333,
     "Flat-pack shelving and storage made from particleboard.",
     (640, 0.24, 0.31, 0.38), (41.0, 1.12, 3.1, True, True), ("approved", "2025-06-19", 2), ["FSC Chain of Custody", "IWAY"]),
    ("mfg-coburg", "Oberfränkische Polstermöbel AG", "manufacturer", "Coburg", "Bavaria", 50.259, 10.964,
     "Upholstered sofas and armchairs.",
     (520, 0.33, 0.44, 0.47), (44.5, 1.04, 4.2, False, True), ("conditional", "2025-02-27", 4), ["IWAY"]),
    ("mfg-loehne", "Ostwestfalen Küchenbau GmbH", "manufacturer", "Löhne", "North Rhine-Westphalia", 52.196, 8.708,
     "Kitchen cabinet fronts and carcasses.",
     (910, 0.11, 0.21, 0.29), (39.0, 1.36, 2.4, True, True), ("approved", "2026-05-06", 0), ["FSC Chain of Custody", "IWAY", "ISO 45001"]),
    ("mfg-erzgebirge", "Erzgebirge Holzwaren KG", "manufacturer", "Annaberg-Buchholz", "Saxony", 50.580, 13.002,
     "Small solid-wood items: stools, trays and children's furniture.",
     (140, 0.18, 0.09, 0.41), (40.0, 1.08, 3.8, None, True), ("approved", "2024-03-14", 1), ["FSC Chain of Custody", "IWAY"]),
    ("mfg-sauerland", "Sauerland Metallbau GmbH", "manufacturer", "Arnsberg", "North Rhine-Westphalia", 51.396, 8.064,
     "Steel frames for beds and office chairs.",
     (380, 0.21, 0.36, 0.14), (42.5, 1.15, 5.1, True, None), ("approved", "2025-10-22", 1), ["IWAY"]),
    ("mfg-freiburg", "Schwarzwald Leuchten GmbH", "manufacturer", "Freiburg im Breisgau", "Baden-Württemberg", 47.999, 7.842,
     "LED lamps and lighting assembly.",
     (260, None, None, 0.58), (38.0, 1.22, None, True, True), ("approved", "2025-08-30", 0), ["IWAY"]),

    # Materials and components (tier 2)
    ("cmp-wismar", "Mecklenburger Spanplatten GmbH", "materials", "Wismar", "Mecklenburg-Western Pomerania", 53.892, 11.465,
     "Particleboard and MDF panels.",
     (450, 0.27, 0.39, 0.12), (45.5, 1.06, 4.9, True, False), ("conditional", "2024-11-12", 3), ["FSC Chain of Custody"]),
    ("cmp-erfurt", "Thüringer Schaumstoff GmbH", "materials", "Erfurt", "Thuringia", 50.978, 11.029,
     "Polyurethane foam for cushions and mattresses.",
     (190, 0.38, 0.52, 0.35), (47.0, 0.97, 6.4, False, False), ("failed", "2025-04-08", 7), []),
    ("cmp-bocholt", "Westfälische Textilveredelung GmbH", "materials", "Bocholt", "North Rhine-Westphalia", 51.838, 6.616,
     "Dyeing and finishing of upholstery fabric.",
     (230, 0.29, None, 0.61), (None, None, 2.9, True, None), ("not-audited", None, None), ["OEKO-TEX Standard 100"]),
    ("cmp-remscheid", "Bergische Beschläge GmbH", "components", "Remscheid", "North Rhine-Westphalia", 51.179, 7.189,
     "Hinges, drawer runners and fittings.",
     (310, 0.14, 0.26, 0.22), (39.5, 1.27, 2.2, True, True), ("approved", "2025-09-09", 0), ["ISO 45001"]),
    ("cmp-solingen", "Rheinland Lackfabrik GmbH", "materials", "Solingen", "North Rhine-Westphalia", 51.171, 7.083,
     "Water-based lacquers and wood stains.",
     (120, 0.10, 0.18, 0.30), (38.0, 1.33, 1.8, True, True), ("approved", "2026-01-28", 0), []),
    ("cmp-duisburg", "Ruhr Stahlservice GmbH", "materials", "Duisburg", "North Rhine-Westphalia", 51.435, 6.762,
     "Steel tube and sheet cutting.",
     (270, 0.22, 0.41, 0.08), (43.0, 1.19, 4.4, True, True), ("approved", "2025-07-01", 2), ["ISO 45001"]),
    ("cmp-kempten", "Allgäuer Glaswerk GmbH", "components", "Kempten", "Bavaria", 47.726, 10.315,
     "Glass shades and diffusers.",
     (None, None, None, None), (None, None, None, None, None), ("not-audited", None, None), []),
    ("cmp-saalfeld", "Saalfelder Verpackungen GmbH", "components", "Saalfeld", "Thuringia", 50.648, 11.364,
     "Corrugated cardboard packaging.",
     (160, 0.31, 0.47, 0.44), (42.0, 1.09, 3.2, False, True), ("approved", "2024-08-20", 1), ["FSC Chain of Custody"]),

    # Sawmills (tier 3)
    ("saw-torgelow", "Sägewerk Vorpommern GmbH", "sawmill", "Torgelow", "Mecklenburg-Western Pomerania", 53.633, 14.007,
     "Pine sawmill producing chips and offcuts for board production.",
     (95, 0.35, 0.58, 0.06), (49.5, 0.98, 7.3, False, False), ("not-audited", None, None), ["FSC Chain of Custody"]),
    ("saw-harz", "Harzer Holzindustrie GmbH", "sawmill", "Goslar", "Lower Saxony", 51.906, 10.429,
     "Spruce sawmill, rebuilding supply after bark beetle damage.",
     (120, 0.22, None, 0.09), (44.0, 1.07, None, True, None), ("approved", "2023-10-05", 2), ["PEFC Chain of Custody"]),
    ("saw-regen", "Bayerwald Sägewerk KG", "sawmill", "Regen", "Bavaria", 48.970, 13.128,
     "Spruce and beech sawmill.",
     (80, 0.19, 0.40, 0.10), (45.0, 1.11, 5.6, None, True), ("approved", "2025-05-15", 1), ["PEFC Chain of Custody"]),
    ("saw-ilmenau", "Thüringer Wald Holz GmbH", "sawmill", "Ilmenau", "Thuringia", 50.684, 10.919,
     "Spruce sawmill and kiln drying.",
     (None, None, None, None), (None, None, None, None, None), ("not-audited", None, None), []),

    # Forestry (tier 4 and beyond)
    ("for-vorpommern", "Forstbetrieb Ueckermünder Heide", "forestry", "Ueckermünde", "Mecklenburg-Western Pomerania", 53.735, 14.045,
     "Pine forest management.",
     (35, 0.20, 0.10, 0.14), (41.0, 1.18, 3.9, True, True), ("approved", "2025-03-03", 0), ["FSC Forest Management"]),
    ("for-harvest-ost", "Holzernte Service Ost GmbH", "forestry", "Pasewalk", "Mecklenburg-Western Pomerania", 53.505, 13.990,
     "Logging contractor using seasonal and posted workers.",
     (None, None, None, None), (None, None, None, None, None), ("not-audited", None, None), []),
    ("for-harz", "Forstgenossenschaft Oberharz", "forestry", "Clausthal-Zellerfeld", "Lower Saxony", 51.805, 10.336,
     "Cooperative of private forest owners.",
     (60, None, None, None), (None, None, 4.8, None, None), ("not-audited", None, None), ["PEFC Forest Management"]),
    ("for-bayerwald", "Forstbetrieb Bayerischer Wald", "forestry", "Zwiesel", "Bavaria", 49.017, 13.236,
     "State-run forest enterprise.",
     (85, 0.12, 0.05, 0.18), (40.0, 1.29, 4.1, True, True), ("approved", "2025-09-25", 0), ["PEFC Forest Management"]),
    ("for-thueringen", "Waldbauernverband Thüringer Wald", "forestry", "Suhl", "Thuringia", 50.609, 10.693,
     "Association of small forest owners, mostly part-time.",
     (None, None, None, None), (None, None, None, None, None), ("not-audited", None, None), []),
]

# (from, to, material): goods flow from the supplier to the receiving site.
LINKS = [
    ("dc-dortmund", "store-cologne", "Finished goods"),
    ("dc-dortmund", "store-frankfurt", "Finished goods"),
    ("dc-salzgitter", "store-berlin", "Finished goods"),
    ("dc-salzgitter", "store-hamburg", "Finished goods"),
    ("dc-salzgitter", "store-munich", "Finished goods"),
    ("dc-dortmund", "store-munich", "Finished goods"),

    ("mfg-lausitz", "dc-salzgitter", "Shelving units"),
    ("mfg-coburg", "dc-salzgitter", "Sofas"),
    ("mfg-coburg", "dc-dortmund", "Sofas"),
    ("mfg-loehne", "dc-dortmund", "Kitchen cabinets"),
    ("mfg-erzgebirge", "dc-salzgitter", "Stools and trays"),
    ("mfg-sauerland", "dc-dortmund", "Bed frames"),
    ("mfg-freiburg", "dc-dortmund", "Lamps"),

    ("cmp-wismar", "mfg-lausitz", "Particleboard"),
    ("cmp-wismar", "mfg-loehne", "MDF panels"),
    ("cmp-erfurt", "mfg-coburg", "Foam"),
    ("cmp-bocholt", "mfg-coburg", "Upholstery fabric"),
    ("cmp-remscheid", "mfg-loehne", "Hinges and runners"),
    ("cmp-remscheid", "mfg-lausitz", "Fittings"),
    ("cmp-solingen", "mfg-loehne", "Lacquer"),
    ("cmp-solingen", "mfg-erzgebirge", "Wood stain"),
    ("cmp-duisburg", "mfg-sauerland", "Steel tube"),
    ("cmp-kempten", "mfg-freiburg", "Glass shades"),
    ("cmp-saalfeld", "mfg-lausitz", "Packaging"),
    ("cmp-saalfeld", "mfg-coburg", "Packaging"),

    ("saw-torgelow", "cmp-wismar", "Wood chips"),
    ("saw-harz", "cmp-wismar", "Offcuts"),
    ("saw-harz", "mfg-coburg", "Frame timber"),
    ("saw-regen", "mfg-erzgebirge", "Beech boards"),
    ("saw-ilmenau", "cmp-saalfeld", "Wood pulp"),
    ("saw-ilmenau", "mfg-erzgebirge", "Spruce boards"),

    ("for-vorpommern", "saw-torgelow", "Pine logs"),
    ("for-harvest-ost", "saw-torgelow", "Harvesting services"),
    ("for-harz", "saw-harz", "Spruce logs"),
    ("for-bayerwald", "saw-regen", "Beech logs"),
    ("for-thueringen", "saw-ilmenau", "Spruce logs"),
]

IKEA_TYPES = {"distribution", "store"}


def tiers():
    """Shortest number of hops from each site to an IKEA-operated site."""
    suppliers = {}
    for src, dst, _ in LINKS:
        suppliers.setdefault(dst, []).append(src)
    tier = {s[0]: 0 for s in SITES if s[2] in IKEA_TYPES}
    queue = deque(tier)
    while queue:
        site = queue.popleft()
        for supplier in suppliers.get(site, []):
            if supplier not in tier:
                tier[supplier] = tier[site] + 1
                queue.append(supplier)
    return tier


def main():
    tier = tiers()
    ids = {s[0] for s in SITES}
    unknown = {end for link in LINKS for end in link[:2]} - ids
    assert not unknown, f"Links reference unknown sites: {unknown}"
    assert ids == set(tier), f"Sites not connected to IKEA: {ids - set(tier)}"

    sites = []
    for (id_, name, type_, city, state, lat, lng, description, workforce, conditions, audit, certs) in SITES:
        headcount, temporary, migrant, women = workforce
        hours, wage, injury, union, grievance = conditions
        status, last_audit, findings = audit
        sites.append({
            "id": id_,
            "name": name,
            "type": type_,
            "tier": tier[id_],
            "description": description,
            "location": {"city": city, "state": state, "lat": lat, "lng": lng},
            "workforce": {"headcount": headcount, "temporaryShare": temporary, "migrantShare": migrant, "womenShare": women},
            "conditions": {
                "avgWeeklyHours": hours,
                "wageToLivingWage": wage,
                "injuryRate": injury,
                "unionRepresentation": union,
                "grievanceMechanism": grievance,
            },
            "audit": {"status": status, "lastAuditDate": last_audit, "openFindings": findings},
            "certifications": certs,
        })

    links = [{"from": src, "to": dst, "material": material} for src, dst, material in LINKS]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"sites": sites, "links": links}, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(sites)} sites and {len(links)} links to {OUT}")


if __name__ == "__main__":
    main()
