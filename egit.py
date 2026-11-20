import json

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from aktar import maclari_aktar, sut_tablosu
from veri import KLASOR, oku
from xg import ozellikler, tahmin


def egit():
    maclar = oku(KLASOR / "matches.json")
    egitim, test = [], []
    for mac in maclar:
        kimlik = mac["match_id"]
        if mac["match_date"] < "2022-12-17":
            egitim.extend(oku(KLASOR / "egitim" / f"{kimlik}.json"))
        else:
            test.extend(sut_tablosu(oku(KLASOR / "data" / f"{kimlik}.json")))
    y = [s["gol"] for s in egitim]
    model = make_pipeline(StandardScaler(), LogisticRegression())
    model.fit([ozellikler(s) for s in egitim], y)
    olcek, regresyon = model.steps[0][1], model.steps[1][1]
    # Katsayıları özgün birimlere çevirerek uygulamayı sklearn bağımlılığından ayır.
    agirliklar = regresyon.coef_[0] / olcek.scale_
    sonuc = {
        "ozellikler": ["mesafe_m", "aci_derece", "penalti"],
        "katsayilar": agirliklar.tolist(),
        "sabit": float(regresyon.intercept_[0] - agirliklar @ olcek.mean_),
        "egitim_mac": sum(m["match_date"] < "2022-12-17" for m in maclar),
        "egitim_sut": len(y), "test_sut": len(test),
    }
    gercek = [s["gol"] for s in test]
    tahminler = [tahmin(sonuc, s) for s in test]
    olasiliklar = model.predict_proba([ozellikler(s) for s in test])[:, 1]
    assert max(abs(a - b) for a, b in zip(tahminler, olasiliklar)) < 1e-10
    sonuc["brier"] = float(brier_score_loss(gercek, tahminler))
    sonuc["referans_brier"] = float(brier_score_loss(gercek, [sum(y) / len(y)] * len(test)))
    (KLASOR / "xg_model.json").write_text(json.dumps(sonuc, indent=2), encoding="utf-8")
    maclari_aktar()
    print(sonuc)


if __name__ == "__main__":
    egit()
