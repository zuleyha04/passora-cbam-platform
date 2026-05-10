"""Analyzes missing/incomplete data and computes Data Quality Score."""
from dataclasses import dataclass, field
from app.domain.cbam.constants import (
    DQ_PENALTY_CRITICAL, DQ_PENALTY_HIGH, DQ_PENALTY_MEDIUM, DQ_PENALTY_RECOMMENDATION
)


@dataclass
class MissingDataItem:
    field: str
    severity: str  # "critical" | "high" | "medium" | "recommendation"
    message: str
    penalty: int


@dataclass
class MissingDataResult:
    items: list[MissingDataItem]
    data_quality_score: int
    score_interpretation: str
    has_critical: bool


def _score_interpretation(score: int) -> str:
    if score >= 85:
        return "good"
    if score >= 65:
        return "needs_review"
    if score >= 40:
        return "weak"
    return "insufficient"


def check_missing_data(inp) -> MissingDataResult:
    """Check a SteelCalculationInput for missing/incomplete fields."""
    items: list[MissingDataItem] = []
    score = 100

    # Critical
    if not inp.cn_code:
        items.append(MissingDataItem("cn_code", "critical", "CN kodu girilmemiş.", DQ_PENALTY_CRITICAL))
        score -= DQ_PENALTY_CRITICAL
    if inp.production_amount_ton <= 0:
        items.append(MissingDataItem("production_amount_ton", "critical", "Üretim miktarı girilmemiş.", DQ_PENALTY_CRITICAL))
        score -= DQ_PENALTY_CRITICAL
    if not inp.product_name:
        items.append(MissingDataItem("product_name", "critical", "Ürün adı girilmemiş.", DQ_PENALTY_CRITICAL))
        score -= DQ_PENALTY_CRITICAL
    if not inp.company_name:
        items.append(MissingDataItem("company_name", "critical", "Firma adı girilmemiş.", DQ_PENALTY_CRITICAL))
        score -= DQ_PENALTY_CRITICAL

    # High
    if not inp.electricity:
        items.append(MissingDataItem("electricity", "high", "Elektrik tüketimi girilmemiş.", DQ_PENALTY_HIGH))
        score -= DQ_PENALTY_HIGH
    if not inp.precursors:
        items.append(MissingDataItem("precursors", "high", "Precursor/hammadde verisi girilmemiş.", DQ_PENALTY_HIGH))
        score -= DQ_PENALTY_HIGH
    else:
        for p in inp.precursors:
            if p.emission_factor_tco2e_per_ton <= 0:
                items.append(MissingDataItem(
                    f"precursor.{p.material_name}.emission_factor",
                    "high", f"{p.material_name} precursor emisyon faktörü girilmemiş.", DQ_PENALTY_HIGH
                ))
                score -= DQ_PENALTY_HIGH

    if inp.electricity and inp.electricity.grid_ef is None:
        items.append(MissingDataItem("electricity.grid_ef", "high", "Grid elektrik emisyon faktörü girilmemiş.", DQ_PENALTY_HIGH))
        score -= DQ_PENALTY_HIGH
    for f in (inp.fuels or []):
        if f.emission_factor_tco2e_per_tj <= 0:
            items.append(MissingDataItem(
                f"fuel.{f.fuel_name}.emission_factor",
                "high", f"{f.fuel_name} yakıt emisyon faktörü girilmemiş.", DQ_PENALTY_HIGH
            ))
            score -= DQ_PENALTY_HIGH

    # Medium
    if not inp.fuels:
        items.append(MissingDataItem("fuels", "medium", "Yakıt verisi girilmemiş.", DQ_PENALTY_MEDIUM))
        score -= DQ_PENALTY_MEDIUM
    if inp.transport and inp.transport.active:
        if inp.transport.distance_km <= 0:
            items.append(MissingDataItem("transport.distance_km", "medium", "Taşıma mesafesi girilmemiş.", DQ_PENALTY_MEDIUM))
            score -= DQ_PENALTY_MEDIUM
        if inp.transport.emission_factor_kgco2e_per_ton_km is None:
            items.append(MissingDataItem("transport.ef", "medium", "Taşıma emisyon faktörü girilmemiş.", DQ_PENALTY_MEDIUM))
            score -= DQ_PENALTY_MEDIUM

    # Recommendation
    for p in (inp.precursors or []):
        if not p.has_epd:
            items.append(MissingDataItem(
                f"precursor.{p.material_name}.epd",
                "recommendation", f"{p.material_name} için EPD belgesi yok.", DQ_PENALTY_RECOMMENDATION
            ))
            score -= DQ_PENALTY_RECOMMENDATION
        if not p.supplier_name:
            items.append(MissingDataItem(
                f"precursor.{p.material_name}.supplier",
                "recommendation", f"{p.material_name} tedarikçi adı girilmemiş.", DQ_PENALTY_RECOMMENDATION
            ))
            score -= DQ_PENALTY_RECOMMENDATION
    if not inp.reporting_period:
        items.append(MissingDataItem("reporting_period", "recommendation", "Raporlama dönemi girilmemiş.", DQ_PENALTY_RECOMMENDATION))
        score -= DQ_PENALTY_RECOMMENDATION

    score = max(0, score)
    has_critical = any(i.severity == "critical" for i in items)

    return MissingDataResult(
        items=items,
        data_quality_score=score,
        score_interpretation=_score_interpretation(score),
        has_critical=has_critical,
    )
