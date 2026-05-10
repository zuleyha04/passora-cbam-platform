# Passora – CBAM Readiness & Carbon Intelligence Platform

## Passora Nedir?

Passora, Avrupa Birliği CBAM (Carbon Border Adjustment Mechanism) düzenlemesine uyum sağlamak isteyen demir-çelik KOBİ’leri ve ihracatçıları için geliştirilmiş web tabanlı bir dijital uyum ve karbon zekâ platformudur.

Platformun amacı; firmaların ürün bazlı karbon emisyonlarını hesaplamasını, eksik verilerini takip etmesini, operasyon kullanıcılarından veri toplamasını, firma yöneticisinin hesaplamaları onaylamasını ve tedarikçi senaryolarıyla daha düşük karbonlu alternatifleri değerlendirmesini sağlamaktır.

---

## Ne Hesaplar?

Passora demir-çelik ürünleri için aşağıdaki emisyon kalemlerini dikkate alır:

- **Direkt emisyon:** Yakıt tüketimi, doğal gaz, kok gazı, kömür/kok vb.
- **Elektrik emisyonu:** Elektrik tüketimi, yenilenebilir elektrik oranı ve grid faktörü
- **Hammadde / precursor emisyonu:** Billet, slab, hurda, DRI/HBI ve diğer girdilerin gömülü karbon ayak izi
- **Lojistik emisyonu:** Hammadde veya ürün taşımacılığı
- **Tedarikçi emisyon faktörü:** EPD veya tedarikçi bazlı emisyon faktörü
- **EPD benchmark karşılaştırması:** Steel Profile EPD-IES-0023407 referansı, 2.29 tCO₂e/ton
- **Toplam emisyon:** tCO₂e
- **Spesifik emisyon:** tCO₂e/ton ürün
- **Risk seviyesi:** Düşük / Orta / Yüksek / Kritik
- **Veri kalite skoru:** 0–100
- **Eksik veri oranı**
- **Hesaplama modu:** Actual Data / Hybrid / Default
- **AI tabanlı karbon azaltım önerileri**
- **Tedarikçi senaryo simülasyonu**

---

## Kimler Kullanır?

Passora güncel yapıda üç farklı kullanıcı rolüyle çalışır:

| Rol | Açıklama |
|---|---|
| **Passora Super Admin** | Passora platform yöneticisidir. Tüm müşteri firmaları ve genel sistem durumunu görür. |
| **KOBİ Firma Admini** | Sadece kendi firmasını görür. Ürünleri, CBAM hesaplarını, onayları, kullanıcıları ve tedarikçi senaryolarını yönetir. |
| **Operasyon Kullanıcısı** | Üretim, enerji, lojistik, satın alma gibi alanlarda sadece kendisine atanmış verileri girer. |

---

## Kullanıcı Rolleri ve Erişimler

### 1. Passora Super Admin

Passora Super Admin, platformun genel yönetim rolüdür.

Menü yapısı:

- Dashboard
- Firmalar
- Firma Admini Atama
- Raporlar
- Ayarlar

Yapabilecekleri:

- Sisteme yeni KOBİ/firma ekler.
- Firma bilgilerini yönetir.
- Firmaya KOBİ Firma Admini atar.
- Tüm firmaların genel CBAM durumunu takip eder.
- Firma bazlı risk, veri kalitesi ve emisyon özetlerini izler.
- Platform seviyesinde genel raporları görür.

Bu rol firma içi operasyon verilerini detaylı olarak yönetmez. Firma içi süreçler KOBİ Firma Admini tarafından yönetilir.

---

### 2. KOBİ Firma Admini

KOBİ Firma Admini, demir-çelik firmasının kendi yöneticisi veya sürdürülebilirlik / CBAM sorumlusudur.

Menü yapısı:

- Firma Dashboard
- Ürünlerim
- CBAM Hesaplama
- Onay Bekleyenler
- Tedarikçi Senaryoları
- Kullanıcılar
- Ayarlar

Yapabilecekleri:

