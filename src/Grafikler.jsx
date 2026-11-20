import React, { useState } from 'react';

const renkler = ['#00796d', '#a8461f'];
const sayi = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });

export function FormGrafigi({ takimlar, ad }) {
  const [olcu, sec] = useState('xg');
  const seriler = takimlar.map(t => [...t.form.gecmis].reverse().map(m => ({
    mac: m, deger: olcu === 'xg' ? m.xg : m.pas ? 100 * m.isabet / m.pas : null,
  })));
  const tavan = olcu === 'xg' ? Math.max(1, Math.ceil(Math.max(...seriler.flat().map(p => p.deger ?? 0)))) : 100;
  const adet = Math.max(1, ...seriler.map(s => s.length));
  const x = i => 36 + 404 * i / Math.max(1, adet - 1);
  const y = n => 150 - 128 * n / tavan;
  return <section className="stats chart"><div className="sut-baslik"><h2>Son maçlarda form</h2>
    <div className="switch">{[['xg','xG'], ['pas','Pas %']].map(([k, etiket]) =>
      <button key={k} aria-pressed={olcu === k} onClick={() => sec(k)}>{etiket}</button>)}</div></div>
    <p className="sut-not">Önceki maçlar · eskiden yeniye</p>
    <svg viewBox="0 0 470 182" role="img" aria-label={olcu === 'xg' ? 'Maçlara göre beklenen gol' : 'Maçlara göre pas isabet yüzdesi'}>
      {[0,.25,.5,.75,1].map(k => <g key={k}><line x1="36" x2="440" y1={y(k*tavan)} y2={y(k*tavan)} stroke="#d7e2df" strokeDasharray="3 4"/>
        <text x="30" y={y(k*tavan)+4} textAnchor="end">{sayi.format(k*tavan)}</text></g>)}
      {Array.from({length:adet}, (_,i) => <text key={i} x={x(i)} y="174" textAnchor="middle">{i+1}. maç</text>)}
      {seriler.map((seri,t) => {
        const noktalar = seri.map((p,i) => ({...p, x:x(adet-seri.length+i)})).filter(p => p.deger != null);
        return <g key={t}><polyline points={noktalar.map(p => [p.x,y(p.deger)].join(',')).join(' ')}
          fill="none" stroke={renkler[t]} strokeWidth="3" strokeDasharray={t ? '7 4' : undefined}/>
          {noktalar.map(p => <circle key={p.mac.id} cx={p.x} cy={y(p.deger)} r="4" fill="white" stroke={renkler[t]} strokeWidth="2">
            <title>{ad(takimlar[t])} · {p.mac.tarih} · {sayi.format(p.deger)} {olcu === 'xg' ? 'xG' : '%'}</title></circle>)}</g>;
      })}
    </svg>
    <div className="chart-key">{takimlar.map((t,i) => <span key={t.ad}><i style={{borderColor:renkler[i],borderStyle:i?'dashed':'solid'}}/>{ad(t)}</span>)}</div>
  </section>;
}

export function SutHaritasi({ sutlar, takimlar, ad }) {
  return <figure className="map"><figcaption>Şut haritası <small>Hücum yönü →</small></figcaption>
    <svg viewBox="-3 -3 126 86" role="img" aria-label={sutlar.length + ' şutun saha üzerindeki konumu'}>
      <g fill="none" stroke="#76a397" strokeWidth=".48">
        <rect width="120" height="80"/><path d="M60 0v80 M0 18h18v44H0 M120 18h-18v44h18 M0 30h6v20H0 M120 30h-6v20h6"/>
        <circle cx="60" cy="40" r="10"/><circle cx="60" cy="40" r=".6"/>
        <path d="M18 32a10 10 0 0 1 0 16 M102 32a10 10 0 0 0 0 16"/>
      </g>
      {sutlar.map(s => <circle key={s.id} cx={s.x} cy={s.y} r={1 + 2*Math.sqrt(s.xg)} fill={s.takim === takimlar[0].ad ? '#8ff5d0' : '#ffa878'}
        stroke={s.gol ? 'white' : '#15362e'} strokeWidth={s.gol ? .85 : .32}>
        <title>{s.oyuncu} · {s.dakika}′ · {sayi.format(s.xg)} xG{s.gol ? ' · Gol' : ''}</title></circle>)}
    </svg>
    <div className="map-key">{takimlar.map((t,i) => <span key={t.ad}><b style={{color:i?'#ffa878':'#8ff5d0'}}>●</b> {ad(t)}</span>)}</div>
    <p>Nokta büyüklüğü xG’yi, beyaz halka golü gösterir.</p>
  </figure>;
}
