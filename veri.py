import json
from pathlib import Path
from urllib.request import urlopen

KLASOR = Path(__file__).resolve().parent
KAYNAK = "https://raw.githubusercontent.com/statsbomb/open-data/master/data"


def oku(dosya):
    return json.loads(dosya.read_text(encoding="utf-8-sig"))


def indir(yol, hedef):
    with urlopen(f"{KAYNAK}/{yol}", timeout=60) as yanit:
        icerik = yanit.read()
    json.loads(icerik)
    hedef.parent.mkdir(parents=True, exist_ok=True)
    gecici = hedef.with_suffix(".tmp")
    gecici.write_bytes(icerik)
    gecici.replace(hedef)


def ozet(olaylar, takim):
    # Seri penaltılar maç içi şut ve pas toplamlarına dahil edilmez.
    kayitlar = [o for o in olaylar if o["team"]["id"] == takim and o["period"] <= 4]
    paslar = [o for o in kayitlar if o["type"]["name"] == "Pass"]
    isabet = sum("outcome" not in o["pass"] for o in paslar)
    return {
        "şut": sum(o["type"]["name"] == "Shot" for o in kayitlar),
        "pas": len(paslar),
        "isabet": isabet,
        "oran": 100 * isabet / len(paslar) if paslar else None,
    }


if __name__ == "__main__":
    liste = KLASOR / "matches.json"
    if not liste.exists():
        indir("matches/43/106.json", liste)
    maclar = sorted(oku(liste), key=lambda m: m["match_date"], reverse=True)
    for mac in maclar[:2]:
        kimlik = mac["match_id"]
        hedef = KLASOR / "data" / f"{kimlik}.json"
        if not hedef.exists():
            indir(f"events/{kimlik}.json", hedef)
        print(kimlik, mac["home_team"]["home_team_name"], mac["away_team"]["away_team_name"])