- Sadece kendi firmasını görür.
- Firma Dashboard üzerinden CBAM hazırlık skorunu takip eder.
- Ürün bazlı emisyon özetlerini inceler.
- CBAM kapsamındaki ürünlerini yönetir.
- Ürün için gerekli üretim, enerji, hammadde ve lojistik verilerini takip eder.
- Operasyon kullanıcılarına veri giriş sorumluluğu atar.
- Eksik veri, default veri ve hybrid hesaplama uyarılarını görür.
- Hesaplama sonuçlarını onaylar veya revizyon ister.
- Tedarikçi senaryoları ile farklı tedarikçilerin karbon ve maliyet etkisini simüle eder.
- AI tabanlı karbon azaltım önerilerini görür.

---

### 3. Operasyon Kullanıcısı

Operasyon Kullanıcısı, firma içindeki veri giriş sorumlusudur.

Menü yapısı:

- Görevlerim
- Veri Girişi
- Belgeler

Yapabilecekleri:

- Sadece kendisine atanmış görevleri görür.
- Üretim, enerji, hammadde, tedarikçi, lojistik veya belge verisi girer.
- PDF kanıt belgesi yükleyebilir.
- Boş veri girerse sistem default değer uyarısı gösterir.
- Veriyi KOBİ Firma Admini’nin onayına gönderir.
- Tüm firma raporlarını veya diğer kullanıcıların verilerini göremez.

---

## Genel İş Akışı

1. Passora Super Admin sisteme yeni firma ekler.
2. Firma bilgileri girilir.
3. Firma için KOBİ Firma Admini atanır.
4. KOBİ Firma Admini kendi paneline giriş yapar.
5. Firma ürünlerini tanımlar.
6. CBAM hesaplama için gerekli veri alanları sistemde gösterilir.
7. Operasyon kullanıcıları tanımlanır.
8. Operasyon kullanıcılarına üretim, enerji, hammadde, lojistik veya belge görevi atanır.
9. Operasyon kullanıcıları kendilerine atanmış verileri girer.
10. Eksik veri varsa sistem default değer uyarısı verir.
11. CBAM hesaplama motoru ürün bazlı emisyonu hesaplar.
12. Hesaplama sonucu onay bekleyenlere gönderilir.
13. KOBİ Firma Admini sonucu inceler.
14. KOBİ Firma Admini hesaplamayı onaylar veya revizyon ister.
15. Tedarikçi senaryoları üzerinden alternatif tedarikçiler karşılaştırılır.
16. Firma daha düşük karbonlu karar seçeneklerini görebilir.

---

## Güncel Sayfa Yapısı

### Passora Super Admin

| Route | Sayfa |
|---|---|
| `/admin` | Super Admin Dashboard |
| `/admin/companies` | Firmalar |
| `/admin/company-admins` | Firma Admini Atama |
| `/admin/reports` | Raporlar |
| `/admin/settings` | Ayarlar |

### KOBİ Firma Admini

| Route | Sayfa |
|---|---|
| `/company` | Firma Dashboard |
| `/company/products` | Ürünlerim |
| `/company/cbam-calculation` | CBAM Hesaplama |
| `/company/approvals` | Onay Bekleyenler |
| `/company/supplier-scenarios` | Tedarikçi Senaryoları |
| `/company/users` | Kullanıcılar |
| `/company/settings` | Ayarlar |

### Operasyon Kullanıcısı

| Route | Sayfa |
|---|---|
| `/operator` | Görevlerim |
| `/operator/data-entry` | Veri Girişi |
| `/operator/documents` | Belgeler |

---

## Firma Dashboard

KOBİ Firma Admini için ana kontrol ekranıdır.

Gösterilen bilgiler:

- CBAM Hazırlık Skoru
- Toplam Ürün
- Tamamlanan Hesaplama
- Eksik Veri
- Onay Bekleyen Hesaplama
- Kritik Riskli Ürün
- Ortalama DQ Skoru
- Ürün bazlı emisyon özeti
- Veri giriş durumu
- AI karbon azaltım önerileri

---

## Ürünlerim Sayfası

Bu sayfa firmanın CBAM kapsamındaki ürün portföyünü gösterir.

Özellikler:

