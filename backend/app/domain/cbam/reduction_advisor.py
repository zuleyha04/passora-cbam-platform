"""
Rule-based Carbon Reduction Advisor.
Architecture is designed to be replaced by or augmented with an LLM in production.
"""
from dataclasses import dataclass, field


@dataclass
class ReductionAdvice:
    source: str
    priority: str  # "critical" | "high" | "medium" | "low"
    share_percent: float
    problem: str
    recommended_actions: list[str]
    expected_impact: str
    note: str


@dataclass
class ReductionAdviceResult:
    advice_list: list[ReductionAdvice]
    top_priority_source: str
    used_defaults_note: str | None


def _priority_from_share(share: float) -> str:
    if share >= 50:
        return "critical"
    if share >= 25:
        return "high"
    if share >= 10:
        return "medium"
    return "low"


FUEL_ACTIONS = [
    "Proses verimliliğini artırın; enerji yoğun adımları optimize edin.",
    "Atık ısı geri kazanım sistemi değerlendirin.",
    "Düşük karbonlu yakıt alternatiflerini araştırın (doğalgaz → hidrojen hibrit, biyogaz).",
    "Yakıt tüketim ölçümünü tesis bazında doğrulayın ve kalibre edin.",
]

ELECTRICITY_ACTIONS = [
    "Düşük karbonlu elektrik tedariki değerlendirin.",
    "Yenilenebilir enerji PPA veya I-REC sertifika seçeneklerini analiz edin.",
    "Elektrik yoğun proseslerde enerji verimliliği çalışması başlatın.",
    "Onsite üretim/grid tüketim ayrımını net biçimde raporlayın.",
]

PRECURSOR_ACTIONS = [
    "Tedarikçiden EPD veya ürün karbon ayak izi belgesi talep edin.",
    "Daha düşük karbonlu billet/slab alternatifi araştırın.",
    "Alternatif tedarikçi simülasyonunu çalıştırın.",
    "Tedarikçi bazlı emission factor takibini düzenli yapın.",
]

TRANSPORT_ACTIONS = [
    "Rota optimizasyonu yapın; gereksiz mesafeleri azaltın.",
    "Demiryolu veya denizyolu taşımacılık alternatifini araştırın.",
    "Daha yakın tedarikçi senaryolarını test edin.",
    "Araç doluluk oranını ve taşıma modunu izleyin.",
]

ACTIONS_MAP = {
    "fuel": (FUEL_ACTIONS, "Proses verimliliği ve alternatif yakıt ile %10-20 azaltım potansiyeli tahmini."),
    "electricity": (ELECTRICITY_ACTIONS, "Yenilenebilir enerji geçişiyle elektrik kaynaklı emisyonu %50+ azaltma potansiyeli."),
    "precursor": (PRECURSOR_ACTIONS, "Düşük karbonlu tedarikçi seçimiyle toplam emisyonda önemli azaltım sağlanabilir."),
    "transport": (TRANSPORT_ACTIONS, "Taşıma optimizasyonuyla %15-30 emisyon azaltımı hedeflenebilir."),
}

PROBLEM_MAP = {
    "fuel": "Yakıt kaynaklı emisyon toplam emisyonun önemli bir payını oluşturuyor.",
    "electricity": "Elektrik kaynaklı emisyon toplam içinde yüksek pay alıyor; grid faktörü iyileştirilmeli.",
    "precursor": "Hammadde/billet kaynaklı emisyon toplam emisyonun büyük kısmını oluşturuyor.",
    "transport": "Taşıma emisyonu göz ardı edilemeyecek düzeyde; optimizasyon potansiyeli mevcut.",
}


def generate_reduction_advice(
    fuel_emission: float,
    electricity_emission: float,
    precursor_emission: float,
    transport_emission: float,
    total_emission: float,
    used_defaults: bool = False,
    supplier_comparison_note: str | None = None,
) -> ReductionAdviceResult:
    if total_emission <= 0:
        return ReductionAdviceResult(advice_list=[], top_priority_source="", used_defaults_note=None)

    sources = {
        "fuel": fuel_emission,
        "electricity": electricity_emission,
        "precursor": precursor_emission,
        "transport": transport_emission,
    }
    shares = {k: round(v / total_emission * 100, 1) for k, v in sources.items()}

    advice_list: list[ReductionAdvice] = []
    for source, share in sorted(shares.items(), key=lambda x: -x[1]):
        if share <= 0:
            continue
        priority = _priority_from_share(share)
        actions, expected = ACTIONS_MAP[source]
        impact = supplier_comparison_note if source == "precursor" and supplier_comparison_note else expected
        advice_list.append(ReductionAdvice(
            source=source.capitalize(),
            priority=priority,
            share_percent=share,
            problem=PROBLEM_MAP[source],
            recommended_actions=actions,
            expected_impact=impact,
            note="Bu öneriler karar destek amaçlıdır; nihai CBAM doğrulaması değildir.",
        ))

    top_source = max(shares, key=shares.get)

    defaults_note = None
    if used_defaults:
        defaults_note = (
            "Bu sonuçta varsayılan (default) değerler kullanıldığı için emisyon güvenilirliği düşüktür. "
            "Gerçek tesis verileri girildiğinde sonuç daha doğru ve genellikle daha düşük olabilir. "
            "Öncelik gerçek elektrik, yakıt ve precursor emission factor verilerinin toplanmasıdır."
        )

    return ReductionAdviceResult(
        advice_list=advice_list,
        top_priority_source=top_source,
        used_defaults_note=defaults_note,
    )
