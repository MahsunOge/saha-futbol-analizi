import streamlit as st

from veri import KLASOR, oku, ozet

st.set_page_config(page_title="Maç Analizi", page_icon="⚽")
st.caption("FUTBOL ANALİZİ  /  2022 DÜNYA KUPASI")
st.title("Maç analizi")

liste = KLASOR / "matches.json"
maclar = oku(liste) if liste.exists() else []
maclar = sorted(
    [m for m in maclar if (KLASOR / "data" / f"{m['match_id']}.json").exists()],
    key=lambda m: m["match_date"],
    reverse=True,
)
if not maclar:
    st.info("Maç verilerini almak için proje klasöründe python veri.py çalıştırın.")
    st.stop()


def mac_adi(mac):
    return f"{mac['home_team']['home_team_name']} – {mac['away_team']['away_team_name']}"


secenekler = {mac_adi(m): m for m in maclar}
mac = secenekler[st.selectbox("Karşılaşma", list(secenekler))]
olaylar = oku(KLASOR / "data" / f"{mac['match_id']}.json")
st.caption(mac["match_date"] + "  ·  " + mac["competition_stage"]["name"])
for sutun, taraf, gol in zip(st.columns(2), ("home_team", "away_team"), ("home_score", "away_score")):
    takim = mac[taraf]
    sonuc = ozet(olaylar, takim[f"{taraf}_id"])
    with sutun.container(border=True):
        st.subheader(takim[f"{taraf}_name"])
        st.metric("Gol", mac[gol])
        st.metric("Şut", sonuc["şut"])
        oran = sonuc["oran"]
        st.metric("Pas isabeti", f"%{oran:.1f}".replace(".", ",") if oran is not None else "—")
        st.caption(f"{sonuc['pas']} pasın {sonuc['isabet']} tanesi isabetli")

st.caption("Skor ve şut sayıları uzatmaları içerir. Seri penaltılar hariçtir.")
st.markdown("Veri kaynağı · [StatsBomb Open Data](https://github.com/statsbomb/open-data)")