- Ürün adı
- CN kodu
- Ürün tipi
- Üretim yöntemi
- Üretim miktarı
- Toplam emisyon
- Spesifik emisyon
- Veri kalite skoru
- Risk seviyesi
- Hesaplama durumu
- Ürün bazlı CBAM hesaplamaya geçiş

Ürün durumu örnekleri:

- Hesaplama Yok
- Veri Eksik
- Onay Bekliyor
- Revizyon Gerekli
- Onaylandı

---

## CBAM Hesaplama Sayfası

KOBİ Firma Admini veya yetkili kullanıcı ürün bazlı veri girişi yapabilir.

### A) Ürün Bilgileri

- Ürün adı
- CN kodu
- Ürün tipi
- Üretim dönemi
- Üretim miktarı

Birim:

- Üretim miktarı: ton

Ürün tipi seçenekleri:

- Çelik Profil
- İnşaat Demiri
- Tel Çubuk
- Sıcak Haddelenmiş Rulo
- Soğuk Haddelenmiş Rulo
- Boru/Profil
- Yapısal Çelik

---

### B) Üretim ve Enerji Verileri

- Üretim yöntemi
- Elektrik tüketimi
- Doğal gaz tüketimi
- Hurda kullanım oranı
- Yenilenebilir elektrik oranı

Birimler:

- Elektrik: MWh
- Doğal gaz: Sm³
- Hurda oranı: %
- Yenilenebilir elektrik oranı: %

Üretim yöntemi seçenekleri:

- Entegre tesis / BF-BOF
- Elektrik Ark Fırını / EAF
- Haddeleme
- Karma üretim

---

### C) Hammadde ve Tedarikçi Verileri

- Hammadde türü
- Hammadde miktarı
- Tedarikçi adı
- Tedarikçi ülkesi
- Tedarikçi emisyon faktörü
- EPD durumu

Birimler:

- Hammadde miktarı: ton
- Tedarikçi EF: tCO₂e/ton

Hammadde seçenekleri:

- Hurda
- Demir cevheri
- DRI/HBI
- Slab
- Billet
- Pig iron
- Ferroalyaj
- Kireç
- Kok

---

### D) Lojistik Verileri

- Taşıma modu
- Mesafe

Birimler:

- Mesafe: km

Taşıma modu seçenekleri:

- Karayolu
- Demiryolu
- Deniz yolu
- Karma taşıma

---

## Default Değer Mantığı

Sistem bazı kritik alanlar boş bırakıldığında durmaz. Ancak kullanıcıya açık uyarı gösterir.

Kritik alanlar:

- Üretim miktarı
- Elektrik tüketimi
- Doğal gaz tüketimi
- Hammadde miktarı
- Tedarikçi emisyon faktörü
- Nakliye mesafesi

Boş bırakılırsa:

- Varsayılan değer kullanılır.
- Hesaplama modu Hybrid veya Default olabilir.
- Veri kalite skoru düşer.
- Kullanıcıya sarı uyarı paneli gösterilir.
- Onaya gönderildiğinde boş alanlar default değerle tamamlanır.
- Onay Bekleyenler sayfasında default kullanılan alanlar gösterilir.

Uyarı mantığı:

> Bu alan boş bırakılırsa varsayılan emisyon faktörü kullanılacaktır. Bu durum hesaplanan emisyonu olduğundan yüksek gösterebilir ve veri kalite skorunu düşürür.

---

## Hesaplama Modları

| Mod | Açıklama |
|---|---|
| **Actual Data** | Tüm kritik veriler kullanıcı tarafından girilmiştir. |
| **Hybrid** | Bazı veriler girilmiş, bazı alanlarda default değer kullanılmıştır. |
| **Default** | Kritik verilerin büyük kısmı eksiktir ve varsayılan değerlerle hesaplama yapılmıştır. |

---

## Onay Bekleyenler Sayfası

CBAM hesaplaması tamamlandıktan sonra kullanıcı **Onaya Gönder** butonuna basar.

Sistem:

