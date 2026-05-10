"""Resolves missing input fields to default values and generates warnings."""
from dataclasses import dataclass, field
from app.domain.cbam.constants import (
    DEFAULT_ONSITE_EF_KGCO2E_PER_KWH,
    DEFAULT_GRID_EF_KGCO2E_PER_KWH,
    DEFAULT_AVERAGE_EF_KGCO2E_PER_KWH,
    DEFAULT_OXIDATION_FACTOR,
    DEFAULT_BIOMASS_SHARE,
    DEFAULT_TRANSPORT_EF_KGCO2E_PER_TON_KM,
)


@dataclass
class DefaultWarning:
    field: str
    used_default: bool
    default_value: float
    severity: str  # "low" | "medium" | "high"
    message: str
    impact_note: str


@dataclass
class ResolvedDefaults:
    onsite_ef: float
    grid_ef: float
    average_ef: float
    oxidation_factor: float
    biomass_share: float
    transport_ef: float
    warnings: list[DefaultWarning] = field(default_factory=list)


def resolve_electricity_defaults(
    onsite_ef: float | None,
    grid_ef: float | None,
    average_ef: float | None,
) -> tuple[float, float, float, list[DefaultWarning]]:
    warnings = []
    resolved_onsite = onsite_ef if onsite_ef is not None else DEFAULT_ONSITE_EF_KGCO2E_PER_KWH
    resolved_grid = grid_ef if grid_ef is not None else DEFAULT_GRID_EF_KGCO2E_PER_KWH
    resolved_avg = average_ef if average_ef is not None else DEFAULT_AVERAGE_EF_KGCO2E_PER_KWH

    if grid_ef is None:
        warnings.append(DefaultWarning(
            field="electricity.grid_ef_kgco2e_per_kwh",
            used_default=True,
            default_value=DEFAULT_GRID_EF_KGCO2E_PER_KWH,
            severity="high",
            message="Grid elektrik emisyon faktörü girilmediği için varsayılan değer kullanıldı.",
            impact_note="Varsayılan değer ihtiyatlı olduğu için sonuç olduğundan yüksek görünebilir.",
        ))
    if onsite_ef is None:
        warnings.append(DefaultWarning(
            field="electricity.onsite_ef_kgco2e_per_kwh",
            used_default=True,
            default_value=DEFAULT_ONSITE_EF_KGCO2E_PER_KWH,
            severity="medium",
            message="Onsite elektrik emisyon faktörü girilmediği için varsayılan değer kullanıldı.",
            impact_note="Varsayılan değer ihtiyatlı olduğu için sonuç olduğundan yüksek görünebilir.",
        ))
    return resolved_onsite, resolved_grid, resolved_avg, warnings


def resolve_oxidation_factor(value: float | None) -> tuple[float, DefaultWarning | None]:
    if value is not None:
        return value, None
    warning = DefaultWarning(
        field="fuel.oxidation_factor",
        used_default=True,
        default_value=DEFAULT_OXIDATION_FACTOR,
        severity="low",
        message="Oksidasyon faktörü girilmediği için varsayılan değer kullanıldı.",
        impact_note="Etki düşük; yakıt emisyonunda küçük sapma oluşabilir.",
    )
    return DEFAULT_OXIDATION_FACTOR, warning


def resolve_biomass_share(value: float | None) -> tuple[float, DefaultWarning | None]:
    if value is not None:
        return value, None
    warning = DefaultWarning(
        field="fuel.biomass_share",
        used_default=True,
        default_value=DEFAULT_BIOMASS_SHARE,
        severity="low",
        message="Biyokütle payı girilmediği için varsayılan değer (0) kullanıldı.",
        impact_note="Biyokütle payı 0 kabul edildiğinde yakıt emisyonu olduğundan yüksek görünebilir.",
    )
    return DEFAULT_BIOMASS_SHARE, warning


def resolve_transport_ef(value: float | None) -> tuple[float, DefaultWarning | None]:
    if value is not None:
        return value, None
    warning = DefaultWarning(
        field="transport.emission_factor_kgco2e_per_ton_km",
        used_default=True,
        default_value=DEFAULT_TRANSPORT_EF_KGCO2E_PER_TON_KM,
        severity="medium",
        message="Taşıma emisyon faktörü girilmediği için varsayılan değer kullanıldı.",
        impact_note="Gerçek taşıma modu ve yakıt farklıysa sonuç sapabilir.",
    )
    return DEFAULT_TRANSPORT_EF_KGCO2E_PER_TON_KM, warning
