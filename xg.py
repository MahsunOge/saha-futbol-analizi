import math


def ozellikler(sut):
    return [sut["mesafe"], sut["aci"], int(sut["tur"] == "Penalty")]


def tahmin(model, sut):
    puan = model["sabit"] + sum(
        agirlik * deger for agirlik, deger in zip(model["katsayilar"], ozellikler(sut), strict=True)
    )
    return 1 / (1 + math.exp(-puan))
