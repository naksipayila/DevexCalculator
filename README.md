<div align="center">

<img src="icon-512.png" alt="DevEx Calculator" width="96" />

# DevEx Calculator

**Robux → USD → TL** — DevEx ödemelerini saniyeler içinde hesapla.

Sıfır bağımlılık · tamamen statik · PWA · offline çalışır

[**🚀 Canlı Demo**](https://naksipayila.github.io/DevexCalculator/)

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-offline-blueviolet?style=flat-square)

</div>

<br />

<table align="center">
  <tr>
    <td align="center"><img src="assets/screenshot-dark.png" alt="Koyu tema" width="420" /></td>
    <td align="center"><img src="assets/screenshot-light.png" alt="Açık tema" width="420" /></td>
  </tr>
  <tr>
    <td align="center"><sub>🌙 Koyu Tema</sub></td>
    <td align="center"><sub>☀️ Açık Tema</sub></td>
  </tr>
</table>

---

## ✨ Özellikler

| | |
|---|---|
| 💱 **Anlık dönüşüm** | Robux veya USD giriş modu; diğer para birimleri her tuş vuruşunda hesaplanır |
| 📈 **Canlı USD/TRY** | [open.er-api.com](https://open.er-api.com/) üzerinden güncel kur; manuel kur girişi ve canlı kurda sıfırlama |
| 🧾 **Brüt fiyat hesaplayıcı** | %30 Roblox komisyonu sonrası hedef net Robux için istenmesi gereken satış fiyatı + komisyon dökümü |
| ✅ **DevEx minimum uyarısı** | 30,000 R$ altı tutarlarda anında bilgilendirme |
| 📋 **Tek tıkla kopyalama** | Robux, USD, TRY ve brüt fiyat değerleri panoya kopyalanır |
| 🌗 **Koyu / açık tema** | Tercih tarayıcıda saklanır |
| 📴 **Offline (PWA)** | Service worker ile uygulama kabuğu önbelleklenir, kur önbellekten gösterilir |

---

## 🧮 Nasıl Hesaplıyor?

```text
USD      = Robux × 0.0038        (sabit DevEx kuru)
TRY      = USD × kur              (canlı / manuel USD/TRY)
Brüt Fiyat = ⌈ Net Robux ÷ 0.70 ⌉ (%30 komisyon sonrası neti tutturmak için)
```

> DevEx kuru (1 R$ = $0.0038) ve %30 pazar yeri komisyonu Roblox tarafından belirlenir;
> nihai uygunluk ve ödeme koşulları için resmi Roblox dokümanlarına bakın.

---

## ⚡ Hızlı Başlangıç

Kurulum yok, build yok — sadece statik dosyalar:

```bash
# yerelde çalıştır
python -m http.server 8000
# → http://localhost:8000
```

> Service worker ve pano API'si için `localhost` gibi güvenli bir bağlam gerekir (`file://` çalışmaz).

---

## 📁 Proje Yapısı

```text
DevexCalculator/
├── index.html            # Markup, a11y, cache-busted asset referansları
├── app.js                # Tüm state, hesaplama, kur çekme, kalıcılık
├── style.css             # Design token'lar, koyu/açık tema, layout
├── sw.js                 # Cache-first app-shell service worker
├── manifest.webmanifest  # PWA manifest
└── assets/               # Ekran görüntüleri
```

---

<div align="center">

Roblox geliştiricileri için sevgiyle yapıldı 💛

</div>
