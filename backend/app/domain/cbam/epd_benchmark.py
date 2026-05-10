"""EPD Benchmark reference data for steel profiles."""
from app.domain.cbam.constants import (
    EPD_STEEL_PROFILE_GWP_TCO2E_PER_TON,
    EPD_RECORD_NO,
    EPD_DECLARED_UNIT,
    EPD_VALIDITY,
)
from dataclasses import dataclass


@dataclass
class EPDBenchmark:
    record_no: str
    product: str
    declared_unit: str
    gwp_a1_a3_kgco2e_per_kg: float
    gwp_tco2e_per_ton: float
    validity: str
    usage_note: str
    cbam_note: str


def get_steel_profile_epd() -> EPDBenchmark:
    return EPDBenchmark(
        record_no=EPD_RECORD_NO,
        product="Steel Profiles",
        declared_unit=EPD_DECLARED_UNIT,
        gwp_a1_a3_kgco2e_per_kg=2.29,
        gwp_tco2e_per_ton=EPD_STEEL_PROFILE_GWP_TCO2E_PER_TON,
        validity=EPD_VALIDITY,
        usage_note=(
            "EPD değeri referans/benchmark olarak kullanılmıştır. "
            "Nihai CBAM hesaplaması için tesis bazlı üretim, yakıt, elektrik ve precursor verileri gereklidir."
        ),
        cbam_note=(
            "EPD benchmark resmi CBAM hesabının yerine geçmez. "
            "Bu karşılaştırma karar destek, veri kalitesi kontrolü ve ön analiz amacıyla sunulur."
        ),
    )
