import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from tempfile import TemporaryDirectory

from veri import KLASOR, indir, oku, ozet
from xg import tahmin
from kadro import ilk_on_bir


def onceki_maclar(fikstur, mac, takim):
    adaylar = [
        m for m in fikstur if m["match_date"] < mac["match_date"]
        and takim in (m["home_team"]["home_team_name"], m["away_team"]["away_team_name"])
    ]
    return sorted(adaylar, key=lambda m: m["match_date"], reverse=True)[:5]


def form(fikstur, mac, takim, paslar, model):
    gecmis = []
    for m in onceki_maclar(fikstur, mac, takim):
        kimlik = m["match_id"]
        ev = m["home_team"]["home_team_name"]
        rakip = m["away_team"]["away_team_name"] if ev == takim else ev
        sutlar = oku(KLASOR / "egitim" / f"{kimlik}.json")
        pas = paslar[str(kimlik)][takim]
        gecmis.append({
            "id": kimlik, "tarih": m["match_date"], "rakip": rakip,
            "xg": sum(tahmin(model, s) for s in sutlar if s["takim"] == takim),
            "pas": pas["pas"], "isabet": pas["isabet"],
        })
    toplam_pas = sum(m["pas"] for m in gecmis)
    return {
        "gecmis": gecmis,
        "xg": sum(m["xg"] for m in gecmis) / len(gecmis) if gecmis else None,
        "oran": 100 * sum(m["isabet"] for m in gecmis) / toplam_pas if toplam_pas else None,
    }


def paslari_al(mac):
    kimlik = mac["match_id"]
    with TemporaryDirectory() as klasor:
        hedef = Path(klasor) / "olaylar.json"
        indir(f"events/{kimlik}.json", hedef)
        olaylar = oku(hedef)
    sonuc = {}
    kadrolar = ilk_on_bir(olaylar)
    for alan in ("home_team", "away_team"):
        takim = mac[alan]
        sayilar = ozet(olaylar, takim[f"{alan}_id"])
        sonuc[takim[f"{alan}_name"]] = {k: sayilar[k] for k in ("pas", "isabet")}
        sonuc[takim[f"{alan}_name"]]["kadro"] = kadrolar[takim[f"{alan}_name"]]
    return str(kimlik), sonuc


if __name__ == "__main__":
    fikstur = oku(KLASOR / "matches.json")
    gerekli = {}
    for mac in fikstur:
        if (KLASOR / "data" / f"{mac['match_id']}.json").exists():
            for alan in ("home_team", "away_team"):
                for m in onceki_maclar(fikstur, mac, mac[alan][f"{alan}_name"]):
                    gerekli[m["match_id"]] = m
    with ThreadPoolExecutor(max_workers=4) as havuz:
        paslar = dict(havuz.map(paslari_al, gerekli.values()))
    (KLASOR / "gecmis_paslar.json").write_text(json.dumps(paslar, indent=2), encoding="utf-8")