1. Eksik kritik alanları default değerle tamamlar.
2. Hesaplama sonucunu localStorage içine kaydeder.
3. Kullanıcıyı `/company/approvals?from=cbam&added=1` sayfasına yönlendirir.
4. Onay Bekleyenler tablosunda yeni hesaplama görünür.

Tabloda gösterilenler:

- Ürün
- Dönem
- Toplam emisyon
- Spesifik emisyon
- Veri kalitesi
- Eksik veri oranı
- Hesaplama modu
- Risk
- Durum
- Aksiyon

Aksiyonlar:

- Detay Gör
- Onayla
- Revizyon İste

---

## Operasyon Kullanıcısı Veri Girişi

Operasyon Kullanıcısı, kendisine atanmış görev üzerinden veri girişi yapar.

Örnek görevler:

- Elektrik Tüketimi
- Nakliye Mesafesi
- Doğal Gaz Tüketimi
- Hammadde Miktarı
- Tedarikçi EF

Veri girişi ekranında:

- Gerçek veri girilebilir.
- Veri boş bırakılırsa default değer uygulanır.
- Sistem default değer uyarısı gösterir.
- Veri kalite skoru düşer.
- PDF kanıt belgesi yüklenebilir.
- Yüklenen belge adı gönderim önizlemesinde gösterilir.

PDF belge kuralları:

- Sadece PDF kabul edilir.
- Maksimum dosya boyutu: 10 MB
- Örnek belgeler:
  - Elektrik faturası
  - Sayaç okuma belgesi
  - Sevk irsaliyesi
  - Tedarikçi EPD belgesi
  - Yakıt tüketim belgesi

---

## Tedarikçi Senaryoları

Tedarikçi Senaryoları artık KOBİ Firma Admini tarafındadır.

Amaç:

> Firma dışarıdan aldığı hammaddeyi farklı tedarikçilerden alsaydı karbon emisyonu ve maliyet nasıl değişirdi?

Simülasyon yapısı:

- Mevcut tedarikçi referans alınır.
- Slider / çubuk üzerinden alternatif tedarikçi seçilir.
- Karbon emisyonu azalırsa sonuç yeşil gösterilir.
- Karbon emisyonu artarsa sonuç kırmızı gösterilir.
- Sistem farkı `+/- tCO₂e` olarak gösterir.
- Maliyet farkı da gösterilir.
- AI önerisi seçimin mantıklı olup olmadığını açıklar.

Örnek çıktı:

- Supplier B seçilirse karbon emisyonu 561 tCO₂e azalır.
- Supplier C seçilirse karbon emisyonu 306 tCO₂e artar.

Tabloda gösterilenler:

- Tedarikçi
- Hammadde
- Miktar
- EF
- Toplam emisyon
- Ton fiyatı
- Toplam maliyet
- EPD
- Karbon farkı
- Durum

---

## AI Karbon Azaltım Önerileri

MVP’de AI öneri motoru rule-based carbon advisor mantığıyla çalışır.

Öneri örnekleri:

- Elektrik tüketiminiz yüksek görünüyor. YEK-G belgesi veya yenilenebilir elektrik tedariki değerlendirilebilir.
- Hurda kullanım oranı artırılırsa elektrik ark fırını bazlı üretimde spesifik emisyon düşürülebilir.
- Tedarikçi EPD verisi eksik olduğu için default emisyon faktörü kullanılmış olabilir. EPD sağlayan tedarikçiler tercih edilebilir.
- Nakliye mesafesi yüksekse daha yakın tedarikçi veya demiryolu taşımacılığı senaryosu emisyonu azaltabilir.
- Yakıt tüketimi yüksekse enerji verimliliği ve alternatif yakıt seçenekleri değerlendirilebilir.

---

## Ana Hesap Formülleri

```text
total_emission = electricity + fuel + precursor + transport

electricity = electricity_mwh × electricity_factor

fuel = natural_gas_sm3 × natural_gas_factor

precursor = material_amount_ton × supplier_emission_factor_tco2e_per_ton

transport = distance_km × material_amount_ton × logistics_factor_kgco2e_per_ton_km / 1000

specific_emission = total_emission / production_amount_ton

epd_difference_percent = (specific_emission - 2.29) / 2.29 × 100
