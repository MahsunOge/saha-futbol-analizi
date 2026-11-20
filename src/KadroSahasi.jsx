import React from 'react';
import './saha.css';

// Kaleci altta, takım yukarı hücum eder. Sol kanat ekranda soldadır.
const yataySira = [0,0,4,3,2,1,0,4,0,3,2,1,4,3,2,1,0,4,3,2,1,0,3,2,1,2];
const kisaAdlar = {
  29201:'Molina', 7797:'De Paul', 27886:'Mac Allister', 5503:'Messi',
  2995:'Di María', 3009:'Mbappé', 5245:'Hakimi', 7459:'El Yamiq',
  31295:'Attiyat Allah', 156734:'El Khannous',
};

export default function KadroSahasi({ takim, baslik, kadro, mevkiler }) {
  const oyuncular = [...kadro.oyuncular].sort((a,b) => a.mevki - b.mevki);
  let baslangic = 0;
  const hatlar = [1, ...kadro.dizilis.split('-').map(Number)].map(adet => {
    const hat = oyuncular.slice(baslangic, baslangic + adet);
    baslangic += adet;
    return hat.sort((a,b) => yataySira[a.mevki] - yataySira[b.mevki]);
  }).reverse();
  return <figure className="kadro-kart" data-team={takim}>
    <figcaption><strong>{baslik}</strong><span aria-label={'Diziliş ' + kadro.dizilis}>{kadro.dizilis}</span></figcaption>
    <div className="kadro-saha">
      <svg className="saha-cizgi" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth=".4">
          <rect x="1" y="1" width="98" height="98"/><path d="M1 50h98 M23 1v14h54V1 M37 1v5h26V1 M23 99V85h54v14 M37 99v-5h26v5"/>
          <ellipse cx="50" cy="50" rx="11" ry="8"/><path d="M41 15q9 8 18 0 M41 85q9-8 18 0"/>
        </g>
      </svg>
      {hatlar.map((hat,i) => <div className="kadro-hat" key={i}>{hat.map(o =>
        <div className="kadro-oyuncu" key={o.id} title={o.ad + ' · ' + mevkiler[o.mevki]}
          aria-label={[o.ad, mevkiler[o.mevki], o.numara].join(', ')}>
          <span className={'forma' + (o.mevki === 1 ? ' kaleci' : '')}><b>{o.numara ?? '–'}</b></span>
          <span className="forma-ad">{kisaAdlar[o.id] ?? o.ad.split(' ').at(-1)}</span>
        </div>)}</div>)}
    </div>
  </figure>;
}
