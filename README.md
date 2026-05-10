# Passora – CBAM Readiness & Carbon Intelligence Platform

## Passora Nedir?

Passora, Avrupa Birliği CBAM (Carbon Border Adjustment Mechanism) düzenlemesine uyum sağlamak isteyen demir-çelik ihracatçıları için geliştirilmiş bir dijital uyum ve karbon zekâ platformudur.

## Ne Hesaplar?

- **Direkt emisyon**: Yakıt tüketimi (doğalgaz, kok gazı vb.)
- **Elektrik emisyonu**: Onsite üretim ve grid elektriği (split/average yöntemi)
- **Precursor/hammadde emisyonu**: Billet, slab ve diğer girdilerin gömülü karbon ayak izi
- **Taşıma emisyonu**: Hammadde ve ürün lojistiği
- **EPD benchmark karşılaştırması**: Steel Profile EPD-IES-0023407 (2.29 tCO₂e/ton)
- **Risk seviyesi**: Low / Medium / High / Critical
- **Veri kalite skoru (DQ Score)**: 0–100
- **Karbon eşdeğerliği**: Fidan/ağaç eşdeğeri (farkındalık amaçlı)

## Kimler Kullanır?

- Demir-çelik ihracatçıları (AB'ye)
- Carbon Officer / Sürdürülebilirlik ekipleri
- CBAM uyum sorumluları
- Kurumsal yöneticiler (Admin)

## Kullanıcı Rolleri

| Rol | Erişim |
|-----|--------|
| **Admin** | Tüm firmalar, tüm raporlar, sistem durumu, tedarikçi senaryo analizi |
| **Company User (Carbon Officer)** | Yalnızca kendi firmasının verileri ve hesaplamaları |

---

## Çalıştırma

### Backend

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend http://localhost:8000 adresinde çalışır.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend http://localhost:5173 adresinde çalışır.

---

## Demo Kullanıcılar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@passora.com | admin123 |
| Fabrika Kullanıcısı | user@passora.com | user123 |

---

## API Endpoint Listesi

| Endpoint | Yöntem | Açıklama |
|----------|--------|----------|
| `/health` | GET | Sistem sağlık kontrolü |
| `/api/auth/login` | POST | Kullanıcı girişi |
| `/api/auth/me` | GET | Aktif kullanıcı bilgisi |
| `/api/admin/summary` | GET | Admin özet istatistikler |
| `/api/admin/reports` | GET | Tüm hesaplama raporları |
| `/api/admin/supplier-scenarios` | GET | Tedarikçi senaryo analizi |
| `/api/cbam/steel/calculate` | POST | Emisyon hesaplama |
| `/api/cbam/steel/classify-cn/{cn_code}` | GET | CN kodu sınıflandırma |
| `/api/cbam/steel/check-missing-data` | POST | Eksik veri analizi |
| `/api/cbam/steel/compare-suppliers` | POST | Tedarikçi karşılaştırması |
| `/api/cbam/steel/reduction-advice` | POST | Azaltım önerileri |
| `/api/cbam/steel/offset-equivalents` | POST | Karbon eşdeğerliği |
| `/api/cbam/epd/steel-profile` | GET | EPD benchmark verisi |
| `/api/reports` | GET | Raporlar |
| `/api/reports/{id}` | GET | Rapor detayı |

---

## Demo Veri

**Firma:** Örnek Demir Çelik A.Ş.  
**Ürün:** Steel Profile | CN: 7216 | Rota: BF-BOF | Miktar: 1000 ton

**Yakıtlar:**
- Doğalgaz: 50,000 birim, NCV: 0.000034, EF: 56.1
- Kok Gazı: 120,000 birim, NCV: 0.000017, EF: 44.4

**Elektrik:** 600,000 kWh onsite + 400,000 kWh grid (split method)

**Precursor:** Billet, 1020 ton, EF: 2.10 tCO₂e/ton

**Taşıma:** 1000 ton × 250 km × 0.062 kgCO₂e/ton-km

---

## Ana Hesap Formülleri

```
total_emission = fuel + electricity + precursor + transport

fuel = amount × NCV × EF × oxidation_factor × (1 - biomass_share)

electricity (split) = (onsite_kwh × onsite_ef + grid_kwh × grid_ef) / 1000

precursor = amount_ton × emission_factor_tco2e_per_ton

transport = mass_ton × distance_km × ef_kgco2e_per_ton_km / 1000

specific_emission = total_emission / production_amount_ton

epd_difference_percent = (specific - 2.29) / 2.29 × 100
```

---

## Risk Seviyesi Mantığı

| Seviye | Fark (EPD'ye göre) | Renk |
|--------|---------------------|------|
| Low | ≤ 0% | Yeşil |
| Medium | 0–25% | Amber |
| High | 25–50% | Turuncu |
| Critical | > 50% | Kırmızı |

---

## Default Değer Mantığı

Kullanıcı bazı alanları boş bırakırsa sistem durmaz, ancak varsayılan değer kullanıldığında:
- API response'ta `used_default: true` döner
- Frontend'de sarı uyarı paneli gösterilir
- DQ skoru düşer
- Varsayılan değerler ihtiyatlı seçildiğinden sonuç gerçek değerden yüksek çıkabilir

**Default atanmaz (zorunlu):** CN kodu, üretim miktarı, ürün adı, firma adı

---

## Veri Kalite Skoru

100'den başlar, eksik/yetersiz alanlara göre düşer:
- Critical eksik: -25 puan
- High eksik: -15 puan
- Medium eksik: -8 puan
- Öneri: -3 puan

**Yorumu:** 85+ → İyi | 65–84 → Gözden Geçirilmeli | 40–64 → Zayıf | 0–39 → Yetersiz

---

## AI Öneri Motoru

MVP'de rule-based carbon advisor olarak çalışır. Emisyon kaynaklarının toplam içindeki payına göre:
- %25+ pay → High priority öneri
- %50+ pay → Critical priority öneri

Her kaynak için spesifik eylem önerileri sunar.

---

## EPD ve CBAM Farkı

| | EPD Benchmark | CBAM Hesaplama |
|---|---|---|
| Amaç | Ürün karbon ayak izi beyanı | Sınır karbon vergisi hesabı |
| Kapsam | A1-A3 yaşam döngüsü | Üretim sürecinde gömülü emisyon |
| Kullanım | Referans/benchmark | Resmi vergi matrahı |
| Passora | Karşılaştırma amaçlı | Asıl hesaplama hedefi |

---

## Testleri Çalıştırma

```bash
cd backend
pytest app/tests/ -v
```

---

## Mimari Notlar

- **Clean Architecture**: Controller → Service → Domain katmanları
- **Repository Pattern**: Mock JSON → ileride PostgreSQL geçişi için hazır
- **Katmanlı mimari**: `domain/`, `services/`, `repositories/`, `api/routes/`
- **Pydantic v2** ile tip güvenli request/response şemaları
- **CORS açık**: Frontend-backend lokal iletişimi için

---

## Metodoloji Uyarıları

> EPD benchmark resmi CBAM hesabının yerine geçmez. Bu karşılaştırma karar destek, veri kalitesi kontrolü ve ön analiz amacıyla sunulur.

> Ağaç eşdeğerliği yalnızca farkındalık/eşdeğerlik amaçlıdır. CBAM resmi mahsuplaşması veya doğrulanmış karbon kredisi yerine geçmez.

> Bu platform CBAM Implementing Regulation (EU) 2023/1773 çerçevesinde tasarlanmıştır. Nihai CBAM bildirimi için Verifying Authority onayı gereklidir.
