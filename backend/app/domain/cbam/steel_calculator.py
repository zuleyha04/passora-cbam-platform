"""
Steel Carbon Calculator - CBAM Methodology
All calculations follow CBAM Implementing Regulation (EU) 2023/1773
"""
from dataclasses import dataclass, field
from app.domain.cbam.constants import EPD_STEEL_PROFILE_GWP_TCO2E_PER_TON
from app.domain.cbam.default_value_resolver import (
    DefaultWarning,
    resolve_electricity_defaults,
    resolve_oxidation_factor,
    resolve_biomass_share,
    resolve_transport_ef,
)


@dataclass
class FuelInput:
    fuel_name: str
    amount: float
    ncv_tj_per_unit: float
    emission_factor_tco2e_per_tj: float
    oxidation_factor: float | None = None
    biomass_share: float | None = None


@dataclass
class ElectricityInput:
    calculation_type: str  # "split" | "average"
    onsite_kwh: float = 0.0
    grid_kwh: float = 0.0
    total_kwh: float = 0.0
    onsite_ef: float | None = None
    grid_ef: float | None = None
    average_ef: float | None = None


@dataclass
class PrecursorInput:
    material_name: str
    amount_ton: float
    emission_factor_tco2e_per_ton: float
    supplier_name: str = ""
    has_epd: bool = False


@dataclass
class TransportInput:
    active: bool = False
    mass_ton: float = 0.0
    distance_km: float = 0.0
    emission_factor_kgco2e_per_ton_km: float | None = None


@dataclass
class SteelCalculationInput:
    # Company / Product
    company_name: str
    country: str
    facility_name: str
    reporting_period: str
    product_name: str
    cn_code: str
    production_route: str
    production_amount_ton: float
    # Process data
    fuels: list[FuelInput] = field(default_factory=list)
    electricity: ElectricityInput | None = None
    precursors: list[PrecursorInput] = field(default_factory=list)
    transport: TransportInput | None = None


@dataclass
class EmissionBreakdown:
    fuel_emission_tco2e: float
    electricity_emission_tco2e: float
    precursor_emission_tco2e: float
    transport_emission_tco2e: float
    total_emission_tco2e: float
    specific_emission_tco2e_per_ton: float


@dataclass
class SteelCalculationResult:
    calculation_mode: str
    breakdown: EmissionBreakdown
    epd_benchmark_tco2e_per_ton: float
    epd_benchmark_total_tco2e: float
    difference_tco2e_per_ton: float
    difference_percent: float
    risk_level: str
    source_shares: dict[str, float]
    default_warnings: list[DefaultWarning]
    used_defaults: bool
    data_quality_score: int


def _calc_fuel_emission(fuel: FuelInput, warnings: list[DefaultWarning]) -> float:
    """Fuel emission = amount × NCV × EF × oxidation_factor × (1 - biomass_share)"""
    oxidation_factor, w1 = resolve_oxidation_factor(fuel.oxidation_factor)
    biomass_share, w2 = resolve_biomass_share(fuel.biomass_share)
    if w1:
        warnings.append(w1)
    if w2:
        warnings.append(w2)
    fossil_share = 1.0 - biomass_share
    return fuel.amount * fuel.ncv_tj_per_unit * fuel.emission_factor_tco2e_per_tj * oxidation_factor * fossil_share


def _calc_electricity_emission(elec: ElectricityInput, warnings: list[DefaultWarning]) -> float:
    """Electricity emission in tCO2e. Split or average method."""
    onsite_ef, grid_ef, avg_ef, elec_warnings = resolve_electricity_defaults(
        elec.onsite_ef, elec.grid_ef, elec.average_ef
    )
    warnings.extend(elec_warnings)

    if elec.calculation_type == "split":
        return (elec.onsite_kwh * onsite_ef + elec.grid_kwh * grid_ef) / 1000.0
    else:
        # average method
        total_kwh = elec.total_kwh or (elec.onsite_kwh + elec.grid_kwh)
        return total_kwh * avg_ef / 1000.0


def _calc_precursor_emission(precursor: PrecursorInput) -> float:
    """Precursor emission = amount_ton × EF"""
    return precursor.amount_ton * precursor.emission_factor_tco2e_per_ton


def _calc_transport_emission(transport: TransportInput, warnings: list[DefaultWarning]) -> float:
    """Transport emission = mass_ton × distance_km × EF / 1000"""
    if not transport.active or transport.mass_ton <= 0 or transport.distance_km <= 0:
        return 0.0
    ef, w = resolve_transport_ef(transport.emission_factor_kgco2e_per_ton_km)
    if w:
        warnings.append(w)
    return transport.mass_ton * transport.distance_km * ef / 1000.0


