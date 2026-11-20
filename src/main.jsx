import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import maclar from './maclar.json';
import './style.css';
import KadroSahasi from './KadroSahasi';
import { FormGrafigi, SutHaritasi } from './Grafikler';

const adlar = {
  Argentina: 'Arjantin', France: 'Fransa', Croatia: 'Hırvatistan', Morocco: 'Fas',
  Australia: 'Avustralya', Brazil: 'Brezilya', Mexico: 'Meksika', Poland: 'Polonya',
  Netherlands: 'Hollanda', Portugal: 'Portekiz', Denmark: 'Danimarka', England: 'İngiltere',
  Tunisia: 'Tunus', Belgium: 'Belçika', Canada: 'Kanada', Spain: 'İspanya', Japan: 'Japonya',
};
const ad = takim => adlar[takim.ad] ?? takim.ad;
const tur = mac => mac.tur === '3rd Place Final' ? 'Üçüncülük maçı' : mac.tur;
const tarih = deger => new Date(deger + 'T12:00:00').toLocaleDateString('tr-TR', { dateStyle: 'long' });
const olculer = [['xg', 'Beklenen gol (xG)'], ['şut', 'Toplam şut'], ['pas', 'Toplam pas'], ['isabet', 'Başarılı pas'], ['oran', 'Pas isabeti']];
const xgBicimi = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Karsilastirma({ takimlar, alan, baslik }) 
{
  const degerler = takimlar.map(t => t[alan]);
  const toplam = degerler.reduce((a, b) => a + (b ?? 0), 0);
  function goster(n) {
    if (n == null) return '—';
    if (alan === 'xg') return xgBicimi.format(n);
    return alan === 'oran' ? '%' + n.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) : n;
  }
  return <div className="metric">
    <div className="values"><strong>{goster(degerler[0])}</strong><span>{baslik}</span><strong>{goster(degerler[1])}</strong></div>
    <div className="bars" aria-hidden="true">{degerler.map((n, i) =>
      <i key={i} style={{ width: (alan === 'oran' ? n : toplam ? n / toplam * 100 : 0) + '%' }} />
    )}</div>
  </div>;
}

const sonuclar = {
  Goal: 'Gol', Saved: 'Kurtarıldı', Blocked: 'Engellendi',
  'Off T': 'Aut', Wayward: 'Kaleden uzak', Post: 'Direk',
  'Saved to Post': 'Kurtarış ve direk', 'Saved Off Target': 'Kaleyi bulmayan şuta müdahale',
};
const ondalik = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

function Sutlar({ mac }) 
{
  const [takim, takimSec] = useState('');
  const sutlar = mac.sutlar.filter(sut => !takim || takim === sut.takim);
  return <section className="stats">
    <div className="sut-baslik"><h2>Şut analizi</h2>
      <label>Takım<select value={takim} onChange={e => takimSec(e.target.value)}>
        <option value="">İki takım</option>
        {mac.takimlar.map(t => <option key={t.ad} value={t.ad}>{ad(t)}</option>)}
      </select></label>
    </div>
    <p className="sut-not">Modelimiz xG değerini şutun mesafesi, kaleyi gördüğü açı ve penaltı bilgisiyle hesaplar. 0,20 xG, %20 gol olasılığıdır. Ölçüler 105 × 68 m referans saha içindir.</p>
    <div className="shot-grid"><SutHaritasi sutlar={sutlar} takimlar={mac.takimlar} ad={ad} />
    <div className="sut-liste" tabIndex="0" role="region" aria-label="Kaydırılabilir şut listesi"><table>
      <caption>{sutlar.length} şut · Maç saatine göre</caption>
      <thead><tr>{['Süre', 'Oyuncu', 'Takım', 'Mesafe', 'Açı', 'xG', 'Sonuç'].map(s => <th key={s} scope="col">{s}</th>)}</tr></thead>
      <tbody>{sutlar.map(s => <tr key={s.id}>
        <td>{s.dakika}:{String(s.saniye).padStart(2, '0')}</td><td>{s.oyuncu}</td>
        <td>{adlar[s.takim] ?? s.takim}</td><td>{ondalik.format(s.mesafe)} m</td>
        <td>{ondalik.format(s.aci)}°</td>
        <td>{xgBicimi.format(s.xg)}</td>
        <td className={s.gol ? 'gol' : undefined}>{sonuclar[s.sonuc] ?? s.sonuc}{s.tur === 'Penalty' && ' (penaltı)'}</td>
      </tr>)}</tbody>
    </table></div></div>
  </section>;
}

function MacOnu({ takimlar }) 
{
  return <><div className="form-grid"><section className="stats"><h2>Maç öncesi form</h2>
    <p className="sut-not">Her takımın önceki beş turnuva maçı. Maç başına xG uzatmaları içerir. Pas isabeti, bu maçlardaki başarılı pasların toplam paslara oranıdır.</p>
    <div className="legend">{takimlar.map(t => <span key={t.ad}>{ad(t)} · {t.form.gecmis.length} maç</span>)}</div>
    <div><Karsilastirma takimlar={takimlar.map(t => t.form)} alan="xg" baslik="Maç başına xG" />
      <Karsilastirma takimlar={takimlar.map(t => t.form)} alan="oran" baslik="Pas isabeti" /></div>
    </section><FormGrafigi takimlar={takimlar} ad={ad}/></div>
    <details className="stats history" open><summary>Hesaba katılan maçlar</summary>
      <div className="gecmis">{takimlar.map(t => <div key={t.ad}><h3>{ad(t)}</h3>
        <table><thead><tr>{['Tarih', 'Rakip', 'xG', 'İsabet / pas'].map(k => <th key={k}>{k}</th>)}</tr></thead>
          <tbody>{t.form.gecmis.map(m => <tr key={m.id}>
            <td>{tarih(m.tarih)}</td><td>{adlar[m.rakip] ?? m.rakip}</td>
            <td>{xgBicimi.format(m.xg)}</td><td>{m.isabet} / {m.pas}</td>
          </tr>)}</tbody></table></div>)}</div>
    </details></>;
}

