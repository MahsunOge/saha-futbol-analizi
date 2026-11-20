import json
from concurrent.futures import ThreadPoolExecutor
from tempfile import TemporaryDirectory
from pathlib import Path

from aktar import sut_tablosu
from veri import KLASOR, indir, oku


def sutlari_indir(mac):
    kimlik = mac["match_id"]
    hedef = KLASOR / "egitim" / f"{kimlik}.json"
    if hedef.exists():
        return
    with TemporaryDirectory() as klasor:
        ham = Path(klasor) / "olaylar.json"
        indir(f"events/{kimlik}.json", ham)
        sutlar = sut_tablosu(oku(ham))
    hedef.parent.mkdir(exist_ok=True)
    gecici = hedef.with_suffix(".tmp")
    gecici.write_text(json.dumps(sutlar, ensure_ascii=False), encoding="utf-8")
    gecici.replace(hedef)


if __name__ == "__main__":
    maclar = [m for m in oku(KLASOR / "matches.json") if m["match_date"] < "2022-12-17"]
    with ThreadPoolExecutor(max_workers=4) as havuz:
        list(havuz.map(sutlari_indir, maclar))
    print(len(maclar), "mac hazir.")
