import json
import math

from veri import KLASOR, oku, ozet
from xg import tahmin
from mac_onu import form
from kadro import ilk_on_bir, tahmini_kadro


def sut_tablosu(olaylar):
    satirlar = []
    for olay in sorted(olaylar, key=lambda olay: olay["index"]):
        if olay["type"]["name"] != "Shot" or olay["period"] > 4:
            continue
        x, y = olay["location"][:2]
        # StatsBomb koordinatlarını 105 × 68 m referans sahaya ölçekle.
        ileri = (120 - x) * 105 / 120
        yanal = (y - 40) * 68 / 80
        # İki kale direğine uzanan vektörler arasındaki açı (kale 7,32 m).
        aci = math.atan2(abs(ileri) * 7.32, ileri**2 + yanal**2 - 3.66**2)
        sut = olay["shot"]
        satirlar.append({
            "id": olay["id"], "takim": olay["team"]["name"],
            "oyuncu": olay["player"]["name"], "dakika": olay["minute"],
            "saniye": olay["second"], "x": x, "y": y,
            "mesafe": math.hypot(ileri, yanal), "aci": math.degrees(aci),
            "sonuc": sut["outcome"]["name"], "tur": sut["type"]["name"],
            "gol": sut["outcome"]["name"] == "Goal",
        })
    return satirlar


def maclari_aktar():
    model = oku(KLASOR / "xg_model.json")
    fikstur = oku(KLASOR / "matches.json")
    paslar = oku(KLASOR / "gecmis_paslar.json")
    maclar = []
    for mac in sorted(fikstur, key=lambda m: m["match_date"], reverse=True):
        kimlik = mac["match_id"]
        dosya = KLASOR / "data" / f"{kimlik}.json"
        if not dosya.exists():
            continue
        olaylar = oku(dosya)
        gercek_kadrolar = ilk_on_bir(olaylar)
        sutlar = sut_tablosu(olaylar)
        for sut in sutlar:
            sut["xg"] = tahmin(model, sut)
        takimlar = []
        for taraf in ("home", "away"):
            alan = f"{taraf}_team"
            takim = mac[alan]
            ad = takim[f"{alan}_name"]
            son_form = form(fikstur, mac, ad, paslar, model)
            onceki_kadrolar = [paslar[str(m["id"])][ad]["kadro"] for m in son_form["gecmis"]]
            takimlar.append({
                "ad": takim[f"{alan}_name"],
                "form": son_form, "tahmin": tahmini_kadro(onceki_kadrolar),
                "gercek": gercek_kadrolar[ad],
                "gol": mac[f"{taraf}_score"],
                "xg": sum(s["xg"] for s in sutlar if s["takim"] == takim[f"{alan}_name"]),
                **ozet(olaylar, takim[f"{alan}_id"]),
            })
        maclar.append({
            "id": kimlik, "tarih": mac["match_date"],
            "tur": mac["competition_stage"]["name"], "takimlar": takimlar,
            "sutlar": sutlar,
        })
    hedef = KLASOR / "src" / "maclar.json"
    hedef.parent.mkdir(exist_ok=True)
    hedef.write_text(json.dumps(maclar, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    maclari_aktar()