const mevkiler = [
  '', 'Kaleci', 'Sağ bek', 'Sağ stoper', 'Stoper', 'Sol stoper', 'Sol bek',
  'Sağ kanat bek', 'Sol kanat bek', 'Sağ ön libero', 'Ön libero', 'Sol ön libero',
  'Sağ orta saha', 'Sağ iç', 'Merkez orta saha', 'Sol iç', 'Sol orta saha',
  'Sağ kanat', 'Sağ ofansif orta saha', 'Ofansif orta saha', 'Sol ofansif orta saha',
  'Sol kanat', 'Sağ forvet', 'Santrfor', 'Sol forvet', 'İkinci forvet',
];

function Kadrolar({ takimlar, macOncesi }) {
  return <section className="stats"><h2>{macOncesi ? 'Muhtemel ilk 11' : 'Gerçek ilk 11 ve tahmin'}</h2>
    {macOncesi && <p className="sut-not">Son beş maçta en sık kullanılan diziliş ve oyuncuların mevkilerindeki başlangıç sayıları esas alınır. Eşitlikte yakın tarihli maçlar önceliklidir.</p>}
    <div className="kadro-grid">{takimlar.map(t => {
      const gorunen = macOncesi ? t.tahmin : t.gercek;
      const secilen = new Set(t.tahmin?.oyuncular.map(o => o.id));
      return <div key={t.ad}>{gorunen && <KadroSahasi takim={t.ad} baslik={ad(t) + (macOncesi ? ' · Tahmini 11' : ' · Gerçek 11')} kadro={gorunen} mevkiler={mevkiler}/>}
        {!macOncesi && t.tahmin && <p className="sut-not">
          {t.gercek.oyuncular.filter(o => secilen.has(o.id)).length}/11 oyuncu doğru.
          {' '}Diziliş tahmini {t.tahmin.dizilis} · {t.tahmin.dizilis === t.gercek.dizilis ? 'doğru' : 'farklı'}.
        </p>}
        {gorunen ? <details><summary>Kadro detayları</summary><table><thead><tr><th>Mevki</th><th>Oyuncu</th>{!macOncesi && <th>Tahminde</th>}</tr></thead>
          <tbody>{gorunen.oyuncular.map(o => <tr key={o.id}><td>{mevkiler[o.mevki] ?? o.mevki}</td><td>{o.ad}</td>
            {!macOncesi && <td>{secilen.has(o.id) ? 'Evet' : 'Hayır'}</td>}</tr>)}</tbody></table></details>
          : <p>Önceki maç kadrosu bulunmuyor.</p>}
      </div>;
    })}</div></section>;
}

function App() {
  const [mac, sec] = useState(maclar[0]);
  const [macOncesi, macOncesiSec] = useState(true);
  if (!mac) return <main><h1>Maç verisi bulunamadı</h1><p>Proje klasöründe python veri.py çalıştırıp uygulamayı yeniden başlatın.</p></main>;
  const [ev, deplasman] = mac.takimlar;
  return <>
    <header><div className="wrap brand"><span className="mark" aria-hidden="true">◉</span> SAHA <span className="brand-detail">Futbol analizi</span></div></header>
    <main className="wrap">
      <p className="kicker">2022 DÜNYA KUPASI</p>
      <div className="heading"><h1>Maç analizi</h1>
        <label>Karşılaşma<select value={mac.id} onChange={e => sec(maclar.find(m => m.id === Number(e.target.value)))}>
          {maclar.map(m => <option key={m.id} value={m.id}>{m.takimlar.map(ad).join(' – ')}</option>)}
        </select></label>
      </div>
      <section className="score" aria-label="Karşılaşma">
        <div className="meta"><b>{tur(mac)}</b><span>{tarih(mac.tarih)}</span></div>
        <div className="result"><h2>{ad(ev)}</h2><strong>{macOncesi ? <small>vs</small> : <>{ev.gol} <small>–</small> {deplasman.gol}</>}</strong><h2>{ad(deplasman)}</h2></div>
      </section>
      <div className="gorunum" role="group" aria-label="Analiz görünümü">
        <button aria-pressed={macOncesi} onClick={() => macOncesiSec(true)}>Maç önü</button>
        <button aria-pressed={!macOncesi} onClick={() => macOncesiSec(false)}>Maç sonu</button>
      </div>
      {macOncesi ? <MacOnu key={mac.id} takimlar={mac.takimlar} /> : <><section className="stats"><h2>Takım istatistikleri</h2>
        <div className="legend"><span>{ad(ev)}</span><span>{ad(deplasman)}</span></div>
        {olculer.map(([alan, baslik]) => <Karsilastirma key={alan} takimlar={mac.takimlar} alan={alan} baslik={baslik} />)}
      </section>
      <Sutlar key={mac.id} mac={mac} /></>}
      <Kadrolar takimlar={mac.takimlar} macOncesi={macOncesi} />
      <footer><span>Uzatmalar dahil, seri penaltılar hariç.</span><a href="https://github.com/statsbomb/open-data">StatsBomb Open Data ↗</a></footer>
    </main>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
