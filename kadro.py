from collections import Counter, defaultdict


def ilk_on_bir(olaylar):
    kadrolar = {}
    for olay in olaylar:
        if olay["type"]["name"] != "Starting XI":
            continue
        taktik = olay["tactics"]
        kadrolar[olay["team"]["name"]] = {
            "dizilis": "-".join(str(taktik["formation"])),
            "oyuncular": [
                {"id": o["player"]["id"], "ad": o["player"]["name"], "mevki": o["position"]["id"],
                 "numara": o.get("jersey_number")}
                for o in taktik["lineup"]
            ],
        }
    return kadrolar


def tahmini_kadro(gecmis):
    if not gecmis:
        return None
    # Kayıtlar yeniden eskiye sıralı. Eşit sıklıkta en güncel diziliş seçilir.
    dizilis = Counter(k["dizilis"] for k in gecmis).most_common(1)[0][0]
    sablon = next(k for k in gecmis if k["dizilis"] == dizilis)
    mevkiler = [o["mevki"] for o in sablon["oyuncular"]]
    adaylar = defaultdict(Counter)
    adlar = {}
    numaralar = {}
    for sira, kadro in enumerate(gecmis):
        for o in kadro["oyuncular"]:
            adlar[o["id"]] = o["ad"]
            if o.get("numara") is not None:
                numaralar.setdefault(o["id"], o["numara"])
            # Öncelik bu mevkide başlama sayısı, eşitlikte yakın tarih.
            adaylar[o["id"]][o["mevki"]] += 1000 + len(gecmis) - sira

    # Her oyuncuyu bir kez değerlendir. Her dolu mevki kümesi için en iyi
    # toplam puanı saklayarak aynı oyuncunun iki kez seçilmesini engelle.
    planlar = {0: (0, {})}
    for oyuncu, puanlar in adaylar.items():
        onceki = list(planlar.items())
        for i, mevki in enumerate(mevkiler):
            if mevki not in puanlar:
                continue
            for maske, (puan, secim) in onceki:
                bit = 1 << i
                if maske & bit:
                    continue
                yeni = maske | bit
                toplam = puan + puanlar[mevki]
                if yeni not in planlar or toplam > planlar[yeni][0]:
                    planlar[yeni] = toplam, {**secim, i: oyuncu}
    _, secim = planlar[(1 << len(mevkiler)) - 1]
    return {"dizilis": dizilis, "oyuncular": [
        {"id": secim[i], "ad": adlar[secim[i]], "mevki": mevki, "numara": numaralar.get(secim[i])}
        for i, mevki in enumerate(mevkiler)
    ]}