def _determine_calculation_mode(inp: SteelCalculationInput) -> str:
    has_fuel = bool(inp.fuels)
    has_elec = inp.electricity is not None
    has_precursor = bool(inp.precursors)
    all_present = has_fuel and has_elec and has_precursor
    none_present = not has_fuel and not has_elec and not has_precursor
    if none_present:
        return "epd_benchmark"
    if all_present:
        return "actual_data"
    return "hybrid"


def _calc_source_shares(breakdown: EmissionBreakdown) -> dict[str, float]:
    total = breakdown.total_emission_tco2e
    if total <= 0:
        return {"fuel": 0, "electricity": 0, "precursor": 0, "transport": 0}
    return {
        "fuel": round(breakdown.fuel_emission_tco2e / total * 100, 1),
        "electricity": round(breakdown.electricity_emission_tco2e / total * 100, 1),
        "precursor": round(breakdown.precursor_emission_tco2e / total * 100, 1),
        "transport": round(breakdown.transport_emission_tco2e / total * 100, 1),
    }


def _classify_risk(difference_percent: float) -> str:
    if difference_percent <= 0:
        return "low"
    if difference_percent <= 25:
        return "medium"
    if difference_percent <= 50:
        return "high"
    return "critical"


def calculate_steel_emissions(inp: SteelCalculationInput) -> SteelCalculationResult:
    """Main calculation entry point. Returns full result with breakdown, risk, and warnings."""
    if inp.production_amount_ton <= 0:
        raise ValueError("Üretim miktarı pozitif olmalıdır.")

    warnings: list[DefaultWarning] = []
    mode = _determine_calculation_mode(inp)

    # --- Fuel ---
    fuel_emission = sum(_calc_fuel_emission(f, warnings) for f in inp.fuels) if inp.fuels else 0.0

    # --- Electricity ---
    electricity_emission = _calc_electricity_emission(inp.electricity, warnings) if inp.electricity else 0.0

    # --- Precursor ---
    precursor_emission = sum(_calc_precursor_emission(p) for p in inp.precursors) if inp.precursors else 0.0

    # --- Transport ---
    transport_emission = _calc_transport_emission(inp.transport, warnings) if inp.transport else 0.0

    # EPD benchmark mode: override with benchmark only
    if mode == "epd_benchmark":
        epd_total = inp.production_amount_ton * EPD_STEEL_PROFILE_GWP_TCO2E_PER_TON
        precursor_emission = epd_total
        fuel_emission = electricity_emission = transport_emission = 0.0

    total = fuel_emission + electricity_emission + precursor_emission + transport_emission
    specific = total / inp.production_amount_ton

    epd_benchmark_total = inp.production_amount_ton * EPD_STEEL_PROFILE_GWP_TCO2E_PER_TON
    diff_tco2e = specific - EPD_STEEL_PROFILE_GWP_TCO2E_PER_TON
    diff_pct = (diff_tco2e / EPD_STEEL_PROFILE_GWP_TCO2E_PER_TON) * 100

    breakdown = EmissionBreakdown(
        fuel_emission_tco2e=round(fuel_emission, 2),
        electricity_emission_tco2e=round(electricity_emission, 2),
        precursor_emission_tco2e=round(precursor_emission, 2),
        transport_emission_tco2e=round(transport_emission, 2),
        total_emission_tco2e=round(total, 2),
        specific_emission_tco2e_per_ton=round(specific, 4),
    )

    source_shares = _calc_source_shares(breakdown)
    risk_level = _classify_risk(diff_pct)

    # Rudimentary DQ score based on warnings
    from app.domain.cbam.missing_data_checker import check_missing_data
    missing = check_missing_data(inp)
    dq_score = missing.data_quality_score

    return SteelCalculationResult(
        calculation_mode=mode,
        breakdown=breakdown,
        epd_benchmark_tco2e_per_ton=EPD_STEEL_PROFILE_GWP_TCO2E_PER_TON,
        epd_benchmark_total_tco2e=round(epd_benchmark_total, 2),
        difference_tco2e_per_ton=round(diff_tco2e, 4),
        difference_percent=round(diff_pct, 2),
        risk_level=risk_level,
        source_shares=source_shares,
        default_warnings=warnings,
        used_defaults=len(warnings) > 0,
        data_quality_score=dq_score,
    )
