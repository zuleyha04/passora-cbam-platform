"""Carbon offset equivalency calculations (awareness / visualization only)."""
from dataclasses import dataclass
from app.domain.cbam.constants import TREE_10_YEAR_ABSORPTION_TCO2


@dataclass
class OffsetEquivalents:
    excess_emission_tco2e: float
    required_tree_seedlings_10_years: int
    tree_absorption_rate_tco2: float
    disclaimer: str
    note: str


def calculate_offset_equivalents(
    calculated_specific: float,
    epd_benchmark: float,
    production_amount_ton: float,
) -> OffsetEquivalents:
    """
    Calculate tree seedlings needed to offset excess emissions vs EPD benchmark.
    IMPORTANT: For awareness only. Not a CBAM credit or official offset mechanism.
    """
    excess_per_ton = max(0.0, calculated_specific - epd_benchmark)
    excess_total = excess_per_ton * production_amount_ton
    trees = int(excess_total / TREE_10_YEAR_ABSORPTION_TCO2) if excess_total > 0 else 0

    return OffsetEquivalents(
        excess_emission_tco2e=round(excess_total, 2),
        required_tree_seedlings_10_years=trees,
        tree_absorption_rate_tco2=TREE_10_YEAR_ABSORPTION_TCO2,
        disclaimer=(
            "Ağaç eşdeğerliği yalnızca farkındalık/eşdeğerlik amaçlıdır. "
            "CBAM resmi mahsuplaşması veya doğrulanmış karbon kredisi yerine geçmez."
        ),
        note=f"EPD benchmark değerini aşan {round(excess_total, 1)} tCO2e için "
             f"yaklaşık {trees:,} adet fidan (10 yıl) gerekmektedir.",
    )
