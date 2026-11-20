# SAHA · Futbol analizi

2022 Dünya Kupası finali ve üçüncülük maçı için React ve Python ile geliştirilmiş bir bitirme projesi demosu. Maç önü ekranında son beş maçın formu ve tahmini ilk 11, maç sonu ekranında gerçek kadro, pas istatistikleri, şut haritası ve kendi modelimizin xG değerleri gösterilir.

## Yerelde çalıştırma

Python 3.11 ve Node.js 22.12 veya daha yeni bir LTS sürümünü kurun. Depoyu klonladıktan sonra proje klasöründe çalıştırın.

```sh
npm ci
npm run dev
```

Terminaldeki **Local** adresini açın. Windows PowerShell komutu engellerse `npm.cmd ci` ve `npm.cmd run dev` kullanabilirsiniz. Python'un `python` komutuyla erişilebilir olması gerekir. Demo maçları, eğitim şutları ve eğitilmiş model depoya dahildir. Başlatma komutu Python ile maç özetlerini üretir ve React arayüzünü açabileceğiniz yerel sunucuyu başlatır.

## Birlikte geliştirme

Her değişiklik için güncel `main` dalından bir çalışma dalı açın. Örneğin `git switch -c oyuncu-paslari`. Değişiklikleri kaydettikten sonra `npm run build` ile derlemeyi kontrol edin. Dalı GitHub'a gönderip bir pull request açın.

## Veri ve model

Veri kaynağı [StatsBomb Open Data](https://github.com/statsbomb/open-data). Ham maç kayıtlarından şut ve pas özetleri Python ile üretilir. Lojistik regresyon modeli önceki 62 maçın şutlarıyla eğitilmiştir. Modeli yeniden eğitmek için bir Python sanal ortamında `python -m pip install -r requirements.txt` ve ardından `python egit.py` çalıştırın.
