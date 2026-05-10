"""Risk level classification based on EPD benchmark difference."""
from dataclasses import dataclass
from app.domain.cbam.constants import RISK_LOW_MAX, RISK_MEDIUM_MAX, RISK_HIGH_MAX


@dataclass
class RiskAssessment:
    risk_level: str
    difference_percent: float
    largest_emission_source: str
    recommended_first_action: str
    summary: str
    color: str


def classify_risk(
    difference_percent: float,
    source_shares: dict[str, float],
) -> RiskAssessment:
    largest_source = max(source_shares, key=source_shares.get) if source_shares else "precursor"
    source_label = {
        "fuel": "yakıt emisyonu",
        "electricity": "elektrik emisyonu",
        "precursor": "precursor emisyonu",
        "transport": "taşıma emisyonu",
    }.get(largest_source, largest_source)

    first_action_map = {
        "fuel": "Yakıt verimliliği ve düşük karbonlu yakıt alternatifleri değerlendirilmeli.",
        "electricity": "Yenilenebilir enerji tedariki veya PPA seçeneği araştırılmalı.",
        "precursor": "Düşük karbonlu billet/slab tedarikçisi değerlendirilmeli.",
        "transport": "Rota optimizasyonu ve demiryolu alternatifi araştırılmalı.",
    }
    first_action = first_action_map.get(largest_source, "Veri kalitesi önce iyileştirilmeli.")

    if difference_percent <= RISK_LOW_MAX:
        level, color = "low", "#22c55e"
        summary = f"Ürün başına emisyon EPD benchmark değerinin altındadır. İyi performans."
    elif difference_percent <= RISK_MEDIUM_MAX:
        level, color = "medium", "#f59e0b"
        summary = f"Ürün başına emisyon benchmark değerinin %{difference_percent:.1f} üzerindedir. İyileştirme önerilir."
    elif difference_percent <= RISK_HIGH_MAX:
        level, color = "high", "#f97316"
        summary = f"Ürün başına emisyon benchmark değerinin %{difference_percent:.1f} üzerindedir. Aksiyon gerekli."
    else:
        level, color = "critical", "#ef4444"
        summary = (
            f"Critical: Ürün başına emisyon benchmark değerinin %{difference_percent:.1f} üzerindedir. "
            f"En büyük kaynak {source_label}dır. İlk aksiyon olarak {first_action}"
        )

    return RiskAssessment(
        risk_level=level,
        difference_percent=round(difference_percent, 2),
        largest_emission_source=largest_source,
        recommended_first_action=first_action,
        summary=summary,
        color=color,
    )
